import sentinelHubService from '../modules/integrations/apis';
import { ProcessRequestBody } from '../modules/integrations/types';
import { IProperty } from '../modules/property/property.model';
import * as fs from 'fs/promises';
import * as path from 'path';
import sharp from 'sharp';

class SatelliteService {

    /**
     * Busca uma imagem de satélite para o bounding box de uma propriedade e a salva em uma pasta temporária.
     * @param property A propriedade para a qual obter a imagem.
     * @param dateFrom Data de início para a busca da imagem.
     * @param dateTo Data final para a busca da imagem.
     * @param collection A coleção do Sentinel Hub a ser usada.
     * @returns O caminho para a imagem salva.
     */
    async getPropertyImage(
        property: IProperty,
        dateFrom: string = "2024-01-01T00:00:00Z",
        dateTo: string = "2024-03-31T23:59:59Z",
        collection: string = 'sentinel-2-l2a'
    ): Promise<string> {
        if (!property.geoJson || !property.geoJson.bbox) {
            throw new Error('A propriedade não possui informações de bounding box (geoJson.bbox).');
        }

        // Um evalscript simples para retornar uma imagem de cor verdadeira.
        const evalscript = `
            //VERSION=3
            function setup() {
                return {
                    input: ["B04", "B03", "B02"],
                    output: {
                        bands: 3,
                        sampleType: "UINT8"
                    }
                };
            }

            function evaluatePixel(sample) {
                // Visualização de cor verdadeira simples com algum realce
                return [2.5 * sample.B04, 2.5 * sample.B03, 2.5 * sample.B02];
            }
        `;

        const requestBody: ProcessRequestBody = {
            input: {
                bounds: {
                    bbox: property.geoJson.bbox,
                    properties: {
                        crs: 'http://www.opengis.net/def/crs/OGC/1.3/CRS84'
                    }
                },
                data: [
                    {
                        type: collection,
                        dataFilter: {
                            timeRange: { from: dateFrom, to: dateTo },
                            mosaickingOrder: "leastCC" // menor cobertura de nuvens
                        }
                    }
                ]
            },
            output: {
                width: 512,
                height: 512,
            },
            evalscript: evalscript
        };

        const imageBuffer = await sentinelHubService.process(requestBody);

        const tempDir = path.join(__dirname, '..', '..', 'temp_images');
        await fs.mkdir(tempDir, { recursive: true });
        
        const imagePath = path.join(tempDir, `property_${property.id}_${Date.now()}.png`);
        await fs.writeFile(imagePath, imageBuffer);

        console.log(`🛰️  Imagem de satélite para a propriedade ${property.id} salva em ${imagePath}`);
        
        return imagePath;
    }

    /**
     * Busca uma imagem de satélite e adiciona contorno destacado na área.
     * @param property A propriedade para a qual obter a imagem.
     * @param dateFrom Data de início para a busca da imagem.
     * @param dateTo Data final para a busca da imagem.
     * @param collection A coleção do Sentinel Hub a ser usada.
     * @param highlightColor Cor do contorno (hex ou nome). Ex: 'red', '#FF0000', '#00FF00'
     * @returns O caminho para a imagem com contorno salva.
     */
    async getPropertyImageWithBoundary(
        property: IProperty,
        dateFrom: string = "2024-01-01T00:00:00Z",
        dateTo: string = "2024-03-31T23:59:59Z",
        collection: string = 'sentinel-2-l2a',
        highlightColor: string = 'red'
    ): Promise<string> {
        // 1. Obter a imagem base
        const baseImagePath = await this.getPropertyImage(property, dateFrom, dateTo, collection);
        
        // 2. Ler a imagem
        const imageBuffer = await fs.readFile(baseImagePath);
        const image = sharp(imageBuffer);
        const metadata = await image.metadata();
        
        const width = metadata.width || 512;
        const height = metadata.height || 512;
        
        // 3. Criar SVG com retângulo destacado
        const borderThickness = 8;
        const svg = `
            <svg width="${width}" height="${height}">
                <!-- Retângulo externo (borda destacada) -->
                <rect 
                    x="${borderThickness / 2}" 
                    y="${borderThickness / 2}" 
                    width="${width - borderThickness}" 
                    height="${height - borderThickness}"
                    fill="none"
                    stroke="${highlightColor}"
                    stroke-width="${borderThickness}"
                    stroke-dasharray="20,10"
                />
                <!-- Cantos destacados -->
                <circle cx="${borderThickness * 2}" cy="${borderThickness * 2}" r="10" fill="${highlightColor}" />
                <circle cx="${width - borderThickness * 2}" cy="${borderThickness * 2}" r="10" fill="${highlightColor}" />
                <circle cx="${borderThickness * 2}" cy="${height - borderThickness * 2}" r="10" fill="${highlightColor}" />
                <circle cx="${width - borderThickness * 2}" cy="${height - borderThickness * 2}" r="10" fill="${highlightColor}" />
                
                <!-- Texto com informações -->
                <text x="20" y="30" font-size="16" fill="white" stroke="black" stroke-width="1">
                    ${property.location.city}, ${property.location.state}
                </text>
                <text x="20" y="50" font-size="14" fill="white" stroke="black" stroke-width="1">
                    Área: ${property.areaDetails.total} ha
                </text>
            </svg>
        `;
        
        // 4. Sobrepor o SVG na imagem
        const outputPath = path.join(
            path.dirname(baseImagePath),
            `property_${property.id}_highlighted_${Date.now()}.png`
        );
        
        await image
            .composite([{
                input: Buffer.from(svg),
                top: 0,
                left: 0
            }])
            .toFile(outputPath);
        
        console.log(`✅ Imagem com contorno destacado salva em ${outputPath}`);
        
        return outputPath;
    }

    /**
     * Obtém imagem apenas pelos limites (bbox), sem precisar de propriedade completa.
     * @param bbox Bounding box [oeste, sul, leste, norte]
     * @param dateFrom Data inicial
     * @param dateTo Data final
     * @param options Opções adicionais
     * @returns Caminho da imagem salva
     */
    async getImageByBbox(
        bbox: number[],
        dateFrom: string = "2024-01-01T00:00:00Z",
        dateTo: string = "2024-12-31T23:59:59Z",
        options: {
            collection?: string;
            width?: number;
            height?: number;
            label?: string;
        } = {}
    ): Promise<string> {
        const {
            collection = 'sentinel-2-l2a',
            width = 512,
            height = 512,
            label = 'Área de Interesse'
        } = options;

        if (!bbox || bbox.length !== 4) {
            throw new Error('Bbox inválido. Formato esperado: [oeste, sul, leste, norte]');
        }

        const evalscript = `
            //VERSION=3
            function setup() {
                return {
                    input: ["B04", "B03", "B02"],
                    output: {
                        bands: 3,
                        sampleType: "UINT8"
                    }
                };
            }

            function evaluatePixel(sample) {
                return [2.5 * sample.B04, 2.5 * sample.B03, 2.5 * sample.B02];
            }
        `;

        const requestBody: ProcessRequestBody = {
            input: {
                bounds: {
                    bbox: bbox,
                    properties: {
                        crs: 'http://www.opengis.net/def/crs/OGC/1.3/CRS84'
                    }
                },
                data: [
                    {
                        type: collection,
                        dataFilter: {
                            timeRange: { from: dateFrom, to: dateTo },
                            mosaickingOrder: "leastCC"
                        }
                    }
                ]
            },
            output: { width, height },
            evalscript: evalscript
        };

        const imageBuffer = await sentinelHubService.process(requestBody);

        const tempDir = path.join(__dirname, '..', '..', 'temp_images');
        await fs.mkdir(tempDir, { recursive: true });
        
        const timestamp = Date.now();
        const imagePath = path.join(tempDir, `bbox_${timestamp}.png`);
        
        // Salvar imagem base
        await fs.writeFile(imagePath, imageBuffer);

        // Adicionar contorno destacado
        const image = sharp(imagePath);
        const svg = `
            <svg width="${width}" height="${height}">
                <rect 
                    x="4" y="4" 
                    width="${width - 8}" 
                    height="${height - 8}"
                    fill="none"
                    stroke="#FF0000"
                    stroke-width="6"
                    stroke-dasharray="15,8"
                />
                <circle cx="15" cy="15" r="8" fill="#FF0000" />
                <circle cx="${width - 15}" cy="15" r="8" fill="#FF0000" />
                <circle cx="15" cy="${height - 15}" r="8" fill="#FF0000" />
                <circle cx="${width - 15}" cy="${height - 15}" r="8" fill="#FF0000" />
                
                <text x="20" y="30" font-size="18" fill="white" stroke="black" stroke-width="2" font-weight="bold">
                    ${label}
                </text>
                <text x="20" y="52" font-size="12" fill="white" stroke="black" stroke-width="1">
                    Bbox: [${bbox[0].toFixed(3)}, ${bbox[1].toFixed(3)}, ${bbox[2].toFixed(3)}, ${bbox[3].toFixed(3)}]
                </text>
            </svg>
        `;

        const highlightedPath = path.join(tempDir, `bbox_highlighted_${timestamp}.png`);
        
        await image
            .composite([{
                input: Buffer.from(svg),
                top: 0,
                left: 0
            }])
            .toFile(highlightedPath);

        console.log(`🎯 Imagem da área destacada salva em ${highlightedPath}`);
        
        return highlightedPath;
    }

    /**
     * Converte coordenadas de polígono para bbox.
     * @param coordinates Array de coordenadas [{lat, lon}, ...]
     * @returns Bbox [oeste, sul, leste, norte]
     */
    private calculateBboxFromCoordinates(coordinates: Array<{ lat: number; lon: number }>): number[] {
        let minLon = Infinity;
        let minLat = Infinity;
        let maxLon = -Infinity;
        let maxLat = -Infinity;

        coordinates.forEach(coord => {
            minLon = Math.min(minLon, coord.lon);
            minLat = Math.min(minLat, coord.lat);
            maxLon = Math.max(maxLon, coord.lon);
            maxLat = Math.max(maxLat, coord.lat);
        });

        return [minLon, minLat, maxLon, maxLat];
    }

    /**
     * Converte coordenadas geográficas para pixels na imagem.
     * @param lat Latitude
     * @param lon Longitude
     * @param bbox Bounding box da imagem
     * @param width Largura da imagem
     * @param height Altura da imagem
     * @returns Coordenadas em pixels {x, y}
     */
    private geoToPixel(
        lat: number,
        lon: number,
        bbox: number[],
        width: number,
        height: number
    ): { x: number; y: number } {
        const [minLon, minLat, maxLon, maxLat] = bbox;

        // Normalizar para 0-1
        const normalizedX = (lon - minLon) / (maxLon - minLon);
        const normalizedY = (maxLat - lat) / (maxLat - minLat); // Invertido porque Y cresce para baixo

        // Converter para pixels
        const x = normalizedX * width;
        const y = normalizedY * height;

        return { x, y };
    }

    /**
     * Obtém imagem de satélite com polígono desenhado a partir de coordenadas.
     * @param coordinates Array de coordenadas do polígono [{lat, lon}, ...]
     * @param dateFrom Data inicial
     * @param dateTo Data final
     * @param options Opções adicionais
     * @returns Caminho da imagem com polígono desenhado
     */
    async getImageWithPolygon(
        coordinates: Array<{ lat: number; lon: number }>,
        dateFrom: string = "2024-01-01T00:00:00Z",
        dateTo: string = "2024-12-31T23:59:59Z",
        options: {
            collection?: string;
            width?: number;
            height?: number;
            label?: string;
            polygonColor?: string;
            fillOpacity?: number;
        } = {}
    ): Promise<string> {
        const {
            collection = 'sentinel-2-l2a',
            width = 1024,
            height = 1024,
            label = 'Propriedade',
            polygonColor = '#FF0000',
            fillOpacity = 0.3
        } = options;

        if (!coordinates || coordinates.length < 3) {
            throw new Error('Polígono deve ter pelo menos 3 coordenadas');
        }

        // 1. Calcular bbox a partir das coordenadas
        const bbox = this.calculateBboxFromCoordinates(coordinates);
        console.log('📍 BBOX calculado:', bbox);

        // 2. Adicionar margem ao bbox (10%)
        const lonRange = bbox[2] - bbox[0];
        const latRange = bbox[3] - bbox[1];
        const margin = 0.1;

        const expandedBbox = [
            bbox[0] - lonRange * margin,
            bbox[1] - latRange * margin,
            bbox[2] + lonRange * margin,
            bbox[3] + latRange * margin
        ];

        // 3. Obter imagem de satélite
        console.log('🛰️ Obtendo imagem de satélite...');
        const evalscript = `
            //VERSION=3
            function setup() {
                return {
                    input: ["B04", "B03", "B02"],
                    output: {
                        bands: 3,
                        sampleType: "UINT8"
                    }
                };
            }

            function evaluatePixel(sample) {
                return [2.5 * sample.B04, 2.5 * sample.B03, 2.5 * sample.B02];
            }
        `;

        const requestBody: ProcessRequestBody = {
            input: {
                bounds: {
                    bbox: expandedBbox,
                    properties: {
                        crs: 'http://www.opengis.net/def/crs/OGC/1.3/CRS84'
                    }
                },
                data: [
                    {
                        type: collection,
                        dataFilter: {
                            timeRange: { from: dateFrom, to: dateTo },
                            mosaickingOrder: "leastCC"
                        }
                    }
                ]
            },
            output: { width, height },
            evalscript: evalscript
        };

        const imageBuffer = await sentinelHubService.process(requestBody);

        const tempDir = path.join(__dirname, '..', '..', 'temp_images');
        await fs.mkdir(tempDir, { recursive: true });

        const timestamp = Date.now();
        const imagePath = path.join(tempDir, `polygon_base_${timestamp}.png`);

        await fs.writeFile(imagePath, imageBuffer);
        console.log('✅ Imagem base obtida');

        // 4. Converter coordenadas geográficas para pixels
        const pixelCoords = coordinates.map(coord =>
            this.geoToPixel(coord.lat, coord.lon, expandedBbox, width, height)
        );

        // 5. Criar pontos SVG para o polígono
        const polygonPoints = pixelCoords.map(p => `${p.x},${p.y}`).join(' ');

        // 6. Calcular centro do polígono para o label
        const centerX = pixelCoords.reduce((sum, p) => sum + p.x, 0) / pixelCoords.length;
        const centerY = pixelCoords.reduce((sum, p) => sum + p.y, 0) / pixelCoords.length;

        // 7. Criar SVG com o polígono
        const fillColor = polygonColor.replace('#', '');
        const fillRgb = {
            r: parseInt(fillColor.substring(0, 2), 16),
            g: parseInt(fillColor.substring(2, 4), 16),
            b: parseInt(fillColor.substring(4, 6), 16)
        };

        const svg = `
            <svg width="${width}" height="${height}">
                <!-- Polígono preenchido (semi-transparente) -->
                <polygon 
                    points="${polygonPoints}"
                    fill="rgba(${fillRgb.r}, ${fillRgb.g}, ${fillRgb.b}, ${fillOpacity})"
                    stroke="${polygonColor}"
                    stroke-width="4"
                    stroke-linejoin="round"
                />
                
                <!-- Borda adicional destacada -->
                <polygon 
                    points="${polygonPoints}"
                    fill="none"
                    stroke="${polygonColor}"
                    stroke-width="2"
                    stroke-dasharray="10,5"
                />
                
                <!-- Pontos nos vértices -->
                ${pixelCoords.map(p => `
                    <circle cx="${p.x}" cy="${p.y}" r="6" fill="${polygonColor}" stroke="white" stroke-width="2" />
                `).join('')}
                
                <!-- Label no centro do polígono -->
                <text 
                    x="${centerX}" 
                    y="${centerY}" 
                    font-size="20" 
                    fill="white" 
                    stroke="black" 
                    stroke-width="3"
                    text-anchor="middle"
                    font-weight="bold"
                >
                    ${label}
                </text>
                
                <!-- Informações no canto superior esquerdo -->
                <rect x="10" y="10" width="280" height="80" fill="rgba(0,0,0,0.7)" rx="5" />
                <text x="20" y="35" font-size="16" fill="white" font-weight="bold">
                    ${label}
                </text>
                <text x="20" y="55" font-size="12" fill="#00FF00">
                    📍 ${coordinates.length} vértices
                </text>
                <text x="20" y="75" font-size="12" fill="#FFD700">
                    🛰️ Sentinel-2 | ${new Date().toLocaleDateString('pt-BR')}
                </text>
            </svg>
        `;

        // 8. Sobrepor o SVG na imagem
        const outputPath = path.join(tempDir, `polygon_highlighted_${timestamp}.png`);

        const image = sharp(imagePath);
        await image
            .composite([{
                input: Buffer.from(svg),
                top: 0,
                left: 0
            }])
            .toFile(outputPath);

        console.log(`✅ Polígono desenhado com sucesso!`);
        console.log(`📁 Imagem salva em: ${outputPath}`);

        return outputPath;
    }

    /**
     * Processa arquivo JSON de coordenadas e gera imagem com polígono.
     * @param jsonPath Caminho para o arquivo JSON com coordenadas
     * @param propertyKey Chave do polígono no JSON (ex: 'poligono_propriedade_1')
     * @param dateFrom Data inicial
     * @param dateTo Data final
     * @param options Opções adicionais
     * @returns Caminho da imagem gerada
     */
    async processPolygonFromJson(
        jsonPath: string,
        propertyKey: string,
        dateFrom: string = "2024-01-01T00:00:00Z",
        dateTo: string = "2024-12-31T23:59:59Z",
        options: {
            collection?: string;
            width?: number;
            height?: number;
            label?: string;
            polygonColor?: string;
            fillOpacity?: number;
        } = {}
    ): Promise<string> {
        try {
            // 1. Ler arquivo JSON
            console.log(`📂 Lendo arquivo: ${jsonPath}`);
            const jsonContent = await fs.readFile(jsonPath, 'utf-8');
            const data = JSON.parse(jsonContent);

            // 2. Extrair coordenadas
            if (!data[propertyKey]) {
                throw new Error(`Propriedade "${propertyKey}" não encontrada no JSON`);
            }

            const polygonData = data[propertyKey];
            const coordinates: Array<{ lat: number; lon: number }> = [];

            // Converter objeto de posições em array de coordenadas
            Object.keys(polygonData)
                .sort() // pos1, pos2, pos3...
                .forEach(key => {
                    const pos = polygonData[key];
                    coordinates.push({
                        lat: pos.lat,
                        lon: pos.lon
                    });
                });

            console.log(`✅ ${coordinates.length} coordenadas carregadas`);
            console.log('📍 Coordenadas:', coordinates);

            // 3. Gerar imagem com polígono
            const imagePath = await this.getImageWithPolygon(
                coordinates,
                dateFrom,
                dateTo,
                {
                    ...options,
                    label: options.label || propertyKey.replace(/_/g, ' ')
                }
            );

            return imagePath;

        } catch (error) {
            console.error('❌ Erro ao processar JSON:', error);
            throw error;
        }
    }
}

export default new SatelliteService();
import axios from 'axios';
import * as fs from 'fs/promises';
import * as path from 'path';
import sharp from 'sharp';
import { GoogleGenerativeAI } from '@google/generative-ai';

class SatelliteService {

    private readonly SH_AUTH_URL = 'https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token';
    private readonly SH_PROCESS_URL = 'https://sh.dataspace.copernicus.eu/api/v1/process';
    private shToken: string | null = null;
    private shTokenExpiry: number = 0;
    private gemini: GoogleGenerativeAI | null = null;
    private readonly IMG_SIZE = 1024;
    private readonly MIN_BBOX_SPAN_METERS = 800;

    private getGemini(): GoogleGenerativeAI {
        if (!this.gemini) {
            const key = process.env.GEMINI_API_KEY;
            if (!key) throw new Error('GEMINI_API_KEY nao definida no .env');
            this.gemini = new GoogleGenerativeAI(key);
        }
        return this.gemini;
    }

    private async getShToken(): Promise<string> {
        if (this.shToken && Date.now() < this.shTokenExpiry) {
            return this.shToken;
        }
        const clientId = process.env.SENTINELHUB_CLIENT_ID;
        const clientSecret = process.env.SENTINELHUB_CLIENT_SECRET;
        if (!clientId || !clientSecret) {
            throw new Error('SENTINELHUB_CLIENT_ID e SENTINELHUB_CLIENT_SECRET obrigatorios no .env');
        }
        console.log('Obtendo token Sentinel Hub...');
        const response = await axios.post(
            this.SH_AUTH_URL,
            new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: clientId,
                client_secret: clientSecret,
            }).toString(),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 15000 }
        );
        this.shToken = response.data.access_token;
        this.shTokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
        console.log('Token Sentinel Hub obtido!');
        return this.shToken!;
    }

    async fetchSentinelImage(
        centroid: [number, number],
        spanMeters: number = 1200,
        date?: string
    ): Promise<Buffer> {
        const token = await this.getShToken();

        console.log("token ", token)
        const [lat, lon] = centroid;
        const metersPerDegLat = 111320;
        const metersPerDegLon = 111320 * Math.cos(lat * Math.PI / 180);
        const halfSpanLat = (spanMeters / 2) / metersPerDegLat;
        const halfSpanLon = (spanMeters / 2) / metersPerDegLon;
        const bbox = [
            lon - halfSpanLon,
            lat - halfSpanLat,
            lon + halfSpanLon,
            lat + halfSpanLat
        ];
        const dateTo = date || new Date().toISOString().substring(0, 10);
        const dateFromObj = new Date(dateTo);
        dateFromObj.setDate(dateFromObj.getDate() - 90);
        const dateFrom = dateFromObj.toISOString().substring(0, 10);
        console.log('Sentinel Hub: centroid=[' + lat + ', ' + lon + '], span=' + spanMeters + 'm');
        console.log('Periodo: ' + dateFrom + ' a ' + dateTo);
        console.log('BBOX: [' + bbox.map(v => v.toFixed(6)).join(', ') + ']');

        const evalscript = '//VERSION=3\nfunction setup() {\n    return {\n        input: [{ bands: [\"B04\", \"B03\", \"B02\"], units: \"DN\" }],\n        output: { bands: 3, sampleType: \"AUTO\" }\n    };\n}\nfunction evaluatePixel(sample) {\n    return [sample.B04, sample.B03, sample.B02];\n}';

        const requestBody = {
            input: {
                bounds: {
                    bbox,
                    properties: { crs: 'http://www.opengis.net/def/crs/EPSG/0/4326' }
                },
                data: [{
                    type: 'sentinel-2-l2a',
                    dataFilter: {
                        timeRange: {
                            from: dateFrom + 'T00:00:00Z',
                            to: dateTo + 'T23:59:59Z'
                        },
                        maxCloudCoverage: 30,
                        mosaickingOrder: 'leastCC'
                    }
                }]
            },
            output: {
                width: this.IMG_SIZE,
                height: this.IMG_SIZE,
                responses: [{ identifier: 'default', format: { type: 'image/png' } }]
            },
            evalscript
        };

        const response = await axios.post(this.SH_PROCESS_URL, requestBody, {
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
                'Accept': 'image/png',
            },
            responseType: 'arraybuffer',
            timeout: 60000,
        });

        const contentType = response.headers['content-type'] || '';
        if (contentType.includes('json') || contentType.includes('xml')) {
            const errorText = Buffer.from(response.data).toString();
            throw new Error('Sentinel Hub erro: ' + errorText.substring(0, 300));
        }

        const sizeKB = response.data.length / 1024;
        if (sizeKB < 5) {
            throw new Error('Sentinel Hub: imagem vazia (sem dados para esta regiao/periodo)');
        }
        console.log('Sentinel-2: ' + sizeKB.toFixed(1) + ' KB (' + this.IMG_SIZE + 'x' + this.IMG_SIZE + 'px, ~10m/px)');
        return Buffer.from(response.data);
    }

    async analyzeWithGemini(
        imageBuffer: Buffer,
        coordinates: Array<{ lat: number; lon: number }>,
        areaHa: number
    ): Promise<{
        analise_visual: string;
        uso_solo: Record<string, number>;
        biomassa_estimada_ton: number;
        carbono_sequestrado_ton: number;
        recomendacoes: string[];
        confianca: string;
    }> {
        const genAI = this.getGemini();
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const coordsText = coordinates
            .map((c, i) => '  Vertice ' + (i + 1) + ': lat=' + c.lat.toFixed(6) + ', lon=' + c.lon.toFixed(6))
            .join('\n');

        const prompt = 'Voce e um agronomo especialista em sensoriamento remoto e creditos de carbono.\n\n' +
            'Analise esta imagem de satelite Sentinel-2 (True Color) de uma propriedade rural no Brasil.\n\n' +
            'DADOS DA PROPRIEDADE:\n' +
            '- Area aproximada: ' + areaHa.toFixed(1) + ' hectares\n' +
            '- Coordenadas do poligono (' + coordinates.length + ' vertices):\n' +
            coordsText + '\n\n' +
            'INSTRUCOES:\n' +
            '1. Identifique os tipos de uso do solo visiveis (floresta, pastagem, lavoura, solo exposto, agua, etc.)\n' +
            '2. Estime as porcentagens de cada tipo de uso\n' +
            '3. Estime a densidade de biomassa (toneladas por hectare)\n' +
            '4. Calcule o potencial de sequestro de carbono\n' +
            '5. De recomendacoes para maximizar creditos de carbono\n\n' +
            'RESPONDA EXATAMENTE neste formato JSON (sem markdown, sem backticks):\n' +
            '{\n' +
            '  "analise_visual": "Descricao detalhada do que e visivel na imagem",\n' +
            '  "uso_solo": { "floresta_nativa": 45, "pastagem": 30, "lavoura": 15, "solo_exposto": 5, "agua": 5 },\n' +
            '  "biomassa_estimada_ton": 150.0,\n' +
            '  "carbono_sequestrado_ton": 75.0,\n' +
            '  "recomendacoes": ["Recomendacao 1", "Recomendacao 2"],\n' +
            '  "confianca": "media"\n' +
            '}';

        console.log('Enviando imagem para Gemini...');

        const imagePart = {
            inlineData: {
                data: imageBuffer.toString('base64'),
                mimeType: 'image/png' as const,
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();
        console.log('Resposta do Gemini recebida');

        try {
            const cleanJson = responseText.replace(new RegExp('```json\\n?', 'g'), '').replace(new RegExp('```\\n?', 'g'), '').trim();
            return JSON.parse(cleanJson);
        } catch {
            console.warn('Gemini nao retornou JSON valido');
            return {
                analise_visual: responseText,
                uso_solo: {},
                biomassa_estimada_ton: 0,
                carbono_sequestrado_ton: 0,
                recomendacoes: ['Analise nao estruturada'],
                confianca: 'baixa',
            };
        }
    }

    private calculateBboxFromCoordinates(coords: Array<{ lat: number; lon: number }>): number[] {
        let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;
        for (const c of coords) {
            if (c.lon < minLon) minLon = c.lon;
            if (c.lat < minLat) minLat = c.lat;
            if (c.lon > maxLon) maxLon = c.lon;
            if (c.lat > maxLat) maxLat = c.lat;
        }
        return [minLon, minLat, maxLon, maxLat];
    }

    private calculateCentroid(coords: Array<{ lat: number; lon: number }>): [number, number] {
        const avgLat = coords.reduce((s, c) => s + c.lat, 0) / coords.length;
        const avgLon = coords.reduce((s, c) => s + c.lon, 0) / coords.length;
        return [avgLat, avgLon];
    }

    private calculateSpanMeters(coords: Array<{ lat: number; lon: number }>): number {
        const bbox = this.calculateBboxFromCoordinates(coords);
        const [minLon, minLat, maxLon, maxLat] = bbox;
        const widthM = this.distanceMeters(minLat, minLon, minLat, maxLon);
        const heightM = this.distanceMeters(minLat, minLon, maxLat, minLon);
        const span = Math.max(widthM, heightM) * 1.5;
        return Math.max(span, this.MIN_BBOX_SPAN_METERS);
    }

    private distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371000;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    private calculateAreaHectares(coords: Array<{ lat: number; lon: number }>): number {
        const centerLat = coords.reduce((s, c) => s + c.lat, 0) / coords.length;
        const metersPerDegLat = 111320;
        const metersPerDegLon = 111320 * Math.cos(centerLat * Math.PI / 180);
        const points = coords.map(c => ({
            x: (c.lon - coords[0].lon) * metersPerDegLon,
            y: (c.lat - coords[0].lat) * metersPerDegLat,
        }));
        let area = 0;
        for (let i = 0; i < points.length; i++) {
            const j = (i + 1) % points.length;
            area += points[i].x * points[j].y;
            area -= points[j].x * points[i].y;
        }
        return Math.abs(area) / 2 / 10000;
    }

    private geoToPixel(
        lat: number, lon: number,
        centroid: [number, number],
        spanMeters: number,
        imgSize: number
    ): { x: number; y: number } {
        const [cLat, cLon] = centroid;
        const metersPerDegLat = 111320;
        const metersPerDegLon = 111320 * Math.cos(cLat * Math.PI / 180);
        const dx = (lon - cLon) * metersPerDegLon;
        const dy = (lat - cLat) * metersPerDegLat;
        const halfSpan = spanMeters / 2;
        const x = (dx / halfSpan) * (imgSize / 2) + (imgSize / 2);
        const y = -(dy / halfSpan) * (imgSize / 2) + (imgSize / 2);
        return { x, y };
    }

    private async drawPolygonOverlay(
        imageBuffer: Buffer,
        coordinates: Array<{ lat: number; lon: number }>,
        centroid: [number, number],
        spanMeters: number,
        areaHa: number,
        options: { label?: string; polygonColor?: string; fillOpacity?: number; date?: string }
    ): Promise<Buffer> {
        const label = options.label || 'Propriedade';
        const polygonColor = options.polygonColor || '#00FF00';
        const fillOpacity = options.fillOpacity || 0.3;
        const date = options.date || '';
        const size = this.IMG_SIZE;

        const pixelCoords = coordinates.map(c =>
            this.geoToPixel(c.lat, c.lon, centroid, spanMeters, size)
        );
        const polygonPoints = pixelCoords.map(p => p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' ');
        const cx = pixelCoords.reduce((s, p) => s + p.x, 0) / pixelCoords.length;
        const cy = pixelCoords.reduce((s, p) => s + p.y, 0) / pixelCoords.length;
        const hex = polygonColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const resMeters = (spanMeters / size).toFixed(1);

        let verticesSvg = '';
        for (let i = 0; i < pixelCoords.length; i++) {
            const p = pixelCoords[i];
            verticesSvg += '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="10" fill="' + polygonColor + '" stroke="white" stroke-width="2"/>';
            verticesSvg += '<text x="' + p.x.toFixed(1) + '" y="' + (p.y + 4).toFixed(1) + '" font-size="11" fill="white" text-anchor="middle" font-weight="bold">' + (i + 1) + '</text>';
        }

        const svg = '<svg width="' + size + '" height="' + size + '" xmlns="http://www.w3.org/2000/svg">' +
            '<polygon points="' + polygonPoints + '" fill="rgba(' + r + ',' + g + ',' + b + ',' + fillOpacity + ')" stroke="' + polygonColor + '" stroke-width="3" stroke-linejoin="round"/>' +
            '<polygon points="' + polygonPoints + '" fill="none" stroke="white" stroke-width="1.5" stroke-dasharray="6,3"/>' +
            verticesSvg +
            '<text x="' + cx.toFixed(1) + '" y="' + cy.toFixed(1) + '" font-size="16" fill="white" stroke="black" stroke-width="2.5" text-anchor="middle" font-weight="bold">' + label + '</text>' +
            '<rect x="8" y="8" width="310" height="75" fill="rgba(0,0,0,0.85)" rx="6"/>' +
            '<text x="16" y="28" font-size="13" fill="white" font-weight="bold">' + label + '</text>' +
            '<text x="16" y="46" font-size="11" fill="#00FF00">' + coordinates.length + ' vertices | ~' + areaHa.toFixed(1) + ' ha</text>' +
            '<text x="16" y="62" font-size="11" fill="#FFD700">Sentinel-2 | ~' + resMeters + 'm/px | ' + date + '</text>' +
            '<text x="16" y="76" font-size="9" fill="#AAAAAA">' + (spanMeters / 1000).toFixed(1) + 'x' + (spanMeters / 1000).toFixed(1) + ' km</text>' +
            '</svg>';

        return sharp(imageBuffer)
            .resize(size, size)
            .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
            .png()
            .toBuffer();
    }

    private async ensureTempDir(): Promise<string> {
        const tempDir = path.join(__dirname, '..', '..', 'temp_images');
        await fs.mkdir(tempDir, { recursive: true });
        return tempDir;
    }

    async getImageWithPolygon(
        coordinates: Array<{ lat: number; lon: number }>,
        date?: string,
        options: {
            width?: number;
            height?: number;
            label?: string;
            polygonColor?: string;
            fillOpacity?: number;
            analyzeWithAI?: boolean;
            centroid?: [number, number];
        } = {}
    ): Promise<{ imagePath: string; analysis?: any }> {
        const label = options.label || 'Propriedade';
        const polygonColor = options.polygonColor || '#00FF00';
        const fillOpacity = options.fillOpacity || 0.3;
        const analyzeWithAI = options.analyzeWithAI !== undefined ? options.analyzeWithAI : true;

        if (!coordinates || coordinates.length < 3) {
            throw new Error('Poligono deve ter pelo menos 3 coordenadas');
        }

        const centroid = options.centroid || this.calculateCentroid(coordinates);
        const areaHa = this.calculateAreaHectares(coordinates);
        const spanMeters = this.calculateSpanMeters(coordinates);

        console.log('================================================');
        console.log('Processando: ' + label);
        console.log(coordinates.length + ' vertices, ~' + areaHa.toFixed(1) + ' ha');
        console.log('Centroide: [' + centroid[0].toFixed(6) + ', ' + centroid[1].toFixed(6) + ']');
        console.log('Span: ' + spanMeters.toFixed(0) + 'm (~' + (spanMeters / 1000).toFixed(1) + 'km)');
        console.log('================================================');

        const imageBuffer = await this.fetchSentinelImage(centroid, spanMeters, date);

        const tempDir = await this.ensureTempDir();
        const ts = Date.now();
        const basePath = path.join(tempDir, 'sentinel_base_' + ts + '.png');
        await fs.writeFile(basePath, imageBuffer);

        const dateStr = date || new Date().toISOString().substring(0, 10);
        const overlayBuffer = await this.drawPolygonOverlay(
            imageBuffer, coordinates, centroid, spanMeters, areaHa,
            { label, polygonColor, fillOpacity, date: dateStr }
        );

        const outputPath = path.join(tempDir, 'polygon_' + ts + '.png');
        await fs.writeFile(outputPath, overlayBuffer);
        console.log('Poligono desenhado: ' + outputPath);

        let analysis = null;
        if (analyzeWithAI) {
            try {
                analysis = await this.analyzeWithGemini(imageBuffer, coordinates, areaHa);
                console.log('Analise Gemini:');
                console.log('  Biomassa: ' + analysis.biomassa_estimada_ton + ' ton');
                console.log('  Carbono: ' + analysis.carbono_sequestrado_ton + ' ton');
                console.log('  Confianca: ' + analysis.confianca);
            } catch (error: any) {
                console.warn('Erro Gemini: ' + error.message);
                analysis = { erro: error.message };
            }
        }

        return { imagePath: outputPath, analysis };
    }

    async processPolygonFromJson(
        jsonPath: string,
        propertyKey: string,
        date?: string,
        options: {
            width?: number;
            height?: number;
            label?: string;
            polygonColor?: string;
            fillOpacity?: number;
            analyzeWithAI?: boolean;
        } = {}
    ): Promise<{ imagePath: string; analysis?: any }> {
        console.log('Lendo: ' + jsonPath);
        const jsonContent = await fs.readFile(jsonPath, 'utf-8');
        const data = JSON.parse(jsonContent);

        if (!data[propertyKey]) {
            throw new Error('Chave "' + propertyKey + '" nao encontrada no JSON');
        }

        const polygonData = data[propertyKey];
        const coordinates: Array<{ lat: number; lon: number }> = [];
        let centroid: [number, number] | undefined;

        if (polygonData.centroide && Array.isArray(polygonData.centroide)) {
            centroid = [polygonData.centroide[0], polygonData.centroide[1]];
            console.log('Centroide do JSON: [' + centroid[0] + ', ' + centroid[1] + ']');
        }

        Object.keys(polygonData)
            .filter(key => key.startsWith('pos'))
            .sort()
            .forEach(key => {
                coordinates.push({
                    lat: polygonData[key].lat,
                    lon: polygonData[key].lon
                });
            });

        console.log(coordinates.length + ' coordenadas carregadas');

        return this.getImageWithPolygon(coordinates, date, {
            ...options,
            label: options.label || propertyKey.replace(/_/g, ' '),
            centroid,
        });
    }

    async getImageByBbox(
        bbox: number[],
        date?: string,
        options: { label?: string } = {}
    ): Promise<string> {
        if (!bbox || bbox.length !== 4) {
            throw new Error('BBOX invalido. Formato: [oeste, sul, leste, norte]');
        }
        const [minLon, minLat, maxLon, maxLat] = bbox;
        const centroid: [number, number] = [(minLat + maxLat) / 2, (minLon + maxLon) / 2];
        const widthM = this.distanceMeters(minLat, minLon, minLat, maxLon);
        const heightM = this.distanceMeters(minLat, minLon, maxLat, minLon);
        const spanMeters = Math.max(widthM, heightM) * 1.2;

        const imageBuffer = await this.fetchSentinelImage(centroid, spanMeters, date);
        const tempDir = await this.ensureTempDir();
        const ts = Date.now();
        const outputPath = path.join(tempDir, 'bbox_' + ts + '.png');
        await fs.writeFile(outputPath, imageBuffer);
        console.log('Imagem BBOX: ' + outputPath);
        return outputPath;
    }

    // =====================================================
    // MÉTODOS PÚBLICOS PARA POSTMAN
    // =====================================================

    async getToken(): Promise<string> {
        return this.getShToken();
    }

    calculateCentroidPublic(coords: Array<{ lat: number; lon: number }>): [number, number] {
        return this.calculateCentroid(coords);
    }

    calculateAreaHectaresPublic(coords: Array<{ lat: number; lon: number }>): number {
        return this.calculateAreaHectares(coords);
    }
}

export default new SatelliteService();

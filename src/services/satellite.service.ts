import sentinelHubService from '../modules/integrations/apis';
import { ProcessRequestBody } from '../modules/integrations/types';
import { IProperty } from '../modules/property/property.model';
import * as fs from 'fs/promises';
import * as path from 'path';

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
}

export default new SatelliteService();
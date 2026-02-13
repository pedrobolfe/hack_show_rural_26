import { Request, Response } from 'express';
import propertyService from './property.service';
import carApiService from '../../services/car-api.service';
import satelliteService from '../../services/satellite.service';
import * as path from 'path';

class PropertyController {
  async consultCarData(req: Request, res: Response) {
    try {
      const { carNumber } = req.params;
      
      // Garante que carNumber é uma string
      const carNumberStr = Array.isArray(carNumber) ? carNumber[0] : carNumber;
      
      // Busca os dados do CAR
      const carData = await carApiService.fetchCarData(carNumberStr);
      if (!carData) {
        return res.status(404).json({
          success: false,
          error: 'Dados do CAR não encontrados'
        });
      }

      return res.status(200).json({
        success: true,
        data: carData,
        message: 'Dados do CAR consultados com sucesso'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const property = await propertyService.create(req.body);
      return res.status(201).json({
        success: true,
        data: property,
        message: 'Propriedade criada com sucesso'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  async syncCarData(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;
      const { carNumber } = req.body;
      
      const property = await propertyService.syncCarData(propertyId as string, carNumber);
      return res.status(200).json({
        success: true,
        data: property,
        message: 'Dados do CAR sincronizados com sucesso'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const properties = await propertyService.findAll(limit);
      return res.status(200).json({
        success: true,
        data: properties,
        count: properties.length
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const property = await propertyService.findById(req.params.id as string);
      return res.status(200).json({
        success: true,
        data: property
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  async getByOwner(req: Request, res: Response) {
    try {
      const properties = await propertyService.findByOwnerId(req.params.ownerId as string);
      return res.status(200).json({
        success: true,
        data: properties,
        count: properties.length
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  async getWithoutCluster(_req: Request, res: Response) {
    try {
      const properties = await propertyService.findWithoutCluster();
      return res.status(200).json({
        success: true,
        data: properties,
        count: properties.length
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const property = await propertyService.updateStatus(id as string, status);
      return res.status(200).json({
        success: true,
        data: property,
        message: 'Status atualizado com sucesso'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const property = await propertyService.delete(req.params.id as string);
      return res.status(200).json({
        success: true,
        data: property,
        message: 'Propriedade deletada com sucesso'
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  // ============================================================
  // ROTAS DE IMAGENS DE SATÉLITE (Sentinel Hub + Gemini AI)
  // ============================================================

  /**
   * Obter token OAuth2 do Sentinel Hub
   * POST /api/properties/satellite/token
   */
  async getSentinelToken(_req: Request, res: Response) {
    try {
      const token = await satelliteService.getToken();
      return res.status(200).json({
        success: true,
        data: {
          access_token: token,
          token_type: 'Bearer',
          expires_in: 3600, // Aproximado
          source: 'Sentinel Hub Copernicus Data Space'
        },
        message: 'Token OAuth2 obtido com sucesso'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  /**
   * Obter URL da imagem Sentinel-2 com coordenadas (sem baixar)
   * POST /api/properties/satellite/image-url
   */
  async getImageUrlWithCoordinates(req: Request, res: Response) {
    try {
      const {
        coordinates,
        date,
        centroid,
        spanMeters = 1200
      } = req.body;

      // Validar coordenadas
      if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Coordenadas inválidas. Forneça array com pelo menos 3 pontos [{lat, lon}, ...]'
        });
      }

      // Validar formato das coordenadas
      const validCoords = coordinates.every((coord: any) =>
        typeof coord.lat === 'number' && typeof coord.lon === 'number'
      );

      if (!validCoords) {
        return res.status(400).json({
          success: false,
          error: 'Formato de coordenadas inválido. Use: [{lat: -24.123, lon: -53.456}, ...]'
        });
      }

      // Calcular centroid se não fornecido
      const finalCentroid = centroid || satelliteService.calculateCentroidPublic(coordinates);
      const areaHa = satelliteService.calculateAreaHectaresPublic(coordinates);

      // Obter token
      const token = await satelliteService.getToken();

      // Calcular BBOX
      const [lat, lon] = finalCentroid;
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

      // Calcular período
      const dateTo = date || new Date().toISOString().substring(0, 10);
      const dateFromObj = new Date(dateTo);
      dateFromObj.setDate(dateFromObj.getDate() - 90);
      const dateFrom = dateFromObj.toISOString().substring(0, 10);

      // Construir evalscript
      const evalscript = `//VERSION=3\nfunction setup() {\n    return {\n        input: [{ bands: [\"B04\", \"B03\", \"B02\"], units: \"DN\" }],\n        output: { bands: 3, sampleType: \"AUTO\" }\n    };\n}\nfunction evaluatePixel(sample) {\n    return [sample.B04, sample.B03, sample.B02];\n}`;

      // Construir request body
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
          width: 1024,
          height: 1024,
          responses: [{ identifier: 'default', format: { type: 'image/png' } }]
        },
        evalscript
      };

      return res.status(200).json({
        success: true,
        data: {
          url: 'https://sh.dataspace.copernicus.eu/api/v1/process',
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'image/png'
          },
          body: requestBody,
          centroid: finalCentroid,
          bbox,
          areaHa: areaHa.toFixed(1),
          period: `${dateFrom} a ${dateTo}`,
          spanMeters,
          coordinatesCount: coordinates.length,
          source: 'Sentinel-2 (Copernicus Data Space)'
        },
        message: 'URL e dados para requisição preparados'
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  /**
   * Obtém imagem de satélite com polígono desenhado a partir de coordenadas
   * POST /api/properties/satellite/polygon
   */
  async getImageWithPolygon(req: Request, res: Response) {
    try {
      const { 
        coordinates, 
        date,
        width = 1024,
        height = 1024,
        label = 'Propriedade',
        polygonColor = '#00FF00',
        fillOpacity = 0.3,
        returnPath = false,
        analyzeWithAI = true
      } = req.body;

      // Validar coordenadas
      if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Coordenadas inválidas. Forneça array com pelo menos 3 pontos [{lat, lon}, ...]'
        });
      }

      // Validar formato das coordenadas
      const validCoords = coordinates.every((coord: any) => 
        typeof coord.lat === 'number' && typeof coord.lon === 'number'
      );

      if (!validCoords) {
        return res.status(400).json({
          success: false,
          error: 'Formato de coordenadas inválido. Use: [{lat: -24.123, lon: -53.456}, ...]'
        });
      }

      console.log(`📍 Processando ${coordinates.length} coordenadas...`);

      const result = await satelliteService.getImageWithPolygon(
        coordinates,
        date,
        {
          width: parseInt(width),
          height: parseInt(height),
          label,
          polygonColor,
          fillOpacity: parseFloat(fillOpacity),
          analyzeWithAI
        }
      );

      if (returnPath === true || returnPath === 'true') {
        return res.json({
          success: true,
          data: {
            imagePath: result.imagePath,
            analysis: result.analysis,
            coordinates: coordinates.length,
            source: 'Sentinel-2 (Copernicus) + Gemini AI',
            settings: { width, height, label, polygonColor, fillOpacity }
          },
          message: 'Imagem gerada e analisada com sucesso'
        });
      } else {
        return res.sendFile(result.imagePath);
      }

    } catch (error) {
      console.error('❌ Erro ao gerar imagem:', error);
      return res.status(500).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  /**
   * Obtém imagem de satélite com polígono a partir de arquivo JSON
   * POST /api/properties/satellite/polygon-json
   */
  async getImageFromJsonFile(req: Request, res: Response) {
    try {
      const {
        propertyKey = 'poligono_propriedade_1',
        date,
        width = 1024,
        height = 1024,
        label,
        polygonColor = '#00FF00',
        fillOpacity = 0.3,
        returnPath = false,
        analyzeWithAI = true
      } = req.body;

      const jsonPath = path.join(__dirname, '..', '..', 'services', 'coordenadas.json');

      console.log(`📂 Lendo arquivo: ${jsonPath}`);
      console.log(`🔑 Propriedade: ${propertyKey}`);

      const result = await satelliteService.processPolygonFromJson(
        jsonPath,
        propertyKey,
        date,
        {
          width: parseInt(width),
          height: parseInt(height),
          label: label || propertyKey.replace(/_/g, ' '),
          polygonColor,
          fillOpacity: parseFloat(fillOpacity),
          analyzeWithAI
        }
      );

      if (returnPath === true || returnPath === 'true') {
        return res.json({
          success: true,
          data: {
            imagePath: result.imagePath,
            analysis: result.analysis,
            propertyKey,
            source: 'Sentinel-2 (Copernicus) + Gemini AI',
            settings: { width, height, label, polygonColor, fillOpacity }
          },
          message: 'Imagem gerada e analisada com sucesso a partir do JSON'
        });
      } else {
        return res.sendFile(result.imagePath);
      }

    } catch (error) {
      console.error('❌ Erro ao processar JSON:', error);
      return res.status(500).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  /**
   * Obtém imagem de satélite simples por BBOX
   * GET /api/properties/satellite/bbox?bbox=-53.5,-25.0,-53.4,-24.9
   */
  async getImageByBbox(req: Request, res: Response) {
    try {
      const { bbox, date, label, returnPath } = req.query;

      if (!bbox) {
        return res.status(400).json({
          success: false,
          error: 'Parâmetro bbox é obrigatório. Formato: ?bbox=-53.5,-25.0,-53.4,-24.9'
        });
      }

      const bboxArray = (bbox as string).split(',').map(Number);

      if (bboxArray.length !== 4 || bboxArray.some(isNaN)) {
        return res.status(400).json({
          success: false,
          error: 'BBOX deve ter 4 valores numéricos: [oeste,sul,leste,norte]'
        });
      }

      const imagePath = await satelliteService.getImageByBbox(
        bboxArray,
        date as string,
        { label: (label as string) || 'Área de Interesse' }
      );

      if (returnPath === 'true') {
        return res.json({
          success: true,
          data: {
            imagePath,
            bbox: bboxArray,
            source: 'Sentinel-2 (Copernicus)'
          },
          message: 'Imagem gerada com sucesso via Sentinel Hub'
        });
      } else {
        return res.sendFile(imagePath);
      }

    } catch (error) {
      return res.status(500).json({
        success: false,
        error: (error as Error).message
      });
    }
  }
}

export default new PropertyController();

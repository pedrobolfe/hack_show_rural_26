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
  // ROTAS DE IMAGENS DE SATÉLITE
  // ============================================================

  /**
   * Obtém imagem de satélite com polígono desenhado a partir de coordenadas
   * POST /api/properties/satellite/polygon
   */
  async getImageWithPolygon(req: Request, res: Response) {
    try {
      const { 
        coordinates, 
        dateFrom = "2024-01-01T00:00:00Z",
        dateTo = new Date().toISOString(),
        width = 1024,
        height = 1024,
        label = 'Propriedade',
        polygonColor = '#FF0000',
        fillOpacity = 0.3,
        returnPath = false
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

      // Gerar imagem com polígono
      const imagePath = await satelliteService.getImageWithPolygon(
        coordinates,
        dateFrom,
        dateTo,
        {
          width: parseInt(width),
          height: parseInt(height),
          label,
          polygonColor,
          fillOpacity: parseFloat(fillOpacity)
        }
      );

      // Retornar conforme solicitado
      if (returnPath === true || returnPath === 'true') {
        return res.json({
          success: true,
          data: {
            imagePath,
            coordinates: coordinates.length,
            period: { from: dateFrom, to: dateTo },
            settings: { width, height, label, polygonColor, fillOpacity }
          },
          message: 'Imagem gerada com sucesso'
        });
      } else {
        // Retornar a imagem diretamente
        return res.sendFile(imagePath);
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
        dateFrom = "2024-01-01T00:00:00Z",
        dateTo = new Date().toISOString(),
        width = 1024,
        height = 1024,
        label,
        polygonColor = '#FF0000',
        fillOpacity = 0.3,
        returnPath = false
      } = req.body;

      // Caminho padrão do JSON
      const jsonPath = path.join(__dirname, '..', '..', 'services', 'coordenadas.json');

      console.log(`📂 Lendo arquivo: ${jsonPath}`);
      console.log(`🔑 Propriedade: ${propertyKey}`);

      // Processar JSON
      const imagePath = await satelliteService.processPolygonFromJson(
        jsonPath,
        propertyKey,
        dateFrom,
        dateTo,
        {
          width: parseInt(width),
          height: parseInt(height),
          label: label || propertyKey.replace(/_/g, ' '),
          polygonColor,
          fillOpacity: parseFloat(fillOpacity)
        }
      );

      // Retornar conforme solicitado
      if (returnPath === true || returnPath === 'true') {
        return res.json({
          success: true,
          data: {
            imagePath,
            propertyKey,
            period: { from: dateFrom, to: dateTo },
            settings: { width, height, label, polygonColor, fillOpacity }
          },
          message: 'Imagem gerada com sucesso a partir do JSON'
        });
      } else {
        // Retornar a imagem diretamente
        return res.sendFile(imagePath);
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
      const { bbox, dateFrom, dateTo, label, width, height, returnPath } = req.query;

      // Validar bbox
      if (!bbox) {
        return res.status(400).json({
          success: false,
          error: 'Parâmetro bbox é obrigatório. Formato: ?bbox=-53.5,-25.0,-53.4,-24.9'
        });
      }

      // Converter bbox de string para array
      const bboxArray = (bbox as string).split(',').map(Number);

      if (bboxArray.length !== 4 || bboxArray.some(isNaN)) {
        return res.status(400).json({
          success: false,
          error: 'BBOX deve ter 4 valores numéricos: [oeste,sul,leste,norte]'
        });
      }

      // Obter imagem
      const imagePath = await satelliteService.getImageByBbox(
        bboxArray,
        (dateFrom as string) || "2024-01-01T00:00:00Z",
        (dateTo as string) || new Date().toISOString(),
        {
          label: (label as string) || 'Área de Interesse',
          width: width ? parseInt(width as string) : 1024,
          height: height ? parseInt(height as string) : 1024
        }
      );

      // Retornar conforme solicitado
      if (returnPath === 'true') {
        return res.json({
          success: true,
          data: {
            imagePath,
            bbox: bboxArray,
            period: { from: dateFrom, to: dateTo }
          },
          message: 'Imagem gerada com sucesso'
        });
      } else {
        // Retornar a imagem diretamente
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

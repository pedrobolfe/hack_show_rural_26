import { Request, Response } from 'express';
import propertyService from './property.service';

class PropertyController {
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
}

export default new PropertyController();

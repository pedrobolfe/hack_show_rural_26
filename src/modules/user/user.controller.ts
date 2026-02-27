import { Request, Response } from 'express';
import userService from './user.service';

class UserController {
  async create(req: Request, res: Response) {
    try {
      const user = await userService.create(req.body);
      return res.status(201).json({
        success: true,
        data: user,
        message: 'Usuário criado com sucesso'
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
      const users = await userService.findAll(limit);
      return res.status(200).json({
        success: true,
        data: users,
        count: users.length
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
      const user = await userService.findById(req.params.id as string);
      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  async getByEmail(req: Request, res: Response) {
    try {
      const user = await userService.findByEmail(req.params.email as string);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }
      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  async getByRole(req: Request, res: Response) {
    try {
      const users = await userService.findByRole(req.params.role as string);
      return res.status(200).json({
        success: true,
        data: users,
        count: users.length
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  async getByUserType(req: Request, res: Response) {
    try {
      const users = await userService.findByUserType(req.params.userType as 'produtor' | 'cooperativa');
      return res.status(200).json({
        success: true,
        data: users,
        count: users.length
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  async getByNumCRA(req: Request, res: Response) {
    try {
      const user = await userService.findByNumCRA(req.params.numCRA as string);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Produtor com este CAR não encontrado'
        });
      }
      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const user = await userService.update(req.params.id as string, req.body);
      return res.status(200).json({
        success: true,
        data: user,
        message: 'Usuário atualizado com sucesso'
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
      const user = await userService.delete(req.params.id as string);
      return res.status(200).json({
        success: true,
        data: user,
        message: 'Usuário deletado com sucesso'
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  async updateQuestions(req: Request, res: Response) {
    try {
      const { questionsAndResponses } = req.body;
      
      if (!Array.isArray(questionsAndResponses)) {
        return res.status(400).json({
          success: false,
          error: 'questionsAndResponses deve ser um array'
        });
      }

      const user = await userService.updateQuestions(req.params.id as string, questionsAndResponses);
      return res.status(200).json({
        success: true,
        data: user,
        message: 'Respostas salvas com sucesso'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: (error as Error).message
      });
    }
  }
}

export default new UserController();

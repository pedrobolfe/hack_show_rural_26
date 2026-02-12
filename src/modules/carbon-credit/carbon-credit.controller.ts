import { Request, Response } from 'express';
import carbonCreditService from './carbon-credit.service';

class CarbonCreditController {
  // FASE 1: Criar rascunho
  async createDraft(req: Request, res: Response) {
    try {
      const credit = await carbonCreditService.createDraft(req.body);
      return res.status(201).json({
        success: true,
        data: credit,
        message: 'Crédito criado como rascunho'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  // FASE 2: Submeter para verificação
  async submitForVerification(req: Request, res: Response) {
    try {
      const { creditId } = req.params;
      const { submittedBy } = req.body;
      
      const credit = await carbonCreditService.submitForVerification(creditId as string, submittedBy);
      return res.status(200).json({
        success: true,
        data: credit,
        message: 'Crédito submetido para verificação'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  // FASE 3: Verificar (Verificador)
  async verifyCredit(req: Request, res: Response) {
    try {
      const { creditId } = req.params;
      const { verifiedBy } = req.body;
      
      const credit = await carbonCreditService.verifyCreditByVerifier(creditId as string, verifiedBy);
      return res.status(200).json({
        success: true,
        data: credit,
        message: 'Crédito verificado'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  // FASE 4: Certificar e Assinar (Supervisor)
  async certifyAndSign(req: Request, res: Response) {
    try {
      const { creditId } = req.params;
      const { approvedBy, privateKey } = req.body;
      
      // TODO: Em produção, privateKey vem de KMS, não do body!
      const credit = await carbonCreditService.certifyAndSign(
        creditId as string,
        approvedBy,
        privateKey
      );
      
      return res.status(200).json({
        success: true,
        data: credit,
        message: 'Crédito certificado e assinado'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  // FASE 5: Emitir
  async issueCredit(req: Request, res: Response) {
    try {
      const { creditId } = req.params;
      
      const credit = await carbonCreditService.issueCredit(creditId as string);
      return res.status(200).json({
        success: true,
        data: credit,
        message: 'Crédito emitido'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  // Transferir propriedade
  async transferOwnership(req: Request, res: Response) {
    try {
      const { creditId } = req.params;
      const { newOwnerId, price, currency } = req.body;
      
      const credit = await carbonCreditService.transferOwnership(
        creditId as string,
        newOwnerId,
        price,
        currency
      );
      
      return res.status(200).json({
        success: true,
        data: credit,
        message: 'Propriedade transferida'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  // Aposentar crédito
  async retireCredit(req: Request, res: Response) {
    try {
      const { creditId } = req.params;
      const { retiredBy, reason } = req.body;
      
      const credit = await carbonCreditService.retireCredit(
        creditId as string,
        retiredBy,
        reason
      );
      
      return res.status(200).json({
        success: true,
        data: credit,
        message: 'Crédito aposentado'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  // Verificar certificado (API Pública)
  async verifyCertificate(req: Request, res: Response) {
    try {
      const { tokenId } = req.params;
      
      const result = await carbonCreditService.verifyCreditCertificate(tokenId as string);
      
      return res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  // Listar todos
  async getAll(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const credits = await carbonCreditService.findAll(limit);
      return res.status(200).json({
        success: true,
        data: credits,
        count: credits.length
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  // Buscar por ID
  async getById(req: Request, res: Response) {
    try {
      const credit = await carbonCreditService.findById(req.params.id as string);
      return res.status(200).json({
        success: true,
        data: credit
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: (error as Error).message
      });
    }
  }

  // Buscar por status
  async getByStatus(req: Request, res: Response) {
    try {
      const credits = await carbonCreditService.findByStatus(req.params.status as any);
      return res.status(200).json({
        success: true,
        data: credits,
        count: credits.length
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: (error as Error).message
      });
    }
  }
}

export default new CarbonCreditController();

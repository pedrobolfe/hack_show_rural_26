import { Router } from 'express';
import carbonCreditController from './carbon-credit.controller';

const router = Router();

// Ciclo de Vida do Crédito
router.post('/', (req, res) => carbonCreditController.createDraft(req, res));
router.post('/:creditId/submit', (req, res) => carbonCreditController.submitForVerification(req, res));
router.post('/:creditId/verify', (req, res) => carbonCreditController.verifyCredit(req, res));
router.post('/:creditId/certify', (req, res) => carbonCreditController.certifyAndSign(req, res));
router.post('/:creditId/issue', (req, res) => carbonCreditController.issueCredit(req, res));

// Operações
router.post('/:creditId/transfer', (req, res) => carbonCreditController.transferOwnership(req, res));
router.post('/:creditId/retire', (req, res) => carbonCreditController.retireCredit(req, res));

// API Pública de Verificação
router.get('/verify/:tokenId', (req, res) => carbonCreditController.verifyCertificate(req, res));

// Consultas
router.get('/', (req, res) => carbonCreditController.getAll(req, res));
router.get('/status/:status', (req, res) => carbonCreditController.getByStatus(req, res));
router.get('/:id', (req, res) => carbonCreditController.getById(req, res));

export default router;

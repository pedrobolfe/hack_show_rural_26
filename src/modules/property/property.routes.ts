import { Router } from 'express';
import propertyController from './property.controller';

const router = Router();

router.post('/', (req, res) => propertyController.create(req, res));
router.post('/:propertyId/sync-car', (req, res) => propertyController.syncCarData(req, res));
router.get('/', (req, res) => propertyController.getAll(req, res));
router.get('/without-cluster', (req, res) => propertyController.getWithoutCluster(req, res));
router.get('/owner/:ownerId', (req, res) => propertyController.getByOwner(req, res));
router.get('/:id', (req, res) => propertyController.getById(req, res));
router.patch('/:id/status', (req, res) => propertyController.updateStatus(req, res));
router.delete('/:id', (req, res) => propertyController.delete(req, res));

export default router;

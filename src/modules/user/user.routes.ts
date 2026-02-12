import { Router } from 'express';
import userController from './user.controller';

const router = Router();

router.post('/', (req, res) => userController.create(req, res));
router.get('/', (req, res) => userController.getAll(req, res));
router.get('/email/:email', (req, res) => userController.getByEmail(req, res));
router.get('/role/:role', (req, res) => userController.getByRole(req, res));
router.get('/type/:userType', (req, res) => userController.getByUserType(req, res));
router.get('/car/:numCRA', (req, res) => userController.getByNumCRA(req, res));
router.get('/:id', (req, res) => userController.getById(req, res));
router.put('/:id', (req, res) => userController.update(req, res));
router.delete('/:id', (req, res) => userController.delete(req, res));

export default router;

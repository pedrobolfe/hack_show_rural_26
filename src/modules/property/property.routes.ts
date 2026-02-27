import { Router } from 'express';
import propertyController from './property.controller';

const router = Router();

// ============================================================
// ROTAS DE IMAGENS DE SATÉLITE (DEVEM VIR ANTES DAS ROTAS DINÂMICAS)
// ============================================================

// Obter token OAuth2 do Sentinel Hub
router.post('/satellite/token', (req, res) => propertyController.getSentinelToken(req, res));

// Obter URL da imagem com coordenadas (sem baixar)
router.post('/satellite/image-url', (req, res) => propertyController.getImageUrlWithCoordinates(req, res));

// Obter imagem com polígono a partir de coordenadas
router.post('/satellite/polygon', (req, res) => propertyController.getImageWithPolygon(req, res));

// Obter imagem com polígono a partir do JSON
router.post('/satellite/polygon-json', (req, res) => propertyController.getImageFromJsonFile(req, res));

// Obter imagem por BBOX
router.get('/satellite/bbox', (req, res) => propertyController.getImageByBbox(req, res));

// ============================================================
// ROTAS DE PROPRIEDADES
// ============================================================

// Rota para consultar dados do CAR (sem criar propriedade)
router.get('/car/:carNumber', (req, res) => propertyController.consultCarData(req, res));

router.post('/', (req, res) => propertyController.create(req, res));
router.post('/:propertyId/sync-car', (req, res) => propertyController.syncCarData(req, res));
router.get('/', (req, res) => propertyController.getAll(req, res));
router.get('/without-cluster', (req, res) => propertyController.getWithoutCluster(req, res));
router.get('/owner/:ownerId', (req, res) => propertyController.getByOwner(req, res));
router.get('/:id', (req, res) => propertyController.getById(req, res));
router.patch('/:id/status', (req, res) => propertyController.updateStatus(req, res));
router.delete('/:id', (req, res) => propertyController.delete(req, res));

export default router;

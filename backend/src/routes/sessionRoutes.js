import express from 'express';
import { sessionController } from '../controllers/sessionController.js';
import { authenticateUser } from '../middlewares/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateUser);

// Rutas de sesiones
router.post('/', sessionController.createSession);
router.get('/', sessionController.getSessions);
router.get('/:sessionId/qr', sessionController.getQRCode);
router.get('/:sessionId/status', sessionController.getSessionStatus);
router.post('/:sessionId/restart', sessionController.restartSession);
router.delete('/:sessionId', sessionController.deleteSession);
router.get('/:sessionId/logs', sessionController.getSessionLogs);
router.post('/:sessionId/send', sessionController.sendMessage);

export default router;


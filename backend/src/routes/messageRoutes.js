import express from 'express';
import { messageController } from '../controllers/messageController.js';
import { authenticateUser } from '../middlewares/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateUser);

// Rutas de mensajes
router.get('/:sessionId/contacts', messageController.getContacts);
router.get('/:sessionId/chat/:chatId', messageController.getChatMessages);
router.post('/:sessionId/chat/:chatId/read', messageController.markAsRead);

export default router;


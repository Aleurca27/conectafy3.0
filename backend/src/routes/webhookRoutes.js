import express from 'express';
import { webhookController } from '../controllers/webhookController.js';

const router = express.Router();

// Webhook de WhatsApp (no requiere autenticación, viene de WAHA)
router.post('/whatsapp/:containerName', webhookController.receiveWhatsAppWebhook);

export default router;


import messageService from '../services/messageService.js';

/**
 * Controlador para webhooks de WAHA
 */
export const webhookController = {
  /**
   * Recibir webhook de WhatsApp (mensajes y eventos)
   */
  async receiveWhatsAppWebhook(req, res) {
    try {
      const { containerName } = req.params;
      const webhookData = req.body;

      console.log('Webhook recibido:', {
        container: containerName,
        event: webhookData.event,
        data: webhookData
      });

      // Procesar según el tipo de evento
      if (webhookData.event === 'message') {
        // Mensaje entrante
        await messageService.saveIncomingMessage(containerName, webhookData.payload);
      } else if (webhookData.event === 'session.status') {
        // Cambio de estado de sesión
        await messageService.updateSessionStatus(containerName, webhookData.payload.status);
      }

      // Responder 200 OK al webhook
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error procesando webhook:', error);
      // Aunque haya error, respondemos 200 para que WAHA no reintente
      res.status(200).json({ success: false, error: error.message });
    }
  }
};


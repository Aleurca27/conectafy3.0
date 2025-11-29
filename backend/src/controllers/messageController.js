import messageService from '../services/messageService.js';
import wahaService from '../services/wahaService.js';

/**
 * Controlador para gestión de mensajes
 */
export const messageController = {
  /**
   * Obtener contactos de una sesión
   */
  async getContacts(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      // Verificar que la sesión pertenece al usuario
      const sessions = await wahaService.getUserSessions(userId);
      const session = sessions.find(s => s.id === sessionId);

      if (!session) {
        return res.status(404).json({
          error: 'No encontrado',
          message: 'Sesión no encontrada'
        });
      }

      const contacts = await messageService.getSessionContacts(sessionId);

      res.json({
        success: true,
        data: contacts
      });
    } catch (error) {
      console.error('Error en getContacts:', error);
      res.status(500).json({
        error: 'Error del servidor',
        message: 'No se pudieron obtener los contactos'
      });
    }
  },

  /**
   * Obtener mensajes de un chat específico
   */
  async getChatMessages(req, res) {
    try {
      const { sessionId, chatId } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      const userId = req.user.id;

      // Verificar que la sesión pertenece al usuario
      const sessions = await wahaService.getUserSessions(userId);
      const session = sessions.find(s => s.id === sessionId);

      if (!session) {
        return res.status(404).json({
          error: 'No encontrado',
          message: 'Sesión no encontrada'
        });
      }

      const messages = await messageService.getChatMessages(
        sessionId,
        chatId,
        parseInt(limit),
        parseInt(offset)
      );

      res.json({
        success: true,
        data: messages
      });
    } catch (error) {
      console.error('Error en getChatMessages:', error);
      res.status(500).json({
        error: 'Error del servidor',
        message: 'No se pudieron obtener los mensajes'
      });
    }
  },

  /**
   * Marcar mensajes como leídos
   */
  async markAsRead(req, res) {
    try {
      const { sessionId, chatId } = req.params;
      const userId = req.user.id;

      // Verificar que la sesión pertenece al usuario
      const sessions = await wahaService.getUserSessions(userId);
      const session = sessions.find(s => s.id === sessionId);

      if (!session) {
        return res.status(404).json({
          error: 'No encontrado',
          message: 'Sesión no encontrada'
        });
      }

      await messageService.markAsRead(sessionId, chatId);

      res.json({
        success: true,
        message: 'Mensajes marcados como leídos'
      });
    } catch (error) {
      console.error('Error en markAsRead:', error);
      res.status(500).json({
        error: 'Error del servidor',
        message: 'No se pudieron marcar los mensajes'
      });
    }
  }
};


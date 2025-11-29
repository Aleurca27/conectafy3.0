import wahaService from '../services/wahaService.js';

/**
 * Controlador para gestión de sesiones WhatsApp
 */
export const sessionController = {
  /**
   * Crear nueva sesión
   */
  async createSession(req, res) {
    try {
      const { sessionName } = req.body;
      const userId = req.user.id;

      if (!sessionName) {
        return res.status(400).json({
          error: 'Datos inválidos',
          message: 'El nombre de la sesión es requerido'
        });
      }

      const session = await wahaService.createSession(userId, sessionName);

      res.status(201).json({
        success: true,
        message: 'Sesión creada exitosamente',
        data: session
      });
    } catch (error) {
      console.error('Error en createSession:', error);
      res.status(500).json({
        error: 'Error del servidor',
        message: 'No se pudo crear la sesión'
      });
    }
  },

  /**
   * Obtener todas las sesiones del usuario
   */
  async getSessions(req, res) {
    try {
      const userId = req.user.id;
      const sessions = await wahaService.getUserSessions(userId);

      res.json({
        success: true,
        data: sessions
      });
    } catch (error) {
      console.error('Error en getSessions:', error);
      res.status(500).json({
        error: 'Error del servidor',
        message: 'No se pudieron obtener las sesiones'
      });
    }
  },

  /**
   * Obtener QR code para conectar WhatsApp
   */
  async getQRCode(req, res) {
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

      const qrCode = await wahaService.getQRCode(sessionId);

      res.json({
        success: true,
        data: {
          qrCode,
          sessionId
        }
      });
    } catch (error) {
      console.error('Error en getQRCode:', error);
      res.status(500).json({
        error: 'Error del servidor',
        message: 'No se pudo obtener el código QR'
      });
    }
  },

  /**
   * Obtener estado de una sesión
   */
  async getSessionStatus(req, res) {
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

      const status = await wahaService.getSessionStatus(sessionId);

      res.json({
        success: true,
        data: {
          status,
          sessionId
        }
      });
    } catch (error) {
      console.error('Error en getSessionStatus:', error);
      res.status(500).json({
        error: 'Error del servidor',
        message: 'No se pudo obtener el estado'
      });
    }
  },

  /**
   * Reiniciar sesión
   */
  async restartSession(req, res) {
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

      await wahaService.restartSession(sessionId);

      res.json({
        success: true,
        message: 'Sesión reiniciada exitosamente'
      });
    } catch (error) {
      console.error('Error en restartSession:', error);
      res.status(500).json({
        error: 'Error del servidor',
        message: 'No se pudo reiniciar la sesión'
      });
    }
  },

  /**
   * Eliminar sesión
   */
  async deleteSession(req, res) {
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

      await wahaService.deleteSession(sessionId);

      res.json({
        success: true,
        message: 'Sesión eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error en deleteSession:', error);
      res.status(500).json({
        error: 'Error del servidor',
        message: 'No se pudo eliminar la sesión'
      });
    }
  },

  /**
   * Obtener logs de una sesión
   */
  async getSessionLogs(req, res) {
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

      const logs = await wahaService.getSessionLogs(sessionId);

      res.json({
        success: true,
        data: {
          logs
        }
      });
    } catch (error) {
      console.error('Error en getSessionLogs:', error);
      res.status(500).json({
        error: 'Error del servidor',
        message: 'No se pudieron obtener los logs'
      });
    }
  },

  /**
   * Enviar mensaje
   */
  async sendMessage(req, res) {
    try {
      const { sessionId } = req.params;
      const { phoneNumber, message, mediaUrl } = req.body;
      const userId = req.user.id;

      if (!phoneNumber || (!message && !mediaUrl)) {
        return res.status(400).json({
          error: 'Datos inválidos',
          message: 'Número de teléfono y mensaje son requeridos'
        });
      }

      // Verificar que la sesión pertenece al usuario
      const sessions = await wahaService.getUserSessions(userId);
      const session = sessions.find(s => s.id === sessionId);

      if (!session) {
        return res.status(404).json({
          error: 'No encontrado',
          message: 'Sesión no encontrada'
        });
      }

      const result = await wahaService.sendMessage(sessionId, phoneNumber, message, mediaUrl);

      res.json({
        success: true,
        message: 'Mensaje enviado exitosamente',
        data: result
      });
    } catch (error) {
      console.error('Error en sendMessage:', error);
      res.status(500).json({
        error: 'Error del servidor',
        message: 'No se pudo enviar el mensaje'
      });
    }
  }
};


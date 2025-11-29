import { docker, wahaConfig } from '../config/docker.js';
import { supabaseAdmin } from '../config/supabase.js';
import axios from 'axios';

/**
 * Servicio para gestionar sesiones WAHA
 */
class WahaService {
  /**
   * Obtener puerto disponible para nueva sesión
   */
  async getAvailablePort() {
    const { data: sessions } = await supabaseAdmin
      .from('whatsapp_sessions')
      .select('container_port')
      .order('container_port', { ascending: false })
      .limit(1);

    if (!sessions || sessions.length === 0) {
      return wahaConfig.basePort;
    }

    return sessions[0].container_port + 1;
  }

  /**
   * Crear contenedor WAHA para una nueva sesión
   */
  async createSession(userId, sessionName) {
    try {
      const port = await this.getAvailablePort();
      const containerName = `waha-session-${Date.now()}`;

      // Crear contenedor Docker
      const container = await docker.createContainer({
        Image: wahaConfig.image,
        name: containerName,
        Env: [
          `WHATSAPP_HOOK_URL=${process.env.BACKEND_URL}/api/webhook/whatsapp/${containerName}`,
          'WHATSAPP_HOOK_EVENTS=message,session.status',
        ],
        ExposedPorts: {
          '3000/tcp': {}
        },
        HostConfig: {
          PortBindings: {
            '3000/tcp': [{ HostPort: port.toString() }]
          },
          NetworkMode: wahaConfig.networkName,
          RestartPolicy: {
            Name: 'unless-stopped'
          }
        }
      });

      // Iniciar contenedor
      await container.start();

      // Guardar sesión en base de datos
      const { data: session, error } = await supabaseAdmin
        .from('whatsapp_sessions')
        .insert({
          user_id: userId,
          session_name: sessionName,
          status: 'connecting',
          container_name: containerName,
          container_port: port,
          webhook_url: `${process.env.BACKEND_URL}/api/webhook/whatsapp/${containerName}`
        })
        .select()
        .single();

      if (error) {
        // Si hay error al guardar, eliminar contenedor
        await container.stop();
        await container.remove();
        throw error;
      }

      return session;
    } catch (error) {
      console.error('Error creando sesión WAHA:', error);
      throw error;
    }
  }

  /**
   * Obtener QR code de una sesión
   */
  async getQRCode(sessionId) {
    try {
      const { data: session } = await supabaseAdmin
        .from('whatsapp_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (!session) {
        throw new Error('Sesión no encontrada');
      }

      // Esperar un poco para que WAHA inicie
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Obtener QR desde WAHA API
      const wahaUrl = `http://localhost:${session.container_port}`;
      
      // Iniciar sesión en WAHA
      const startResponse = await axios.post(`${wahaUrl}/api/sessions/start`, {
        name: 'default'
      }).catch(e => {
        console.log('Sesión ya iniciada o error:', e.message);
      });

      // Obtener QR
      const qrResponse = await axios.get(`${wahaUrl}/api/sessions/default/auth/qr`, {
        timeout: 10000
      });

      const qrCode = qrResponse.data.qr || qrResponse.data;

      // Actualizar QR en base de datos
      await supabaseAdmin
        .from('whatsapp_sessions')
        .update({ qr_code: qrCode })
        .eq('id', sessionId);

      return qrCode;
    } catch (error) {
      console.error('Error obteniendo QR:', error);
      throw error;
    }
  }

  /**
   * Obtener estado de una sesión
   */
  async getSessionStatus(sessionId) {
    try {
      const { data: session } = await supabaseAdmin
        .from('whatsapp_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (!session) {
        throw new Error('Sesión no encontrada');
      }

      const wahaUrl = `http://localhost:${session.container_port}`;
      
      try {
        const response = await axios.get(`${wahaUrl}/api/sessions/default`, {
          timeout: 5000
        });

        const status = response.data.status;
        
        // Actualizar estado en BD
        await supabaseAdmin
          .from('whatsapp_sessions')
          .update({ 
            status: status === 'WORKING' ? 'connected' : 'connecting',
            ...(status === 'WORKING' && { last_connected_at: new Date().toISOString() })
          })
          .eq('id', sessionId);

        return status;
      } catch (error) {
        // Si no responde, marcar como desconectado
        await supabaseAdmin
          .from('whatsapp_sessions')
          .update({ status: 'disconnected' })
          .eq('id', sessionId);

        return 'disconnected';
      }
    } catch (error) {
      console.error('Error obteniendo estado:', error);
      throw error;
    }
  }

  /**
   * Enviar mensaje de WhatsApp
   */
  async sendMessage(sessionId, phoneNumber, message, mediaUrl = null) {
    try {
      const { data: session } = await supabaseAdmin
        .from('whatsapp_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (!session) {
        throw new Error('Sesión no encontrada');
      }

      const wahaUrl = `http://localhost:${session.container_port}`;
      
      let payload = {
        chatId: `${phoneNumber}@c.us`,
        session: 'default'
      };

      if (mediaUrl) {
        // Mensaje con media
        payload.file = {
          url: mediaUrl
        };
        if (message) {
          payload.caption = message;
        }
      } else {
        // Mensaje de texto
        payload.text = message;
      }

      const response = await axios.post(
        `${wahaUrl}/api/sendText`,
        payload,
        { timeout: 10000 }
      );

      // Guardar mensaje en BD
      await supabaseAdmin
        .from('messages')
        .insert({
          session_id: sessionId,
          chat_id: phoneNumber,
          message_id: response.data.id || `msg-${Date.now()}`,
          from_me: true,
          from_number: session.phone_number,
          to_number: phoneNumber,
          body: message,
          type: mediaUrl ? 'image' : 'text',
          media_url: mediaUrl,
          timestamp: new Date().toISOString()
        });

      return response.data;
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      throw error;
    }
  }

  /**
   * Eliminar sesión y contenedor
   */
  async deleteSession(sessionId) {
    try {
      const { data: session } = await supabaseAdmin
        .from('whatsapp_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (!session) {
        throw new Error('Sesión no encontrada');
      }

      // Detener y eliminar contenedor
      const container = docker.getContainer(session.container_name);
      
      try {
        await container.stop();
        await container.remove();
      } catch (error) {
        console.log('Contenedor ya eliminado o no existe:', error.message);
      }

      // Eliminar de base de datos
      await supabaseAdmin
        .from('whatsapp_sessions')
        .delete()
        .eq('id', sessionId);

      return { success: true };
    } catch (error) {
      console.error('Error eliminando sesión:', error);
      throw error;
    }
  }

  /**
   * Reiniciar sesión
   */
  async restartSession(sessionId) {
    try {
      const { data: session } = await supabaseAdmin
        .from('whatsapp_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (!session) {
        throw new Error('Sesión no encontrada');
      }

      const container = docker.getContainer(session.container_name);
      
      // Reiniciar contenedor
      await container.restart();

      // Actualizar estado
      await supabaseAdmin
        .from('whatsapp_sessions')
        .update({ 
          status: 'connecting',
          qr_code: null
        })
        .eq('id', sessionId);

      return { success: true };
    } catch (error) {
      console.error('Error reiniciando sesión:', error);
      throw error;
    }
  }

  /**
   * Listar todas las sesiones de un usuario
   */
  async getUserSessions(userId) {
    try {
      const { data: sessions, error } = await supabaseAdmin
        .from('whatsapp_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return sessions;
    } catch (error) {
      console.error('Error obteniendo sesiones:', error);
      throw error;
    }
  }

  /**
   * Obtener logs de una sesión
   */
  async getSessionLogs(sessionId) {
    try {
      const { data: session } = await supabaseAdmin
        .from('whatsapp_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (!session) {
        throw new Error('Sesión no encontrada');
      }

      const container = docker.getContainer(session.container_name);
      const logs = await container.logs({
        stdout: true,
        stderr: true,
        tail: 100,
        timestamps: true
      });

      return logs.toString('utf8');
    } catch (error) {
      console.error('Error obteniendo logs:', error);
      throw error;
    }
  }
}

export default new WahaService();


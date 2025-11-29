import { supabaseAdmin } from '../config/supabase.js';

/**
 * Servicio para gestionar mensajes
 */
class MessageService {
  /**
   * Guardar mensaje entrante desde webhook
   */
  async saveIncomingMessage(containerName, messageData) {
    try {
      // Buscar sesión por container_name
      const { data: session } = await supabaseAdmin
        .from('whatsapp_sessions')
        .select('*')
        .eq('container_name', containerName)
        .single();

      if (!session) {
        console.error('Sesión no encontrada para container:', containerName);
        return null;
      }

      // Extraer datos del mensaje
      const {
        id: messageId,
        from,
        to,
        body,
        type,
        timestamp,
        hasMedia,
        mediaUrl
      } = messageData;

      // Guardar mensaje
      const { data: message, error } = await supabaseAdmin
        .from('messages')
        .insert({
          session_id: session.id,
          chat_id: from?.split('@')[0] || from,
          message_id: messageId,
          from_me: false,
          from_number: from?.split('@')[0] || from,
          to_number: to?.split('@')[0] || to,
          body: body || '',
          type: type || 'text',
          media_url: mediaUrl || null,
          timestamp: timestamp ? new Date(timestamp * 1000).toISOString() : new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error guardando mensaje:', error);
        return null;
      }

      // Actualizar o crear contacto
      await this.updateContact(session.id, from?.split('@')[0] || from);

      return message;
    } catch (error) {
      console.error('Error en saveIncomingMessage:', error);
      return null;
    }
  }

  /**
   * Actualizar información de contacto
   */
  async updateContact(sessionId, phoneNumber) {
    try {
      // Verificar si contacto existe
      const { data: existingContact } = await supabaseAdmin
        .from('contacts')
        .select('*')
        .eq('session_id', sessionId)
        .eq('phone_number', phoneNumber)
        .single();

      if (existingContact) {
        // Actualizar último mensaje y contador
        await supabaseAdmin
          .from('contacts')
          .update({
            last_message_at: new Date().toISOString(),
            unread_count: existingContact.unread_count + 1
          })
          .eq('id', existingContact.id);
      } else {
        // Crear nuevo contacto
        await supabaseAdmin
          .from('contacts')
          .insert({
            session_id: sessionId,
            phone_number: phoneNumber,
            last_message_at: new Date().toISOString(),
            unread_count: 1
          });
      }
    } catch (error) {
      console.error('Error actualizando contacto:', error);
    }
  }

  /**
   * Obtener mensajes de un chat
   */
  async getChatMessages(sessionId, chatId, limit = 50, offset = 0) {
    try {
      const { data: messages, error } = await supabaseAdmin
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .eq('chat_id', chatId)
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return messages.reverse(); // Ordenar cronológicamente para mostrar
    } catch (error) {
      console.error('Error obteniendo mensajes:', error);
      throw error;
    }
  }

  /**
   * Obtener lista de contactos/chats de una sesión
   */
  async getSessionContacts(sessionId) {
    try {
      const { data: contacts, error } = await supabaseAdmin
        .from('contacts')
        .select('*')
        .eq('session_id', sessionId)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      return contacts;
    } catch (error) {
      console.error('Error obteniendo contactos:', error);
      throw error;
    }
  }

  /**
   * Marcar mensajes como leídos
   */
  async markAsRead(sessionId, chatId) {
    try {
      await supabaseAdmin
        .from('contacts')
        .update({ unread_count: 0 })
        .eq('session_id', sessionId)
        .eq('phone_number', chatId);

      return { success: true };
    } catch (error) {
      console.error('Error marcando como leído:', error);
      throw error;
    }
  }

  /**
   * Actualizar estado de sesión desde webhook
   */
  async updateSessionStatus(containerName, status) {
    try {
      const { data: session } = await supabaseAdmin
        .from('whatsapp_sessions')
        .select('*')
        .eq('container_name', containerName)
        .single();

      if (!session) {
        return null;
      }

      let newStatus = 'connecting';
      if (status === 'WORKING' || status === 'authenticated') {
        newStatus = 'connected';
      } else if (status === 'SCAN_QR_CODE') {
        newStatus = 'connecting';
      } else if (status === 'FAILED' || status === 'STOPPED') {
        newStatus = 'disconnected';
      }

      await supabaseAdmin
        .from('whatsapp_sessions')
        .update({
          status: newStatus,
          ...(newStatus === 'connected' && { last_connected_at: new Date().toISOString() })
        })
        .eq('id', session.id);

      return { success: true };
    } catch (error) {
      console.error('Error actualizando estado de sesión:', error);
      return null;
    }
  }
}

export default new MessageService();


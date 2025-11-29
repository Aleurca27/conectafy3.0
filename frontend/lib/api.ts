import axios from 'axios';
import { supabase } from './supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redireccionar a login si no está autenticado
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ========== API de Sesiones ==========

export interface Session {
  id: string;
  user_id: string;
  session_name: string;
  phone_number?: string;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  qr_code?: string;
  container_name: string;
  container_port: number;
  webhook_url?: string;
  created_at: string;
  updated_at: string;
  last_connected_at?: string;
}

export const sessionsApi = {
  // Crear nueva sesión
  create: async (sessionName: string): Promise<Session> => {
    const { data } = await api.post('/api/sessions', { sessionName });
    return data.data;
  },

  // Obtener todas las sesiones
  getAll: async (): Promise<Session[]> => {
    const { data } = await api.get('/api/sessions');
    return data.data;
  },

  // Obtener QR code
  getQR: async (sessionId: string): Promise<string> => {
    const { data } = await api.get(`/api/sessions/${sessionId}/qr`);
    return data.data.qrCode;
  },

  // Obtener estado
  getStatus: async (sessionId: string): Promise<string> => {
    const { data } = await api.get(`/api/sessions/${sessionId}/status`);
    return data.data.status;
  },

  // Reiniciar sesión
  restart: async (sessionId: string): Promise<void> => {
    await api.post(`/api/sessions/${sessionId}/restart`);
  },

  // Eliminar sesión
  delete: async (sessionId: string): Promise<void> => {
    await api.delete(`/api/sessions/${sessionId}`);
  },

  // Obtener logs
  getLogs: async (sessionId: string): Promise<string> => {
    const { data } = await api.get(`/api/sessions/${sessionId}/logs`);
    return data.data.logs;
  },

  // Enviar mensaje
  sendMessage: async (
    sessionId: string,
    phoneNumber: string,
    message: string,
    mediaUrl?: string
  ): Promise<void> => {
    await api.post(`/api/sessions/${sessionId}/send`, {
      phoneNumber,
      message,
      mediaUrl,
    });
  },
};

// ========== API de Mensajes ==========

export interface Message {
  id: string;
  session_id: string;
  chat_id: string;
  message_id: string;
  from_me: boolean;
  from_number: string;
  to_number: string;
  body: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'document';
  media_url?: string;
  timestamp: string;
  created_at: string;
}

export interface Contact {
  id: string;
  session_id: string;
  phone_number: string;
  name?: string;
  last_message_at: string;
  unread_count: number;
  created_at: string;
}

export const messagesApi = {
  // Obtener contactos
  getContacts: async (sessionId: string): Promise<Contact[]> => {
    const { data } = await api.get(`/api/messages/${sessionId}/contacts`);
    return data.data;
  },

  // Obtener mensajes de un chat
  getChatMessages: async (
    sessionId: string,
    chatId: string,
    limit = 50,
    offset = 0
  ): Promise<Message[]> => {
    const { data } = await api.get(
      `/api/messages/${sessionId}/chat/${chatId}?limit=${limit}&offset=${offset}`
    );
    return data.data;
  },

  // Marcar como leído
  markAsRead: async (sessionId: string, chatId: string): Promise<void> => {
    await api.post(`/api/messages/${sessionId}/chat/${chatId}/read`);
  },
};

export default api;


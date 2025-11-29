-- Conectafy 3.0 - Database Schema
-- Base de datos: Supabase (PostgreSQL)

-- =============================================
-- Tabla: whatsapp_sessions
-- Descripción: Almacena las sesiones de WhatsApp de cada usuario
-- =============================================
CREATE TABLE IF NOT EXISTS public.whatsapp_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'disconnected' CHECK (status IN ('disconnected', 'connecting', 'connected', 'error')),
    qr_code TEXT,
    container_name VARCHAR(100) NOT NULL UNIQUE,
    container_port INTEGER NOT NULL,
    webhook_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_connected_at TIMESTAMPTZ
);

-- Índices para whatsapp_sessions
CREATE INDEX idx_sessions_user_id ON public.whatsapp_sessions(user_id);
CREATE INDEX idx_sessions_status ON public.whatsapp_sessions(status);
CREATE INDEX idx_sessions_container ON public.whatsapp_sessions(container_name);

-- =============================================
-- Tabla: messages
-- Descripción: Almacena todos los mensajes enviados y recibidos
-- =============================================
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.whatsapp_sessions(id) ON DELETE CASCADE,
    chat_id VARCHAR(50) NOT NULL,
    message_id VARCHAR(100) NOT NULL,
    from_me BOOLEAN NOT NULL DEFAULT FALSE,
    from_number VARCHAR(20) NOT NULL,
    to_number VARCHAR(20) NOT NULL,
    body TEXT,
    type VARCHAR(20) NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'image', 'audio', 'video', 'document')),
    media_url TEXT,
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para messages
CREATE INDEX idx_messages_session_id ON public.messages(session_id);
CREATE INDEX idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX idx_messages_timestamp ON public.messages(timestamp DESC);
CREATE INDEX idx_messages_session_chat ON public.messages(session_id, chat_id);

-- =============================================
-- Tabla: contacts
-- Descripción: Lista de contactos/chats por sesión
-- =============================================
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.whatsapp_sessions(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL,
    name VARCHAR(100),
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unread_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(session_id, phone_number)
);

-- Índices para contacts
CREATE INDEX idx_contacts_session_id ON public.contacts(session_id);
CREATE INDEX idx_contacts_last_message ON public.contacts(last_message_at DESC);

-- =============================================
-- Función: Actualizar updated_at automáticamente
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at en whatsapp_sessions
CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON public.whatsapp_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- Row Level Security (RLS)
-- =============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.whatsapp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Políticas para whatsapp_sessions
-- Los usuarios solo pueden ver sus propias sesiones
CREATE POLICY "Users can view their own sessions"
    ON public.whatsapp_sessions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Los usuarios solo pueden crear sus propias sesiones
CREATE POLICY "Users can create their own sessions"
    ON public.whatsapp_sessions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Los usuarios solo pueden actualizar sus propias sesiones
CREATE POLICY "Users can update their own sessions"
    ON public.whatsapp_sessions
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Los usuarios solo pueden eliminar sus propias sesiones
CREATE POLICY "Users can delete their own sessions"
    ON public.whatsapp_sessions
    FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para messages
-- Los usuarios solo pueden ver mensajes de sus sesiones
CREATE POLICY "Users can view messages from their sessions"
    ON public.messages
    FOR SELECT
    USING (
        session_id IN (
            SELECT id FROM public.whatsapp_sessions WHERE user_id = auth.uid()
        )
    );

-- Los usuarios solo pueden crear mensajes en sus sesiones
CREATE POLICY "Users can create messages in their sessions"
    ON public.messages
    FOR INSERT
    WITH CHECK (
        session_id IN (
            SELECT id FROM public.whatsapp_sessions WHERE user_id = auth.uid()
        )
    );

-- Políticas para contacts
-- Los usuarios solo pueden ver contactos de sus sesiones
CREATE POLICY "Users can view contacts from their sessions"
    ON public.contacts
    FOR SELECT
    USING (
        session_id IN (
            SELECT id FROM public.whatsapp_sessions WHERE user_id = auth.uid()
        )
    );

-- Los usuarios pueden crear contactos en sus sesiones
CREATE POLICY "Users can create contacts in their sessions"
    ON public.contacts
    FOR INSERT
    WITH CHECK (
        session_id IN (
            SELECT id FROM public.whatsapp_sessions WHERE user_id = auth.uid()
        )
    );

-- Los usuarios pueden actualizar contactos de sus sesiones
CREATE POLICY "Users can update contacts in their sessions"
    ON public.contacts
    FOR UPDATE
    USING (
        session_id IN (
            SELECT id FROM public.whatsapp_sessions WHERE user_id = auth.uid()
        )
    );

-- =============================================
-- Políticas de servicio (para el backend)
-- =============================================

-- Permitir al service role hacer todo (usado por el backend)
CREATE POLICY "Service role can do everything on sessions"
    ON public.whatsapp_sessions
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role can do everything on messages"
    ON public.messages
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role can do everything on contacts"
    ON public.contacts
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- =============================================
-- Datos de ejemplo (opcional, comentar en producción)
-- =============================================

-- NOTA: Descomentar solo para desarrollo local
-- INSERT INTO public.whatsapp_sessions (user_id, session_name, container_name, container_port, status)
-- VALUES (
--     'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', -- Reemplazar con un user_id real
--     'Sesión Demo',
--     'waha-demo-1',
--     3010,
--     'disconnected'
-- );


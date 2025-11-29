# 🗄️ Configuración de Supabase

Guía detallada para configurar la base de datos en Supabase.

## 📌 Paso 1: Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Inicia sesión o crea una cuenta
3. Click en **"New Project"**
4. Completa:
   - **Name**: conectafy-prod (o el nombre que prefieras)
   - **Database Password**: Genera una contraseña segura (guárdala)
   - **Region**: Elige la región más cercana a tus usuarios
   - **Plan**: Free (para empezar) o Pro (para producción)
5. Click en **"Create new project"**
6. Espera ~2 minutos mientras se crea el proyecto

## 🔑 Paso 2: Obtener Credenciales

Una vez creado el proyecto:

1. Ve a **Settings** → **API**
2. Anota estas credenciales:

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon public key: eyJhbGc........
service_role key: eyJhbGc........ (⚠️ MANTENER SECRETA)
```

## 📊 Paso 3: Crear Tablas

1. Ve a **SQL Editor** en el panel izquierdo
2. Click en **"New query"**
3. Copia y pega el contenido completo del archivo `backend/database/schema.sql`
4. Click en **"Run"** o presiona `Ctrl+Enter`

Deberías ver el mensaje: "Success. No rows returned"

## ✅ Paso 4: Verificar Tablas Creadas

1. Ve a **Table Editor** en el panel izquierdo
2. Deberías ver estas tablas:
   - `whatsapp_sessions`
   - `messages`
   - `contacts`

## 🔐 Paso 5: Configurar Autenticación

1. Ve a **Authentication** → **Settings**
2. En **"Email Auth"**, verifica que esté habilitado
3. En **"Email Templates"**, puedes personalizar los emails
4. En **"URL Configuration"**:
   - **Site URL**: `https://tudominio.com` (o tu URL de frontend)
   - **Redirect URLs**: Agregar `https://tudominio.com/**`

### Configuración de Email (Opcional)

Por defecto, Supabase usa su servicio de email. Para producción, configura tu propio SMTP:

1. Ve a **Authentication** → **Settings** → **SMTP Settings**
2. Configura tu servidor SMTP (Gmail, SendGrid, etc.)

## 🔒 Paso 6: Configurar Row Level Security (RLS)

El schema ya incluye las políticas RLS. Verifica que estén activas:

1. Ve a **Authentication** → **Policies**
2. Para cada tabla (`whatsapp_sessions`, `messages`, `contacts`), deberías ver políticas como:
   - "Users can view their own sessions"
   - "Users can create their own sessions"
   - etc.

## 🧪 Paso 7: Probar la Configuración

### Crear Usuario de Prueba

```sql
-- En SQL Editor
SELECT auth.uid(); -- Debería retornar NULL si no estás autenticado
```

### Probar desde la Aplicación

1. Inicia el frontend
2. Ve a `/register`
3. Crea una cuenta de prueba
4. Verifica en **Authentication** → **Users** que el usuario se creó

### Insertar Datos de Prueba (Opcional)

```sql
-- En SQL Editor
-- Primero, obtén el ID del usuario que creaste
SELECT id, email FROM auth.users LIMIT 1;

-- Luego, inserta una sesión de prueba (reemplaza USER_ID con el ID real)
INSERT INTO public.whatsapp_sessions (
  user_id,
  session_name,
  container_name,
  container_port,
  status
) VALUES (
  'USER_ID_AQUI',
  'Sesión de Prueba',
  'waha-test-1',
  3010,
  'disconnected'
);
```

## 📈 Paso 8: Configurar Storage (Para Medios de WhatsApp)

Si deseas almacenar imágenes/audios de WhatsApp en Supabase:

1. Ve a **Storage** → **Create a new bucket**
2. Nombre: `whatsapp-media`
3. Public: `No` (privado)
4. Click en **Create bucket**

### Configurar Políticas de Storage

```sql
-- Permitir a usuarios subir a su carpeta
CREATE POLICY "Users can upload to their folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'whatsapp-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir a usuarios leer de su carpeta
CREATE POLICY "Users can read from their folder"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'whatsapp-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## 🔧 Paso 9: Variables de Entorno

Copia las credenciales obtenidas a tu archivo `.env`:

```env
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc........
SUPABASE_SERVICE_KEY=eyJhbGc........

NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc........
```

## 📊 Paso 10: Monitoreo y Límites

### Plan Free (Incluye):
- 500 MB de base de datos
- 1 GB de almacenamiento
- 2 GB de transferencia
- 50,000 usuarios activos mensuales

### Actualizar a Pro si necesitas:
- 8 GB de base de datos
- 100 GB de almacenamiento
- 250 GB de transferencia
- Usuarios ilimitados
- Backups automáticos diarios
- Soporte prioritario

Ve a **Settings** → **Billing** para actualizar.

## 🔍 Consultas Útiles

### Ver todas las sesiones
```sql
SELECT * FROM public.whatsapp_sessions;
```

### Ver mensajes recientes
```sql
SELECT * FROM public.messages
ORDER BY timestamp DESC
LIMIT 50;
```

### Contar sesiones por usuario
```sql
SELECT 
  u.email,
  COUNT(s.id) as total_sessions,
  SUM(CASE WHEN s.status = 'connected' THEN 1 ELSE 0 END) as connected_sessions
FROM auth.users u
LEFT JOIN public.whatsapp_sessions s ON u.id = s.user_id
GROUP BY u.id, u.email;
```

### Ver estadísticas de mensajes
```sql
SELECT 
  s.session_name,
  COUNT(m.id) as total_messages,
  SUM(CASE WHEN m.from_me THEN 1 ELSE 0 END) as sent,
  SUM(CASE WHEN NOT m.from_me THEN 1 ELSE 0 END) as received
FROM public.whatsapp_sessions s
LEFT JOIN public.messages m ON s.id = m.session_id
GROUP BY s.id, s.session_name
ORDER BY total_messages DESC;
```

## 🛡️ Seguridad

### ✅ Mejores Prácticas

1. **NUNCA** compartas la `service_role key` públicamente
2. Usa `anon key` solo en el frontend
3. Mantén RLS habilitado en todas las tablas
4. Revisa periódicamente los usuarios en **Authentication**
5. Configura alertas de uso en **Settings** → **Usage**

### 🔐 Políticas de Seguridad Adicionales

```sql
-- Limitar cantidad de sesiones por usuario
CREATE OR REPLACE FUNCTION check_session_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT COUNT(*)
    FROM public.whatsapp_sessions
    WHERE user_id = NEW.user_id
  ) >= 10 THEN
    RAISE EXCEPTION 'Límite de sesiones alcanzado (máximo 10)';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_session_limit
BEFORE INSERT ON public.whatsapp_sessions
FOR EACH ROW
EXECUTE FUNCTION check_session_limit();
```

## 📞 Webhooks en Tiempo Real (Opcional)

Para recibir cambios en tiempo real:

1. Ve a **Database** → **Webhooks**
2. Click en **"Create a new webhook"**
3. Configura:
   - **Table**: `messages`
   - **Events**: `INSERT`
   - **Type**: `HTTP Request`
   - **Method**: `POST`
   - **URL**: `https://tudominio.com/api/webhook/supabase`

## ✅ Checklist Final

- [ ] Proyecto creado en Supabase
- [ ] Credenciales copiadas
- [ ] Schema SQL ejecutado
- [ ] Tablas creadas correctamente
- [ ] RLS habilitado y políticas activas
- [ ] Autenticación configurada
- [ ] Variables de entorno actualizadas
- [ ] Usuario de prueba creado
- [ ] Prueba de conexión exitosa

---

**¡Supabase configurado correctamente! ✅**

La base de datos está lista para usar con Conectafy 3.0.


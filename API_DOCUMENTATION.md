# 📡 Documentación de API

Documentación completa de los endpoints de Conectafy 3.0.

## 🔐 Autenticación

Todos los endpoints (excepto webhooks) requieren autenticación mediante JWT token de Supabase.

**Header requerido:**
```
Authorization: Bearer <TOKEN_DE_SUPABASE>
```

## 📋 Endpoints

### 🟢 Health Check

```http
GET /health
```

**Respuesta:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 12345
}
```

---

## 📱 Sesiones de WhatsApp

### Crear Nueva Sesión

```http
POST /api/sessions
```

**Body:**
```json
{
  "sessionName": "Mi WhatsApp Personal"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Sesión creada exitosamente",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "user-uuid",
    "session_name": "Mi WhatsApp Personal",
    "status": "connecting",
    "container_name": "waha-session-1234567890",
    "container_port": 3010,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### Obtener Todas las Sesiones

```http
GET /api/sessions
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "session-uuid",
      "session_name": "Mi WhatsApp Personal",
      "phone_number": "5491234567890",
      "status": "connected",
      "created_at": "2024-01-15T10:30:00.000Z",
      "last_connected_at": "2024-01-15T12:00:00.000Z"
    }
  ]
}
```

### Obtener Código QR

```http
GET /api/sessions/:sessionId/qr
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "qrCode": "2@abc123def456...",
    "sessionId": "session-uuid"
  }
}
```

### Obtener Estado de Sesión

```http
GET /api/sessions/:sessionId/status
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "status": "WORKING",
    "sessionId": "session-uuid"
  }
}
```

**Estados posibles:**
- `SCAN_QR_CODE` - Esperando escaneo
- `WORKING` - Conectado y funcionando
- `FAILED` - Error en la conexión
- `STOPPED` - Detenido

### Reiniciar Sesión

```http
POST /api/sessions/:sessionId/restart
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Sesión reiniciada exitosamente"
}
```

### Eliminar Sesión

```http
DELETE /api/sessions/:sessionId
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Sesión eliminada exitosamente"
}
```

### Obtener Logs de Sesión

```http
GET /api/sessions/:sessionId/logs
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "logs": "[2024-01-15 10:30:00] Container started\n[2024-01-15 10:30:05] Waiting for QR scan..."
  }
}
```

### Enviar Mensaje

```http
POST /api/sessions/:sessionId/send
```

**Body:**
```json
{
  "phoneNumber": "5491234567890",
  "message": "Hola, este es un mensaje de prueba",
  "mediaUrl": "https://ejemplo.com/imagen.jpg" // Opcional
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Mensaje enviado exitosamente",
  "data": {
    "id": "message-id-from-whatsapp"
  }
}
```

---

## 💬 Mensajes

### Obtener Contactos/Chats

```http
GET /api/messages/:sessionId/contacts
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "contact-uuid",
      "session_id": "session-uuid",
      "phone_number": "5491234567890",
      "name": "Juan Pérez",
      "last_message_at": "2024-01-15T12:30:00.000Z",
      "unread_count": 3
    }
  ]
}
```

### Obtener Mensajes de un Chat

```http
GET /api/messages/:sessionId/chat/:chatId?limit=50&offset=0
```

**Parámetros de query:**
- `limit` - Cantidad de mensajes (default: 50)
- `offset` - Offset para paginación (default: 0)

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "message-uuid",
      "session_id": "session-uuid",
      "chat_id": "5491234567890",
      "message_id": "wamid.xxx",
      "from_me": false,
      "from_number": "5491234567890",
      "to_number": "5499876543210",
      "body": "Hola, ¿cómo estás?",
      "type": "text",
      "timestamp": "2024-01-15T12:30:00.000Z"
    }
  ]
}
```

### Marcar Mensajes como Leídos

```http
POST /api/messages/:sessionId/chat/:chatId/read
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Mensajes marcados como leídos"
}
```

---

## 🔗 Webhooks

### Recibir Webhook de WhatsApp

```http
POST /api/webhook/whatsapp/:containerName
```

Este endpoint es llamado automáticamente por WAHA cuando llegan mensajes o cambia el estado de la sesión.

**Body (ejemplo de mensaje):**
```json
{
  "event": "message",
  "payload": {
    "id": "wamid.xxx",
    "from": "5491234567890@c.us",
    "to": "5499876543210@c.us",
    "body": "Hola, este es un mensaje",
    "type": "text",
    "timestamp": 1705320600,
    "hasMedia": false
  }
}
```

**Body (ejemplo de cambio de estado):**
```json
{
  "event": "session.status",
  "payload": {
    "status": "WORKING"
  }
}
```

**Respuesta:**
```json
{
  "success": true
}
```

---

## 🚨 Códigos de Error

### 400 Bad Request
```json
{
  "error": "Datos inválidos",
  "message": "El nombre de la sesión es requerido"
}
```

### 401 Unauthorized
```json
{
  "error": "No autorizado",
  "message": "Token inválido o expirado"
}
```

### 404 Not Found
```json
{
  "error": "No encontrado",
  "message": "Sesión no encontrada"
}
```

### 500 Internal Server Error
```json
{
  "error": "Error del servidor",
  "message": "Error interno del servidor"
}
```

---

## 📝 Ejemplos de Uso

### JavaScript/TypeScript (Axios)

```typescript
import axios from 'axios';

const API_URL = 'https://tudominio.com';
const TOKEN = 'tu-token-de-supabase';

// Crear sesión
const createSession = async () => {
  const response = await axios.post(
    `${API_URL}/api/sessions`,
    { sessionName: 'Mi WhatsApp' },
    {
      headers: {
        Authorization: `Bearer ${TOKEN}`
      }
    }
  );
  return response.data;
};

// Enviar mensaje
const sendMessage = async (sessionId: string) => {
  const response = await axios.post(
    `${API_URL}/api/sessions/${sessionId}/send`,
    {
      phoneNumber: '5491234567890',
      message: 'Hola desde la API'
    },
    {
      headers: {
        Authorization: `Bearer ${TOKEN}`
      }
    }
  );
  return response.data;
};
```

### Python (Requests)

```python
import requests

API_URL = 'https://tudominio.com'
TOKEN = 'tu-token-de-supabase'

headers = {
    'Authorization': f'Bearer {TOKEN}',
    'Content-Type': 'application/json'
}

# Crear sesión
response = requests.post(
    f'{API_URL}/api/sessions',
    json={'sessionName': 'Mi WhatsApp'},
    headers=headers
)
print(response.json())

# Enviar mensaje
response = requests.post(
    f'{API_URL}/api/sessions/{session_id}/send',
    json={
        'phoneNumber': '5491234567890',
        'message': 'Hola desde Python'
    },
    headers=headers
)
print(response.json())
```

### cURL

```bash
# Crear sesión
curl -X POST https://tudominio.com/api/sessions \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sessionName":"Mi WhatsApp"}'

# Obtener sesiones
curl https://tudominio.com/api/sessions \
  -H "Authorization: Bearer TU_TOKEN"

# Enviar mensaje
curl -X POST https://tudominio.com/api/sessions/SESSION_ID/send \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "5491234567890",
    "message": "Hola desde cURL"
  }'
```

---

## 🔄 Rate Limiting

Actualmente no hay rate limiting implementado, pero se recomienda:
- Máximo 10 solicitudes por segundo por sesión
- Máximo 100 mensajes por minuto por sesión

## 📌 Notas Importantes

1. Los números de teléfono deben incluir código de país sin el símbolo `+`
   - ✅ Correcto: `5491234567890`
   - ❌ Incorrecto: `+54 9 11 2345-6789`

2. Los webhooks se configuran automáticamente al crear una sesión

3. El QR code debe solicitarse inmediatamente después de crear la sesión

4. Las sesiones inactivas por más de 30 días pueden ser eliminadas automáticamente

5. Los mensajes con media (imágenes, audios) deben proporcionar una URL pública

---

**Última actualización:** Enero 2024


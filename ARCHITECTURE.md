# 🏗️ Arquitectura de Conectafy 3.0

Documentación técnica de la arquitectura del sistema.

## 📐 Diagrama General

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIO FINAL                           │
│                    (Navegador Web)                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTPS (443)
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NGINX (Reverse Proxy)                      │
│  - Manejo de SSL/TLS                                           │
│  - Redirección HTTP → HTTPS                                    │
│  - Load Balancing (futuro)                                     │
│  - Compresión gzip                                             │
└───────────┬──────────────────────────┬──────────────────────────┘
            │                          │
            │ :3000                    │ :3001
            │                          │
            ▼                          ▼
┌─────────────────────┐    ┌─────────────────────────────────────┐
│   FRONTEND          │    │         BACKEND                      │
│   Next.js 14        │◄───┤      Node.js + Express              │
│   - App Router      │    │   - API REST                        │
│   - NextUI          │    │   - Auth Middleware                 │
│   - Zustand Store   │    │   - Docker Management               │
│   - Axios Client    │    │   - Webhook Handler                 │
└─────────────────────┘    └──────┬────────────────┬─────────────┘
                                  │                │
                     ┌────────────┘                └────────────┐
                     │                                          │
                     │ Supabase Client                          │ Dockerode
                     │                                          │
                     ▼                                          ▼
        ┌────────────────────────┐         ┌─────────────────────────────┐
        │      SUPABASE          │         │    DOCKER ENGINE            │
        │   (PostgreSQL)         │         │                             │
        │  ┌──────────────────┐  │         │  ┌────────────────────┐    │
        │  │ whatsapp_sessions│  │         │  │  WAHA Container 1  │    │
        │  │ messages         │  │         │  │  Port: 3010        │    │
        │  │ contacts         │  │         │  └────────────────────┘    │
        │  │ users (auth)     │  │         │  ┌────────────────────┐    │
        │  └──────────────────┘  │         │  │  WAHA Container 2  │    │
        │  - Row Level Security  │         │  │  Port: 3011        │    │
        │  - Auth Management     │         │  └────────────────────┘    │
        │  - Auto Backups        │         │  ┌────────────────────┐    │
        └────────────────────────┘         │  │  WAHA Container N  │    │
                                           │  │  Port: 3010+N      │    │
                                           │  └────────────────────┘    │
                                           └──────────┬──────────────────┘
                                                      │
                                                      │ Webhooks
                                                      │
                                                      ▼
                                           ┌──────────────────────┐
                                           │   WhatsApp Web API   │
                                           │      (WAHA API)      │
                                           └──────────────────────┘
```

## 🔄 Flujo de Datos

### 1. Autenticación
```
Usuario → Frontend → Supabase Auth → JWT Token → LocalStorage
                                         ↓
                          Token usado en cada request al Backend
```

### 2. Crear Sesión WhatsApp
```
Usuario → Frontend → Backend → Dockerode → Crear Container WAHA
                        ↓
                    Supabase DB
                 (guardar sesión)
```

### 3. Obtener QR
```
Frontend → Backend → WAHA Container API → QR Code
              ↓                              ↓
          Supabase DB                    Frontend
        (actualizar QR)                 (mostrar QR)
```

### 4. Enviar Mensaje
```
Usuario → Frontend → Backend → WAHA Container → WhatsApp Web
                        ↓
                    Supabase DB
                 (guardar mensaje)
```

### 5. Recibir Mensaje (Webhook)
```
WhatsApp Web → WAHA Container → Webhook → Backend → Supabase DB
                                              ↓
                                          Frontend
                                      (polling/actualizar)
```

## 🗂️ Estructura de Módulos

### Backend (Node.js + Express)

```
backend/
├── config/
│   ├── supabase.js      # Cliente Supabase (admin + anon)
│   └── docker.js        # Configuración Docker + WAHA
│
├── middlewares/
│   └── auth.js          # Verificación JWT de Supabase
│
├── controllers/
│   ├── sessionController.js   # Lógica de sesiones
│   ├── messageController.js   # Lógica de mensajes
│   └── webhookController.js   # Manejo de webhooks WAHA
│
├── services/
│   ├── wahaService.js         # Gestión contenedores WAHA
│   └── messageService.js      # Operaciones de mensajes
│
├── routes/
│   ├── sessionRoutes.js       # Rutas /api/sessions
│   ├── messageRoutes.js       # Rutas /api/messages
│   └── webhookRoutes.js       # Rutas /api/webhook
│
└── index.js                   # Entry point + Express setup
```

### Frontend (Next.js 14)

```
frontend/
├── app/                      # App Router
│   ├── layout.tsx           # Layout global
│   ├── providers.tsx        # NextUI + Toaster providers
│   ├── login/               # Página login
│   ├── register/            # Página registro
│   ├── dashboard/           # Dashboard principal
│   ├── sessions/            # Gestión sesiones
│   ├── qr/[sessionId]/      # Escaneo QR
│   └── chat/                # Mensajería
│
├── components/
│   └── Navbar.tsx           # Barra navegación
│
└── lib/
    ├── supabase.ts          # Cliente Supabase
    ├── api.ts               # Cliente API (axios)
    └── store.ts             # Estado global (zustand)
```

## 🗄️ Modelo de Base de Datos

### Diagrama ER

```
┌──────────────────┐
│   auth.users     │  (Supabase Auth)
│ ─────────────────│
│ id (PK)          │
│ email            │
│ created_at       │
└────────┬─────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────────────┐
│  whatsapp_sessions      │
│ ────────────────────────│
│ id (PK)                 │
│ user_id (FK)            │◄──────┐
│ session_name            │       │
│ phone_number            │       │
│ status                  │       │ 1:N
│ qr_code                 │       │
│ container_name          │       │
│ container_port          │       │
│ webhook_url             │       │
│ created_at              │       │
│ updated_at              │       │
│ last_connected_at       │       │
└────────┬────────────────┘       │
         │                        │
         │ 1:N                    │
         │                        │
         ├────────────────────────┤
         │                        │
         ▼                        │
┌──────────────────┐     ┌────────┴──────────┐
│   messages       │     │   contacts        │
│ ─────────────────│     │ ──────────────────│
│ id (PK)          │     │ id (PK)           │
│ session_id (FK)  │     │ session_id (FK)   │
│ chat_id          │     │ phone_number      │
│ message_id       │     │ name              │
│ from_me          │     │ last_message_at   │
│ from_number      │     │ unread_count      │
│ to_number        │     │ created_at        │
│ body             │     └───────────────────┘
│ type             │
│ media_url        │
│ timestamp        │
│ created_at       │
└──────────────────┘
```

## 🔐 Seguridad

### Capas de Seguridad

1. **Autenticación (Supabase Auth)**
   - JWT Tokens
   - Email + Password
   - Session management

2. **Autorización (RLS)**
   - Row Level Security en PostgreSQL
   - Políticas por usuario
   - Aislamiento de datos

3. **API (Backend)**
   - Middleware de autenticación
   - Validación de permisos
   - Sanitización de inputs

4. **Red (Docker + Nginx)**
   - Red privada Docker
   - SSL/TLS (HTTPS)
   - Firewall (UFW)
   - Headers de seguridad (Helmet)

### Flujo de Autenticación

```
1. Usuario → Login → Supabase Auth
2. Supabase → JWT Token → Frontend (LocalStorage)
3. Frontend → Request con Header "Authorization: Bearer TOKEN"
4. Backend → Verificar Token con Supabase
5. Backend → Extraer user_id del token
6. Backend → Validar permisos (¿la sesión pertenece al usuario?)
7. Backend → Ejecutar operación
8. RLS en DB → Filtrar solo datos del usuario
```

## 🐳 Contenedores Docker

### Contenedores Estáticos

1. **Backend**
   - Imagen: Node 20 Alpine
   - Puerto: 3001
   - Red: conectafy_network
   - Volumen: /var/run/docker.sock (para crear contenedores WAHA)

2. **Frontend**
   - Imagen: Node 20 Alpine
   - Puerto: 3000
   - Red: conectafy_network

3. **Nginx** (Producción)
   - Imagen: nginx:alpine
   - Puertos: 80, 443
   - Red: conectafy_network

### Contenedores Dinámicos (WAHA)

- **Creados**: Por el backend cuando usuario crea sesión
- **Imagen**: devlikeapro/waha:latest
- **Puertos**: 3010, 3011, 3012... (dinámicos)
- **Red**: conectafy_network
- **Variables**:
  - WHATSAPP_HOOK_URL
  - WHATSAPP_HOOK_EVENTS

### Red Docker

```
conectafy_network (bridge)
├── backend (conectafy-backend)
├── frontend (conectafy-frontend)
├── nginx (conectafy-nginx)
├── waha-session-1234567890
├── waha-session-1234567891
└── waha-session-N
```

Todos los contenedores pueden comunicarse entre sí usando sus nombres.

## 📡 API Endpoints

### Sesiones
```
POST   /api/sessions              - Crear sesión
GET    /api/sessions              - Listar sesiones
GET    /api/sessions/:id/qr       - Obtener QR
GET    /api/sessions/:id/status   - Estado sesión
POST   /api/sessions/:id/restart  - Reiniciar
DELETE /api/sessions/:id          - Eliminar
GET    /api/sessions/:id/logs     - Ver logs
POST   /api/sessions/:id/send     - Enviar mensaje
```

### Mensajes
```
GET  /api/messages/:sessionId/contacts        - Lista contactos
GET  /api/messages/:sessionId/chat/:chatId    - Mensajes de chat
POST /api/messages/:sessionId/chat/:chatId/read - Marcar leído
```

### Webhooks
```
POST /api/webhook/whatsapp/:containerName    - Recibir desde WAHA
```

## 🔄 Estados de Sesión

```
disconnected → connecting → connected
      ↑            │             │
      │            ▼             │
      └───────── error ◄─────────┘
```

- **disconnected**: Sesión creada, esperando QR
- **connecting**: QR generado, esperando escaneo
- **connected**: WhatsApp conectado y activo
- **error**: Problema en la conexión

## 📊 Escalabilidad

### Vertical (1 Servidor)
```
VPS Resources:
├── 2GB RAM   → ~10 sesiones
├── 4GB RAM   → ~20 sesiones
├── 8GB RAM   → ~40 sesiones
├── 16GB RAM  → ~80 sesiones
└── 32GB RAM  → ~160 sesiones
```

### Horizontal (Múltiples Servidores)
```
       ┌─────────────────┐
       │  Load Balancer  │
       └────────┬─────────┘
                │
        ┌───────┴───────┐
        │               │
        ▼               ▼
    ┌───────┐       ┌───────┐
    │ VPS 1 │       │ VPS 2 │
    │ 80 ses│       │ 80 ses│
    └───┬───┘       └───┬───┘
        │               │
        └───────┬───────┘
                │
                ▼
        ┌───────────────┐
        │  Supabase DB  │
        │   (Shared)    │
        └───────────────┘
```

## 🎯 Optimizaciones Implementadas

1. **Frontend**
   - Code splitting automático (Next.js)
   - Lazy loading de componentes
   - Optimización de imágenes
   - Cache de assets

2. **Backend**
   - Conexión pooling (Supabase)
   - Compresión de respuestas
   - Manejo eficiente de webhooks

3. **Base de Datos**
   - Índices en columnas frecuentes
   - RLS para seguridad y filtrado
   - Queries optimizados

4. **Docker**
   - Imágenes Alpine (ligeras)
   - Multi-stage builds
   - .dockerignore para reducir tamaño

## 📈 Monitoreo

### Logs
- Backend: `docker-compose logs -f backend`
- Frontend: `docker-compose logs -f frontend`
- WAHA: `docker logs -f waha-session-XXX`
- Nginx: `/var/log/nginx/`

### Métricas
```bash
# Recursos de contenedores
docker stats

# Estado de servicios
docker-compose ps

# Uso de disco
df -h

# Uso de RAM
free -h
```

## 🔮 Futuras Mejoras

1. **WebSockets** - Mensajes en tiempo real sin polling
2. **Redis** - Cache de sesiones y rate limiting
3. **Kubernetes** - Orquestación avanzada
4. **Microservicios** - Separar auth, messaging, sessions
5. **GraphQL** - API más flexible
6. **Queue System** - RabbitMQ/Bull para mensajes
7. **Monitoring** - Prometheus + Grafana
8. **CDN** - CloudFlare para assets

---

**Arquitectura diseñada para**:
- ✅ Escalabilidad
- ✅ Mantenibilidad
- ✅ Seguridad
- ✅ Performance
- ✅ Flexibilidad


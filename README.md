# Conectafy 3.0 - SaaS Multi-WhatsApp

Sistema SaaS multiusuario para gestionar múltiples conexiones de WhatsApp Web usando WAHA.

## 🏗️ Arquitectura

```
conectafy3.0/
├── backend/                    # API Node.js + Express
│   ├── src/
│   │   ├── controllers/       # Controladores de rutas
│   │   ├── services/          # Lógica de negocio
│   │   ├── models/            # Modelos de datos
│   │   ├── middlewares/       # Middlewares (auth, etc)
│   │   ├── routes/            # Definición de rutas
│   │   ├── utils/             # Utilidades
│   │   ├── config/            # Configuración
│   │   └── index.js           # Punto de entrada
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── frontend/                   # Next.js 14 + NextUI
│   ├── app/                   # App Router
│   │   ├── (auth)/           # Grupo de rutas autenticadas
│   │   ├── login/
│   │   ├── register/
│   │   ├── dashboard/
│   │   ├── sessions/
│   │   ├── qr/
│   │   └── chat/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
└── scripts/
    ├── deploy.sh
    ├── restart-session.sh
    └── setup-digitalocean.sh
```

## 🚀 Tecnologías

- **Backend**: Node.js + Express
- **Frontend**: Next.js 14 (App Router) + NextUI + Iconify
- **Base de datos**: Supabase (Postgres + Auth)
- **WhatsApp**: WAHA (Docker)
- **Infraestructura**: Docker + Docker Compose en DigitalOcean

## 📊 Modelo de Base de Datos

### Tabla: users (gestionada por Supabase Auth)
- id (UUID)
- email
- created_at

### Tabla: whatsapp_sessions
- id (UUID)
- user_id (FK → users)
- session_name (string)
- phone_number (string, nullable)
- status (enum: 'disconnected', 'connecting', 'connected', 'error')
- qr_code (text, nullable)
- container_name (string)
- container_port (integer)
- webhook_url (string)
- created_at
- updated_at
- last_connected_at

### Tabla: messages
- id (UUID)
- session_id (FK → whatsapp_sessions)
- chat_id (string) - número del contacto
- message_id (string) - ID del mensaje en WhatsApp
- from_me (boolean)
- from_number (string)
- to_number (string)
- body (text)
- type (enum: 'text', 'image', 'audio', 'video', 'document')
- media_url (string, nullable)
- timestamp (timestamptz)
- created_at

### Tabla: contacts
- id (UUID)
- session_id (FK → whatsapp_sessions)
- phone_number (string)
- name (string, nullable)
- last_message_at (timestamptz)
- unread_count (integer)
- created_at

## 🔧 Instalación Local

### Inicio Rápido (5 minutos)

1. **Configurar Supabase** (Ver [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
   ```bash
   # Crear proyecto en supabase.com
   # Ejecutar backend/database/schema.sql
   # Obtener credenciales
   ```

2. **Configurar variables de entorno**
   ```bash
   cp env.example .env
   nano .env  # Pegar credenciales de Supabase
   ```

3. **Levantar servicios**
   ```bash
   docker-compose up -d
   ```

4. **Acceder**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001
   - Health: http://localhost:3001/health

Ver [QUICK_START.md](./QUICK_START.md) para guía completa.

## 🌊 Flujo de Funcionamiento

1. **Usuario se registra** → Supabase Auth crea el usuario
2. **Usuario inicia sesión** → Recibe JWT token
3. **Usuario crea sesión WhatsApp** → Backend crea contenedor WAHA dinámico
4. **WAHA genera QR** → Frontend muestra QR para escanear
5. **Usuario escanea QR** → WhatsApp se conecta
6. **WAHA envía webhook** → Backend guarda mensajes entrantes
7. **Frontend consulta mensajes** → Muestra chat en tiempo real

## 📦 Despliegue en DigitalOcean

Ver `scripts/setup-digitalocean.sh` para guía completa.

### Pasos rápidos:
1. Crear Droplet Ubuntu 22.04 (mínimo 4GB RAM)
2. Instalar Docker y Docker Compose
3. Clonar repositorio
4. Configurar variables de entorno
5. Ejecutar `docker-compose -f docker-compose.prod.yml up -d`

## 🔐 Variables de Entorno

```env
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_KEY=xxxxx

# Backend
PORT=3001
NODE_ENV=production
JWT_SECRET=xxxxx
BACKEND_URL=https://api.tudominio.com

# Frontend
NEXT_PUBLIC_API_URL=https://api.tudominio.com
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx

# WAHA
WAHA_BASE_PORT=3010
WAHA_IMAGE=devlikeapro/waha:latest
```

## 📈 Escalabilidad

### Para 100-500 números:
- **VPS**: DigitalOcean Droplet de 16GB RAM (soporta ~50 sesiones WAHA)
- **Load Balancer**: Agregar múltiples VPS detrás de un load balancer
- **Base de datos**: Supabase Pro (conexiones ilimitadas)
- **Storage**: Para medios de WhatsApp usar S3 o DigitalOcean Spaces

### Recursos por sesión WAHA:
- RAM: ~150-200MB por sesión
- CPU: 0.1-0.2 cores por sesión
- Puerto: 1 puerto único por sesión

### Cálculo:
- 1 VPS de 16GB = ~50-60 sesiones
- Para 500 números = 8-10 VPS

## 🛠️ Comandos Útiles

```bash
# Ver logs de una sesión específica
docker logs waha-session-<session_id>

# Reiniciar una sesión
./scripts/restart-session.sh <session_id>

# Ver todas las sesiones activas
docker ps | grep waha

# Limpiar sesiones huérfanas
docker container prune
```

## 📝 Licencia

Propietario - Conectafy 2025


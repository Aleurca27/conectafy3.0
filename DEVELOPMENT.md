# 🛠️ Guía de Desarrollo Local

Guía para configurar y ejecutar Conectafy 3.0 en tu entorno de desarrollo local.

## 📋 Requisitos Previos

- **Node.js** 20.x o superior
- **Docker** y **Docker Compose**
- **Git**
- Cuenta en **Supabase** (gratis)
- Editor de código (VS Code recomendado)

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/conectafy3.0.git
cd conectafy3.0
```

### 2. Configurar Supabase

Sigue la guía en [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) para:
- Crear proyecto en Supabase
- Ejecutar el schema SQL
- Obtener las credenciales

### 3. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar con tus credenciales
nano .env
```

Configurar:

```env
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_KEY=tu_service_key

# Backend
PORT=3001
NODE_ENV=development
JWT_SECRET=desarrollo_secret_cambiar_en_prod
BACKEND_URL=http://localhost:3001

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key

# WAHA
WAHA_BASE_PORT=3010
WAHA_IMAGE=devlikeapro/waha:latest
WAHA_MAX_SESSIONS=100
NETWORK_NAME=conectafy_network
```

### 4. Instalar Dependencias

#### Backend
```bash
cd backend
npm install
cd ..
```

#### Frontend
```bash
cd frontend
npm install
cd ..
```

## 🏃 Ejecutar en Desarrollo

### Opción 1: Usando Docker Compose (Recomendado)

```bash
# Levantar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# El backend estará en http://localhost:3001
# El frontend estará en http://localhost:3000
```

### Opción 2: Ejecutar Manualmente

Necesitarás 3 terminales:

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

#### Terminal 3 - WAHA (Ejemplo)
```bash
docker run -d \
  --name waha-dev \
  -p 3010:3000 \
  -e WHATSAPP_HOOK_URL=http://host.docker.internal:3001/api/webhook/whatsapp/waha-dev \
  -e WHATSAPP_HOOK_EVENTS=message,session.status \
  devlikeapro/waha:latest
```

## 🧪 Probar la Aplicación

1. Abre http://localhost:3000
2. Regístrate con un email de prueba
3. Crea una nueva sesión de WhatsApp
4. Escanea el QR con WhatsApp
5. Prueba enviar/recibir mensajes

## 🔧 Comandos Útiles

### Docker

```bash
# Ver contenedores en ejecución
docker ps

# Ver logs de un servicio
docker-compose logs -f backend
docker-compose logs -f frontend

# Reiniciar un servicio
docker-compose restart backend

# Detener todo
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v

# Rebuild de servicios
docker-compose up -d --build
```

### Backend

```bash
cd backend

# Modo desarrollo (con hot reload)
npm run dev

# Modo producción
npm start

# Verificar sintaxis
npm run lint
```

### Frontend

```bash
cd frontend

# Modo desarrollo
npm run dev

# Build para producción
npm run build

# Ejecutar build de producción
npm start

# Verificar sintaxis
npm run lint
```

## 📁 Estructura del Proyecto

```
conectafy3.0/
├── backend/                    # API Node.js + Express
│   ├── src/
│   │   ├── config/            # Configuraciones (Supabase, Docker)
│   │   ├── controllers/       # Controladores de rutas
│   │   ├── services/          # Lógica de negocio
│   │   ├── middlewares/       # Auth, validación, etc
│   │   ├── routes/            # Definición de rutas
│   │   └── index.js           # Entry point
│   ├── database/
│   │   └── schema.sql         # Schema de base de datos
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                   # Next.js 14 + NextUI
│   ├── app/                   # App Router
│   │   ├── login/            # Página de login
│   │   ├── register/         # Página de registro
│   │   ├── dashboard/        # Dashboard principal
│   │   ├── sessions/         # Gestión de sesiones
│   │   ├── qr/               # Escaneo de QR
│   │   └── chat/             # Chat de WhatsApp
│   ├── components/           # Componentes reutilizables
│   ├── lib/                  # Utilidades y API client
│   ├── Dockerfile
│   └── package.json
│
├── scripts/                   # Scripts de despliegue
│   ├── setup-digitalocean.sh
│   ├── deploy.sh
│   ├── restart-session.sh
│   └── backup.sh
│
├── nginx/                     # Configuración Nginx
│   └── nginx.conf
│
├── docker-compose.yml         # Desarrollo
├── docker-compose.prod.yml    # Producción
└── README.md
```

## 🐛 Debugging

### Backend

Agregar breakpoints en VS Code:

1. Crear `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/backend/src/index.js",
      "envFile": "${workspaceFolder}/.env"
    }
  ]
}
```

2. Presiona F5 para iniciar debug

### Frontend

Next.js tiene debugging integrado en Chrome DevTools.

### Ver logs de WAHA

```bash
# Ver logs de contenedor específico
docker logs -f waha-session-XXXX

# Ver todos los logs de WAHA
docker logs $(docker ps --filter "name=waha" -q)
```

## 🧹 Limpiar Entorno

```bash
# Detener y eliminar contenedores
docker-compose down

# Eliminar imágenes
docker rmi conectafy-backend conectafy-frontend

# Limpiar todo Docker
docker system prune -a

# Eliminar node_modules
rm -rf backend/node_modules frontend/node_modules

# Reinstalar
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

## 🔍 Troubleshooting

### Puerto ya en uso

```bash
# Ver qué proceso usa el puerto
lsof -i :3000
lsof -i :3001

# Matar proceso
kill -9 PID
```

### Docker no puede conectarse

```bash
# Reiniciar Docker
sudo systemctl restart docker

# O en Mac
docker restart
```

### Errores de permisos

```bash
# En Linux, agregar usuario a grupo docker
sudo usermod -aG docker $USER
newgrp docker

# Dar permisos a socket
sudo chmod 666 /var/run/docker.sock
```

### Frontend no se conecta al backend

Verifica:
1. Backend esté corriendo en puerto 3001
2. Variable `NEXT_PUBLIC_API_URL` en `.env` sea correcta
3. CORS esté habilitado en backend (ya configurado)

### WAHA no genera QR

```bash
# Ver logs
docker logs waha-session-XXXX

# Reiniciar contenedor
docker restart waha-session-XXXX

# Verificar webhook URL
docker inspect waha-session-XXXX | grep WHATSAPP_HOOK_URL
```

## 📚 Recursos Útiles

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de NextUI](https://nextui.org/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de WAHA](https://waha.devlike.pro/)
- [Documentación de Docker](https://docs.docker.com/)

## 🎯 Flujo de Desarrollo Típico

1. **Crear rama para feature**
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```

2. **Desarrollar y probar localmente**
   ```bash
   docker-compose up -d
   # Hacer cambios
   # Probar en http://localhost:3000
   ```

3. **Commit y push**
   ```bash
   git add .
   git commit -m "feat: nueva funcionalidad"
   git push origin feature/nueva-funcionalidad
   ```

4. **Crear Pull Request**

5. **Merge a main**

6. **Desplegar a producción**
   ```bash
   ./scripts/deploy.sh production
   ```

## 🧪 Testing

### Backend

```bash
cd backend
npm test
```

### Frontend

```bash
cd frontend
npm test
```

### E2E (Próximamente)

```bash
# Instalar Playwright
npm install -D @playwright/test

# Ejecutar tests E2E
npm run test:e2e
```

## 📝 Convenciones de Código

- **Commits**: Usar [Conventional Commits](https://www.conventionalcommits.org/)
  - `feat:` - Nueva funcionalidad
  - `fix:` - Corrección de bug
  - `docs:` - Documentación
  - `style:` - Formato, punto y coma, etc
  - `refactor:` - Refactorización
  - `test:` - Tests
  - `chore:` - Mantenimiento

- **Código**: 
  - TypeScript para frontend
  - ESM (import/export) para backend
  - Prettier para formato
  - ESLint para linting

## 🤝 Contribuir

1. Fork del proyecto
2. Crear rama de feature
3. Commit de cambios
4. Push a la rama
5. Crear Pull Request

---

**¡Happy coding! 🚀**


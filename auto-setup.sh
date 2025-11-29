#!/bin/bash
# Script de instalación automática de Conectafy 3.0
# Este script configura todo automáticamente

set -e

echo "🚀 Iniciando instalación automática de Conectafy 3.0..."
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Actualizar docker-compose.prod.yml con las variables correctas
echo -e "${YELLOW}📝 Configurando variables de entorno...${NC}"
cat > /opt/conectafy/.env << 'EOF'
# Supabase
SUPABASE_URL=https://cazfuljesrzddvgydsbu.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhemZ1bGplc3J6ZGR2Z3lkc2J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0NDg4NzUsImV4cCI6MjA4MDAyNDg3NX0.XyMC8mUoUGO6XjcYInR2QuMYbKFUgwBo3pqQR-Euhpg
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhemZ1bGplc3J6ZGR2Z3lkc2J1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQ0ODg3NSwiZXhwIjoyMDgwMDI0ODc1fQ.9t1gHUkOKtzPTr7BBhdOIsgEZRPMeWr8o2KrWDxBdRU

# JWT
JWT_SECRET=tu_super_secreto_jwt_key_cambiar_en_produccion

# API
PORT=3001
NODE_ENV=production

# Frontend
NEXT_PUBLIC_API_URL=http://34.134.182.26:3001
NEXT_PUBLIC_SUPABASE_URL=https://cazfuljesrzddvgydsbu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhemZ1bGplc3J6ZGR2Z3lkc2J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0NDg4NzUsImV4cCI6MjA4MDAyNDg3NX0.XyMC8mUoUGO6XjcYInR2QuMYbKFUgwBo3pqQR-Euhpg

# WAHA
WAHA_BASE_PORT=3010
WAHA_IMAGE=devlikeapro/waha:latest
WAHA_MAX_SESSIONS=100

# Docker
NETWORK_NAME=conectafy-network
BACKEND_URL=http://backend:3001
EOF

echo -e "${GREEN}✅ Variables de entorno configuradas${NC}"

# 2. Arreglar Dockerfile del frontend
echo -e "${YELLOW}📝 Arreglando Dockerfile del frontend...${NC}"
sed -i 's/RUN npm ci$/RUN npm ci --legacy-peer-deps/g' /opt/conectafy/frontend/Dockerfile
echo -e "${GREEN}✅ Dockerfile actualizado${NC}"

# 3. Crear docker-compose simplificado (sin nginx por ahora)
echo -e "${YELLOW}📝 Creando configuración Docker simplificada...${NC}"
cat > /opt/conectafy/docker-compose.simple.yml << 'EOF'
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: conectafy-backend
    restart: always
    ports:
      - "3001:3001"
    env_file:
      - .env
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    networks:
      - conectafy_network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: conectafy-frontend
    restart: always
    ports:
      - "3000:3000"
    env_file:
      - .env
    networks:
      - conectafy_network
    depends_on:
      - backend

networks:
  conectafy_network:
    name: conectafy_network
    driver: bridge
EOF

echo -e "${GREEN}✅ Configuración creada${NC}"

# 4. Limpiar contenedores anteriores si existen
echo -e "${YELLOW}🧹 Limpiando instalaciones previas...${NC}"
cd /opt/conectafy
docker-compose -f docker-compose.simple.yml down 2>/dev/null || true
docker system prune -f 2>/dev/null || true
echo -e "${GREEN}✅ Limpieza completada${NC}"

# 5. Construir e iniciar servicios
echo -e "${YELLOW}🔨 Construyendo e iniciando servicios (esto puede tardar 5-10 minutos)...${NC}"
docker-compose -f docker-compose.simple.yml up -d --build

# 6. Esperar a que los servicios estén listos
echo -e "${YELLOW}⏳ Esperando a que los servicios inicien...${NC}"
sleep 30

# 7. Verificar estado
echo ""
echo -e "${GREEN}🎉 ¡Instalación completada!${NC}"
echo ""
echo "📊 Estado de los servicios:"
docker-compose -f docker-compose.simple.yml ps
echo ""
echo "🌐 URLs de acceso:"
echo "  - Frontend: http://34.134.182.26:3000"
echo "  - Backend API: http://34.134.182.26:3001"
echo ""
echo "📝 Para ver logs:"
echo "  docker-compose -f docker-compose.simple.yml logs -f"
echo ""
echo "🔄 Para reiniciar:"
echo "  docker-compose -f docker-compose.simple.yml restart"
echo ""
echo "🛑 Para detener:"
echo "  docker-compose -f docker-compose.simple.yml down"
echo ""


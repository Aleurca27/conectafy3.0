#!/bin/bash

# ============================================
# Script de Despliegue
# Conectafy 3.0 - Multi WhatsApp SaaS
# ============================================

set -e

echo "============================================"
echo "  Conectafy 3.0 - Despliegue"
echo "============================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Verificar que existe archivo .env
if [ ! -f .env ]; then
    print_error "Archivo .env no encontrado"
    echo "Copia .env.example a .env y configura las variables"
    exit 1
fi

# Determinar modo (desarrollo o producción)
MODE=${1:-production}

if [ "$MODE" == "dev" ] || [ "$MODE" == "development" ]; then
    COMPOSE_FILE="docker-compose.yml"
    print_info "Modo: DESARROLLO"
else
    COMPOSE_FILE="docker-compose.prod.yml"
    print_info "Modo: PRODUCCIÓN"
fi

echo ""

# 1. Pull de últimos cambios (si es git)
if [ -d .git ]; then
    print_info "1/6 Obteniendo últimos cambios..."
    git pull
    print_success "Cambios obtenidos"
else
    print_info "1/6 No es un repositorio git, saltando..."
fi

# 2. Detener contenedores actuales
print_info "2/6 Deteniendo contenedores..."
docker-compose -f $COMPOSE_FILE down
print_success "Contenedores detenidos"

# 3. Pull de imágenes
print_info "3/6 Descargando imágenes..."
docker-compose -f $COMPOSE_FILE pull
print_success "Imágenes descargadas"

# 4. Build de servicios
print_info "4/6 Construyendo servicios..."
docker-compose -f $COMPOSE_FILE build --no-cache
print_success "Servicios construidos"

# 5. Iniciar servicios
print_info "5/6 Iniciando servicios..."
docker-compose -f $COMPOSE_FILE up -d
print_success "Servicios iniciados"

# 6. Limpiar recursos no usados
print_info "6/6 Limpiando recursos..."
docker system prune -f
print_success "Recursos limpiados"

echo ""
print_success "============================================"
print_success "  Despliegue completado exitosamente!"
print_success "============================================"
echo ""

# Mostrar estado de servicios
print_info "Estado de servicios:"
docker-compose -f $COMPOSE_FILE ps

echo ""
print_info "Logs en tiempo real: docker-compose -f $COMPOSE_FILE logs -f"
print_info "Detener servicios: docker-compose -f $COMPOSE_FILE down"
echo ""


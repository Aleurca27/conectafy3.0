#!/bin/bash

# ============================================
# Script de Setup para DigitalOcean
# Conectafy 3.0 - Multi WhatsApp SaaS
# ============================================

set -e

echo "============================================"
echo "  Conectafy 3.0 - Setup DigitalOcean"
echo "============================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Verificar si es root
if [ "$EUID" -ne 0 ]; then 
    print_error "Este script debe ejecutarse como root"
    echo "Usa: sudo bash setup-digitalocean.sh"
    exit 1
fi

print_info "Iniciando instalación..."
echo ""

# 1. Actualizar sistema
print_info "1/8 Actualizando sistema..."
apt-get update -qq
apt-get upgrade -y -qq
print_success "Sistema actualizado"

# 2. Instalar dependencias básicas
print_info "2/8 Instalando dependencias..."
apt-get install -y -qq \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    ufw \
    fail2ban
print_success "Dependencias instaladas"

# 3. Instalar Docker
print_info "3/8 Instalando Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    systemctl enable docker
    systemctl start docker
    print_success "Docker instalado"
else
    print_warning "Docker ya está instalado"
fi

# 4. Instalar Docker Compose
print_info "4/8 Instalando Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_VERSION="v2.24.0"
    curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose instalado"
else
    print_warning "Docker Compose ya está instalado"
fi

# 5. Configurar firewall
print_info "5/8 Configurando firewall..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp  # Frontend
ufw allow 3001/tcp  # Backend
ufw allow 3010:3510/tcp  # Rango para WAHA (hasta 500 sesiones)
print_success "Firewall configurado"

# 6. Configurar fail2ban
print_info "6/8 Configurando fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban
print_success "Fail2ban configurado"

# 7. Crear directorios
print_info "7/8 Creando directorios..."
mkdir -p /opt/conectafy
mkdir -p /opt/conectafy/logs
mkdir -p /opt/conectafy/backups
print_success "Directorios creados"

# 8. Configurar límites del sistema para Docker
print_info "8/8 Configurando límites del sistema..."
cat >> /etc/sysctl.conf <<EOF

# Conectafy - Límites para Docker
fs.file-max = 100000
vm.max_map_count = 262144
net.core.somaxconn = 65535
EOF

sysctl -p
print_success "Límites configurados"

echo ""
print_success "============================================"
print_success "  Instalación completada exitosamente!"
print_success "============================================"
echo ""
print_info "Próximos pasos:"
echo "1. Clonar el repositorio: cd /opt/conectafy && git clone <tu-repo>"
echo "2. Configurar variables de entorno: cp .env.example .env"
echo "3. Editar .env con tus credenciales de Supabase"
echo "4. Ejecutar: docker-compose -f docker-compose.prod.yml up -d"
echo ""
print_warning "Recuerda configurar tu dominio y SSL con Certbot/Let's Encrypt"
echo ""


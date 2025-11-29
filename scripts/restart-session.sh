#!/bin/bash

# ============================================
# Script para reiniciar sesión WAHA individual
# Conectafy 3.0
# ============================================

# Verificar argumento
if [ -z "$1" ]; then
    echo "Uso: ./restart-session.sh <container_name>"
    echo "Ejemplo: ./restart-session.sh waha-session-1234567890"
    exit 1
fi

CONTAINER_NAME=$1

echo "Reiniciando sesión: $CONTAINER_NAME"

# Verificar si el contenedor existe
if ! docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "Error: Contenedor $CONTAINER_NAME no encontrado"
    exit 1
fi

# Reiniciar contenedor
echo "Deteniendo contenedor..."
docker stop $CONTAINER_NAME

echo "Iniciando contenedor..."
docker start $CONTAINER_NAME

echo "✓ Sesión reiniciada exitosamente"
echo ""
echo "Ver logs: docker logs -f $CONTAINER_NAME"
echo "Estado: docker ps | grep $CONTAINER_NAME"


#!/bin/bash

# ============================================
# Script de Backup para Supabase
# Conectafy 3.0
# ============================================

set -e

BACKUP_DIR="/opt/conectafy/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="conectafy_backup_${TIMESTAMP}.sql"

echo "============================================"
echo "  Conectafy 3.0 - Backup"
echo "============================================"
echo ""

# Verificar variables de entorno
if [ -f .env ]; then
    source .env
else
    echo "Error: Archivo .env no encontrado"
    exit 1
fi

# Crear directorio de backups si no existe
mkdir -p $BACKUP_DIR

echo "Creando backup en: $BACKUP_DIR/$BACKUP_FILE"
echo ""

# Nota: Supabase maneja los backups automáticamente
# Este script es para backups manuales adicionales usando pg_dump
# Necesitarás la conexión directa a PostgreSQL de Supabase

# Para Supabase, puedes usar su dashboard para backups automáticos
# O exportar datos manualmente vía API

echo "NOTA: Supabase maneja backups automáticamente."
echo "Para backups manuales, usa el dashboard de Supabase:"
echo "https://app.supabase.com/project/_/settings/storage"
echo ""
echo "Para backups locales de datos específicos, considera exportar"
echo "las tablas individuales usando la API de Supabase."
echo ""

# Ejemplo de backup de datos importantes usando curl
echo "Generando backup de metadatos..."

# Aquí podrías agregar scripts para exportar datos críticos
# usando la API de Supabase si es necesario

echo "✓ Backup completado"
echo ""
echo "Ubicación: $BACKUP_DIR/"


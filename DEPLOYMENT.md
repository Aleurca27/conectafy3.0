# 🚀 Guía de Despliegue en DigitalOcean

Esta guía te llevará paso a paso para desplegar Conectafy 3.0 en DigitalOcean.

## 📋 Requisitos Previos

- Cuenta en DigitalOcean
- Cuenta en Supabase
- Dominio (opcional pero recomendado para SSL)

## 🖥️ Paso 1: Crear Droplet en DigitalOcean

1. Ve a [DigitalOcean](https://www.digitalocean.com)
2. Crea un nuevo Droplet:
   - **Imagen**: Ubuntu 22.04 LTS
   - **Plan**: 
     - Para desarrollo/pruebas: 2GB RAM ($12/mes)
     - Para 10-20 sesiones: 4GB RAM ($24/mes)
     - Para 50-100 sesiones: 8GB RAM ($48/mes)
     - Para 100-500 sesiones: 16GB RAM ($96/mes)
   - **Región**: Elige la más cercana a tus usuarios
   - **Autenticación**: SSH keys (recomendado)
   - **Hostname**: conectafy-server

3. Espera a que el Droplet esté listo y anota la IP pública

## 🔧 Paso 2: Configurar Supabase

1. Ve a [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Espera a que la base de datos esté lista
4. Ve a **SQL Editor** y ejecuta el contenido de `backend/database/schema.sql`
5. Anota las credenciales:
   - **URL del proyecto**: Settings → API → Project URL
   - **Anon key**: Settings → API → Project API keys → anon public
   - **Service role key**: Settings → API → Project API keys → service_role (secret)

## 🔐 Paso 3: Conectarse al Servidor

```bash
ssh root@TU_IP_DEL_DROPLET
```

## 📦 Paso 4: Ejecutar Script de Setup

```bash
# Descargar script de setup
curl -O https://raw.githubusercontent.com/tu-usuario/conectafy3.0/main/scripts/setup-digitalocean.sh

# Dar permisos de ejecución
chmod +x setup-digitalocean.sh

# Ejecutar script
sudo bash setup-digitalocean.sh
```

Este script instalará:
- Docker
- Docker Compose
- Firewall (UFW)
- Fail2ban
- Configuraciones del sistema

## 📂 Paso 5: Clonar Repositorio

```bash
cd /opt/conectafy
git clone https://github.com/tu-usuario/conectafy3.0.git
cd conectafy3.0
```

O si subes archivos manualmente:

```bash
# Desde tu máquina local
scp -r /ruta/local/conectafy3.0 root@TU_IP:/opt/conectafy/
```

## ⚙️ Paso 6: Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar archivo
nano .env
```

Configurar las siguientes variables:

```env
# Supabase (obtenidas en Paso 2)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_KEY=tu_service_key_aqui

# Backend
PORT=3001
NODE_ENV=production
JWT_SECRET=genera_un_string_aleatorio_seguro_aqui
BACKEND_URL=https://tudominio.com  # o http://TU_IP:3001

# Frontend
NEXT_PUBLIC_API_URL=https://tudominio.com  # o http://TU_IP:3001
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui

# WAHA
WAHA_BASE_PORT=3010
WAHA_IMAGE=devlikeapro/waha:latest
WAHA_MAX_SESSIONS=500

# Docker Network
NETWORK_NAME=conectafy_network
```

**Generar JWT_SECRET seguro:**
```bash
openssl rand -base64 32
```

## 🚀 Paso 7: Desplegar Aplicación

```bash
# Dar permisos a script de deploy
chmod +x scripts/deploy.sh

# Ejecutar despliegue
./scripts/deploy.sh production
```

## 🌐 Paso 8: Configurar Dominio (Opcional pero Recomendado)

### 8.1. Configurar DNS

En tu proveedor de dominio, agrega estos registros DNS:

```
Tipo: A
Nombre: @
Valor: TU_IP_DEL_DROPLET

Tipo: A
Nombre: www
Valor: TU_IP_DEL_DROPLET
```

### 8.2. Instalar Certbot para SSL

```bash
# Instalar Certbot
apt-get install -y certbot python3-certbot-nginx

# Detener nginx temporal si está corriendo
docker-compose -f docker-compose.prod.yml stop nginx

# Obtener certificado
certbot certonly --standalone -d tudominio.com -d www.tudominio.com

# Copiar certificados a carpeta de nginx
mkdir -p nginx/ssl
cp /etc/letsencrypt/live/tudominio.com/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/tudominio.com/privkey.pem nginx/ssl/

# Reiniciar servicios
docker-compose -f docker-compose.prod.yml up -d
```

### 8.3. Renovación Automática de Certificados

```bash
# Agregar cron job para renovación
crontab -e

# Agregar esta línea (renueva cada día a las 3 AM)
0 3 * * * certbot renew --quiet --post-hook "docker-compose -f /opt/conectafy/conectafy3.0/docker-compose.prod.yml restart nginx"
```

## ✅ Paso 9: Verificar Despliegue

```bash
# Ver estado de contenedores
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Verificar que todo funcione
curl http://localhost:3001/health
curl http://localhost:3000
```

Abre en tu navegador:
- **Frontend**: `http://TU_IP:3000` o `https://tudominio.com`
- **Backend API**: `http://TU_IP:3001/health` o `https://tudominio.com/api/health`

## 📊 Monitoreo y Mantenimiento

### Ver logs de un servicio específico
```bash
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### Ver logs de una sesión WAHA específica
```bash
docker logs -f waha-session-XXXX
```

### Reiniciar servicios
```bash
# Todos los servicios
docker-compose -f docker-compose.prod.yml restart

# Un servicio específico
docker-compose -f docker-compose.prod.yml restart backend

# Una sesión WAHA
./scripts/restart-session.sh waha-session-XXXX
```

### Ver uso de recursos
```bash
docker stats
```

### Limpiar recursos no usados
```bash
docker system prune -a
```

## 🔄 Actualizar Aplicación

```bash
cd /opt/conectafy/conectafy3.0
./scripts/deploy.sh production
```

## 🛡️ Seguridad Adicional

### Cambiar puerto SSH (opcional)
```bash
nano /etc/ssh/sshd_config
# Cambiar Port 22 a Port 2222
systemctl restart sshd
ufw allow 2222/tcp
```

### Configurar backups automáticos
```bash
# Configurar backup diario
crontab -e

# Agregar (backup diario a las 2 AM)
0 2 * * * /opt/conectafy/conectafy3.0/scripts/backup.sh
```

## 🚨 Troubleshooting

### Los contenedores no inician
```bash
docker-compose -f docker-compose.prod.yml logs
```

### Error de permisos con Docker
```bash
chmod 666 /var/run/docker.sock
```

### Puertos ya en uso
```bash
# Ver qué usa el puerto
lsof -i :3000
lsof -i :3001

# Matar proceso
kill -9 PID
```

### WAHA no genera QR
```bash
# Ver logs del contenedor WAHA
docker logs waha-session-XXXX

# Reiniciar sesión
./scripts/restart-session.sh waha-session-XXXX
```

## 📈 Escalabilidad

### Para escalar a múltiples VPS:

1. **Configurar Load Balancer** en DigitalOcean
2. **Usar base de datos compartida** (Supabase funciona perfecto)
3. **Distribuir sesiones WAHA** entre servidores
4. **Usar Docker Swarm o Kubernetes** para orquestación

### Recursos recomendados por escala:

| Sesiones | RAM  | CPU | Costo/mes |
|----------|------|-----|-----------|
| 1-10     | 2GB  | 1   | $12       |
| 10-50    | 4GB  | 2   | $24       |
| 50-100   | 8GB  | 4   | $48       |
| 100-200  | 16GB | 6   | $96       |
| 200-500  | 32GB | 8   | $192      |

## 📞 Soporte

Para problemas o preguntas:
- Issues en GitHub
- Documentación: README.md
- Logs del sistema: `/opt/conectafy/logs/`

---

**¡Felicitaciones! 🎉 Conectafy 3.0 está desplegado y listo para usar.**


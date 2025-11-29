# ⚡ Quick Start - Conectafy 3.0

Guía rápida para empezar en **5 minutos**.

## 🎯 Pasos Rápidos

### 1️⃣ Configurar Supabase (2 min)

1. Ve a [supabase.com](https://supabase.com) → Crear proyecto
2. Espera 2 minutos a que se cree
3. Ve a **SQL Editor** → Copia y pega el contenido de `backend/database/schema.sql` → Ejecutar
4. Ve a **Settings** → **API** → Copia las 3 credenciales

### 2️⃣ Configurar Variables (1 min)

```bash
cp env.example .env
nano .env
```

Pega tus credenciales de Supabase:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...

NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### 3️⃣ Levantar Aplicación (2 min)

```bash
docker-compose up -d
```

### 4️⃣ Usar la App

1. Abre http://localhost:3000
2. Regístrate
3. Crea una sesión de WhatsApp
4. Escanea el QR
5. ¡Listo! 🎉

## 🚀 Comandos Esenciales

```bash
# Ver logs
docker-compose logs -f

# Reiniciar
docker-compose restart

# Detener
docker-compose down

# Ver contenedores
docker ps
```

## 📱 URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🆘 Problemas Comunes

### Puerto ocupado
```bash
# Cambiar puertos en docker-compose.yml
ports:
  - "3002:3000"  # Frontend
  - "3003:3001"  # Backend
```

### Docker no funciona
```bash
# Reiniciar Docker
sudo systemctl restart docker  # Linux
# o reinicia Docker Desktop en Mac/Windows
```

### No genera QR
```bash
# Espera 10 segundos y recarga la página
# O reinicia la sesión desde el dashboard
```

## 📚 Más Información

- **Desarrollo Local**: [DEVELOPMENT.md](./DEVELOPMENT.md)
- **Despliegue en DigitalOcean**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **API**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Supabase**: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

## 💡 Tips

1. **Primer uso**: Usa el plan Free de Supabase para empezar
2. **Desarrollo**: Usa `docker-compose.yml` (incluido)
3. **Producción**: Usa `docker-compose.prod.yml`
4. **Logs**: Siempre revisa los logs si algo falla
5. **Backup**: Supabase hace backups automáticos

## ✅ Checklist

- [ ] Proyecto Supabase creado
- [ ] Schema SQL ejecutado
- [ ] Archivo .env configurado
- [ ] Docker corriendo
- [ ] Servicios levantados (`docker-compose up -d`)
- [ ] Frontend accesible en http://localhost:3000
- [ ] Backend respondiendo en http://localhost:3001/health
- [ ] Usuario de prueba creado
- [ ] Primera sesión de WhatsApp conectada

---

**¿Listo?** ¡Empieza ahora! 🚀

```bash
docker-compose up -d && docker-compose logs -f
```


# ✅ Checklist Pre-Despliegue

Lista de verificación antes de desplegar Conectafy 3.0 a producción.

## 🔐 Seguridad

### Variables de Entorno
- [ ] `JWT_SECRET` cambiado (no usar el de ejemplo)
- [ ] `SUPABASE_SERVICE_KEY` configurada correctamente
- [ ] Variables de entorno no commiteadas al repositorio
- [ ] Archivo `.env` en `.gitignore`

### Supabase
- [ ] Row Level Security (RLS) habilitado en todas las tablas
- [ ] Políticas de seguridad verificadas
- [ ] Service role key guardada de forma segura
- [ ] Autenticación de email habilitada
- [ ] Plan de Supabase adecuado al uso esperado

### Servidor
- [ ] SSH con keys (no password)
- [ ] Puerto SSH cambiado (opcional)
- [ ] Firewall (UFW) configurado
- [ ] Fail2ban instalado
- [ ] Usuario no-root para aplicación (Docker ya lo maneja)

## 🐳 Docker

### Configuración
- [ ] `docker-compose.prod.yml` revisado
- [ ] Límites de recursos configurados
- [ ] Restart policy: `always` o `unless-stopped`
- [ ] Network configurada correctamente
- [ ] Volúmenes persistentes si es necesario

### Imágenes
- [ ] Imágenes de producción optimizadas
- [ ] No incluyen archivos de desarrollo
- [ ] `.dockerignore` configurado

## 🌐 Dominio y SSL

### DNS
- [ ] Dominio apuntando a IP del servidor
- [ ] Registro A configurado
- [ ] Registro WWW configurado (opcional)
- [ ] Propagación DNS completada (24-48 hrs)

### SSL/HTTPS
- [ ] Certbot instalado
- [ ] Certificado SSL obtenido
- [ ] Certificados copiados a nginx/ssl/
- [ ] Auto-renovación configurada (cron)
- [ ] HTTPS funcionando
- [ ] Redirección HTTP → HTTPS activa

## 🗄️ Base de Datos

### Supabase
- [ ] Proyecto creado
- [ ] Schema SQL ejecutado
- [ ] Tablas creadas correctamente
- [ ] Índices creados
- [ ] Triggers funcionando
- [ ] Datos de prueba eliminados
- [ ] Backup automático habilitado (en plan Pro)

### Conexión
- [ ] URL de conexión correcta
- [ ] Credenciales verificadas
- [ ] Conexión desde servidor funcional

## 🔧 Backend

### Código
- [ ] Sin console.log innecesarios
- [ ] Manejo de errores implementado
- [ ] Variables de entorno usadas correctamente
- [ ] Logs configurados (morgan)
- [ ] Health check funcionando

### API
- [ ] Todos los endpoints probados
- [ ] Autenticación funcionando
- [ ] Webhooks configurados
- [ ] CORS configurado para dominio de producción

## 🎨 Frontend

### Código
- [ ] Build de producción exitoso
- [ ] Sin warnings en build
- [ ] Variables NEXT_PUBLIC_* configuradas
- [ ] URLs de API apuntando a producción
- [ ] Assets optimizados

### UI/UX
- [ ] Responsive en móvil
- [ ] Navegación fluida
- [ ] Errores manejados con toast/mensajes
- [ ] Loading states implementados

## 🚀 Despliegue

### Pre-despliegue
- [ ] Código en repositorio Git
- [ ] Tag de versión creado
- [ ] CHANGELOG actualizado
- [ ] Documentación actualizada

### Servidor
- [ ] VPS de DigitalOcean creado
- [ ] Tamaño adecuado para carga esperada
- [ ] Región óptima seleccionada
- [ ] IP pública asignada

### Scripts
- [ ] `setup-digitalocean.sh` ejecutado
- [ ] Docker y Docker Compose instalados
- [ ] Firewall configurado
- [ ] Repositorio clonado en servidor

### Ejecución
- [ ] Variables de entorno configuradas
- [ ] `deploy.sh production` ejecutado
- [ ] Contenedores corriendo
- [ ] Logs sin errores críticos

## 🧪 Testing Post-Despliegue

### Frontend
- [ ] Página principal carga
- [ ] Login funciona
- [ ] Registro funciona
- [ ] Dashboard accesible
- [ ] Navegación entre páginas

### Backend
- [ ] Health check responde
- [ ] API responde
- [ ] Autenticación funciona
- [ ] CORS permite requests del frontend

### Funcionalidad Completa
- [ ] Crear usuario nuevo
- [ ] Login con usuario
- [ ] Crear sesión de WhatsApp
- [ ] Ver código QR
- [ ] Conectar WhatsApp (escanear QR)
- [ ] Enviar mensaje
- [ ] Recibir mensaje
- [ ] Ver lista de chats

### WAHA
- [ ] Contenedor WAHA se crea correctamente
- [ ] QR se genera
- [ ] WhatsApp se conecta
- [ ] Webhooks funcionan
- [ ] Mensajes se reciben

## 📊 Monitoreo

### Logs
- [ ] Backend logs accesibles
- [ ] Frontend logs accesibles
- [ ] WAHA logs accesibles
- [ ] Nginx logs accesibles

### Recursos
- [ ] Uso de RAM monitoreado
- [ ] Uso de CPU monitoreado
- [ ] Uso de disco monitoreado
- [ ] Alertas configuradas (opcional)

## 🔄 Backup y Recuperación

### Backup
- [ ] Supabase backups automáticos (Pro plan)
- [ ] Script de backup configurado
- [ ] Cron job de backup (opcional)
- [ ] Ubicación de backups segura

### Recuperación
- [ ] Procedimiento de recuperación documentado
- [ ] Backup probado al menos una vez

## 📞 Soporte

### Documentación
- [ ] README actualizado
- [ ] API_DOCUMENTATION actualizado
- [ ] Contacto de soporte definido
- [ ] Issues de GitHub habilitados (opcional)

### Mantenimiento
- [ ] Plan de updates definido
- [ ] Responsable de mantenimiento asignado
- [ ] Procedimiento de rollback conocido

## 🎯 Performance

### Optimización
- [ ] Imágenes optimizadas
- [ ] Caché configurado (Nginx)
- [ ] Compresión habilitada (gzip)
- [ ] Lazy loading implementado

### Escalabilidad
- [ ] Recursos del servidor adecuados
- [ ] Plan de escalamiento definido
- [ ] Límites de rate considerados

## 📈 Métricas

### Tracking
- [ ] Google Analytics (opcional)
- [ ] Error tracking (Sentry, opcional)
- [ ] Uptime monitoring (opcional)
- [ ] Performance monitoring (opcional)

## ✅ Checklist Final

### Antes de Lanzar
- [ ] Todos los items anteriores completados
- [ ] Tests manuales pasados
- [ ] Sin errores en logs
- [ ] DNS propagado
- [ ] SSL funcionando
- [ ] Backup inicial realizado

### Post-Lanzamiento
- [ ] Monitorear primeras 24 horas
- [ ] Verificar logs regularmente
- [ ] Estar disponible para soporte
- [ ] Recopilar feedback de usuarios

---

## 🚨 Señales de Alerta

Estar atento a:
- ❌ CPU > 80% constantemente
- ❌ RAM > 90% constantemente
- ❌ Disco > 85% usado
- ❌ Errores 500 frecuentes
- ❌ Timeouts en API
- ❌ Contenedores WAHA caídos
- ❌ Base de datos lenta
- ❌ SSL expirado

---

## 📝 Notas

**Importante:**
- No saltarse pasos de seguridad
- Probar en ambiente de staging primero (si es posible)
- Tener plan de rollback listo
- Documentar cualquier cambio
- Mantener credenciales seguras

**Recomendación:**
- Desplegar en horario de baja demanda
- Tener 2-3 horas disponibles para el despliegue
- Tener acceso a terminal del servidor
- Tener backups recientes

---

**Última actualización:** Enero 2024  
**Versión checklist:** 1.0


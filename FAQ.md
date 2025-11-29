# ❓ Preguntas Frecuentes (FAQ)

Respuestas a las preguntas más comunes sobre Conectafy 3.0.

## 🎯 General

### ¿Qué es Conectafy 3.0?
Es un SaaS (Software as a Service) multiusuario que permite gestionar múltiples conexiones de WhatsApp Web desde una única plataforma. Cada usuario puede conectar varios números de WhatsApp y gestionar mensajes desde un dashboard web.

### ¿Es legal usar esto?
Sí, siempre que se use de acuerdo con los [Términos de Servicio de WhatsApp](https://www.whatsapp.com/legal/terms-of-service). Este software utiliza WhatsApp Web oficial mediante WAHA. **No envíes spam ni violes las políticas de WhatsApp**.

### ¿Cuánto cuesta?
- **Código**: Gratis (open source)
- **Supabase**: Plan Free (gratis) o Pro ($25/mes)
- **DigitalOcean**: Desde $12/mes (VPS de 2GB)
- **Total mínimo**: ~$12-37/mes

### ¿Necesito conocimientos técnicos?
Para desarrollo local: Conocimientos básicos de Docker y Node.js  
Para despliegue: Conocimientos de Linux, Docker y servidores  
Nivel: Intermedio-Avanzado

---

## 🚀 Instalación y Configuración

### ¿Cómo empiezo?
1. Lee [QUICK_START.md](./QUICK_START.md) para inicio rápido
2. Sigue [DEVELOPMENT.md](./DEVELOPMENT.md) para desarrollo local
3. Usa [DEPLOYMENT.md](./DEPLOYMENT.md) para producción

### ¿Necesito instalar algo en mi computadora?
Sí, necesitas:
- Docker y Docker Compose
- Git (opcional)
- Editor de código (VS Code recomendado)
- Navegador web moderno

### ¿Puedo usar otro proveedor en vez de DigitalOcean?
Sí, puedes usar cualquier VPS que soporte Docker:
- AWS EC2
- Google Cloud
- Azure
- Linode
- Vultr
- Hetzner
- etc.

Los scripts están hechos para DigitalOcean pero son adaptables.

### ¿Puedo usar otra base de datos en vez de Supabase?
Técnicamente sí, pero requiere modificaciones:
- PostgreSQL directo
- MySQL/MariaDB (con adaptaciones)
- MongoDB (requiere cambios significativos)

Supabase es recomendado porque incluye Auth y es fácil de usar.

---

## 💬 WhatsApp y WAHA

### ¿Qué es WAHA?
WAHA (WhatsApp HTTP API) es un servicio open-source que conecta WhatsApp Web y expone una API HTTP. Es como tener WhatsApp Web en un servidor controlable vía API.

### ¿Cuántos números de WhatsApp puedo conectar?
Técnicamente ilimitado, pero depende de:
- Recursos del servidor (RAM/CPU)
- Plan de Supabase (conexiones a DB)
- Cada sesión usa ~200MB RAM

**Ejemplos:**
- VPS 2GB: ~5-10 sesiones
- VPS 8GB: ~30-50 sesiones
- VPS 16GB: ~70-100 sesiones

### ¿El QR expira?
Sí, el QR de WhatsApp expira en ~60 segundos. Si expira, simplemente recarga la página para generar uno nuevo.

### ¿Puedo usar un número que ya está en WhatsApp Web?
No, WhatsApp solo permite vincular hasta 4 dispositivos (incluyendo WhatsApp Web). Si ya tienes 4 dispositivos vinculados, debes desvincular uno primero.

### ¿Se puede enviar WhatsApp a grupos?
En la versión 3.0 actual no está implementado, pero está planeado para v3.1. WAHA sí lo soporta, solo falta agregar la UI.

### ¿Puedo enviar imágenes, audios y videos?
- **Imágenes**: Sí, mediante URL pública
- **Audios**: Sí, mediante URL pública
- **Videos**: Sí, mediante URL pública
- **Documentos**: Sí, mediante URL pública

La carga directa de archivos está planeada para v3.1.

---

## 🔐 Seguridad y Privacidad

### ¿Mis mensajes están seguros?
Los mensajes se almacenan en Supabase (PostgreSQL). Supabase está hospedado en AWS con:
- Encriptación en reposo
- Backups automáticos
- Row Level Security (RLS)

**Recomendación**: Para máxima seguridad, usa tu propio servidor PostgreSQL.

### ¿Quién puede ver mis mensajes?
Solo tú. Cada usuario solo ve sus propias sesiones y mensajes gracias a Row Level Security (RLS) en Supabase.

### ¿Conectafy guarda mi contraseña de WhatsApp?
No, Conectafy nunca tiene acceso a tu contraseña de WhatsApp. La conexión se hace mediante QR de WhatsApp Web oficial.

### ¿Es seguro vincular mi WhatsApp?
Sí, es tan seguro como usar WhatsApp Web normal. Usas el mismo método de escaneo de QR que WhatsApp Web oficial.

---

## 💻 Desarrollo

### ¿Cómo contribuyo al proyecto?
1. Fork del repositorio
2. Crea una rama para tu feature
3. Haz commits con mensajes claros
4. Crea un Pull Request
5. Espera review

Ver [DEVELOPMENT.md](./DEVELOPMENT.md) para más detalles.

### ¿Puedo modificar el código?
Sí, el proyecto es open-source. Puedes:
- Modificar para uso personal
- Crear features nuevas
- Personalizar la UI
- Adaptar a tus necesidades

### ¿Hay roadmap del proyecto?
Sí, ver [CHANGELOG.md](./CHANGELOG.md) sección "Próximas Versiones".

---

## 🐛 Troubleshooting

### El QR no se genera
**Posibles causas:**
1. Contenedor WAHA no está listo (espera 10 seg)
2. Puerto bloqueado por firewall
3. Error en contenedor WAHA

**Solución:**
```bash
# Ver logs
docker logs waha-session-XXXXX

# Reiniciar sesión
./scripts/restart-session.sh waha-session-XXXXX
```

### No recibo mensajes
**Verificar:**
1. Webhook configurado correctamente
2. Backend accesible desde WAHA
3. Logs del backend

```bash
# Ver logs
docker-compose logs -f backend
```

### Error de autenticación
**Solución:**
1. Verificar token en localStorage
2. Hacer logout/login
3. Verificar credenciales de Supabase en .env

### Contenedores no inician
```bash
# Ver logs
docker-compose logs

# Ver recursos
docker stats

# Reiniciar todo
docker-compose down
docker-compose up -d
```

### Puerto ya en uso
```bash
# Ver qué usa el puerto
lsof -i :3000

# Cambiar puerto en docker-compose.yml
ports:
  - "3002:3000"
```

---

## 💰 Costos

### ¿Cuánto cuesta mantener esto?
**Mínimo (1-10 usuarios):**
- DigitalOcean VPS 2GB: $12/mes
- Supabase Free: $0/mes
- Dominio: ~$10/año
- **Total**: ~$13/mes

**Medio (10-50 usuarios):**
- DigitalOcean VPS 4GB: $24/mes
- Supabase Pro: $25/mes
- Dominio: ~$10/año
- **Total**: ~$50/mes

**Alto (50-200 usuarios):**
- DigitalOcean VPS 8GB: $48/mes
- Supabase Pro: $25/mes
- Dominio: ~$10/año
- **Total**: ~$74/mes

### ¿Hay límites en el plan Free de Supabase?
Sí:
- 500 MB de base de datos
- 1 GB de almacenamiento
- 2 GB de transferencia
- 50,000 usuarios activos/mes

Para producción, se recomienda plan Pro.

### ¿Puedo monetizar esto?
Sí, puedes:
- Ofrecer como servicio SaaS
- Cobrar subscripción mensual
- Revender a empresas
- White label

**Importante:** Respeta las licencias open-source del código base.

---

## 📊 Performance

### ¿Qué tan rápido es?
- Enviar mensaje: <500ms
- Recibir mensaje: ~1-2 seg (webhook)
- Cargar dashboard: <1 seg
- Generar QR: ~3-5 seg

### ¿Soporta muchos usuarios concurrentes?
Depende del servidor:
- VPS 2GB: ~5-10 usuarios concurrentes
- VPS 8GB: ~30-50 usuarios concurrentes
- VPS 16GB: ~70-100 usuarios concurrentes

Con load balancer: ilimitado (horizontally scalable).

### ¿Cómo optimizo el rendimiento?
1. Usar VPS con SSD
2. Habilitar cache (Redis, futuro)
3. CDN para assets (CloudFlare)
4. Optimizar queries de DB
5. Lazy loading en frontend

---

## 🔄 Actualizaciones

### ¿Cómo actualizo a nueva versión?
```bash
cd /opt/conectafy/conectafy3.0
git pull
./scripts/deploy.sh production
```

### ¿Pierdo datos al actualizar?
No, los datos están en Supabase (separado del código).

### ¿Con qué frecuencia sale nueva versión?
Depende de la comunidad, pero estimado:
- Parches (bugs): Según necesidad
- Minor (features): Cada 2-3 meses
- Major: Cada 6-12 meses

---

## 🌐 Multilenguaje

### ¿Está en español?
La documentación sí. El código (variables, funciones) está en inglés (estándar de desarrollo).

### ¿Puedo traducir la UI?
Sí, puedes agregar i18n. Próximas versiones incluirán multilenguaje.

---

## 📱 Mobile

### ¿Hay app móvil?
No, pero la web es responsive y funciona en móvil. Puedes instalarla como PWA (Progressive Web App).

### ¿Funcionará en mi teléfono?
Sí, si tu navegador soporta:
- JavaScript moderno
- Fetch API
- LocalStorage

Funciona en Chrome, Safari, Firefox, Edge.

---

## 🤝 Soporte

### ¿Dónde obtengo ayuda?
1. Lee la documentación
2. Revisa [FAQ.md](./FAQ.md) (este archivo)
3. Busca en Issues de GitHub
4. Crea un Issue nuevo
5. Contacta al desarrollador

### ¿Hay soporte comercial?
Actualmente no, pero puedes:
- Contratar desarrollador freelance
- Buscar en la comunidad
- Contribuir al proyecto

### ¿Reportar un bug?
Crea un Issue en GitHub con:
- Descripción del problema
- Pasos para reproducirlo
- Logs relevantes
- Versión del software
- Sistema operativo

---

## 📚 Recursos

### Documentación útil
- [Next.js Docs](https://nextjs.org/docs)
- [NextUI Docs](https://nextui.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [WAHA Docs](https://waha.devlike.pro/)
- [Docker Docs](https://docs.docker.com/)

### Comunidad
- GitHub Issues
- Discord (próximamente)
- Stack Overflow

---

**¿No encontraste tu pregunta?** Abre un Issue en GitHub.


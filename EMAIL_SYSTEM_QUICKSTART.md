# Sistema de Emails - Inicio Rápido ⚡

Guía rápida para configurar el sistema de notificaciones por email en menos de 15 minutos.

## ✅ Checklist Rápido

### 1️⃣ Configurar Resend (5 min)
```
1. Crear cuenta en https://resend.com
2. Agregar y verificar dominio (o usar dominio de prueba)
3. Obtener API Key
4. Guardar: RESEND_API_KEY=re_xxxxx
```

### 2️⃣ Configurar Supabase (3 min)
```
Dashboard → Project Settings → Edge Functions → Secrets:

RESEND_API_KEY=re_xxxxxxxxxxxxx
SENDER_EMAIL=notificaciones@tudominio.com
FUNCTION_SECRET=<generar con: openssl rand -hex 32>
APP_URL=https://tuapp.com
```

### 3️⃣ Desplegar Función (2 min)
```bash
# Opción fácil:
chmod +x scripts/deploy-email-function.sh
./scripts/deploy-email-function.sh

# O manualmente:
supabase login
supabase link --project-ref TU_PROJECT_REF
supabase functions deploy send-expiration-emails
```

### 4️⃣ Configurar GitHub Actions (3 min)
```
Repositorio → Settings → Secrets → Actions:

SUPABASE_PROJECT_URL=https://xxx.supabase.co
SUPABASE_FUNCTION_SECRET=<mismo que FUNCTION_SECRET>
```

### 5️⃣ Probar (2 min)
```bash
# Opción 1: Script de prueba
chmod +x scripts/test-email-function.sh
./scripts/test-email-function.sh

# Opción 2: Manualmente
curl -X POST "https://xxx.supabase.co/functions/v1/send-expiration-emails" \
  -H "Authorization: Bearer TU_FUNCTION_SECRET" \
  -d '{}'
```

## 🎯 ¿Cómo funciona?

```
Cada día a las 8:00 AM
    ↓
GitHub Actions ejecuta
    ↓
Llama a Edge Function de Supabase
    ↓
Busca servicios que vencen en 30 días:
  • Certificados de conservación
  • Inspecciones de sistemas
    ↓
Envía email profesional con Resend
    ↓
Usuario recibe notificación
```

## 🔧 Personalización Rápida

### Cambiar días de anticipación (30 → X días)
Editar: `supabase/functions/send-expiration-emails/index.ts`
```typescript
// Línea 36 y 69
thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30); // Cambiar 30
```

### Cambiar horario de envío
Editar: `.github/workflows/send-expiration-emails.yml`
```yaml
- cron: '0 8 * * *'  # Hora en UTC
# Para Argentina (UTC-3): '0 11 * * *' = 8:00 AM local
```

### Usar dominio de prueba (sin verificar dominio)
En Resend, puedes usar `onboarding@resend.dev` para pruebas:
```
SENDER_EMAIL=onboarding@resend.dev
```

## 📊 Monitoreo

**Ver emails enviados:**
- Resend Dashboard → Logs
- Supabase Dashboard → Edge Functions → send-expiration-emails → Logs

**Ver ejecuciones del cron:**
- GitHub → Actions → "Send Expiration Email Notifications"

## 🐛 Problemas Comunes

### "RESEND_API_KEY no configurada"
→ Agrega la variable en Supabase Dashboard y redespliega

### "No autorizado"
→ Verifica que FUNCTION_SECRET sea el mismo en Supabase y GitHub

### Emails no llegan
→ Verifica dominio en Resend o usa onboarding@resend.dev

### GitHub Actions no se ejecuta
→ Verifica que Actions esté habilitado en Settings → Actions

## 💰 Costos (100% GRATIS para uso normal)

- **Resend Free:** 100 emails/día, 3,000/mes
- **Supabase Free:** 500,000 invocaciones/mes
- **GitHub Actions:** Gratis para repos públicos, 2,000 min/mes privados

## 📚 Documentación Completa

Ver: [EMAIL_NOTIFICATIONS_SETUP.md](./EMAIL_NOTIFICATIONS_SETUP.md)

## 🆘 Ayuda Rápida

```bash
# Ver logs de la función
supabase functions logs send-expiration-emails --tail

# Probar manualmente
supabase functions invoke send-expiration-emails --body '{}'

# Ver estructura de archivos
tree supabase/
```

---

**Tiempo total de configuración:** ~15 minutos
**Próxima ejecución:** Mañana a las 8:00 AM
**Documentación:** [EMAIL_NOTIFICATIONS_SETUP.md](./EMAIL_NOTIFICATIONS_SETUP.md)

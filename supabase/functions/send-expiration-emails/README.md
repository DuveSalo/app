# Send Expiration Emails - Edge Function

Edge Function de Supabase que envía notificaciones por email cuando servicios están próximos a vencer (30 días de anticipación).

## 🎯 Funcionalidad

Detecta y notifica sobre:
- **Certificados de conservación** próximos a vencer
- **Inspecciones de sistemas de autoprotección** próximas

## 🚀 Despliegue Rápido

```bash
# Desplegar la función
supabase functions deploy send-expiration-emails

# Ejecutar prueba
supabase functions invoke send-expiration-emails \
  --body '{}' \
  --header "Authorization: Bearer YOUR_FUNCTION_SECRET"
```

## 🔐 Variables de Entorno Requeridas

Configura en Supabase Dashboard → Project Settings → Edge Functions:

```
RESEND_API_KEY=re_xxx              # API key de Resend
SENDER_EMAIL=notificaciones@xxx    # Email verificado en Resend
FUNCTION_SECRET=xxx                # Secret para proteger la función
APP_URL=https://tuapp.com          # URL de tu aplicación
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
```

## 📖 Documentación Completa

Ver: [EMAIL_NOTIFICATIONS_SETUP.md](../../../EMAIL_NOTIFICATIONS_SETUP.md)

## 🧪 Prueba Local

```bash
# Iniciar Supabase localmente
supabase start

# Servir la función
supabase functions serve send-expiration-emails

# Ejecutar prueba
curl -X POST http://localhost:54321/functions/v1/send-expiration-emails \
  -H "Authorization: Bearer YOUR_FUNCTION_SECRET" \
  -d '{}'
```

## 📊 Respuesta de la Función

```json
{
  "success": true,
  "message": "Procesamiento completado",
  "stats": {
    "totalServices": 10,
    "certificates": 6,
    "inspections": 4,
    "emailsSent": 9,
    "emailsFailed": 1
  }
}
```

## 🔧 Personalización

### Cambiar días de anticipación

Edita las líneas 36 y 69 en `index.ts`:
```typescript
thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30); // Cambiar 30 por los días deseados
```

### Modificar plantilla de email

Edita la función `generateEmailHTML()` en `index.ts` (línea ~115).

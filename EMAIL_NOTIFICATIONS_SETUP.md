# Configuración del Sistema de Notificaciones por Email

Este documento describe cómo configurar y desplegar el sistema automático de notificaciones por email para servicios próximos a vencer.

## 📋 Descripción General

El sistema envía emails automáticos cuando faltan **30 días** para el vencimiento de:
- **Certificados de conservación** (`conservation_certificates.expiration_date`)
- **Inspecciones de sistemas de autoprotección** (`self_protection_systems.next_inspection_date`)

## 🏗️ Arquitectura

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Cron Job       │────▶│  Edge Function   │────▶│   Resend     │
│  (GitHub/Cron)  │     │  Supabase        │     │   API        │
└─────────────────┘     └──────────────────┘     └──────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │  Base de Datos   │
                        │  (Supabase)      │
                        └──────────────────┘
```

## 🚀 Requisitos Previos

1. **Cuenta de Resend** (servicio de email)
   - Registro gratuito en: https://resend.com
   - Plan gratuito: 100 emails/día, 3,000 emails/mes

2. **Supabase CLI** instalado
   ```bash
   npm install -g supabase
   ```

3. **Deno** instalado (para desarrollo local)
   - Descarga: https://deno.land/

## 📦 Paso 1: Configuración de Resend

1. Crea una cuenta en [Resend](https://resend.com)

2. Verifica tu dominio:
   - Ve a **Domains** en el panel de Resend
   - Agrega tu dominio
   - Configura los registros DNS (SPF, DKIM, DMARC)
   - Espera la verificación (puede tomar unos minutos)

3. Obtén tu API Key:
   - Ve a **API Keys** en el panel de Resend
   - Crea una nueva API key
   - Guarda la clave de forma segura (la necesitarás en el siguiente paso)

## 🔐 Paso 2: Configurar Variables de Entorno en Supabase

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a **Project Settings** → **Edge Functions**
3. Agrega las siguientes variables de entorno (secrets):

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxx
SENDER_EMAIL=notificaciones@tudominio.com
FUNCTION_SECRET=tu_secret_key_seguro
APP_URL=https://tuapp.com
```

**Descripción de cada variable:**
- `RESEND_API_KEY`: Tu API key de Resend
- `SENDER_EMAIL`: Email desde el cual se enviarán las notificaciones (debe estar verificado en Resend)
- `FUNCTION_SECRET`: Una clave secreta generada por ti para proteger la función
- `APP_URL`: URL de tu aplicación (para el botón del email)

**Generar FUNCTION_SECRET:**
```bash
# Opción 1: Con Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Opción 2: Con OpenSSL
openssl rand -hex 32
```

## 🚀 Paso 3: Desplegar la Edge Function

### Opción A: Usando Supabase CLI

1. Inicia sesión en Supabase:
```bash
supabase login
```

2. Vincula tu proyecto:
```bash
supabase link --project-ref TU_PROJECT_REF
```

3. Despliega la función:
```bash
supabase functions deploy send-expiration-emails
```

4. Verifica el despliegue:
```bash
supabase functions list
```

### Opción B: Desde Supabase Dashboard

1. Ve a **Edge Functions** en tu proyecto
2. Haz clic en **Create a new function**
3. Nombra la función: `send-expiration-emails`
4. Copia y pega el contenido de `supabase/functions/send-expiration-emails/index.ts`
5. Haz clic en **Deploy**

## ⏰ Paso 4: Configurar Ejecución Automática

### Opción A: GitHub Actions (Recomendado - Gratis)

1. **Configurar Secrets en GitHub:**
   - Ve a tu repositorio → **Settings** → **Secrets and variables** → **Actions**
   - Agrega los siguientes secrets:
     ```
     SUPABASE_PROJECT_URL=https://tuproyecto.supabase.co
     SUPABASE_FUNCTION_SECRET=tu_function_secret
     ```

2. **El workflow ya está configurado** en `.github/workflows/send-expiration-emails.yml`
   - Se ejecutará automáticamente todos los días a las 8:00 AM UTC
   - Puedes ejecutarlo manualmente desde la pestaña "Actions" en GitHub

3. **Ajustar zona horaria:**
   - Edita el archivo `.github/workflows/send-expiration-emails.yml`
   - Modifica la línea `cron:` según tu zona horaria
   - Ejemplo para Argentina (UTC-3, 8:00 AM local):
     ```yaml
     - cron: '0 11 * * *'  # 11:00 UTC = 8:00 AM Argentina
     ```

### Opción B: Supabase pg_cron (Solo planes Pro+)

Si tienes un plan Pro o superior en Supabase:

1. Ejecuta la migración:
```bash
supabase db push
```

2. O ejecuta manualmente el SQL en el SQL Editor de Supabase:
```sql
-- Ver archivo: supabase/migrations/setup_email_notifications_cron.sql
```

3. Reemplaza los placeholders:
   - `<TU_SUPABASE_PROJECT_URL>` con tu URL de Supabase
   - `<TU_FUNCTION_SECRET>` con tu secret key

### Opción C: Servicio Externo de Cron

Puedes usar servicios gratuitos como:
- **Cron-job.org** (https://cron-job.org)
- **EasyCron** (https://www.easycron.com)
- **Cronhub** (https://cronhub.io)

Configura una petición HTTP POST a:
```
URL: https://tuproyecto.supabase.co/functions/v1/send-expiration-emails
Método: POST
Headers:
  Content-Type: application/json
  Authorization: Bearer TU_FUNCTION_SECRET
Body: {}
Frecuencia: Diaria a las 8:00 AM
```

## 🧪 Paso 5: Pruebas

### Prueba Manual Inmediata

Ejecuta la función manualmente desde la terminal:

```bash
curl -X POST \
  "https://tuproyecto.supabase.co/functions/v1/send-expiration-emails" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_FUNCTION_SECRET" \
  -d '{}'
```

### Verificar Logs

1. **En Supabase Dashboard:**
   - Ve a **Edge Functions** → `send-expiration-emails`
   - Haz clic en **Logs**
   - Verifica la ejecución y posibles errores

2. **En GitHub Actions:**
   - Ve a la pestaña **Actions**
   - Selecciona el workflow "Send Expiration Email Notifications"
   - Revisa los logs de ejecución

### Crear Datos de Prueba

Para probar el sistema, crea un certificado que venza en 25 días:

```sql
-- Insertar certificado de prueba
INSERT INTO conservation_certificates (
  company_id,
  presentation_date,
  expiration_date,
  intervener,
  registration_number
) VALUES (
  'tu_company_id',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '25 days',
  'Interventor de Prueba',
  'TEST-001'
);
```

## 📧 Plantilla de Email

Los emails incluyen:
- ✅ Diseño responsive profesional
- ⚠️ Banner de alerta con días restantes
- 📋 Detalles del servicio
- 🎨 Colores que cambian según urgencia:
  - Naranja: 11-30 días restantes
  - Rojo: 10 o menos días restantes
- 🔗 Botón para ir al panel de control

**Vista previa:**

```
┌─────────────────────────────────────┐
│   Recordatorio de Vencimiento       │
├─────────────────────────────────────┤
│ ⚠️ Faltan 25 días para el vencimiento │
├─────────────────────────────────────┤
│                                     │
│ Estimado/a,                         │
│                                     │
│ Le recordamos que su certificado    │
│ de conservación está próximo a      │
│ vencer.                             │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ Empresa: Mi Empresa         │   │
│ │ Servicio: Certificado #123  │   │
│ │ Vencimiento: 15 Nov 2025    │   │
│ │ Días restantes: 25 días     │   │
│ └─────────────────────────────┘   │
│                                     │
│     [Ir al Panel de Control]        │
│                                     │
└─────────────────────────────────────┘
```

## 🔧 Personalización

### Cambiar los días de anticipación

Edita el archivo `supabase/functions/send-expiration-emails/index.ts`:

```typescript
// Línea 36 y 69 - Cambiar 30 por el número de días deseado
const thirtyDaysFromNow = new Date();
thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30); // Cambiar aquí
```

### Modificar el horario de envío

**GitHub Actions:**
Edita `.github/workflows/send-expiration-emails.yml`:
```yaml
- cron: '0 8 * * *'  # Formato: 'minuto hora * * *'
```

**pg_cron:**
Edita `supabase/migrations/setup_email_notifications_cron.sql`:
```sql
'0 8 * * *'  -- Formato: 'minuto hora día mes díaSemana'
```

### Personalizar el diseño del email

Edita la función `generateEmailHTML()` en el archivo `index.ts` (línea ~115).

## 📊 Monitoreo

### Verificar emails enviados

En el dashboard de Resend:
- Ve a **Logs** para ver todos los emails enviados
- Verifica el estado de entrega
- Revisa tasas de apertura (si tienes tracking habilitado)

### Logs de ejecución

```bash
# Ver logs de la función en tiempo real
supabase functions logs send-expiration-emails --tail
```

### Estadísticas

La función devuelve estadísticas en cada ejecución:
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

## 🐛 Solución de Problemas

### Error: "RESEND_API_KEY no está configurada"
- Verifica que agregaste la variable en Supabase Edge Functions settings
- Redespliega la función después de agregar las variables

### Error: "No autorizado"
- Verifica que estás enviando el header `Authorization: Bearer TU_FUNCTION_SECRET`
- Verifica que el `FUNCTION_SECRET` en Supabase coincida con el que usas

### Los emails no llegan
- Verifica que el dominio esté verificado en Resend
- Revisa los logs de Resend para ver errores de entrega
- Verifica que la dirección `SENDER_EMAIL` esté verificada
- Revisa la carpeta de spam

### La función no se ejecuta automáticamente
- **GitHub Actions:** Verifica que el repositorio sea público o que tengas Actions habilitado
- **pg_cron:** Verifica que tengas plan Pro o superior
- Verifica los logs del cron job

### Error de conexión con la base de datos
- Verifica que `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` estén configurados
- Verifica que la función tenga permisos de service role

## 💰 Costos Estimados

### Plan Gratuito (Resend)
- ✅ 100 emails/día
- ✅ 3,000 emails/mes
- ✅ Suficiente para ~30 empresas con múltiples servicios

### Plan Pro (Resend - $20/mes)
- ✅ 50,000 emails/mes
- ✅ Soporte prioritario
- ✅ Analytics avanzados

### Supabase
- ✅ Edge Functions: Gratis hasta 500,000 invocaciones/mes
- ✅ Cron (pg_cron): Solo en planes Pro+ ($25/mes)

**Alternativa gratis completa:**
- Supabase Free Plan
- Resend Free Plan
- GitHub Actions (gratis para repos públicos, 2,000 minutos/mes para privados)

## 📚 Recursos Adicionales

- [Documentación de Resend](https://resend.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [GitHub Actions Cron](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)
- [Cron Expression Generator](https://crontab.guru)

## ✅ Checklist de Implementación

- [ ] Crear cuenta en Resend
- [ ] Verificar dominio en Resend
- [ ] Obtener API key de Resend
- [ ] Configurar variables de entorno en Supabase
- [ ] Desplegar Edge Function
- [ ] Configurar GitHub Actions o cron job
- [ ] Ejecutar prueba manual
- [ ] Crear datos de prueba
- [ ] Verificar recepción de email
- [ ] Configurar monitoreo

## 🆘 Soporte

Si encuentras problemas:
1. Revisa los logs de la Edge Function
2. Verifica los logs de Resend
3. Revisa este documento para troubleshooting
4. Contacta al equipo de desarrollo

---

**Última actualización:** 2025-10-27
**Versión:** 1.0.0

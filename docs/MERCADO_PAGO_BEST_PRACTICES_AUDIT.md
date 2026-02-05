# Auditoria de Buenas Practicas - Integracion Mercado Pago

> Fecha: 30/01/2026
> Proyecto: SafetyGuard Pro
> Fuente: Documentacion oficial de MercadoPago via Context7

---

## Resumen Ejecutivo

| Categoria | Estado | Prioridad |
|-----------|--------|-----------|
| Validacion de Webhooks | CRITICO | Alta |
| Seguridad de Credenciales | OK | - |
| CORS Configuration | MEJORABLE | Media |
| Idempotencia | FALTA | Media |
| Manejo de Estados | PARCIAL | Media |
| Rate Limiting | FALTA | Baja |
| Logs de Auditoria | PARCIAL | Baja |

**Puntuacion General: 65/100**

---

## 1. CRITICO: Validacion de Firma de Webhooks

### Problema Actual
El webhook en `supabase/functions/webhook-mercadopago/index.ts` **NO valida la firma** de las notificaciones de Mercado Pago. Esto es una vulnerabilidad de seguridad critica.

### Por que es importante
Sin validacion de firma, cualquier actor malicioso podria enviar notificaciones falsas a tu webhook, potencialmente:
- Activando suscripciones sin pago real
- Manipulando estados de pago
- Causando inconsistencias en la base de datos

### Solucion Requerida

#### 1.1 Agregar variable de entorno

```env
# En Supabase Dashboard > Project Settings > Edge Functions > Secrets
MERCADOPAGO_WEBHOOK_SECRET=tu_secret_key_aqui
```

> El secret se obtiene desde: Panel de Desarrolladores de MP > Tu App > Webhooks > Ver secreto

#### 1.2 Implementar validacion de firma

Reemplazar el inicio del webhook con:

```typescript
// supabase/functions/webhook-mercadopago/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts';

// ... (corsHeaders igual)

/**
 * Valida la firma del webhook de Mercado Pago
 * Segun documentacion oficial: https://www.mercadopago.com.br/developers/pt/docs/checkout-bricks/additional-content/your-integrations/notifications/webhooks
 */
async function validateWebhookSignature(
  req: Request,
  body: string
): Promise<boolean> {
  const secret = Deno.env.get('MERCADOPAGO_WEBHOOK_SECRET');
  if (!secret) {
    console.error('[Webhook] MERCADOPAGO_WEBHOOK_SECRET not configured');
    return false;
  }

  const xSignature = req.headers.get('x-signature');
  const xRequestId = req.headers.get('x-request-id');

  if (!xSignature || !xRequestId) {
    console.error('[Webhook] Missing x-signature or x-request-id headers');
    return false;
  }

  // Extraer data.id del query string
  const url = new URL(req.url);
  const dataId = url.searchParams.get('data.id') || '';

  // Parsear x-signature: ts=xxx,v1=xxx
  const signatureParts = xSignature.split(',');
  let ts: string | null = null;
  let receivedHash: string | null = null;

  signatureParts.forEach(part => {
    const [key, value] = part.split('=');
    if (key === 'ts') ts = value;
    else if (key === 'v1') receivedHash = value;
  });

  if (!ts || !receivedHash) {
    console.error('[Webhook] Invalid x-signature format');
    return false;
  }

  // Construir el template de firma
  // Formato: id:[data.id];request-id:[x-request-id];ts:[ts];
  const manifest = `id:${dataId.toLowerCase()};request-id:${xRequestId};ts:${ts};`;

  // Generar HMAC-SHA256
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(manifest);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const expectedHash = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Comparar hashes
  const isValid = expectedHash === receivedHash;

  if (!isValid) {
    console.error('[Webhook] Signature mismatch', {
      expected: expectedHash,
      received: receivedHash,
    });
  }

  return isValid;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Leer el body como texto para validacion
  const bodyText = await req.text();

  // VALIDAR FIRMA ANTES DE PROCESAR
  const isValid = await validateWebhookSignature(req, bodyText);
  if (!isValid) {
    console.error('[Webhook] Invalid signature - rejecting request');
    return new Response(JSON.stringify({ error: 'Invalid signature' }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  // Parsear el body despues de validar
  const body = JSON.parse(bodyText);
  // ... resto del codigo
});
```

---

## 2. CORS Demasiado Permisivo

### Problema Actual
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',  // Permite cualquier origen
  // ...
};
```

### Solucion

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('APP_URL') || 'http://localhost:3000',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

// Para webhooks (que vienen de MP), usar:
const webhookCorsHeaders = {
  'Access-Control-Allow-Origin': '*', // Necesario para MP
  'Content-Type': 'application/json',
};
```

---

## 3. Falta Idempotencia en Webhook

### Problema Actual
El webhook puede procesar el mismo pago multiples veces si MP envia reintentos.

### Solucion

```typescript
// Antes de insertar payment_transaction, verificar si ya existe
const { data: existingPayment } = await supabase
  .from('payment_transactions')
  .select('id')
  .eq('mp_payment_id', payment.id?.toString())
  .single();

if (existingPayment) {
  console.log('[Webhook] Payment already processed:', payment.id);
  return new Response(JSON.stringify({ received: true, duplicate: true }), {
    status: 200,
    headers: corsHeaders,
  });
}

// Continuar con el insert...
```

---

## 4. Falta Manejo de Estado "authorized"

### Problema Actual
Cuando la suscripcion cambia a `authorized` (pago exitoso), no se actualiza la company.

### Solucion

En el handler `subscription_preapproval`, agregar:

```typescript
// Despues de actualizar la suscripcion
if (preapproval.status === 'authorized') {
  await supabase
    .from('companies')
    .update({
      subscription_status: 'active',
      is_subscribed: true,
      selected_plan: subscription.plan_id, // Si tienes este campo
    })
    .eq('id', sub.company_id);

  console.log('[Webhook] Company activated:', sub.company_id);
}
```

---

## 5. Falta Ruta de Callback

### Problema Actual
El `back_url` apunta a `/#/subscription/callback` pero esta ruta no existe.

### Solucion

#### 5.1 Agregar la ruta en `routes.config.ts`:

```typescript
// src/routes/routes.config.ts
{
  path: ROUTE_PATHS.SUBSCRIPTION_CALLBACK,
  element: lazy(() => import('@/features/auth/SubscriptionCallbackPage')),
  protected: true,
}
```

#### 5.2 Agregar constante en `constants/routes.ts`:

```typescript
export const ROUTE_PATHS = {
  // ... existentes
  SUBSCRIPTION_CALLBACK: '/subscription/callback',
};
```

#### 5.3 Crear el componente callback:

```typescript
// src/features/auth/SubscriptionCallbackPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { ROUTE_PATHS } from '@/constants';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const SubscriptionCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshCompany } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const processCallback = async () => {
      // MP envia: ?preapproval_id=xxx&status=authorized
      const preapprovalId = searchParams.get('preapproval_id');
      const mpStatus = searchParams.get('status');

      if (mpStatus === 'authorized' || mpStatus === 'pending') {
        // Refrescar datos de la company
        await refreshCompany();
        setStatus('success');

        // Redirigir al dashboard despues de 2 segundos
        setTimeout(() => {
          navigate(ROUTE_PATHS.DASHBOARD);
        }, 2000);
      } else {
        setStatus('error');
      }
    };

    processCallback();
  }, [searchParams, refreshCompany, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-secondary">
      <div className="bg-surface-primary rounded-xl border border-borderClr-default p-8 text-center max-w-md">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-brand-primary animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Procesando...</h2>
            <p className="text-content-secondary mt-2">Verificando tu suscripcion</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-status-success mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Suscripcion Activada</h2>
            <p className="text-content-secondary mt-2">Redirigiendo al dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-status-error mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Error en el Pago</h2>
            <p className="text-content-secondary mt-2">
              Hubo un problema con tu pago. Por favor intenta nuevamente.
            </p>
            <button
              onClick={() => navigate(ROUTE_PATHS.SUBSCRIPTION)}
              className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-lg"
            >
              Volver a intentar
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SubscriptionCallbackPage;
```

---

## 6. Validacion de Montos en Backend

### Problema Actual
El backend acepta cualquier monto enviado desde el frontend sin validar.

### Solucion

En `create-subscription/index.ts`:

```typescript
// Definir planes validos en el servidor
const VALID_PLANS: Record<string, { name: string; amount: number }> = {
  basic: { name: 'Basico', amount: 29000 },
  standard: { name: 'Estandar', amount: 59000 },
  premium: { name: 'Premium', amount: 99000 },
};

// Validar que el plan existe y el monto coincide
const validPlan = VALID_PLANS[body.planId];
if (!validPlan) {
  return new Response(JSON.stringify({ error: 'Plan no valido' }), {
    status: 400,
    headers: corsHeaders,
  });
}

if (body.amount !== validPlan.amount) {
  console.error('[create-subscription] Amount mismatch:', {
    received: body.amount,
    expected: validPlan.amount,
  });
  return new Response(JSON.stringify({ error: 'Monto invalido' }), {
    status: 400,
    headers: corsHeaders,
  });
}

// Usar el monto del servidor, no del cliente
const preapprovalBody = {
  // ...
  auto_recurring: {
    transaction_amount: validPlan.amount, // Usar monto validado
    // ...
  },
};
```

---

## 7. MercadoPagoProvider No Integrado en App

### Problema Actual
El `MercadoPagoProvider` existe pero no esta envolviendo la aplicacion.

### Solucion

En `src/App.tsx`, agregar:

```typescript
import { MercadoPagoProvider } from '@/lib/mercadopago';

function App() {
  return (
    <AuthProvider>
      <MercadoPagoProvider>
        <RouterProvider router={router} />
      </MercadoPagoProvider>
    </AuthProvider>
  );
}
```

> Nota: Si solo usas Checkout Pro (redirect), el Provider no es estrictamente necesario. Solo es requerido para Checkout Bricks (formulario embebido).

---

## 8. Mejorar Logs de Auditoria

### Recomendacion

Agregar tabla de audit logs especifica para pagos:

```sql
-- supabase/migrations/20250131_create_payment_audit_logs.sql

CREATE TABLE payment_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  event_type TEXT NOT NULL,
  -- subscription_created, payment_received, payment_rejected,
  -- subscription_authorized, subscription_cancelled, webhook_received
  event_data JSONB,
  mp_id TEXT,
  source TEXT, -- 'edge_function', 'webhook'
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_audit_company ON payment_audit_logs(company_id);
CREATE INDEX idx_payment_audit_type ON payment_audit_logs(event_type);
CREATE INDEX idx_payment_audit_created ON payment_audit_logs(created_at);
```

---

## 9. Rate Limiting (Opcional)

### Recomendacion

Usar Supabase Edge Functions con un rate limiter basico:

```typescript
// Simple in-memory rate limiter (reinicia con cada cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests
const RATE_WINDOW = 60000; // 1 minuto

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

// En el handler:
const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
if (!checkRateLimit(clientIp)) {
  return new Response(JSON.stringify({ error: 'Too many requests' }), {
    status: 429,
    headers: corsHeaders,
  });
}
```

---

## 10. Checklist de Implementacion

### Alta Prioridad (Implementar Inmediatamente)

- [ ] Agregar `MERCADOPAGO_WEBHOOK_SECRET` en Supabase secrets
- [ ] Implementar validacion de firma en webhook
- [ ] Validar montos en el servidor contra planes definidos
- [ ] Crear ruta y componente de callback

### Media Prioridad (Implementar Pronto)

- [ ] Agregar idempotencia al webhook (verificar duplicados)
- [ ] Manejar estado `authorized` para activar company
- [ ] Restringir CORS en create-subscription

### Baja Prioridad (Nice to Have)

- [ ] Agregar tabla de audit logs
- [ ] Implementar rate limiting basico
- [ ] Envolver App con MercadoPagoProvider (solo si usas Bricks)

---

## 11. Referencias

- [MercadoPago Node.js SDK - Context7](https://context7.com/mercadopago/sdk-nodejs)
- [Webhook Signature Validation - MP Docs](https://www.mercadopago.com.br/developers/pt/docs/checkout-bricks/additional-content/your-integrations/notifications/webhooks)
- [Preapproval API](https://www.mercadopago.com.ar/developers/es/reference/subscriptions/_preapproval/post)
- [Panel de Desarrolladores MP](https://www.mercadopago.com.ar/developers/panel)

---

*Documento generado el 30/01/2026 para SafetyGuard Pro*

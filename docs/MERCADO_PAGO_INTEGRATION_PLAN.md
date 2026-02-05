# Plan de Integración de Mercado Pago - SafetyGuard Pro

## Resumen Ejecutivo

Este documento detalla el plan de integración de Mercado Pago como pasarela de pagos para SafetyGuard Pro, reemplazando el sistema actual de suscripciones simulado por un flujo de pagos real y seguro.

---

## 1. Análisis del Estado Actual

### 1.1 Arquitectura Existente

| Componente | Ubicación | Estado Actual |
|------------|-----------|---------------|
| Página de Suscripción | `src/features/auth/SubscriptionPage.tsx` | UI de selección de planes sin pasarela real |
| Contexto de Auth | `src/features/auth/AuthContext.tsx` | Maneja `completeSubscription()` simulado |
| Servicio de Company | `src/lib/api/services/company.ts` | `subscribeCompany()` sin procesamiento de pago |
| Tipos | `src/types/company.ts` | `PaymentDetails` básico, sin tokens MP |

### 1.2 Planes Definidos

```typescript
// Planes actuales en SubscriptionPage.tsx
{ id: 'basic',    price: '$29.000/mes',  priceNumber: 29000  }
{ id: 'standard', price: '$59.000/mes',  priceNumber: 59000  }
{ id: 'premium',  price: '$99.000/mes',  priceNumber: 99000  }
```

### 1.3 Flujo Actual de Suscripción

```
Usuario selecciona plan → completeSubscription() → updateCompany() → Redirect a Dashboard
                          (sin pago real)
```

---

## 2. Opción de Integración Recomendada

### 2.1 Checkout Bricks (Recomendado)

**¿Por qué Checkout Bricks?**

| Criterio | Checkout Pro | Checkout Bricks | Checkout API |
|----------|--------------|-----------------|--------------|
| Personalización UI | Baja | Alta | Total |
| Tiempo de implementación | Rápido | Medio | Alto |
| Cumplimiento PCI SAQ A | ✅ | ✅ | ✅ |
| Integración con React | Redirect | Nativa | Manual |
| Suscripciones recurrentes | ✅ | ✅ | ✅ |

**Checkout Bricks** es ideal porque:
- Se integra nativamente con React via `@mercadopago/sdk-react`
- Permite mantener el diseño Attio-inspired del proyecto
- Cumple automáticamente con PCI SAQ A
- Soporta suscripciones recurrentes

---

## 3. Requisitos Previos

### 3.1 Cuenta de Mercado Pago

1. Crear cuenta vendedor en [Mercado Pago](https://www.mercadopago.com.ar)
2. Acceder al [Panel de Desarrolladores](https://www.mercadopago.com.ar/developers/panel)
3. Crear aplicación para obtener credenciales

### 3.2 Credenciales Necesarias

| Credencial | Uso | Entorno |
|------------|-----|---------|
| `PUBLIC_KEY` | Frontend (SDK React) | Test/Producción |
| `ACCESS_TOKEN` | Backend (crear preferencias/suscripciones) | Test/Producción |

### 3.3 Variables de Entorno

```env
# .env.local (desarrollo)
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# .env.production
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

> **Nota:** El `ACCESS_TOKEN` debe manejarse exclusivamente en el backend (Supabase Edge Functions).

---

## 4. Arquitectura de la Solución

### 4.1 Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────────┐ │
│  │ SubscriptionPage│───▶│ PaymentBrick     │───▶│ Confirmación de Pago    │ │
│  │ (Selección Plan)│    │ (SDK React)      │    │ (StatusScreen Brick)    │ │
│  └─────────────────┘    └────────┬─────────┘    └─────────────────────────┘ │
│                                  │                                           │
└──────────────────────────────────┼───────────────────────────────────────────┘
                                   │ cardToken
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (Supabase Edge Functions)                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────┐    ┌────────────────────────┐                   │
│  │ create-subscription    │───▶│ Mercado Pago API       │                   │
│  │ (Edge Function)        │    │ (Preapproval/Orders)   │                   │
│  └────────────────────────┘    └────────────────────────┘                   │
│                                          │                                   │
│  ┌────────────────────────┐              │                                   │
│  │ webhook-mercadopago    │◀─────────────┘                                   │
│  │ (Notificaciones IPN)   │                                                  │
│  └───────────┬────────────┘                                                  │
│              │                                                               │
└──────────────┼───────────────────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE (Supabase)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────┐  │
│  │ companies       │    │ subscriptions   │    │ payment_transactions   │  │
│  │ (actualización) │    │ (nueva tabla)   │    │ (nueva tabla)          │  │
│  └─────────────────┘    └─────────────────┘    └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Componentes a Desarrollar

| Componente | Tipo | Descripción |
|------------|------|-------------|
| `MercadoPagoProvider` | Context | Inicializa SDK y maneja estado global |
| `PaymentBrickWrapper` | Component | Wrapper del CardPayment Brick |
| `SubscriptionCheckout` | Component | Nueva página de checkout |
| `create-subscription` | Edge Function | Crea suscripción en MP |
| `webhook-mercadopago` | Edge Function | Procesa notificaciones IPN |

---

## 5. Plan de Implementación

### Fase 1: Configuración Inicial (1-2 días)

#### 1.1 Instalar Dependencias

```bash
npm install @mercadopago/sdk-react
```

#### 1.2 Crear Configuración de Mercado Pago

```typescript
// src/lib/mercadopago/config.ts
import { initMercadoPago } from '@mercadopago/sdk-react';

export const initializeMercadoPago = () => {
  const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;

  if (!publicKey) {
    console.error('VITE_MERCADOPAGO_PUBLIC_KEY no está configurada');
    return;
  }

  initMercadoPago(publicKey, {
    locale: 'es-AR',
  });
};
```

#### 1.3 Agregar Variables de Entorno

```env
# .env.local
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-xxx

# .env.staging
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-xxx

# .env.production
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxx
```

---

### Fase 2: Nuevas Tablas en Supabase (1 día)

#### 2.1 Migración: subscriptions

```sql
-- supabase/migrations/20250129_create_subscriptions_table.sql

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Mercado Pago IDs
  mp_preapproval_id TEXT UNIQUE,
  mp_payer_id TEXT,

  -- Plan info
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'ARS',

  -- Status
  status TEXT NOT NULL DEFAULT 'pending',
  -- pending, authorized, paused, cancelled, expired

  -- Dates
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  next_payment_date TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT fk_company FOREIGN KEY (company_id)
    REFERENCES companies(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX idx_subscriptions_company ON subscriptions(company_id);
CREATE INDEX idx_subscriptions_mp_preapproval ON subscriptions(mp_preapproval_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company subscriptions"
  ON subscriptions FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );
```

#### 2.2 Migración: payment_transactions

```sql
-- supabase/migrations/20250129_create_payment_transactions_table.sql

CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Mercado Pago IDs
  mp_payment_id TEXT UNIQUE,
  mp_order_id TEXT,

  -- Transaction details
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'ARS',
  status TEXT NOT NULL,
  -- approved, pending, rejected, refunded

  status_detail TEXT,
  payment_method TEXT,
  payment_type TEXT,

  -- Dates
  date_created TIMESTAMPTZ DEFAULT NOW(),
  date_approved TIMESTAMPTZ,

  -- Raw response (for debugging)
  mp_response JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_transactions_company ON payment_transactions(company_id);
CREATE INDEX idx_transactions_subscription ON payment_transactions(subscription_id);
CREATE INDEX idx_transactions_mp_payment ON payment_transactions(mp_payment_id);

-- RLS
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company transactions"
  ON payment_transactions FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );
```

---

### Fase 3: Edge Functions Backend (2-3 días)

#### 3.1 Crear Preferencia de Suscripción

```typescript
// supabase/functions/create-subscription/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const MP_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface CreateSubscriptionRequest {
  planId: string;
  planName: string;
  amount: number;
  payerEmail: string;
  cardToken: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Verificar autenticación
    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    // Obtener company del usuario
    const { data: company } = await supabase
      .from('companies')
      .select('id, name')
      .eq('user_id', user.id)
      .single();

    if (!company) {
      return new Response(JSON.stringify({ error: 'Empresa no encontrada' }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    const body: CreateSubscriptionRequest = await req.json();

    // Crear preapproval (suscripción) en Mercado Pago
    const preapprovalResponse = await fetch(
      'https://api.mercadopago.com/preapproval',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preapproval_plan_id: null, // Suscripción directa sin plan previo
          reason: `SafetyGuard Pro - Plan ${body.planName}`,
          external_reference: company.id,
          payer_email: body.payerEmail,
          card_token_id: body.cardToken,
          auto_recurring: {
            frequency: 1,
            frequency_type: 'months',
            transaction_amount: body.amount,
            currency_id: 'ARS',
          },
          back_url: `${Deno.env.get('APP_URL')}/#/subscription/callback`,
          status: 'authorized',
        }),
      }
    );

    const preapproval = await preapprovalResponse.json();

    if (!preapprovalResponse.ok) {
      console.error('Error MP:', preapproval);
      return new Response(JSON.stringify({ error: 'Error al crear suscripción' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Guardar suscripción en DB
    const { data: subscription, error: dbError } = await supabase
      .from('subscriptions')
      .insert({
        company_id: company.id,
        mp_preapproval_id: preapproval.id,
        mp_payer_id: preapproval.payer_id,
        plan_id: body.planId,
        plan_name: body.planName,
        amount: body.amount,
        status: preapproval.status,
        start_date: preapproval.date_created,
        next_payment_date: preapproval.next_payment_date,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error DB:', dbError);
    }

    // Actualizar company como suscrita
    await supabase
      .from('companies')
      .update({
        is_subscribed: true,
        selected_plan: body.planId,
        subscription_status: 'active',
      })
      .eq('id', company.id);

    return new Response(JSON.stringify({
      success: true,
      subscription,
      mp_status: preapproval.status,
    }), {
      headers: corsHeaders,
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Error interno' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};
```

#### 3.2 Webhook para Notificaciones IPN

```typescript
// supabase/functions/webhook-mercadopago/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const MP_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    const body = await req.json();
    const { type, data } = body;

    console.log('Webhook recibido:', type, data);

    if (type === 'payment') {
      // Obtener detalles del pago
      const paymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${data.id}`,
        {
          headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` },
        }
      );
      const payment = await paymentResponse.json();

      // Buscar suscripción por preapproval_id
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('id, company_id')
        .eq('mp_preapproval_id', payment.preapproval_id)
        .single();

      if (subscription) {
        // Guardar transacción
        await supabase.from('payment_transactions').insert({
          subscription_id: subscription.id,
          company_id: subscription.company_id,
          mp_payment_id: payment.id.toString(),
          amount: payment.transaction_amount,
          status: payment.status,
          status_detail: payment.status_detail,
          payment_method: payment.payment_method_id,
          payment_type: payment.payment_type_id,
          date_approved: payment.date_approved,
          mp_response: payment,
        });

        // Si el pago fue rechazado, actualizar suscripción
        if (payment.status === 'rejected') {
          await supabase
            .from('subscriptions')
            .update({ status: 'paused' })
            .eq('id', subscription.id);
        }
      }
    }

    if (type === 'subscription_preapproval') {
      // Actualizar estado de suscripción
      const preapprovalResponse = await fetch(
        `https://api.mercadopago.com/preapproval/${data.id}`,
        {
          headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` },
        }
      );
      const preapproval = await preapprovalResponse.json();

      await supabase
        .from('subscriptions')
        .update({
          status: preapproval.status,
          next_payment_date: preapproval.next_payment_date,
          updated_at: new Date().toISOString(),
        })
        .eq('mp_preapproval_id', data.id);

      // Actualizar company si se cancela
      if (preapproval.status === 'cancelled') {
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('company_id')
          .eq('mp_preapproval_id', data.id)
          .single();

        if (sub) {
          await supabase
            .from('companies')
            .update({ subscription_status: 'canceled' })
            .eq('id', sub.company_id);
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: 'Error procesando webhook' }), {
      status: 500,
    });
  }
});
```

---

### Fase 4: Componentes Frontend (2-3 días)

#### 4.1 Provider de Mercado Pago

```typescript
// src/lib/mercadopago/MercadoPagoProvider.tsx
import React, { useEffect, useState, createContext, useContext } from 'react';
import { initMercadoPago } from '@mercadopago/sdk-react';

interface MercadoPagoContextType {
  isReady: boolean;
  publicKey: string | null;
}

const MercadoPagoContext = createContext<MercadoPagoContextType>({
  isReady: false,
  publicKey: null,
});

export const MercadoPagoProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [isReady, setIsReady] = useState(false);
  const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;

  useEffect(() => {
    if (publicKey) {
      initMercadoPago(publicKey, { locale: 'es-AR' });
      setIsReady(true);
    }
  }, [publicKey]);

  return (
    <MercadoPagoContext.Provider value={{ isReady, publicKey }}>
      {children}
    </MercadoPagoContext.Provider>
  );
};

export const useMercadoPago = () => useContext(MercadoPagoContext);
```

#### 4.2 Componente de Pago con CardPayment Brick

```typescript
// src/features/auth/components/PaymentForm.tsx
import React, { useState } from 'react';
import { CardPayment } from '@mercadopago/sdk-react';
import { useMercadoPago } from '@/lib/mercadopago/MercadoPagoProvider';
import { Plan } from '@/types';

interface PaymentFormProps {
  plan: Plan;
  onSuccess: (paymentData: PaymentData) => void;
  onError: (error: Error) => void;
}

interface PaymentData {
  cardToken: string;
  paymentMethodId: string;
  issuerId: string;
  installments: number;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  plan,
  onSuccess,
  onError,
}) => {
  const { isReady } = useMercadoPago();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
      </div>
    );
  }

  const initialization = {
    amount: plan.priceNumber || 0,
  };

  const customization = {
    visual: {
      style: {
        theme: 'default' as const,
        customVariables: {
          formBackgroundColor: '#ffffff',
          baseColor: '#0f172a', // slate-900
        },
      },
    },
    paymentMethods: {
      maxInstallments: 1,
      types: {
        excluded: ['debit_card'], // Solo tarjetas de crédito para suscripciones
      },
    },
  };

  const onSubmit = async (formData: any) => {
    setIsProcessing(true);
    try {
      onSuccess({
        cardToken: formData.token,
        paymentMethodId: formData.payment_method_id,
        issuerId: formData.issuer_id,
        installments: formData.installments,
      });
    } catch (error) {
      onError(error as Error);
    } finally {
      setIsProcessing(false);
    }
  };

  const onFormError = (error: any) => {
    console.error('Error en formulario:', error);
    onError(new Error('Error al procesar el formulario de pago'));
  };

  return (
    <div className="w-full">
      <CardPayment
        initialization={initialization}
        customization={customization}
        onSubmit={onSubmit}
        onError={onFormError}
      />
      {isProcessing && (
        <div className="mt-4 text-center text-sm text-slate-500">
          Procesando pago...
        </div>
      )}
    </div>
  );
};
```

#### 4.3 Nueva Página de Checkout

```typescript
// src/features/auth/SubscriptionCheckoutPage.tsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { PaymentForm } from './components/PaymentForm';
import { StatusScreen } from '@mercadopago/sdk-react';
import AuthLayout from '@/components/layout/AuthLayout';
import { Button } from '@/components/common/Button';
import { ROUTE_PATHS } from '@/constants';
import { plansData } from './SubscriptionPage';
import { supabase } from '@/lib/supabase/client';

type CheckoutStep = 'payment' | 'processing' | 'success' | 'error';

const SubscriptionCheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, currentCompany, refreshCompany } = useAuth();

  const planId = new URLSearchParams(location.search).get('plan') || 'standard';
  const plan = plansData.find(p => p.id === planId) || plansData[1];

  const [step, setStep] = useState<CheckoutStep>('payment');
  const [error, setError] = useState<string>('');
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const handlePaymentSuccess = async (paymentData: any) => {
    setStep('processing');
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-subscription`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            planId: plan.id,
            planName: plan.name,
            amount: plan.priceNumber,
            payerEmail: currentUser?.email,
            cardToken: paymentData.cardToken,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al procesar el pago');
      }

      setPaymentId(result.subscription?.mp_preapproval_id);
      await refreshCompany();
      setStep('success');

      // Redirect después de 3 segundos
      setTimeout(() => {
        navigate(ROUTE_PATHS.DASHBOARD);
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setStep('error');
    }
  };

  const handlePaymentError = (err: Error) => {
    setError(err.message);
    setStep('error');
  };

  const wizardSteps = ['Cuenta', 'Empresa', 'Suscripción', 'Pago'];

  return (
    <AuthLayout variant="wizard" wizardSteps={wizardSteps} currentStep={4}>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-slate-900">
            Completar Pago
          </h2>
          <p className="text-slate-500 mt-1 text-sm">
            Plan {plan.name} - {plan.price}{plan.priceSuffix}
          </p>
        </div>

        {/* Contenido según paso */}
        {step === 'payment' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <PaymentForm
              plan={plan}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />

            <button
              onClick={() => navigate(ROUTE_PATHS.SUBSCRIPTION)}
              className="w-full mt-4 text-sm text-slate-500 hover:text-slate-700"
            >
              ← Volver a planes
            </button>
          </div>
        )}

        {step === 'processing' && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4" />
            <p className="text-slate-600">Procesando tu suscripción...</p>
          </div>
        )}

        {step === 'success' && paymentId && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <StatusScreen
              initialization={{ paymentId }}
            />
            <p className="text-center text-sm text-slate-500 mt-4">
              Redirigiendo al dashboard...
            </p>
          </div>
        )}

        {step === 'error' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">!</span>
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">
              Error en el pago
            </h3>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <Button onClick={() => setStep('payment')}>
              Intentar nuevamente
            </Button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default SubscriptionCheckoutPage;
```

---

### Fase 5: Integración y Testing (2 días)

#### 5.1 Actualizar Rutas

```typescript
// src/routes/routes.config.ts (agregar)
{
  path: ROUTE_PATHS.SUBSCRIPTION_CHECKOUT,
  element: <SubscriptionCheckoutPage />,
  protected: true,
}
```

#### 5.2 Actualizar SubscriptionPage

```typescript
// Modificar handleSelectPlan en SubscriptionPage.tsx
const handleSelectPlan = () => {
  navigate(`${ROUTE_PATHS.SUBSCRIPTION_CHECKOUT}?plan=${selectedPlanId}`);
};
```

#### 5.3 Tarjetas de Prueba

| Tarjeta | Número | CVV | Vencimiento | Resultado |
|---------|--------|-----|-------------|-----------|
| Mastercard | 5031 7557 3453 0604 | 123 | 11/25 | Aprobado |
| Visa | 4509 9535 6623 3704 | 123 | 11/25 | Aprobado |
| Amex | 3711 803032 57522 | 1234 | 11/25 | Aprobado |
| Mastercard | 5031 7557 3453 0604 | 123 | 11/25 | Rechazado (usar DNI: 12345678) |

#### 5.4 Usuarios de Prueba

Crear usuarios de prueba desde el panel de desarrolladores:
- Usuario comprador (para testing)
- Usuario vendedor (tu aplicación)

---

## 6. Configuración de Webhooks

### 6.1 URL del Webhook

```
https://<tu-proyecto>.supabase.co/functions/v1/webhook-mercadopago
```

### 6.2 Eventos a Suscribir

- `payment` - Pagos (aprobados, rechazados, reembolsados)
- `subscription_preapproval` - Cambios en suscripciones

### 6.3 Configurar en Panel MP

1. Ir a [Panel de Desarrolladores](https://www.mercadopago.com.ar/developers/panel)
2. Seleccionar tu aplicación
3. Ir a "Notificaciones" → "Webhooks"
4. Agregar URL del webhook
5. Seleccionar eventos

---

## 7. Consideraciones de Seguridad

### 7.1 Manejo de Credenciales

| Credencial | Ubicación | Nunca exponer en |
|------------|-----------|------------------|
| PUBLIC_KEY | Frontend (.env) | - |
| ACCESS_TOKEN | Supabase Secrets | Frontend, Git |

### 7.2 Validaciones

- Verificar firma de webhooks (opcional pero recomendado)
- Validar montos en backend antes de crear suscripción
- Rate limiting en Edge Functions
- Logs de auditoría para transacciones

### 7.3 PCI Compliance

Con Checkout Bricks automáticamente cumples PCI SAQ A:
- Los datos de tarjeta nunca tocan tu servidor
- El token se genera en el iframe de MP
- Solo recibes el token para procesamiento

---

## 8. Cronograma Estimado

| Fase | Tareas | Duración |
|------|--------|----------|
| 1 | Configuración inicial, dependencias, variables | 1-2 días |
| 2 | Migraciones de base de datos | 1 día |
| 3 | Edge Functions (create-subscription, webhook) | 2-3 días |
| 4 | Componentes React (Provider, PaymentForm, Checkout) | 2-3 días |
| 5 | Integración, testing, debugging | 2 días |
| 6 | QA y deploy a producción | 1-2 días |

**Total estimado: 9-13 días**

---

## 9. Checklist de Implementación

### Pre-implementación
- [ ] Crear cuenta de Mercado Pago vendedor
- [ ] Obtener credenciales de prueba (PUBLIC_KEY, ACCESS_TOKEN)
- [ ] Crear usuarios de prueba en panel MP
- [ ] Configurar variables de entorno locales

### Fase 1: Setup
- [ ] Instalar `@mercadopago/sdk-react`
- [ ] Crear `src/lib/mercadopago/config.ts`
- [ ] Agregar variables a `.env.local`, `.env.staging`

### Fase 2: Database
- [ ] Crear migración `subscriptions`
- [ ] Crear migración `payment_transactions`
- [ ] Aplicar migraciones: `supabase db push`
- [ ] Verificar RLS policies

### Fase 3: Backend
- [ ] Crear Edge Function `create-subscription`
- [ ] Crear Edge Function `webhook-mercadopago`
- [ ] Configurar secrets en Supabase Dashboard
- [ ] Deploy functions: `supabase functions deploy`
- [ ] Configurar webhook URL en panel MP

### Fase 4: Frontend
- [ ] Crear `MercadoPagoProvider`
- [ ] Crear `PaymentForm` component
- [ ] Crear `SubscriptionCheckoutPage`
- [ ] Actualizar `SubscriptionPage` para redirigir
- [ ] Agregar ruta en `routes.config.ts`
- [ ] Envolver App con `MercadoPagoProvider`

### Fase 5: Testing
- [ ] Probar flujo completo con tarjetas de prueba
- [ ] Verificar webhooks recibidos
- [ ] Probar casos de error (tarjeta rechazada)
- [ ] Verificar datos en DB

### Pre-producción
- [ ] Obtener credenciales de producción
- [ ] Actualizar variables de entorno producción
- [ ] Configurar webhook producción
- [ ] Testing en staging

---

## 10. Referencias y Recursos

### Documentación Oficial
- [Mercado Pago Developers](https://www.mercadopago.com.ar/developers/en/docs)
- [Checkout Bricks](https://www.mercadopago.com.ar/developers/en/docs/checkout-bricks/landing)
- [SDK React](https://github.com/mercadopago/sdk-react)
- [SDK Node.js](https://github.com/mercadopago/sdk-nodejs)
- [API Reference](https://www.mercadopago.com.ar/developers/es/reference)

### Supabase
- [Edge Functions](https://supabase.com/docs/guides/functions)
- [Secrets Management](https://supabase.com/docs/guides/functions/secrets)

---

*Documento generado el 29/01/2026 para SafetyGuard Pro*

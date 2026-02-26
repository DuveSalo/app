# PRD — Escuela Segura

> **Versión:** 1.1
> **Fecha:** 2026-02-24
> **Estado:** En producción

---

## 1. Resumen Ejecutivo

**Escuela Segura** es una plataforma SaaS de gestión de cumplimiento de seguridad para establecimientos educativos. Permite a las escuelas centralizar, rastrear y gestionar toda la documentación de seguridad obligatoria — certificados de conservación, sistemas de autoprotección, matafuegos, documentos QR, y registros de eventos — con alertas automáticas de vencimiento y un panel unificado.

**Propuesta de valor:** Reemplazar planillas y archivos físicos por un sistema digital que previene multas por documentación vencida y simplifica las inspecciones de seguridad.

---

## 2. Problema

Las instituciones educativas en Argentina deben cumplir con múltiples normativas de seguridad que requieren:

- Mantener decenas de certificados y habilitaciones actualizados
- Realizar inspecciones periódicas de matafuegos (con 40+ campos por inspección)
- Gestionar documentos QR de ascensores, termotanques, instalaciones eléctricas, etc.
- Registrar simulacros de evacuación y eventos de seguridad
- Renovar documentación antes de su vencimiento

**Puntos de dolor actuales:**
1. Documentación fragmentada en papel, PDFs sueltos y planillas Excel
2. Vencimientos olvidados que generan multas y riesgos legales
3. Falta de visibilidad centralizada del estado de cumplimiento
4. Dificultad para preparar auditorías e inspecciones

---

## 3. Usuarios Objetivo

| Rol | Descripción | Necesidad principal |
|-----|-------------|---------------------|
| **Administrador de escuela** | Responsable de seguridad del establecimiento | Panel centralizado de vencimientos |
| **Personal de mantenimiento** | Ejecuta inspecciones y registra controles | Formularios digitales para inspecciones |
| **Director/a** | Toma decisiones y firma documentación | Visibilidad del estado de cumplimiento |
| **Empleados adicionales** | Personal con acceso limitado al sistema | Consulta de documentación |

---

## 4. Objetivos del Producto

### 4.1 Objetivos de Negocio
- Adquirir instituciones educativas como clientes recurrentes (modelo SaaS mensual)
- Ofrecer 3 planes escalables según la cantidad de módulos gestionados
- Pagos recurrentes con MercadoPago para el mercado argentino y LATAM

### 4.2 Objetivos de Usuario
- Reducir a cero los vencimientos olvidados mediante alertas proactivas
- Digitalizar el 100% de la documentación de seguridad
- Preparar auditorías en minutos en vez de horas

### 4.3 Métricas Clave
| Métrica | Descripción |
|---------|-------------|
| Tasa de retención mensual | % de suscriptores activos mes a mes |
| Documentos gestionados/empresa | Adopción funcional del sistema |
| Vencimientos resueltos a tiempo | Efectividad de las alertas |
| Tiempo promedio en onboarding | De registro a primer documento cargado |

---

## 5. Arquitectura Funcional

### 5.1 Flujo de Onboarding

```
Login/Registro → Crear Empresa → Elegir Plan/Trial → Dashboard
     │                │                  │
     ▼                ▼                  ▼
  Google OAuth    Datos empresa      MercadoPago
  Email + Pass    CUIT, dirección    Trial 14 días
                  1er empleado
```

**Detalle:**
1. **Registro:** Email + contraseña (con validación: ≥8 chars, mayúscula, minúscula, número) o Google OAuth
2. **Crear empresa:** Nombre, CUIT, dirección, localidad, código postal, ciudad, provincia, país, teléfono
3. **Suscripción:** Elegir plan (pago con tarjeta vía MercadoPago) o activar prueba gratuita de 14 días
4. **Acceso:** Dashboard completo con todas las funcionalidades

### 5.2 Sistema de Autenticación

- **Proveedor:** Supabase Auth
- **Métodos:** Email/contraseña + Google OAuth
- **Protección de rutas:** 3 niveles de guardia
  1. ¿Usuario autenticado? → Si no, redirige a login
  2. ¿Tiene empresa creada? → Si no, redirige a crear empresa
  3. ¿Tiene suscripción activa o trial vigente? → Si no, redirige a suscripción o página de trial expirado

---

## 6. Módulos Funcionales

### 6.1 Dashboard

**Propósito:** Vista centralizada del estado de cumplimiento.

**Funcionalidades:**
- Tarjetas de resumen con conteo de items por estado (vigente, por vencer, vencido)
- Tabla unificada con todos los documentos y sus fechas de vencimiento
- Filtros por estado y tipo de documento
- Ordenamiento por fecha de vencimiento

**Lógica de estados:**
| Estado | Color | Condición |
|--------|-------|-----------|
| Vigente | Verde (emerald) | ≥ 90 días para vencer |
| Por vencer | Amarillo (amber) | 30–90 días |
| Vencido | Rojo (red) | < 30 días o ya vencido |

**Fuentes de datos agregados:**
- Certificados de conservación
- Sistemas de autoprotección
- Matafuegos
- Documentos QR (todos los tipos)

---

### 6.2 Certificados de Conservación

**Propósito:** Gestionar certificados de conservación y mantenimiento del edificio.

**Modelo de datos:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `presentationDate` | Fecha | Fecha de presentación |
| `expirationDate` | Fecha | Fecha de vencimiento |
| `intervener` | Texto | Profesional interviniente |
| `registrationNumber` | Texto | Número de matrícula |
| `pdfUrl` | Archivo | Certificado escaneado |

**Operaciones:** CRUD completo + carga de PDF + paginación por cursor + búsqueda + filtro por estado.

---

### 6.3 Sistemas de Autoprotección

**Propósito:** Rastrear certificados de sistemas contra incendio y evacuación.

**Modelo de datos:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `probatoryDispositionDate` | Fecha | Fecha de disposición probatoria |
| `probatoryDispositionPdf` | Archivo | PDF de disposición |
| `extensionDate` | Fecha | Fecha de prórroga |
| `extensionPdf` | Archivo | PDF de prórroga |
| `expirationDate` | Fecha | Fecha de vencimiento |
| `drills[]` | Array | Simulacros realizados |
| `intervener` | Texto | Profesional interviniente |
| `registrationNumber` | Texto | Número de matrícula |

**Simulacros (drills):**
- Cada simulacro tiene fecha + PDF adjunto
- Se pueden agregar/eliminar dinámicamente
- Carga paralela de múltiples PDFs

---

### 6.4 Control de Matafuegos

**Propósito:** Registro detallado de inspecciones de extintores.

**Modelo de datos (40+ campos):**

*Datos generales:*
| Campo | Tipo | Opciones |
|-------|------|----------|
| `controlDate` | Fecha | — |
| `extinguisherNumber` | Texto | Identificador |
| `type` | Enum | Polvo Químico, CO₂, Halón, Acetato de Potasio, Agua, Espuma |
| `capacity` | Enum | 3.5 kg, 5 kg, 10 kg |
| `class` | Texto | Clase de fuego |
| `positionNumber` | Texto | Ubicación |
| `chargeExpirationDate` | Fecha | Vencimiento de carga |
| `hydraulicPressureExpirationDate` | Fecha | Vencimiento presión hidráulica |
| `manufacturingYear` | Número | Año de fabricación |
| `tagColor` | Texto | Color de etiqueta |

*Checklist de inspección (Sí/No/N.A.):*
- Etiquetas legibles
- Presión en rango
- Precinto y seguro
- Instrucciones legibles
- Condición del contenedor
- Condición de la boquilla
- Visibilidad obstruida
- Acceso obstruido
- Señalización (piso, pared, altura)
- Condición del vidrio
- Puerta abre fácilmente
- Gabinete limpio
- Observaciones (texto libre)

---

### 6.5 Documentos QR

**Propósito:** Gestionar documentación vinculada a QR para equipamiento especializado.

**Tipos de documentos:**
| Tipo | Ruta |
|------|------|
| Ascensores | `/qr-elevators` |
| Termotanques y Calderas | `/qr-water-heaters` |
| Instalación Fija Contra Incendios | `/qr-fire-safety` |
| Detección | `/qr-detection` |
| Medición de Puesta a Tierra | `/electrical-installations` |

**Modelo por documento:**
| Campo | Tipo |
|-------|------|
| `type` | Enum (tipo QR) |
| `documentName` | Texto |
| `floor` | Texto |
| `unit` | Texto |
| `pdfUrl` | Archivo |
| `uploadDate` | Fecha |
| `qrCodeData` | Texto |
| `extractedDate` | Fecha (auto: +1 año) |

**Funcionalidad:** Cada tipo QR tiene su propia sección de navegación con rutas dinámicas generadas automáticamente.

---

### 6.6 Información de Eventos

**Propósito:** Registrar eventos de seguridad, incidentes y acciones correctivas.

**Modelo de datos:**
| Campo | Tipo |
|-------|------|
| `date` | Fecha |
| `time` | Hora |
| `description` | Texto largo |
| `correctiveActions` | Texto largo |
| `testimonials[]` | Array de textos |
| `observations[]` | Array de textos |
| `finalChecks[]` | Array de textos |

**UX:** Listas dinámicas con botones agregar/eliminar para testimonios, observaciones y verificaciones finales.

---

### 6.7 Notificaciones

**Propósito:** Centro de notificaciones in-app.

**Funcionalidades:**
- Listado paginado con filtro leído/no leído
- Filtro por tipo (sistema, advertencia, etc.) y categoría
- Marcar como leído
- Navegación al recurso relacionado
- Badge con conteo de no leídas en la campana del header

---

### 6.8 Configuración

**Pestañas:**

| Pestaña | Funcionalidad |
|---------|---------------|
| **Empresa** | Editar nombre, CUIT, dirección, teléfono |
| **Empleados** | Ver, agregar, eliminar empleados con roles |
| **Facturación** | Estado de suscripción, historial de pagos, cancelar/reactivar/cambiar plan |
| **Perfil** | Editar datos de usuario, resetear contraseña, cerrar sesión |

---

### 6.9 Auditoría

**Propósito:** Registro inmutable de todas las acciones en el sistema.

**Campos registrados:**
- Acción (crear, actualizar, eliminar)
- Tabla y registro afectado
- Datos anteriores y nuevos (JSON)
- Usuario, empresa, IP, user agent, timestamp

---

## 7. Sistema de Suscripciones

### 7.1 Planes

| Plan | Precio ARS | Posicionamiento |
|------|-----------|-----------------|
| **Basic** | ARS 25.000/mes | Escuelas pequeñas |
| **Standard** | ARS 49.000/mes | Más popular |
| **Premium** | ARS 89.000/mes | Acceso completo |

### 7.2 Trial Gratuito

- **Duración:** 14 días
- **Activación:** Sin tarjeta, un clic
- **Acceso:** Funcionalidad completa
- **Expiración:** Redirige a página de trial expirado con opción de suscribirse

### 7.3 Proveedor de Pago — MercadoPago

**Único proveedor de pago.** Integración completa con la API de suscripciones (preapproval) de MercadoPago.

**Funcionalidades:**
- Secure Fields API para tokenización de tarjeta en el frontend
- Preapproval (suscripción recurrente) con cobro automático del primer pago
- Gestión completa del ciclo de vida: upgrade, downgrade, pausa, reactivación, cambio de tarjeta, cancelación
- Verificación de firma HMAC-SHA256 en cada webhook
- Registro idempotente de eventos webhook
- Notificaciones por email (vía Resend) para cada acción de suscripción
- Consulta de estado de suscripción en tiempo real desde la API de MercadoPago

### 7.4 Estados de Suscripción

```
pending → approval_pending → active ⇄ suspended
                                 ↓
                            cancelled → expired
```

### 7.5 Cron de Verificación

Edge Function programada que:
- Sincroniza suscripciones activas con la API de MercadoPago
- Actualiza `next_billing_time` desde el estado del preapproval
- Revoca acceso para suscripciones canceladas pasado el período de gracia
- Notifica a las empresas afectadas

---

## 8. Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 19, TypeScript, Vite |
| **Estilos** | Tailwind CSS + shadcn/ui |
| **Backend** | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| **Edge Functions** | Deno (TypeScript) |
| **Pagos** | MercadoPago SDK (Secure Fields + Preapproval API) |
| **Emails** | Resend API |
| **Hosting** | Vite build estático + Supabase hosted |

### 8.1 Decisiones Arquitectónicas Clave

1. **Lazy loading:** Todas las páginas usan `React.lazy()` + Suspense para code splitting
2. **Paginación por cursor:** Evita ineficiencia de OFFSET en tablas grandes
3. **Selección explícita de columnas:** Nunca `SELECT *`, siempre `.select()` con campos específicos
4. **Capa de servicios centralizada:** Un archivo por entidad en `src/lib/api/services/`
5. **Mappers de tipos:** Conversión DB → dominio en un solo lugar (`mapXFromDb`)
6. **Validación de webhooks:** Verificación de firma HMAC-SHA256 antes de procesar pagos
7. **Error boundaries:** UI de fallback para prevenir crashes completos
8. **Idempotencia en webhooks:** Registro de eventos procesados para evitar duplicados

---

## 9. Estructura del Proyecto

```
src/
├── App.tsx                          # Router principal (HashRouter + lazy routes)
├── components/
│   ├── common/                      # Componentes reutilizables (Button, Input, Table, etc.)
│   ├── layout/                      # PageLayout, AuthLayout, MainLayout, Sidebar, MobileNav
│   └── ui/                          # shadcn/ui base (NO modificar)
├── features/
│   ├── dashboard/                   # Panel de vencimientos
│   ├── conservation-certificates/   # Certificados de conservación
│   ├── self-protection-systems/     # Sistemas de autoprotección
│   ├── fire-extinguishers/          # Control de matafuegos
│   ├── qr/                          # Documentos QR (5 tipos)
│   ├── event-information/           # Registro de eventos
│   ├── notifications/               # Centro de notificaciones
│   ├── settings/                    # Configuración (empresa, empleados, billing, perfil)
│   ├── auth/                        # Login, registro, onboarding, suscripción
│   └── audit/                       # Registro de auditoría
├── lib/
│   ├── api/services/                # Capa de servicios (1 por entidad)
│   ├── api/mappers.ts               # Mappers DB → tipos de dominio
│   ├── mercadopago/                 # Configuración MercadoPago (public key, SDK)
│   ├── utils/                       # Utilidades (fechas, validación, trial, logger)
│   └── env.ts                       # Variables de entorno (Zod-validated)
├── routes/
│   ├── routes.config.ts             # Lazy imports centralizados
│   └── ProtectedRoute.tsx           # Guardia de 3 niveles
├── types/                           # Tipos TypeScript + database.types.ts (auto-generado)
├── constants/                       # Rutas y constantes
└── styles/                          # CSS global

supabase/
├── functions/
│   ├── _shared/                     # Utilidades compartidas (CORS, auth, plans, email)
│   ├── mp-create-subscription/      # Crear suscripción MercadoPago
│   ├── mp-manage-subscription/      # Gestionar ciclo de vida (cancel, pause, change plan/card)
│   ├── mp-get-subscription-status/  # Consultar estado de suscripción en MP API
│   ├── webhook-mercadopago/         # Webhook MercadoPago (firma HMAC-SHA256)
│   ├── cron-check-subscriptions/    # Cron de sincronización y verificación
│   └── send-expiration-emails/      # Emails de vencimiento de documentos
└── migrations/                      # Migraciones SQL
```

---

## 10. Seguridad

- **RLS (Row Level Security):** Políticas a nivel de fila en todas las tablas — cada empresa solo ve sus propios datos
- **JWT Validation:** Todas las Edge Functions verifican el token JWT antes de procesar
- **Webhook Signatures:** Verificación HMAC-SHA256 de MercadoPago + registro idempotente de eventos
- **Input Sanitization:** Sanitización de entradas en formularios
- **CUIT Validation:** Validación de formato de identificación fiscal argentina
- **Error Boundaries:** Contención de errores para prevenir exposición de datos internos
- **Audit Logging:** Registro completo de todas las operaciones con IP y user agent

---

## 11. Roadmap — Módulos Pendientes

| Módulo | Estado | Descripción |
|--------|--------|-------------|
| Tanques de agua | Placeholder | Gestión de certificados de limpieza y análisis de tanques |
| Especies vegetales | Placeholder | Registro de especies en el predio y mantenimiento |
| Sanitización | Placeholder | Certificados de desinfección y fumigación |

---

## 12. Variables de Entorno

### Frontend (Vite)

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `VITE_SUPABASE_URL` | Sí | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Sí | Clave anónima de Supabase |
| `VITE_MP_PUBLIC_KEY` | Sí | Clave pública de MercadoPago |
| `VITE_GEMINI_API_KEY` | No | API key de Gemini (funcionalidad opcional) |
| `VITE_LOG_LEVEL` | No | Nivel de logging (debug, info, warn, error) |

### Edge Functions (Supabase Secrets)

| Variable | Descripción |
|----------|-------------|
| `MP_MODE` | Modo de MercadoPago: `sandbox` o `production` |
| `MP_ACCESS_TOKEN` | Access token de MercadoPago |
| `MP_WEBHOOK_SECRET` | Secreto para verificación de firma webhook |
| `MP_PLAN_ID_BASIC` | ID del plan Basic en MercadoPago |
| `MP_PLAN_ID_STANDARD` | ID del plan Standard en MercadoPago |
| `MP_PLAN_ID_PREMIUM` | ID del plan Premium en MercadoPago |
| `RESEND_API_KEY` | API key de Resend para envío de emails |

---

## 13. Esquema de Base de Datos

### Tablas Principales

| Tabla | FK | Descripción |
|-------|-----|-------------|
| `companies` | `user_id` | Empresas/escuelas registradas |
| `employees` | `company_id` | Empleados de cada empresa |
| `conservation_certificates` | `company_id` | Certificados de conservación |
| `self_protection_systems` | `company_id` | Sistemas de autoprotección |
| `fire_extinguishers` | `company_id` | Inspecciones de matafuegos |
| `qr_documents` | `company_id` | Documentos QR (5 tipos) |
| `events` | `company_id` | Eventos de seguridad |
| `notifications` | `company_id`, `user_id` | Notificaciones in-app |
| `subscriptions` | `company_id` | Suscripciones activas |
| `payment_transactions` | `subscription_id`, `company_id` | Historial de pagos |
| `audit_logs` | `company_id`, `user_id` | Registro de auditoría |
| `mp_webhook_log` | — | Registro idempotente de eventos webhook |

### Campos de Suscripción en `companies`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `is_subscribed` | Boolean | ¿Tiene suscripción activa? |
| `selected_plan` | Text | Plan seleccionado |
| `subscription_status` | Text | Estado actual |
| `subscription_renewal_date` | Timestamp | Próxima renovación |
| `trial_ends_at` | Timestamp | Fin del período de prueba |

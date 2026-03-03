# Auditoría del Sistema de Diseño — Escuela Segura

> Generada: 2026-03-03
> Alcance: `apps/web/src/` — componentes, estilos, tokens, features

---

## 1. Inventario de Tokens de Diseño

No existe `tailwind.config.ts` — el proyecto usa **Tailwind CSS v4** con configuración CSS-first. Todo se define en `apps/web/src/app/globals.css`.

### 1.1 Fuentes

| Variable | Valor | Origen |
|---|---|---|
| `--font-sans` | `'Inter', system-ui, -apple-system, sans-serif` | Custom (override del default de Tailwind) |
| `--font-heading` | `'Inter', system-ui, -apple-system, sans-serif` | **Custom** — token no estándar |
| `--font-mono` | `'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace` | Custom (override del default) |
| `--font-display` | `'Inter', system-ui, sans-serif` | **Custom** — token no estándar, **nunca referenciado** en ningún componente |

`lib/fonts.ts` exporta `heading` (--font-heading), `body` (--font-body), `mono` (--font-mono). **`--font-body` se inyecta en `<html>` pero nunca se consume en CSS** — `globals.css` define `--font-sans` como la fuente del body.

### 1.2 Colores — Paleta Neutral (estándar)

Las 11 paradas de `neutral-50` a `neutral-950` están re-declaradas en `@theme inline {}`. **Son idénticas a los defaults de Tailwind** — redundantes pero inofensivas.

### 1.3 Colores — Paleta Brand (custom)

| Variable | Valor | Nota |
|---|---|---|
| `--color-brand-50` a `brand-600` | Idénticos a `neutral-*` | Redundantes |
| `--color-brand-700` | `#171717` | **Diverge** — salta a neutral-900 |
| `--color-brand-800` | `#0a0a0a` | **Diverge** — salta a neutral-950 |
| `--color-brand-900` | `#000000` | **Diverge** — negro puro |
| `--color-brand-950` | `#000000` | **Diverge** — idéntico a brand-900 |

**Uso real**: No se encontró `brand-*` utilizado en ningún componente. Paleta completa sin uso.

### 1.4 Colores — Paleta Warm (custom)

11 paradas (`warm-50` a `warm-950`) — **100% duplicado exacto de `neutral-*`**.

**Uso real**: Solo se usa en 3 archivos SSR: `not-found.tsx`, `privacidad/page.tsx`, `terminos/page.tsx`. Usan `text-warm-900`, `text-warm-500`, `text-warm-600`.

### 1.5 Colores Semánticos Custom

| Variable | Valor | Nota |
|---|---|---|
| `--color-success` | `#22C55E` (green-500) | **Custom** — no referenciado en componentes |
| `--color-warning` | `#f59e0b` (amber-500) | **Custom** — no referenciado en componentes |
| `--color-danger` | `#e7000b` | **Custom** — rojo no estándar (no es de la escala de Tailwind) |

### 1.6 Variables CSS de shadcn/ui (`:root`)

29 variables definidas. La mayoría son defaults correctos del theme `neutral` de shadcn. **Excepciones**:

| Variable | Valor | Problema |
|---|---|---|
| `--destructive` | `#e7000b` | Rojo custom (mismo que `--color-danger`) en vez del default shadcn |
| `--sidebar-foreground` | `#09090b` | **zinc-950** — mezcla con paleta neutral |
| `--sidebar-primary` | `#18181b` | **zinc-900** — mezcla con paleta neutral |
| `--sidebar-accent` | `#f4f4f4` | Valor no estándar (entre neutral-50 y 100) |
| `--sidebar-accent-foreground` | `#18181b` | **zinc-900** — mezcla |
| `--sidebar-border` | `#e4e4e7` | **zinc-200** — mezcla |
| `--sidebar-ring` | `#71717a` | **zinc-500** — mezcla |

**Problema principal**: Las variables de sidebar usan la paleta **zinc** mientras que todo el resto del sistema usa **neutral**. Las diferencias son sutiles (#09090b vs #0a0a0a) pero rompen la consistencia del theme.

### 1.7 Sombras

| Variable | Tipo |
|---|---|
| `--shadow-xs` | **Custom** |
| `--shadow-sm` | Estándar Tailwind |
| `--shadow`, `--shadow-md`, `--shadow-lg`, `--shadow-xl` | Opacidades ligeramente customizadas |
| `--shadow-card`, `--shadow-card-hover` | **Custom** |
| `--shadow-dropdown` | **Custom** |
| `--shadow-inner` | **Custom** (más suave que default) |
| `--shadow-ring` | **Custom** |
| `--shadow-ring-accent` | **Custom** — idéntico a `--shadow-ring` (duplicado) |

### 1.8 Radios

| Variable | Valor | Nota |
|---|---|---|
| `--radius-sm` a `--radius-xl`, `--radius` | Estándar shadcn | OK |
| `--radius-2xl` (`1rem`) | **Custom** | Extensión |
| `--radius-3xl` (`1.5rem`) | **Custom** | Extensión |
| `--radius-4xl` (`2rem`) | **Custom** | Extensión |

### 1.9 Animaciones

| Variable | Nota |
|---|---|
| `--animate-fade-in`, `fade-in-up`, `scale-in`, `slide-in-right`, `slide-up`, `pulse-soft`, `dropdown-in` | **Custom** con keyframes definidos |
| `--animate-shimmer` | **Custom — KEYFRAME NO DEFINIDO** (broken) |
| `--animate-spin` | Estándar Tailwind |

---

## 2. Inventario de Componentes UI

### 2.1 Componentes shadcn/ui (`components/ui/`) — TODOS MODIFICADOS

| Componente | Estado | Cambios |
|---|---|---|
| `accordion.tsx` | **Modificado (alto)** | `text-black` y `font-bold` en trigger, `hover:bg-neutral-50` en vez de `hover:underline`, `border-neutral-200` hardcodeado, patrón `forwardRef` antiguo |
| `alert-dialog.tsx` | **Modificado (alto)** | `border-2 border-neutral-900` (borde grueso), `font-bold text-black` en título, `font-[family-name:var(--font-heading)]`, importa `buttonVariants` de `components/common/Button` (no del shadcn button) |
| `calendar.tsx` | **Reescrito completamente** | 12+ colores hardcodeados (`text-black`, `bg-black`, `border-black`, `bg-neutral-*`), `rounded-none` en todo, `font-bold` en vez de `font-medium`, cero uso de CSS variables semánticas |
| `dialog.tsx` | **Modificado (alto)** | `border-2 border-neutral-900`, `font-[family-name:var(--font-heading)]`, `focus:ring-black` hardcodeado, `rounded-none` en close button |
| `popover.tsx` | **Modificado (alto)** | `border-2 border-neutral-900`, `bg-white` hardcodeado en vez de `bg-popover`, `font-[family-name:var(--font-heading)]`, animaciones custom |

**Patrón de modificación consistente en `ui/`**: Todos los overlays tienen border grueso (`border-2 border-neutral-900`), font heading forzado, y `text-black`/`font-bold` en vez de tokens semánticos.

### 2.2 Componentes Landing (`components/landing/ui/`)

| Componente | Estado |
|---|---|
| `accordion.tsx` | Modificado (menor) — `rounded-lg` añadido, `items-start` en vez de `items-center`. Usa tokens correctamente. |
| `badge.tsx` | Modificado (menor) — Variantes `ghost` y `link` custom añadidas. `border-neutral-200` hardcodeado en outline. |
| `button.tsx` | Extendido — Sizes custom (`xs`, `icon-xs`, `icon-sm`, `icon-lg`). Colores correctos con CSS vars. |
| `card.tsx` | **Sin modificar** — Default shadcn exacto. |
| `separator.tsx` | **Sin modificar** — Default shadcn exacto. |

### 2.3 Componentes Custom (`components/common/`)

Todos son componentes propios con estilos hardcodeados usando la escala `neutral-*` directamente en vez de tokens semánticos.

| Componente | Colores hardcodeados principales | Debería usar |
|---|---|---|
| `Button.tsx` | `bg-neutral-900`, `bg-[#e7000b]`, `hover:bg-red-700` | `bg-primary`, `bg-destructive` |
| `Card.tsx` | `bg-neutral-50`, `border-neutral-200`, `text-neutral-900/500` | `bg-muted`, `border-border`, `text-foreground/muted-foreground` |
| `Input.tsx` | `border-neutral-200`, `text-neutral-900`, `border-red-500` | `border-input`, `text-foreground`, `border-destructive` |
| `Select.tsx` | `border-neutral-200`, `text-neutral-900`, `border-red-500` | `border-input`, `text-foreground`, `border-destructive` |
| `Textarea.tsx` | `border-neutral-200`, `text-neutral-900`, `border-red-600` | `border-input`, `text-foreground`, `border-destructive` |
| `Checkbox.tsx` | `bg-neutral-900`, `border-neutral-300` | `bg-primary`, `border-input` |
| `ChipGroup.tsx` | `bg-neutral-900`, `border-neutral-200` | `bg-primary`, `border-border` |
| `StatusBadge.tsx` | `bg-[#ecfdf5]`, `border-[#a7f3d0]`, `text-green-700` | Hex deberían ser `bg-emerald-50`, `border-emerald-200` |
| `Table.tsx` | `bg-neutral-50`, `text-neutral-500`, `border-neutral-200` | `bg-muted`, `text-muted-foreground`, `border-border` |
| `Tabs.tsx` | `bg-neutral-100`, `text-neutral-500/900` | `bg-muted`, `text-muted-foreground/foreground` |
| `Modal.tsx` | `bg-neutral-900/20`, `bg-white`, `border-neutral-200` | `bg-background`, `border-border` |
| `ConfirmDialog.tsx` | `bg-red-50`, `text-red-600`, `bg-amber-50`, `bg-blue-50` | Semantic variants |
| `Toast.tsx` | Inline style `color: '#171717'`, `text-green-600/red-600/amber-500/blue-600` | `text-foreground`, tokens semánticos |
| `FilterSort.tsx` | `bg-white`, `border-neutral-200/900`, `text-neutral-*` | Tokens semánticos |
| `FileUpload.tsx` | `bg-neutral-100`, `border-neutral-200/300/400` | Tokens semánticos |
| `DatePicker.tsx` | `border-red-600`, `text-neutral-*`, `bg-white` | `border-destructive`, tokens |
| `Empty.tsx` | `bg-neutral-100`, `text-neutral-400/500/900` | `bg-muted`, tokens |
| `LoadingSpinner.tsx` | `text-neutral-500` | `text-muted-foreground` |
| `SkeletonLoader.tsx` | `bg-neutral-100`, `border-neutral-200` | `bg-muted`, `border-border` |
| `ErrorBoundary.tsx` | `bg-red-50`, `text-red-600`, `bg-neutral-50` | Tokens |
| `PdfPreview.tsx` | `bg-neutral-50`, spinner con `border-neutral-900` | Tokens |
| `TrialBanner.tsx` | `bg-amber-50/600/700`, `bg-neutral-900` | Tokens |

### 2.4 Componentes Layout (`components/layout/`)

| Componente | Principales estilos hardcodeados |
|---|---|
| `Sidebar.tsx` | Mezcla CSS vars (`--sidebar-*`) con `bg-neutral-900`, `text-white`, `border-neutral-200`. Active state usa `bg-neutral-900` en vez de `bg-[var(--sidebar-primary)]`. |
| `MainLayout.tsx` | `bg-neutral-50`, `text-neutral-900`, `selection:bg-neutral-200/60` |
| `PageLayout.tsx` | `bg-neutral-50`, `bg-white`, `border-neutral-200`, `text-neutral-900/500` |
| `MobileNav.tsx` | `bg-neutral-900` (logo/avatar/active), `text-red-600` (logout), 8+ shades de neutral |
| `AuthLayout.tsx` | `bg-neutral-900` (stepper), `bg-white`, `bg-neutral-50`, `border-neutral-200` |
| `NotificationBell.tsx` | `bg-red-600` (badge), `border-l-red-500/amber-400/neutral-200` (notification types), `shadow-lg` |
| `SplitPaneLayout.tsx` | `bg-neutral-50/50`, `border-neutral-100/200`, `border-l-neutral-900` (selected) |

---

## 3. Mapa de Inconsistencias

### 3.1 Colores de error inconsistentes entre form components

| Componente | Border error | Texto error | Ring error |
|---|---|---|---|
| `Input.tsx` | `border-red-500` | `text-red-600` | `ring-red-500/10` |
| `Select.tsx` | `border-red-500` | `text-red-500` | `ring-red-500/10` |
| `Textarea.tsx` | `border-red-600` | `text-red-600` | `ring-red-600/10` |
| `DatePicker.tsx` | `border-red-600` | `text-red-600` | `ring-red-600/10` |
| `Button.tsx` (danger) | — | — | — bg: `#e7000b`, hover: `red-700` |

Tres valores distintos de rojo para la misma semántica "error/destructive".

### 3.2 Status dots triplicados

El mismo mapa `{ valid: 'bg-emerald-600', expiring: 'bg-amber-600', expired: 'bg-red-600' }` está definido por separado en:
- `ConservationCertificateListPage.tsx`
- `SelfProtectionSystemListPage.tsx`
- `QRModuleListPage.tsx`

Y `DashboardCards.tsx` tiene su **propio `StatusBadge` inline** que duplica el componente compartido `components/common/StatusBadge` con markup diferente.

### 3.3 Módulo Audit sin border-radius

**Todo el feature `audit/`** carece de `rounded-*` en cualquier elemento:
- `AuditFilters`: `bg-white border border-neutral-200 p-4` — sin rounded
- `AuditLogItem`: `bg-white border border-neutral-200 p-4` — sin rounded
- `AuditPage` paginación: `bg-white border border-neutral-200 p-4` — sin rounded

**Todo el resto de la app usa `rounded-lg` en cards y `rounded-md` en buttons/inputs.**

### 3.4 Paginación inconsistente

| Feature | Estilo |
|---|---|
| `Dashboard` | Botones con números de página, `bg-neutral-900 text-white` para activo, `rounded-md` |
| `Audit` | Botones prev/next simples, `bg-white border-neutral-200`, sin `rounded-*`, sin números |

### 3.5 Empty states inconsistentes

| Page | Implementación |
|---|---|
| DashboardPage | Usa `<Empty>` compartido (con icon, título, descripción, acción) |
| FireExtinguisherListPage | `<div>` inline ad-hoc |
| ConservationCertificateListPage | `<div>` inline ad-hoc |
| SelfProtectionSystemListPage | `<div>` inline ad-hoc |
| EventInformationListPage | `<div>` inline ad-hoc |
| QRModuleListPage | `<div>` inline ad-hoc |
| NotificationsPage | `<p>` centrado simple |
| AuditLogList | `<p>` en white box |

### 3.6 Auth pages bypasean el design system

`AuthPage.tsx` y `CreateCompanyPage.tsx` usan `<input>` HTML nativo con clases manuales en vez del componente `<Input>`. `CardForm.tsx` tiene su propio `inputClass` al que **le falta `rounded-md`**.

Inconsistencias de padding en inputs del auth flow:
- Login: `px-4`
- Register: `px-3.5`
- CreateCompany: `px-3.5`

### 3.7 Hover invisible en botones primarios

Múltiples botones tienen `bg-neutral-900 hover:bg-neutral-900` — **sin cambio visual al hacer hover**:
- `AuthPage.tsx` (login/register)
- `CreateCompanyPage.tsx`
- `SubscriptionPage.tsx`
- `SettingsPage.tsx`
- `FireExtinguisherListPage.tsx`
- `SelfProtectionSystemListPage.tsx`
- `EventInformationListPage.tsx`
- `QRModuleListPage.tsx`

Solo `ConservationCertificateListPage` tiene `hover:bg-neutral-800` (correcto).

### 3.8 Color azul no formalizado

`blue-50/200/500/600/700` se usa en 6+ features pero **no es parte del design system**:
- Audit (badges de acción, stats, links)
- Fire Extinguishers (checklist box)
- Event Information (alert, badges, add button)
- Notifications (info badge)
- Settings/Billing (trial card, refund status)
- DynamicListInput (item numbers)

`indigo-500/600` aparece **una sola vez** en `AuditPage.tsx`.

### 3.9 Sidebar mezcla zinc y neutral

Las CSS variables de sidebar (`--sidebar-foreground: #09090b`, `--sidebar-primary: #18181b`, etc.) usan la paleta **zinc**, mientras que todo el resto del sistema usa **neutral**. Diferencias sutiles pero rompen la coherencia.

### 3.10 Dos sistemas de componentes duplicados

`components/ui/` (shadcn) y `components/common/` (custom) ambos tienen:
- Button (con variantes diferentes: shadcn usa `default`/`destructive`, custom usa `primary`/`danger`)
- Card
- Accordion

`alert-dialog.tsx` (shadcn) importa `buttonVariants` de `components/common/Button` — acoplamiento cruzado.

### 3.11 `bg-white` vs `bg-card`/`bg-background`

Prácticamente todos los componentes usan `bg-white` hardcodeado. El design system define `--card: #fafafa` y `--background: #fafafa`. Si se cambiara el background, ningún componente respondería.

---

## 4. Archivos y Tokens Huérfanos

### 4.1 Paletas no utilizadas

| Token | Estado |
|---|---|
| `--color-brand-*` (11 paradas) | **Sin uso** — ningún componente referencia `brand-*` |
| `--color-warm-*` (11 paradas) | Duplicado exacto de `neutral-*`. Solo lo usan 3 páginas SSR que podrían usar `neutral-*` directamente |
| `--color-success` | **Sin uso** — componentes usan `green-*` / `emerald-*` directamente |
| `--color-warning` | **Sin uso** — componentes usan `amber-*` directamente |
| `--color-danger` | **Sin uso** — el Button usa `bg-[#e7000b]` (mismo valor) como hex inline |

### 4.2 Variables de fuente sin uso

| Variable | Estado |
|---|---|
| `--font-display` | Definida en `@theme`, **nunca referenciada** |
| `--font-body` (de `lib/fonts.ts`) | Inyectada en `<html>`, **nunca consumida en CSS** |

### 4.3 Tokens duplicados

| Token | Duplicado en |
|---|---|
| `--radius` | Definido tanto en `@theme inline {}` como en `:root {}` |
| `--shadow-ring-accent` | Idéntico a `--shadow-ring` |

### 4.4 Animación rota

| Token | Problema |
|---|---|
| `--animate-shimmer` | Referencia `@keyframes shimmer` que **no existe** |

### 4.5 Sombras custom poco usadas

| Token | Uso |
|---|---|
| `--shadow-card` | No encontrado en componentes (usan `shadow-sm` directamente) |
| `--shadow-card-hover` | No encontrado en componentes (usan `shadow-md` directamente) |
| `--shadow-dropdown` | No encontrado en componentes |
| `--shadow-ring`, `--shadow-ring-accent` | No encontrados en componentes |

### 4.6 Radios custom poco usados

| Token | Uso |
|---|---|
| `--radius-2xl`, `--radius-3xl`, `--radius-4xl` | No encontrados en componentes (usan `rounded-lg` como máximo) |

---

## Resumen Ejecutivo

| Categoría | Cantidad |
|---|---|
| Paletas de color custom sin uso | 2 completas (brand, warm) + 3 tokens sueltos |
| Componentes shadcn/ui modificados | **5/5** (100%) |
| Componentes custom con colores hardcodeados | **22+** |
| Colores de error inconsistentes | 3 variantes (red-500, red-600, #e7000b) |
| Features con estilos divergentes del sistema | Audit (sin radius), Auth (sin Input component) |
| Tokens CSS definidos pero sin uso | 28+ (brand palette, warm palette, shadows, fonts, animations) |
| Animación rota | 1 (shimmer — keyframe missing) |
| Paleta mezclada | Sidebar usa zinc, resto usa neutral |

**Esperando confirmación para proceder con la Fase 2 (limpieza).**

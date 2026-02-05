# SafetyGuard Pro Design System

Sistema de diseño inspirado en Attio con tokens semanticos para una experiencia consistente.

---

## Colores

### Content (Texto)

| Token | Valor | Uso |
|-------|-------|-----|
| `text-content` | #18181b | Texto principal |
| `text-content-secondary` | #52525b | Texto secundario |
| `text-content-muted` | #71717a | Texto deshabilitado/placeholder |
| `text-content-light` | #a1a1aa | Texto muy sutil |
| `text-content-inverse` | #fafafa | Texto sobre fondos oscuros |

### Surface (Fondos)

| Token | Valor | Uso |
|-------|-------|-----|
| `bg-surface` | #fafafa | Fondo de pagina |
| `bg-surface-card` | #ffffff | Fondo de tarjetas |
| `bg-surface-elevated` | #ffffff | Elementos elevados |
| `bg-surface-subtle` | #f4f4f5 | Fondo sutil (inputs) |
| `bg-surface-muted` | #e4e4e7 | Fondo destacado |
| `bg-surface-hover` | #f8f8f9 | Estado hover |

### Borders

| Token | Valor | Uso |
|-------|-------|-----|
| `border-borderClr` | #e4e4e7 | Borde por defecto |
| `border-borderClr-subtle` | #f4f4f5 | Borde sutil |
| `border-borderClr-strong` | #d4d4d8 | Borde marcado |
| `border-borderClr-focus` | #18181b | Borde en focus |

### Status (Estados)

```tsx
// Vigente / Success
<div className="bg-status-success-bg text-status-success-text">
  Certificado vigente
</div>

// Por vencer / Warning
<div className="bg-status-warning-bg text-status-warning-text">
  Vence en 30 dias
</div>

// Vencido / Danger
<div className="bg-status-danger-bg text-status-danger-text">
  Documento vencido
</div>

// Informativo
<div className="bg-status-info-bg text-status-info-text">
  Nota informativa
</div>
```

### Metric (Dashboard Stats)

```tsx
// Total
<div className="bg-metric-total-bg text-metric-total-text">
  <span className="text-metric-total-accent">42</span> Total
</div>

// Vigentes
<div className="bg-metric-valid-bg text-metric-valid-text">
  <span className="text-metric-valid-accent">35</span> Vigentes
</div>

// Por vencer
<div className="bg-metric-warning-bg text-metric-warning-text">
  <span className="text-metric-warning-accent">5</span> Por vencer
</div>

// Vencidos
<div className="bg-metric-danger-bg text-metric-danger-text">
  <span className="text-metric-danger-accent">2</span> Vencidos
</div>
```

---

## Sombras

| Clase | Uso |
|-------|-----|
| `shadow-xs` | Elementos muy sutiles |
| `shadow-sm` | Botones, inputs |
| `shadow` | Default |
| `shadow-card` | Tarjetas en reposo |
| `shadow-card-hover` | Tarjetas en hover |
| `shadow-dropdown` | Menus desplegables |
| `shadow-ring` | Focus ring neutro |
| `shadow-ring-accent` | Focus ring con accent |

---

## Animaciones

| Clase | Duracion | Uso |
|-------|----------|-----|
| `animate-fade-in` | 0.15s | Aparicion basica |
| `animate-fade-in-up` | 0.25s | Aparicion con movimiento |
| `animate-scale-in` | 0.2s | Modales, popovers |
| `animate-slide-in-right` | 0.2s | Paneles laterales |
| `animate-slide-up` | 0.25s | Tooltips desde abajo |
| `animate-pulse-soft` | 2s | Indicadores de carga |
| `animate-shimmer` | 2s | Skeletons |

---

## Tipografia

### Familias

- `font-sans`: Inter, system-ui (texto general)
- `font-display`: Inter, system-ui (titulos)
- `font-mono`: IBM Plex Mono (codigo, IDs)

### Espaciado de Letras

- `tracking-tighter`: -0.03em (titulos grandes)
- `tracking-tight`: -0.015em (subtitulos)
- `tracking-normal`: 0 (texto general)
- `tracking-wide`: 0.015em (labels)

---

## Componentes Comunes

### Tarjeta Base

```tsx
<div className="bg-surface-card border border-borderClr rounded-xl shadow-card hover:shadow-card-hover transition-shadow">
  {/* Contenido */}
</div>
```

### Boton Primario

```tsx
<button className="bg-brand text-content-inverse px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors">
  Accion
</button>
```

### Input

```tsx
<input className="w-full px-3 py-2 bg-surface-subtle border border-borderClr rounded-lg focus:border-borderClr-focus focus:outline-none focus:ring-2 focus:ring-offset-0 shadow-ring" />
```

### Badge de Estado

```tsx
// Vigente
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-status-success-bg text-status-success-text">
  Vigente
</span>

// Vencido
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-status-danger-bg text-status-danger-text">
  Vencido
</span>
```

---

## Border Radius

| Clase | Valor | Uso |
|-------|-------|-----|
| `rounded-sm` | 4px | Elementos pequenos |
| `rounded` | 8px | Default |
| `rounded-lg` | 10px | Botones, inputs |
| `rounded-xl` | 14px | Tarjetas |
| `rounded-2xl` | 16px | Modales |
| `rounded-3xl` | 20px | Contenedores grandes |

---

## Espaciado Custom

| Clase | Valor |
|-------|-------|
| `p-4.5` | 1.125rem (18px) |
| `p-5.5` | 1.375rem (22px) |
| `p-18` | 4.5rem (72px) |

---

*Documento generado el 29/01/2026*

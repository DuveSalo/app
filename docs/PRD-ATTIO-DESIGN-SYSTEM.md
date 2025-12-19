# PRD: Sistema de Diseño Inspirado en Attio
## Adaptado para Sistema de Gestión de Seguridad contra Incendios

---

## 1. Resumen Ejecutivo

Este documento define las especificaciones de diseño para transformar la interfaz de la aplicación de gestión de seguridad contra incendios, adoptando los principios visuales de Attio.com: uso magistral del espacio en blanco, paleta de grises sofisticada, texturas de fondo sutiles, layouts tipo bento grid, y una estética minimalista que transmite profesionalismo y modernidad.

---

## 2. Filosofía de Diseño

### 2.1 Principios Fundamentales

| Principio | Descripción |
|-----------|-------------|
| **Espacio en Blanco** | El vacío es un elemento de diseño, no espacio desperdiciado. Cada elemento respira. |
| **Monocromía Sofisticada** | Paleta de grises como protagonista. Color solo para acciones críticas y estados. |
| **Texturas Sutiles** | Patrones de puntos y líneas que añaden profundidad sin distraer. |
| **Jerarquía Clara** | Tipografía con peso variable para crear contraste y guiar la mirada. |
| **Minimalismo Funcional** | Cada elemento tiene un propósito. Sin decoración superflua. |

### 2.2 Sensaciones a Transmitir

- **Profesionalismo**: Diseño que inspira confianza en entornos B2B
- **Modernidad**: Estética de próxima generación, no genérica
- **Calma**: Interfaces que no abruman, que invitan a usar
- **Precisión**: Atención al detalle en cada píxel

---

## 3. Sistema de Colores

### 3.1 Paleta Principal (Grayscale)

```css
/* Backgrounds */
--bg-primary: #FFFFFF;           /* Fondo principal */
--bg-secondary: #FAFAFA;         /* Fondo secundario, cards */
--bg-tertiary: #F5F5F5;          /* Fondo terciario, hover states */
--bg-elevated: #FFFFFF;          /* Cards y elementos elevados */

/* Textos */
--text-primary: #0F0F0F;         /* Títulos principales - casi negro */
--text-secondary: #525252;       /* Texto de cuerpo */
--text-tertiary: #A3A3A3;        /* Texto secundario, placeholders */
--text-muted: #D4D4D4;           /* Texto muy sutil */

/* Bordes */
--border-default: #E5E5E5;       /* Borde estándar */
--border-subtle: #F0F0F0;        /* Borde muy sutil */
--border-strong: #D4D4D4;        /* Borde enfatizado */

/* Superficies */
--surface-elevated: #FFFFFF;     /* Cards elevadas */
--surface-sunken: #FAFAFA;       /* Áreas hundidas */
```

### 3.2 Colores de Acento (Uso Mínimo)

```css
/* Acciones Primarias */
--accent-primary: #0F0F0F;       /* Botones principales - negro */
--accent-primary-hover: #262626; /* Hover de botones principales */

/* Estados de Éxito */
--success-bg: #ECFDF5;           /* Fondo de éxito */
--success-text: #059669;         /* Texto de éxito */
--success-border: #A7F3D0;       /* Borde de éxito */

/* Estados de Advertencia */
--warning-bg: #FFFBEB;           /* Fondo de advertencia */
--warning-text: #D97706;         /* Texto de advertencia */
--warning-border: #FDE68A;       /* Borde de advertencia */

/* Estados de Error */
--danger-bg: #FEF2F2;            /* Fondo de error */
--danger-text: #DC2626;          /* Texto de error */
--danger-border: #FECACA;        /* Borde de error */

/* Acentos de Información */
--info-bg: #EFF6FF;              /* Fondo informativo */
--info-text: #2563EB;            /* Texto informativo */
--info-border: #BFDBFE;          /* Borde informativo */
```

### 3.3 Regla del Color

> **90% Grayscale / 10% Color**
>
> El color se reserva exclusivamente para:
> - Estados de validación (éxito, error, advertencia)
> - Badges de estado críticos
> - Indicadores de actividad (como "Live" en verde)
> - Links de acción secundarios (azul sutil)

---

## 4. Tipografía

### 4.1 Familia Tipográfica

```css
/* Sistema tipográfico */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'IBM Plex Mono', 'Fira Code', monospace;
```

### 4.2 Escala Tipográfica

```css
/* Hero/Display - Para citas grandes y títulos de landing */
--text-display: 4rem;        /* 64px - Citas testimoniales */
--text-display-sm: 3rem;     /* 48px - Headlines principales */

/* Headings */
--text-h1: 2.25rem;          /* 36px */
--text-h2: 1.875rem;         /* 30px */
--text-h3: 1.5rem;           /* 24px */
--text-h4: 1.25rem;          /* 20px */
--text-h5: 1.125rem;         /* 18px */

/* Body */
--text-body-lg: 1.125rem;    /* 18px - Descripciones destacadas */
--text-body: 1rem;           /* 16px - Texto principal */
--text-body-sm: 0.875rem;    /* 14px - Texto secundario */

/* Small */
--text-caption: 0.75rem;     /* 12px - Labels, captions */
--text-overline: 0.6875rem;  /* 11px - Overlines, badges */
```

### 4.3 Pesos Tipográficos

```css
--font-normal: 400;          /* Texto de cuerpo */
--font-medium: 500;          /* Énfasis suave */
--font-semibold: 600;        /* Subtítulos, labels */
--font-bold: 700;            /* Headlines */
--font-black: 900;           /* Display text, citas grandes */
```

### 4.4 Estilo de Headlines (Attio Style)

El estilo característico de Attio usa headlines con:
- Parte inicial en **negro bold**
- Continuación en **gris claro** (para texto secundario)

```tsx
// Ejemplo de implementación
<h2 className="text-4xl font-bold">
  <span className="text-gray-900">GTM at full throttle.</span>
  <span className="text-gray-400"> Execute your revenue strategy with precision.</span>
</h2>
```

---

## 5. Texturas de Fondo

### 5.1 Patrón de Puntos (Dot Pattern)

El elemento distintivo de Attio es su patrón de puntos sutil en el fondo.

```css
/* Implementación CSS del dot pattern */
.dot-pattern {
  background-image: radial-gradient(
    circle,
    #E5E5E5 1px,
    transparent 1px
  );
  background-size: 24px 24px;
}

/* Variante más sutil */
.dot-pattern-subtle {
  background-image: radial-gradient(
    circle,
    #F0F0F0 0.5px,
    transparent 0.5px
  );
  background-size: 20px 20px;
}
```

### 5.2 Patrón de Líneas Diagonales

Para secciones específicas que requieren diferenciación visual.

```css
.diagonal-lines {
  background-image: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 10px,
    #FAFAFA 10px,
    #FAFAFA 11px
  );
}
```

### 5.3 Grid Lines (Líneas de Cuadrícula)

Para áreas de contenido interactivo (como workflows visuales).

```css
.grid-lines {
  background-image:
    linear-gradient(to right, #F5F5F5 1px, transparent 1px),
    linear-gradient(to bottom, #F5F5F5 1px, transparent 1px);
  background-size: 40px 40px;
}
```

### 5.4 Cuándo Usar Cada Textura

| Textura | Uso |
|---------|-----|
| **Dot Pattern** | Hero sections, fondos de páginas principales, testimoniales |
| **Grid Lines** | Áreas de workflow, diagramas, visualizaciones de datos |
| **Diagonal Lines** | Separadores de sección, áreas decorativas |
| **Sin Textura** | Cards, modals, áreas de contenido denso |

---

## 6. Sistema de Espaciado

### 6.1 Escala de Espaciado

```css
--space-0: 0;
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-5: 1.25rem;    /* 20px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
--space-24: 6rem;      /* 96px */
--space-32: 8rem;      /* 128px */
```

### 6.2 Principios de Espaciado

1. **Generosidad**: Usar más espacio del que parece necesario
2. **Consistencia**: Múltiplos de 4px o 8px siempre
3. **Jerarquía**: Más espacio = más importancia
4. **Agrupación**: Elementos relacionados más cerca

### 6.3 Espaciado por Contexto

```css
/* Secciones de página */
--section-padding-y: var(--space-24);     /* 96px */
--section-padding-x: var(--space-16);     /* 64px */

/* Cards */
--card-padding: var(--space-6);           /* 24px */
--card-padding-lg: var(--space-8);        /* 32px */

/* Entre elementos de formulario */
--form-gap: var(--space-4);               /* 16px */

/* Entre items de lista */
--list-gap: var(--space-3);               /* 12px */

/* Container máximo */
--container-max: 1280px;
--container-padding: var(--space-6);
```

---

## 7. Componentes UI

### 7.1 Botones

#### 7.1.1 Botón Primario (Negro)

```tsx
// Especificaciones
{
  background: '#0F0F0F',
  color: '#FFFFFF',
  padding: '12px 24px',
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: 500,
  border: 'none',
  boxShadow: 'none',
  transition: 'background 150ms ease',

  ':hover': {
    background: '#262626'
  },

  ':active': {
    background: '#171717',
    transform: 'scale(0.98)'
  }
}
```

#### 7.1.2 Botón Secundario (Outline)

```tsx
{
  background: 'transparent',
  color: '#0F0F0F',
  padding: '12px 24px',
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: 500,
  border: '1px solid #E5E5E5',

  ':hover': {
    background: '#FAFAFA',
    borderColor: '#D4D4D4'
  }
}
```

#### 7.1.3 Botón Ghost

```tsx
{
  background: 'transparent',
  color: '#525252',
  padding: '8px 16px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 500,
  border: 'none',

  ':hover': {
    background: '#F5F5F5',
    color: '#0F0F0F'
  }
}
```

#### 7.1.4 Botón Danger

```tsx
{
  background: '#0F0F0F',
  color: '#FFFFFF',
  // Mismo estilo que primario pero con gradiente rojo sutil
  backgroundImage: 'linear-gradient(135deg, #1F1F1F 0%, #2D1F1F 100%)',

  ':hover': {
    backgroundImage: 'linear-gradient(135deg, #2D2020 0%, #3D2525 100%)'
  }
}
```

### 7.2 Cards

#### 7.2.1 Card Estándar

```tsx
{
  background: '#FFFFFF',
  border: '1px solid #E5E5E5',
  borderRadius: '16px',
  padding: '24px',
  boxShadow: 'none', // Sin sombra por defecto

  ':hover': {
    borderColor: '#D4D4D4'
  }
}
```

#### 7.2.2 Card Elevada (Para elementos interactivos)

```tsx
{
  background: '#FFFFFF',
  border: '1px solid #E5E5E5',
  borderRadius: '16px',
  padding: '24px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',

  ':hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    transform: 'translateY(-2px)'
  }
}
```

#### 7.2.3 Card de Selección (Como planes de suscripción)

```tsx
// Estado normal
{
  background: '#FFFFFF',
  border: '1px solid #E5E5E5',
  borderRadius: '16px',
  padding: '24px',
  cursor: 'pointer'
}

// Estado seleccionado
{
  border: '2px solid #0F0F0F',
  boxShadow: '0 0 0 1px #0F0F0F'
}
```

### 7.3 Inputs

#### 7.3.1 Input de Texto

```tsx
{
  background: '#FFFFFF',
  border: '1px solid #E5E5E5',
  borderRadius: '12px',
  padding: '12px 16px',
  fontSize: '14px',
  color: '#0F0F0F',

  '::placeholder': {
    color: '#A3A3A3'
  },

  ':focus': {
    outline: 'none',
    borderColor: '#0F0F0F',
    boxShadow: '0 0 0 3px rgba(15, 15, 15, 0.1)'
  },

  // Estado de error
  ':invalid': {
    borderColor: '#DC2626',
    boxShadow: '0 0 0 3px rgba(220, 38, 38, 0.1)'
  }
}
```

#### 7.3.2 Labels

```tsx
{
  fontSize: '14px',
  fontWeight: 500,
  color: '#0F0F0F',
  marginBottom: '6px',
  display: 'block'
}
```

### 7.4 Badges/Tags

#### 7.4.1 Badge Neutral

```tsx
{
  background: '#F5F5F5',
  color: '#525252',
  padding: '4px 10px',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: 500
}
```

#### 7.4.2 Badge de Estado

```tsx
// Success
{
  background: '#ECFDF5',
  color: '#059669',
  padding: '4px 10px',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: 500
}

// Warning
{
  background: '#FFFBEB',
  color: '#D97706'
}

// Error
{
  background: '#FEF2F2',
  color: '#DC2626'
}

// Info (con estilo "AI" como Attio)
{
  background: '#F5F5F5',
  color: '#525252',
  border: '1px solid #E5E5E5'
}
```

#### 7.4.3 Badge "Live" (Indicador de Estado Activo)

```tsx
{
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  background: '#ECFDF5',
  color: '#059669',
  padding: '4px 12px',
  borderRadius: '9999px', // Pill shape
  fontSize: '12px',
  fontWeight: 500,

  // Dot pulsante
  '::before': {
    content: '""',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#10B981',
    animation: 'pulse 2s infinite'
  }
}
```

### 7.5 Tablas

```tsx
// Contenedor de tabla
{
  background: '#FFFFFF',
  border: '1px solid #E5E5E5',
  borderRadius: '16px',
  overflow: 'hidden'
}

// Header de tabla
{
  background: '#FAFAFA',
  borderBottom: '1px solid #E5E5E5'
}

// Celda de header
{
  padding: '12px 16px',
  fontSize: '12px',
  fontWeight: 600,
  color: '#525252',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
}

// Filas
{
  borderBottom: '1px solid #F5F5F5',

  ':hover': {
    background: '#FAFAFA'
  },

  ':last-child': {
    borderBottom: 'none'
  }
}

// Celdas
{
  padding: '16px',
  fontSize: '14px',
  color: '#0F0F0F'
}
```

### 7.6 Modal/Dialog

```tsx
// Overlay
{
  background: 'rgba(0, 0, 0, 0.4)',
  backdropFilter: 'blur(4px)'
}

// Modal container
{
  background: '#FFFFFF',
  borderRadius: '20px',
  padding: '32px',
  maxWidth: '480px',
  width: '100%',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
}

// Modal header
{
  marginBottom: '24px'
}

// Modal title
{
  fontSize: '20px',
  fontWeight: 600,
  color: '#0F0F0F'
}

// Modal footer
{
  marginTop: '32px',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px'
}
```

### 7.7 Sidebar/Navigation

```tsx
// Sidebar container
{
  width: '280px',
  background: '#FAFAFA',
  borderRight: '1px solid #E5E5E5',
  padding: '24px 16px'
}

// Nav section header
{
  fontSize: '11px',
  fontWeight: 600,
  color: '#A3A3A3',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  padding: '8px 12px',
  marginTop: '16px'
}

// Nav item
{
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '10px 12px',
  borderRadius: '8px',
  fontSize: '14px',
  color: '#525252',

  ':hover': {
    background: '#F0F0F0',
    color: '#0F0F0F'
  }
}

// Nav item activo
{
  background: '#FFFFFF',
  color: '#0F0F0F',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
}

// Nav icon
{
  width: '20px',
  height: '20px',
  color: 'currentColor'
}
```

### 7.8 Toast/Notifications

```tsx
// Toast container
{
  position: 'fixed',
  top: '24px',
  right: '24px',
  zIndex: 9999
}

// Toast item
{
  background: '#0F0F0F',
  color: '#FFFFFF',
  padding: '16px 20px',
  borderRadius: '12px',
  fontSize: '14px',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  maxWidth: '400px'
}

// Toast success
{
  background: '#059669'
}

// Toast error
{
  background: '#DC2626'
}
```

---

## 8. Layouts - Bento Grid System

### 8.1 Concepto de Bento Grid

El "Bento Grid" es un sistema de layout inspirado en las cajas bento japonesas, donde elementos de diferentes tamaños se organizan en una cuadrícula armoniosa.

### 8.2 Grid Base

```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
  padding: 24px;
}

/* Variante compacta */
.bento-grid-compact {
  gap: 16px;
  padding: 16px;
}

/* Variante espaciosa */
.bento-grid-spacious {
  gap: 32px;
  padding: 32px;
}
```

### 8.3 Tamaños de Celdas Bento

```css
/* Pequeño - 4 columnas */
.bento-sm {
  grid-column: span 4;
}

/* Mediano - 6 columnas */
.bento-md {
  grid-column: span 6;
}

/* Grande - 8 columnas */
.bento-lg {
  grid-column: span 8;
}

/* Full - 12 columnas */
.bento-full {
  grid-column: span 12;
}

/* Altura doble */
.bento-tall {
  grid-row: span 2;
}
```

### 8.4 Ejemplo de Layout Bento para Dashboard

```tsx
// Dashboard con Control de Vencimientos
<div className="bento-grid">
  {/* Métricas principales - fila superior */}
  <MetricCard className="bento-sm" title="Certificados" value={24} />
  <MetricCard className="bento-sm" title="Por Vencer" value={8} status="warning" />
  <MetricCard className="bento-sm" title="Vencidos" value={2} status="danger" />

  {/* Gráfico de tendencia - grande */}
  <ChartCard className="bento-lg bento-tall" title="Tendencia de Vencimientos" />

  {/* Lista de próximos vencimientos */}
  <UpcomingList className="bento-sm bento-tall" />

  {/* Actividad reciente */}
  <ActivityFeed className="bento-md" />

  {/* Acciones rápidas */}
  <QuickActions className="bento-sm" />
</div>
```

### 8.5 Layout de Página Estándar

```tsx
// Estructura de página con sidebar
<div className="app-layout">
  {/* Sidebar fijo */}
  <aside className="sidebar">
    <Logo />
    <Navigation />
    <UserMenu />
  </aside>

  {/* Contenido principal */}
  <main className="main-content">
    {/* Header de página */}
    <header className="page-header">
      <h1>Título de Página</h1>
      <div className="header-actions">
        <Button variant="secondary">Exportar</Button>
        <Button variant="primary">Nuevo</Button>
      </div>
    </header>

    {/* Contenido scrolleable */}
    <div className="page-content">
      {/* Contenido aquí */}
    </div>

    {/* Footer de página (opcional) */}
    <footer className="page-footer">
      <Button>Guardar cambios</Button>
    </footer>
  </main>
</div>
```

```css
.app-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 280px;
  flex-shrink: 0;
  background: #FAFAFA;
  border-right: 1px solid #E5E5E5;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
}

.main-content {
  flex: 1;
  margin-left: 280px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.page-header {
  padding: 24px 32px;
  border-bottom: 1px solid #E5E5E5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #FFFFFF;
  position: sticky;
  top: 0;
  z-index: 10;
}

.page-content {
  flex: 1;
  padding: 32px;
  background: #FAFAFA;
  overflow-y: auto;
}

.page-footer {
  padding: 16px 32px;
  border-top: 1px solid #E5E5E5;
  background: #FFFFFF;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
```

---

## 9. Animaciones y Transiciones

### 9.1 Principios de Animación

1. **Sutileza**: Animaciones apenas perceptibles pero que añaden pulido
2. **Rapidez**: Duración corta (150-300ms)
3. **Propósito**: Cada animación comunica algo

### 9.2 Timing Functions

```css
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);     /* Suave */
--ease-in: cubic-bezier(0.4, 0, 1, 1);            /* Entrada */
--ease-out: cubic-bezier(0, 0, 0.2, 1);           /* Salida */
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1); /* Rebote sutil */
```

### 9.3 Duraciones

```css
--duration-fast: 150ms;    /* Hovers, pequeños cambios */
--duration-normal: 200ms;  /* Transiciones estándar */
--duration-slow: 300ms;    /* Animaciones más complejas */
--duration-slower: 500ms;  /* Animaciones de página */
```

### 9.4 Animaciones Específicas

```css
/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide up */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale in */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Pulse para indicadores "Live" */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Skeleton loading */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
```

### 9.5 Clases de Utilidad para Animaciones

```css
.animate-fade-in {
  animation: fadeIn var(--duration-normal) var(--ease-out);
}

.animate-slide-up {
  animation: slideUp var(--duration-normal) var(--ease-out);
}

.animate-scale-in {
  animation: scaleIn var(--duration-fast) var(--ease-out);
}

/* Staggered animations para listas */
.stagger-children > * {
  animation: slideUp var(--duration-normal) var(--ease-out) both;
}

.stagger-children > *:nth-child(1) { animation-delay: 0ms; }
.stagger-children > *:nth-child(2) { animation-delay: 50ms; }
.stagger-children > *:nth-child(3) { animation-delay: 100ms; }
.stagger-children > *:nth-child(4) { animation-delay: 150ms; }
.stagger-children > *:nth-child(5) { animation-delay: 200ms; }
```

---

## 10. Iconografía

### 10.1 Librería de Iconos

Usar **Lucide React** (ya implementado en el proyecto) como librería principal.

### 10.2 Tamaños de Iconos

```css
--icon-xs: 14px;   /* Badges, indicadores */
--icon-sm: 16px;   /* Dentro de botones, inputs */
--icon-md: 20px;   /* Navegación, acciones */
--icon-lg: 24px;   /* Headers, destacados */
--icon-xl: 32px;   /* Empty states, features */
```

### 10.3 Estilo de Iconos

```tsx
// Configuración estándar
{
  strokeWidth: 1.5,  // Trazo más delgado que el default
  color: 'currentColor'
}

// Para iconos en navegación
{
  strokeWidth: 1.75
}
```

---

## 11. Estados Vacíos y Loading

### 11.1 Empty State

```tsx
<div className="empty-state">
  <div className="empty-state-icon">
    <FileText className="w-12 h-12 text-gray-300" />
  </div>
  <h3 className="empty-state-title">No hay certificados</h3>
  <p className="empty-state-description">
    Comienza creando tu primer certificado de conservación.
  </p>
  <Button>Crear certificado</Button>
</div>
```

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 32px;
  text-align: center;
}

.empty-state-icon {
  margin-bottom: 24px;
  padding: 24px;
  background: #F5F5F5;
  border-radius: 16px;
}

.empty-state-title {
  font-size: 18px;
  font-weight: 600;
  color: #0F0F0F;
  margin-bottom: 8px;
}

.empty-state-description {
  font-size: 14px;
  color: #525252;
  max-width: 300px;
  margin-bottom: 24px;
}
```

### 11.2 Skeleton Loading

```css
.skeleton {
  background: linear-gradient(
    90deg,
    #F5F5F5 25%,
    #EBEBEB 50%,
    #F5F5F5 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}

.skeleton-text {
  height: 14px;
  border-radius: 4px;
}

.skeleton-title {
  height: 24px;
  width: 60%;
  border-radius: 6px;
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.skeleton-card {
  height: 120px;
  border-radius: 16px;
}
```

---

## 12. Aplicación Específica al Proyecto

### 12.1 Dashboard - Control de Vencimientos (Rediseño)

```tsx
// Estructura propuesta
<PageLayout title="Dashboard">
  {/* Hero section con patrón de puntos */}
  <section className="dot-pattern py-12">
    <h1 className="text-4xl font-bold">
      <span className="text-gray-900">Control de Vencimientos.</span>
      <span className="text-gray-400"> Mantén tu documentación al día.</span>
    </h1>
  </section>

  {/* Bento grid de métricas */}
  <div className="bento-grid mt-8">
    <MetricCard
      className="bento-sm"
      icon={<FileText />}
      label="Certificados Activos"
      value={24}
    />
    <MetricCard
      className="bento-sm"
      icon={<Clock />}
      label="Próximos a Vencer"
      value={8}
      variant="warning"
    />
    <MetricCard
      className="bento-sm"
      icon={<AlertTriangle />}
      label="Vencidos"
      value={2}
      variant="danger"
    />

    {/* Timeline de vencimientos */}
    <Card className="bento-lg bento-tall">
      <CardHeader>
        <h3>Próximos Vencimientos</h3>
        <Badge>30 días</Badge>
      </CardHeader>
      <ExpirationTimeline items={upcomingExpirations} />
    </Card>

    {/* Distribución por tipo */}
    <Card className="bento-sm bento-tall">
      <CardHeader>
        <h3>Por Tipo de Documento</h3>
      </CardHeader>
      <DocumentTypeBreakdown data={typeData} />
    </Card>
  </div>
</PageLayout>
```

### 12.2 Página de Configuración (Settings)

```tsx
// Tabs con estilo Attio
<div className="settings-tabs">
  <Tab active>Empresa</Tab>
  <Tab>Empleados</Tab>
  <Tab>Facturación</Tab>
  <Tab>Mi Perfil</Tab>
</div>

// Tab styling
.settings-tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #E5E5E5;
  padding-bottom: -1px;
}

.settings-tab {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #525252;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 150ms ease;
}

.settings-tab:hover {
  color: #0F0F0F;
}

.settings-tab.active {
  color: #0F0F0F;
  border-bottom-color: #0F0F0F;
}
```

### 12.3 Formularios de Certificados

```tsx
// Card de formulario con secciones
<Card className="form-card">
  <CardSection>
    <SectionHeader>
      <span className="section-number">[01]</span>
      <h3>Información General</h3>
    </SectionHeader>
    <div className="form-grid">
      <Input label="Número de Certificado" />
      <Input label="Fecha de Emisión" type="date" />
      <Input label="Fecha de Vencimiento" type="date" />
    </div>
  </CardSection>

  <CardSection>
    <SectionHeader>
      <span className="section-number">[02]</span>
      <h3>Datos del Cliente</h3>
    </SectionHeader>
    {/* ... */}
  </CardSection>
</Card>
```

```css
.section-number {
  font-size: 12px;
  font-weight: 600;
  color: #A3A3A3;
  margin-right: 12px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}
```

### 12.4 Tabla de Certificados

```tsx
<TableContainer>
  <TableHeader>
    <TableRow>
      <TableHead sortable>Certificado</TableHead>
      <TableHead>Cliente</TableHead>
      <TableHead sortable>Vencimiento</TableHead>
      <TableHead>Estado</TableHead>
      <TableHead>Acciones</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {certificates.map(cert => (
      <TableRow key={cert.id} hoverable>
        <TableCell>
          <div className="flex items-center gap-3">
            <div className="icon-container">
              <FileText className="w-4 h-4" />
            </div>
            <span className="font-medium">{cert.number}</span>
          </div>
        </TableCell>
        <TableCell>{cert.client}</TableCell>
        <TableCell>
          <span className={getExpirationClass(cert.expiresAt)}>
            {formatDate(cert.expiresAt)}
          </span>
        </TableCell>
        <TableCell>
          <Badge variant={getStatusVariant(cert.status)}>
            {cert.status}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex gap-1">
            <IconButton icon={<Eye />} />
            <IconButton icon={<Edit />} />
            <IconButton icon={<Trash />} variant="danger" />
          </div>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</TableContainer>
```

---

## 13. Responsive Design

### 13.1 Breakpoints

```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

### 13.2 Comportamiento del Sidebar

```css
/* Desktop */
@media (min-width: 1024px) {
  .sidebar {
    width: 280px;
    position: fixed;
  }

  .main-content {
    margin-left: 280px;
  }
}

/* Tablet */
@media (max-width: 1023px) {
  .sidebar {
    width: 240px;
    transform: translateX(-100%);
    transition: transform 300ms ease;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0;
  }
}

/* Mobile */
@media (max-width: 767px) {
  .sidebar {
    width: 100%;
    max-width: 320px;
  }
}
```

### 13.3 Bento Grid Responsive

```css
/* Desktop */
@media (min-width: 1024px) {
  .bento-grid {
    grid-template-columns: repeat(12, 1fr);
  }
}

/* Tablet */
@media (max-width: 1023px) {
  .bento-grid {
    grid-template-columns: repeat(6, 1fr);
  }

  .bento-lg {
    grid-column: span 6;
  }

  .bento-sm {
    grid-column: span 3;
  }
}

/* Mobile */
@media (max-width: 767px) {
  .bento-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .bento-sm,
  .bento-md,
  .bento-lg,
  .bento-full {
    grid-column: span 1;
  }

  .bento-tall {
    grid-row: span 1;
  }
}
```

---

## 14. Accesibilidad

### 14.1 Contraste de Colores

Todos los textos cumplen con WCAG 2.1 AA:

| Combinación | Ratio | Cumple |
|-------------|-------|--------|
| #0F0F0F sobre #FFFFFF | 19.5:1 | ✅ AAA |
| #525252 sobre #FFFFFF | 7.3:1 | ✅ AA |
| #A3A3A3 sobre #FFFFFF | 3.1:1 | ⚠️ Solo decorativo |
| #FFFFFF sobre #0F0F0F | 19.5:1 | ✅ AAA |

### 14.2 Focus States

```css
/* Focus visible para navegación por teclado */
:focus-visible {
  outline: 2px solid #0F0F0F;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Quitar outline para clicks de mouse */
:focus:not(:focus-visible) {
  outline: none;
}
```

### 14.3 Reducción de Movimiento

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 15. Implementación Técnica

### 15.1 Archivos a Crear/Modificar

```
src/
├── styles/
│   ├── design-tokens.css      # Variables CSS
│   ├── base.css               # Estilos base
│   ├── components.css         # Estilos de componentes
│   ├── utilities.css          # Clases de utilidad
│   └── animations.css         # Keyframes y animaciones
├── components/
│   ├── common/
│   │   ├── Button.tsx         # Actualizar
│   │   ├── Card.tsx           # Actualizar
│   │   ├── Input.tsx          # Actualizar
│   │   ├── Badge.tsx          # Nuevo
│   │   ├── Table.tsx          # Actualizar
│   │   └── ...
│   └── layout/
│       ├── BentoGrid.tsx      # Nuevo
│       ├── PageLayout.tsx     # Actualizar
│       └── Sidebar.tsx        # Actualizar
└── ...
```

### 15.2 Tailwind Config Actualizado

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        gray: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0F0F0F',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    }
  }
}
```

---

## 16. Checklist de Implementación

### Fase 1: Fundamentos
- [ ] Actualizar variables de color en CSS/Tailwind
- [ ] Implementar tipografía Inter + IBM Plex Mono
- [ ] Crear clases de patrones de fondo (dots, grid)
- [ ] Actualizar escala de espaciado

### Fase 2: Componentes Core
- [ ] Rediseñar Button component
- [ ] Rediseñar Card component
- [ ] Rediseñar Input/Form elements
- [ ] Crear Badge component
- [ ] Actualizar Table component
- [ ] Rediseñar Modal component

### Fase 3: Layout
- [ ] Crear BentoGrid component
- [ ] Actualizar Sidebar
- [ ] Actualizar PageLayout
- [ ] Implementar responsive behavior

### Fase 4: Páginas
- [ ] Rediseñar Dashboard
- [ ] Rediseñar SettingsPage
- [ ] Actualizar formularios de certificados
- [ ] Actualizar páginas de listado

### Fase 5: Pulido
- [ ] Implementar animaciones
- [ ] Agregar skeleton loading
- [ ] Crear empty states
- [ ] Testing de accesibilidad
- [ ] Testing responsive

---

## 17. Referencias Visuales

### Elementos Clave de Attio a Replicar

1. **Hero con cita grande**: Texto enorme en gris claro sobre fondo con puntos
2. **Section headers**: `[01] TITULO` con número en brackets
3. **Cards con bordes sutiles**: Sin sombra, borde gris claro
4. **Botones negros sólidos**: Sin gradientes, hover más claro
5. **Tablas limpias**: Headers en mayúsculas pequeñas, filas con hover sutil
6. **Indicadores de estado**: Badges pill-shaped con colores sutiles
7. **Navegación minimal**: Iconos delgados, texto gris, activo en negro

---

*Documento creado para el Sistema de Gestión de Seguridad contra Incendios*
*Versión 1.0 - Diciembre 2024*

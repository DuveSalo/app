# Design System — Escuela Segura

> Este documento es el contrato de diseño del proyecto. Todo cambio visual debe respetar estas reglas.

---

## 1. Principios

- **Minimalista**: pocas variantes, consistentes en toda la app.
- **shadcn/ui first**: usar componentes oficiales de shadcn. Solo crear custom si shadcn no lo tiene.
- **Tokenizado**: colores en `:root` de `globals.css`. Nunca hardcodear.
- **Un solo radius**: `rounded-lg` (10px) en todo.

---

## 2. Tokens de diseño

Se definen **exclusivamente** en `:root` de `apps/web/src/app/globals.css`.

### Valores (idénticos al dashboard de shadcn/ui)

```css
:root {
  --radius: 0.625rem;
  --background: #fff;
  --foreground: #0a0a0a;
  --card: #fff;
  --card-foreground: #0a0a0a;
  --popover: #fff;
  --popover-foreground: #0a0a0a;
  --primary: #171717;
  --primary-foreground: #fafafa;
  --secondary: #f5f5f5;
  --secondary-foreground: #171717;
  --muted: #f5f5f5;
  --muted-foreground: #737373;
  --accent: #f5f5f5;
  --accent-foreground: #171717;
  --destructive: #e40014;
  --destructive-foreground: #fcf3f3;
  --border: #e5e5e5;
  --input: #e5e5e5;
  --ring: #a1a1a1;
  --sidebar: #fafafa;
  --sidebar-foreground: #0a0a0a;
  --sidebar-primary: #171717;
  --sidebar-primary-foreground: #fafafa;
  --sidebar-accent: #f5f5f5;
  --sidebar-accent-foreground: #171717;
  --sidebar-border: #e5e5e5;
  --sidebar-ring: #a1a1a1;
}
```

Tokens custom adicionales que no existen en shadcn (mantener sin cambios): `--info`, `--info-foreground`.

**Regla**: NUNCA colores directos (`bg-red-500`, `bg-white`, `text-black`). Siempre tokens. Única excepción: badges de estado (sección 6).

---

## 3. Tipografía

Fuente: **Inter** para todo. JetBrains Mono solo para código.

### Escala tipográfica (únicas opciones)

| Nombre | Clase | Uso |
|---|---|---|
| **Page title** | `text-2xl font-semibold tracking-tight` | Título de página (h1). Uno por página. Sin subtítulo. |
| **Section title** | `text-base font-medium` | Título de sección (h2). |
| **Card label** | `text-sm text-muted-foreground` | Labels de stat cards, labels de formulario. |
| **Card value** | `text-2xl font-bold` | Valores numéricos en stat cards. |
| **Body** | `text-sm text-foreground` | Texto general, tablas, párrafos. |
| **Small** | `text-xs text-muted-foreground` | Timestamps, metadata, paginación. |
| **Table header** | `text-xs font-medium text-muted-foreground` | Encabezados de tabla. |

No se usan otros tamaños. Default: **Body**. No hay subtítulos debajo del page title.

---

## 4. Border Radius

**`rounded-lg` (10px) en TODO.** `--radius: 0.625rem` en `:root`.

Aplica a: cards, botones, inputs, selects, textareas, badges, modals, dialogs, popovers, dropdowns, avatares, sidebar logo, contenedores de tabla, botones de paginación, tooltips, skeletons, toasts.

---

## 5. Botones

**4 variantes.**

| Variante | Uso |
|---|---|
| **default** (primary) | Acción principal: guardar, crear, confirmar, subir |
| **destructive** | Eliminar, cancelar suscripción, cerrar sesión (en AlertDialog) |
| **outline** | Acciones en cards (Cambiar plan, Cambiar método de pago), filtros de toolbar |
| **ghost** | Acciones secundarias, cancelar diálogos, links con aspecto de botón |

Estilos constantes: `rounded-lg text-sm font-medium h-9 px-4 py-2`. Ancho se adapta al contenido.

**Sizes**: default (h-9) e icon (h-9 w-9). Nada más.

### Botones dentro de cards

- Acciones (Cambiar plan, Cambiar método de pago): `Button variant="outline"`
- Acciones destructivas (Cancelar plan): `Button variant="ghost"` con `text-destructive`

---

## 6. Badges

**Misma forma, distinto color.**

Estructura: `inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-medium border`

| Semántica | Fondo | Texto | Borde | Ejemplos |
|---|---|---|---|---|
| **Positivo** | `bg-emerald-50` | `text-emerald-700` | `border-emerald-200` | Vigente, Activa, Aprobado, Completado |
| **Advertencia** | `bg-amber-50` | `text-amber-700` | `border-amber-200` | Por vencer, Pendiente, Suspendida |
| **Negativo** | `bg-red-50` | `text-red-700` | `border-red-200` | Vencido, Cancelada, Rechazado |
| **Neutro** | `bg-muted` | `text-muted-foreground` | `border-border` | Expirada, Inactivo |
| **Informativo** | `bg-info/10` | `text-info` | `border-info/30` | Trial, Nuevo |

Usar en: tablas de documentos, historial de pagos, estado de plan, estado de suscripción. Todos usan el mismo componente Badge con estos estilos.

---

## 7. Sidebar

- Fondo: `bg-sidebar` (#fafafa)
- Borde derecho: `border-r border-sidebar-border` (línea vertical continua sin interrupciones)
- Items: `text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg px-3 py-2`
- Item activo: `bg-sidebar-accent text-sidebar-accent-foreground font-medium rounded-lg`
- Logo avatar ("ES"): `bg-primary text-primary-foreground rounded-lg`
- Nombre "Escuela Segura": `text-sm font-semibold text-foreground`
- Íconos: lucide-react `h-4 w-4` a la izquierda de cada item con `gap-3`
- NO separador horizontal entre logo y nav
- NO fondo negro, NO texto blanco (excepto avatar del logo)
- "Configuración" NO está en el sidebar

### Usuario (parte inferior del sidebar)

El avatar/nombre del usuario es trigger de un DropdownMenu:
- Empresa, Facturación, Empleados, Mi Perfil → navegan a Settings con el tab correspondiente
- Cerrar sesión → abre AlertDialog de confirmación (botón rojo)

---

## 8. Layout general

- Fondo de toda la app: `bg-background` (blanco)
- NO fondo gris en el área de contenido
- Header de página: solo page title a la izquierda + botón de acción a la derecha (si aplica). Sin subtítulos.
- Separador: `border-b border-border` alineado con el `border-r` del sidebar
- Contenido: `overflow-y-auto` para permitir scroll

---

## 9. Tablas (DataTable con @tanstack/react-table)

### Estilo visual

- **Contenedor**: `border border-border rounded-lg overflow-hidden`
- **thead th**: `text-xs font-medium text-muted-foreground py-3 px-4 border-b border-border`
- **tbody td**: `text-sm text-foreground py-3.5 px-4 border-b border-border`
- **tr hover**: `hover:bg-muted/50`
- **NO** cursor-pointer en filas. NO navegar al hacer click en fila.

### Toolbar

- Input de búsqueda: `h-9 w-64 rounded-lg` con ícono Search. Filtra columna principal con `table.getColumn("campo")?.setFilterValue(value)`.
- Filtro por Estado: DropdownMenu con DropdownMenuCheckboxItem (Vigente, Por vencer, Vencido). Usa `column.setFilterValue()` con array de estados activos.
- NO botón "Ordenar" suelto. El sort se hace desde los headers de columna con `column.getToggleSortingHandler()` e ícono ArrowUpDown.

### Acciones por fila (DropdownMenu)

Todas las tablas (excepto Dashboard y Sistema de Autoprotección) tienen un DropdownMenu con 3 puntos en la última columna:

```
DropdownMenuTrigger: Button variant="ghost" size="icon" className="h-8 w-8"
  ícono: MoreHorizontal h-4 w-4

DropdownMenuContent align="end":
  - Editar (ícono Pencil) → navega a la página de edición
  - Ver PDF (ícono Eye) → abre PDF en nueva pestaña (solo si el módulo tiene PDF)
  - DropdownMenuSeparator
  - Eliminar (ícono Trash2) → className="text-destructive focus:text-destructive"
```

**Dashboard**: no tiene DropdownMenu (solo muestra documentos recientes).
**Sistema de Autoprotección**: usa Collapsible en vez de DropdownMenu (ver sección 15).

### Pagination

Siempre visible debajo de la tabla (incluso con pocos items). Usa Pagination de shadcn.

---

## 10. Cards y contenedores

Un solo estilo: `border border-border rounded-lg bg-background`

- Padding: `p-5` (general) o `p-6` (formularios)
- Sin sombra por defecto
- Stat cards del dashboard: agregan borde y fondo de color (emerald/amber/red)

---

## 11. Formularios

### Estructura visual (actual: hooks custom)

- Formularios van **directamente sobre el fondo blanco**, SIN Card wrapper
- Secciones separadas por `border-t border-border pt-6 mt-6`
- Labels: Label de shadcn (`text-sm font-medium`)
- Inputs: Input de shadcn
- Errores: `text-xs text-destructive` debajo del input
- Header: page title + Button "Guardar" (default) a la derecha
- Botones footer: "Cancelar" (ghost) + "Guardar" / "Actualizar" (default)

### Target futuro: react-hook-form + zod

- Schemas de validación con zod
- Form/FormField/FormItem/FormLabel/FormMessage de shadcn
- Migración gradual, formulario por formulario

---

## 12. Loading

- **Páginas**: Skeleton (bloques `bg-muted rounded-lg animate-pulse`)
- **Variantes**: SkeletonTable (list pages), SkeletonCards (dashboard), SkeletonForm (create/edit)
- **Inline** (botones): Spinner dentro del Button con `loading={true}`
- **NO** spinner de página completa

---

## 13. Toasts (Sonner)

Posición: `bottom-right`. Usar `import { toast } from "sonner"`.

| Tipo | Cuándo | Ejemplo |
|---|---|---|
| `toast.success()` | Crear, guardar, actualizar, eliminar exitoso | `toast.success("Certificado guardado")` |
| `toast.error()` | Errores de cualquier tipo | `toast.error("Error al guardar", { description: error.message })` |
| `toast.info()` | Acciones neutras | `toast.info("Sesión cerrada")` |

### Reglas

- Texto breve: máximo 1 línea de título + 1 línea de descripción opcional
- Usar description solo si aporta información adicional (ej: detalle del error)
- NO usar toast para navegación o redirecciones
- TODA acción del usuario debe tener feedback con toast (éxito o error)
- NO usar alerts nativos del browser ni componentes custom de notificación

---

## 14. AlertDialog (confirmaciones)

Usar para TODA acción irreversible:
- Eliminar cualquier registro
- Cerrar sesión
- Cancelar suscripción

### Estructura

```
AlertDialogContent:
  AlertDialogHeader:
    AlertDialogTitle: "¿[Acción]?"
    AlertDialogDescription: texto explicativo
  AlertDialogFooter:
    AlertDialogCancel: "Cancelar" (o "No, mantener")
    AlertDialogAction: "[Confirmar acción]"
```

### Regla: botón destructivo siempre en rojo

El AlertDialogAction de acciones destructivas SIEMPRE usa:
`className="bg-destructive text-destructive-foreground hover:bg-destructive/90"`

Aplica a: eliminar, cerrar sesión, cancelar suscripción.

---

## 15. Collapsible (filas expandibles)

Usar en tablas donde una fila tiene mucha información para mostrar inline.

**Caso actual**: Sistema de Autoprotección — cada fila se expande para mostrar grid de fechas y botones para ver PDFs.

- Trigger: botón con ChevronDown/ChevronUp en la fila
- Contenido expandido: `bg-muted/30` para diferenciarse
- Acciones (Editar, Eliminar, Ver PDF) van dentro del contenido expandido como botones inline
- NO DropdownMenu en tablas con Collapsible

---

## 16. Empty state

Centrado, sin card, sin borde:

- Ícono: lucide-react `h-10 w-10 text-muted-foreground/50` (muy tenue)
- Título: `text-base font-medium text-foreground`
- Descripción: `text-sm text-muted-foreground`
- Botón de acción opcional: `Button variant="default"`
- Padding: `py-16`

Props del componente: `icon`, `title`, `description`, `actionLabel?`, `onAction?`

---

## 17. Estructura de página

### List page

```
Page title + botón primary arriba a la derecha
Toolbar (búsqueda + filtro estado con DropdownMenuCheckboxItem)
DataTable (border rounded-lg, sort desde headers)
Pagination (siempre visible)
```

### Dashboard

```
Page title (sin subtítulo)
Stat cards grid 4 cols
Toolbar + DataTable + Pagination
```

### Create/Edit

```
Page title + botón "Guardar" arriba a la derecha
Formulario directo sobre fondo blanco (SIN Card wrapper)
Secciones separadas por border-t
Botones: Cancelar (ghost) + Guardar (default)
```

### Auth

```
Centrado vertical y horizontal, fondo bg-muted
Card: border rounded-lg p-8 max-w-md
Inputs shadcn + Button w-full
```

### Settings (accesible desde DropdownMenu del usuario)

```
Page title
Tabs de shadcn
Cada tab en Card rounded-lg p-6
```

---

## 18. Componentes shadcn a usar

Alert, AlertDialog, Badge, Button, Card, Checkbox, Collapsible, DataTable (Table + @tanstack/react-table), Dialog, DropdownMenu, Form (futuro), Input, Label, Pagination, Select, Skeleton, Sonner, Tabs, Textarea, Tooltip

---

## 19. Anti-patterns (NO hacer)

1. NO hardcodear colores de Tailwind
2. NO usar `bg-white` ni `text-black`
3. NO crear componentes custom si shadcn tiene equivalente
4. NO definir status colors locales en cada página
5. NO usar `<input>` HTML nativo
6. NO crear empty states ad-hoc con `<div>`
7. NO usar border-radius distinto a `rounded-lg` (10px)
8. NO crear sombras custom
9. NO mezclar paletas de color
10. NO crear funciones utilitarias locales si ya existen en `lib/utils/`
11. NO inventar tamaños de texto fuera de la escala tipográfica
12. NO crear variantes de botón fuera de las 4 definidas
13. NO usar spinner de página completa
14. NO poner subtítulos debajo del page title
15. NO usar split-pane layout en list pages
16. NO poner fondo gris en el área de contenido
17. NO sidebar con fondo negro
18. NO navegar al hacer click en fila de tabla
19. NO usar alerts nativos del browser
20. NO poner "Configuración" en el sidebar (va en DropdownMenu del usuario)
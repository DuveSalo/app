# Escuela Segura - Interface Design System

## Direction & Feel
Professional safety compliance SaaS. Clean, structured, data-dense. Inspired by Attio/Linear - subtle layering, gray-dominant palette with semantic status colors.

## Depth Strategy
**Borders + subtle shadows.** Cards use `border-gray-200 shadow-sm`. Hover cards use `shadow-card-hover`. No dramatic depth changes.

## Color Palette (Canonical)
- **Text**: `gray-900` (primary), `gray-600` (secondary), `gray-500` (muted), `gray-400` (light/tertiary)
- **Surfaces**: `white` (cards), `gray-50` (subtle bg), `gray-100` (muted bg)
- **Borders**: `gray-200` (default), `gray-100` (subtle dividers), `gray-300` (strong)
- **Status Success**: `emerald-50` bg, `emerald-700` text, `emerald-200/50` border
- **Status Warning**: `amber-50` bg, `amber-700` text, `amber-200/50` border
- **Status Danger**: `red-50` bg, `red-700` text, `red-200/50` border
- **Status Info**: `blue-50` bg, `blue-700` text, `blue-200/50` border
- **Primary/Action**: `gray-900` (buttons, active tabs, focus rings)

## NEVER use
- `slate-*` classes (use `gray-*` always)
- `content-primary/secondary/tertiary` tokens (use `gray-900/500/400`)
- `surface-primary` tokens (use `bg-white`)
- `brand-primary` tokens (use `gray-900`)
- `borderClr-default` tokens (use `border-gray-200`)
- `status-success/error/warning` tokens (use `emerald-600/red-600/amber-600`)
- `border-l-4` alert style (use `rounded-xl` with icon box)
- `bg-*-100` for status badges (use `bg-*-50`)

## Spacing Base
4px (Tailwind default). Cards: `p-4 sm:p-5` or `p-4 sm:p-6`. Sections: `gap-4`. Form fields: `space-y-3` or `space-y-4`.

## Border Radius
- Small elements: `rounded-lg` (8px)
- Cards: `rounded-xl` (14px)
- Large containers: `rounded-2xl` (16px)
- Badges: `rounded-full`

## Typography
- Font: Inter
- Page title: `text-xl sm:text-2xl font-medium tracking-tight text-gray-900`
- Section title: `text-base sm:text-lg font-semibold text-gray-900`
- Table headers: `text-xs font-medium text-gray-500 uppercase tracking-wider`
- Body: `text-sm text-gray-700`
- Labels: `text-sm font-medium text-gray-700`
- Data labels (settings): `text-xs font-medium text-gray-500 uppercase tracking-wide`

## Component Patterns

### Alerts/Messages
```
bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl
Icon: h-8 w-8 rounded-lg bg-emerald-100
```

### Status Badges
```
inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
bg-emerald-50 text-emerald-700 border border-emerald-200/50
```

### Tables
Container: `bg-white rounded-xl border border-gray-200 overflow-hidden`
Header row: `bg-gray-50/50`
Body rows: `hover:bg-gray-50 transition-colors`
Borders: `divide-y divide-gray-100`

### Buttons
Primary: `bg-gray-900 text-white`
Secondary: `bg-gray-100 text-gray-900`
Outline: `border border-gray-200 bg-white`
Danger: `bg-red-600 text-white`

### Tab Navigation
Active: `border-gray-900 text-gray-900`
Inactive: `border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`

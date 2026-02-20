# Visual Consistency Audit — Escuela Segura

## Summary

Full visual audit of all components, pages, and layouts. The app uses **Tailwind CSS 3.4** with **shadcn/ui** base components. The design identity is professional/minimal: gray-dominant palette, Inter font, subtle shadows, semantic status colors (emerald/amber/red/blue).

---

## 1. Typography Inconsistencies

### Page Titles
| Location | Classes | Issue |
|----------|---------|-------|
| PageLayout.tsx | `text-lg sm:text-xl font-semibold tracking-tight text-gray-900` | **Canonical** |
| ErrorBoundary.tsx | `text-2xl font-bold text-gray-900` | Uses `font-bold` instead of `font-semibold` |
| system.md spec | `text-xl sm:text-2xl font-medium tracking-tight text-gray-900` | Spec says `font-medium`, PageLayout uses `font-semibold` |

**Decision:** PageLayout's `text-lg sm:text-xl font-semibold tracking-tight text-gray-900` is used across all pages. Adopt this as canonical. ErrorBoundary is a special case (standalone full-page error) — will align it too.

### Section Headings
| Location | Classes | Issue |
|----------|---------|-------|
| global.css `.section-title` | `text-base sm:text-lg font-semibold text-gray-900` | **Canonical** |
| CompanyInfoSection | `text-lg font-medium text-gray-900` | `font-medium` vs `font-semibold` |
| ProfileSection | `text-base font-semibold text-gray-900` | Missing responsive `sm:text-lg` |
| Card.tsx CardTitle | `text-lg font-semibold leading-none text-gray-900` | Matches but `leading-none` is different |
| ConfirmDialog title | `text-base font-semibold text-gray-900 mb-1` | Uses `text-base` only |

**Decision:** Standardize section headings to `text-base sm:text-lg font-semibold text-gray-900`.

### Sub-section Headings (h3)
Found variations: `text-sm font-semibold text-gray-900`, `text-sm font-semibold text-gray-800`.

**Decision:** Standardize to `text-sm font-semibold text-gray-900`.

### Labels
| Context | Classes | Issue |
|---------|---------|-------|
| Common Input/Select/Textarea | `text-sm font-medium text-gray-700 mb-1.5` | **Used in shared components** |
| Feature form sections | `text-xs font-medium text-gray-500 uppercase tracking-wide mb-1` | **Used for read-only data labels** |

**Decision:** Both are valid but serve different purposes. Form field labels = `text-sm font-medium text-gray-700 mb-1.5`. Read-only data labels = `text-xs font-medium text-gray-500 uppercase tracking-wide mb-1`.

---

## 2. Color Inconsistencies

### Hardcoded Background Colors
| File | Value | Should Be |
|------|-------|-----------|
| MainLayout.tsx | `bg-[#F3F4F6]` | `bg-gray-100` (same color, use Tailwind class) |
| Sidebar.tsx | `bg-[#F3F4F6]` | `bg-gray-100` |

### Border Color Variance
| File | Value | Should Be |
|------|-------|-----------|
| EventInformationListPage | `border-gray-300` | `border-gray-200` |
| SelfProtectionSystemListPage | `border-gray-300` | `border-gray-200` |
| AuditPage pagination | `border-gray-300` | `border-gray-200` |
| All others | `border-gray-200` | **Canonical** |

### Delete Button Color Variance
| File | Value | Should Be |
|------|-------|-----------|
| Most pages | `text-red-500 hover:bg-red-50 hover:text-red-600` | Common pattern |
| QRModuleListPage | `text-red-600 hover:bg-red-50` | Missing hover text change |
| NotificationsPage | `text-gray-400 hover:text-red-600 hover:bg-red-50` | Different starting color |

**Decision:** Standardize to `text-red-600 hover:bg-red-50 hover:text-red-700` per design system (uses red-600 as the status danger default).

### Status Colors (non-standard)
| File | Value | Should Be |
|------|-------|-----------|
| AuditPage stat values | `text-green-600`, `text-blue-600`, `text-purple-600` | `text-emerald-600`, `text-blue-600`, `text-indigo-600` |

**Decision:** Use `emerald` instead of `green`, keep `blue`, use `indigo` instead of `purple`.

---

## 3. Container & Card Inconsistencies

### Table Container Border Radius
| File | Value | Should Be |
|------|-------|-----------|
| FireExtinguisherListPage | `rounded-xl` | **Canonical** |
| ConservationCertificateListPage | `rounded-xl` | OK |
| QRModuleListPage | `rounded-lg` | Should be `rounded-xl` |
| SkeletonLoader cards | `rounded-lg` | Should be `rounded-xl` |

### Card Border Opacity
| File | Value | Should Be |
|------|-------|-----------|
| CreateEditConservationCertificatePage | `border-gray-200/60` | `border-gray-200` (no opacity) |

### Form Container Patterns
| Location | Pattern |
|----------|---------|
| CreateEdit pages | `space-y-5 bg-white rounded-xl border border-gray-200 p-6` |
| Settings sections | `space-y-6` within Card |

**Decision:** Form sections should use `space-y-5` or `space-y-6` consistently. Adopt `space-y-6` for main sections, `space-y-4` for fields within sections.

---

## 4. Button Action Row Spacing

| File | Pattern | Should Be |
|------|---------|-----------|
| Most list pages | `flex gap-0.5` or `flex items-center gap-0.5` | **Canonical** |
| QRModuleListPage | `flex space-x-1` | Should use `gap-1` (consistent with flex gap pattern) |

**Decision:** Standardize to `flex items-center gap-1`.

---

## 5. Component Usage Gaps

### Hardcoded Badges Instead of StatusBadge
- **EventInformationListPage**: Uses inline `className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200"` instead of StatusBadge component.
- **NotificationsPage**: Hardcoded type badge styles dict instead of shared component.

### Duplicate Spinner Components
- `Spinner.tsx` — Full-featured with variants (xs-xl sizes, color variants, Page/Inline/Overlay)
- `LoadingSpinner.tsx` — Simpler, uses Lucide Loader2 icon
- `SpinnerPage.tsx` — Simple full-page wrapper around LoadingSpinner

**Decision:** Keep all three as they serve different purposes, but ensure visual consistency between them.

### AuditPage Stat Cards
AuditPage uses raw `Card` component + inline stat rendering. DashboardPage uses dedicated `StatCard` component. These should use the same pattern.

---

## 6. Sidebar & Navigation

### Sidebar Section Title Font Size
- Uses `text-[11px]` (hardcoded arbitrary value)
- MobileNav uses `text-xs` for equivalent labels

**Decision:** Standardize to `text-xs` (12px) for section labels.

### User Profile Name Truncation
- Sidebar uses `max-w-[120px]` hardcoded truncation
- This is acceptable but noted as a hardcoded value.

### Active Nav State Inconsistency
| Component | Active State | Inactive Hover |
|-----------|-------------|----------------|
| Sidebar main nav | `bg-white shadow-sm` | `hover:bg-white/50` |
| Sidebar service nav | `bg-gray-100` | `hover:bg-gray-50` |
| MobileNav | `bg-gray-100` | `hover:bg-gray-50` |

**Decision:** Sidebar main nav should match: active = `bg-white shadow-sm`, inactive hover = `hover:bg-gray-50`. Service nav active should also use `bg-white shadow-sm` for consistency.

---

## 7. Skeleton Loader

### Card Styling
- Uses `rounded-lg` for cards — should be `rounded-xl` to match Card component.
- Uses `shadow-sm` — consistent.
- Uses `border-gray-200` — consistent.

---

## 8. Settings Page Tabs vs Tabs Component

SettingsPage has **inline tab implementation** instead of using the shared `Tabs` component. The styles are similar but have minor spacing differences:
- Settings: `space-x-2 sm:space-x-6`
- Tabs component: `gap-1 sm:gap-6`

**Decision:** Ideally refactor SettingsPage to use shared Tabs component. For this audit, will align the inline styles.

---

## Changes to Implement (Priority Order)

1. **Hardcoded colors** → Replace `bg-[#F3F4F6]` with `bg-gray-100`
2. **Border standardization** → All table/card borders to `border-gray-200`
3. **Typography alignment** → Unify section heading weights and sizes
4. **Container radius** → All cards/tables to `rounded-xl`
5. **Delete button colors** → Standardize to `text-red-600`
6. **Action button spacing** → Standardize to `flex items-center gap-1`
7. **Skeleton loader** → Update `rounded-lg` to `rounded-xl`
8. **Status colors** → `green` → `emerald`, `purple` → `indigo`
9. **Sidebar section labels** → `text-[11px]` → `text-xs`
10. **Global CSS utility classes** → Add consistent typography classes

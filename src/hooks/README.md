# Custom Hooks

Esta carpeta contiene custom hooks reutilizables para la aplicación.

## Ejemplos de hooks útiles para implementar:

- `useDebounce.ts` - Debounce para búsquedas
- `useLocalStorage.ts` - Persistencia local
- `useAsync.ts` - Manejo de async operations
- `useMediaQuery.ts` - Responsive design
- `useClickOutside.ts` - Detectar clicks fuera de elementos

## Uso:

```typescript
import { useDebounce } from '@/hooks/useDebounce';

const debouncedValue = useDebounce(searchValue, 500);
```

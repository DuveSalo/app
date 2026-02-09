# Auditoria de Buenas Practicas - SafetyGuard Pro

Este documento analiza el cumplimiento de buenas practicas para cada tecnologia utilizada en el proyecto, basado en la documentacion oficial de Context7.

---

## Resumen Ejecutivo

| Tecnologia | Estado | Puntuacion |
|------------|--------|------------|
| React 19 | Bueno | 8/10 |
| TypeScript 5.8 | Mejorable | 6/10 |
| Vite 6.2 | Bueno | 8/10 |
| Supabase | Excelente | 9/10 |
| Tailwind CSS | Excelente | 9/10 |

---

## 1. React 19

### Lo que se hace bien

- **Uso correcto de useEffect**: Los efectos tienen arrays de dependencias correctos y funciones de limpieza donde es necesario.
  ```tsx
  // AuthContext.tsx:60-62 - Correcto
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);
  ```

- **useCallback para funciones estables**: Se usa correctamente para evitar re-renders innecesarios.
  ```tsx
  // AuthContext.tsx:36 - Correcto
  const fetchInitialData = useCallback(async () => { ... }, []);
  ```

- **useMemo para calculos costosos**: Se utiliza apropiadamente en DashboardPage.
  ```tsx
  // DashboardPage.tsx:121 - Correcto
  const filteredAndSortedItems = useMemo(() => { ... }, [items, searchQuery, sortBy, filterStatus, filterType]);
  ```

- **Contexto bien estructurado**: AuthContext sigue el patron recomendado de React.

### Mejoras recomendadas

#### 1.1 Prevenir race conditions en fetching de datos

**Problema**: En `DashboardPage.tsx:50-119`, no se maneja el caso de race conditions cuando el componente se desmonta durante una peticion.

**Solucion**:
```tsx
useEffect(() => {
  let ignore = false;

  const fetchItems = async () => {
    if (!currentCompany) return;
    setIsLoading(true);

    try {
      const [certsData, systemsData, qrDocs] = await Promise.all([
        api.getCertificates(currentCompany.id),
        api.getSelfProtectionSystems(currentCompany.id),
        api.getAllQRDocuments(currentCompany.id)
      ]);

      if (!ignore) {
        // ... procesar datos y setItems
        setIsLoading(false);
      }
    } catch (err) {
      if (!ignore) {
        logger.error("Error fetching dashboard data", err);
        setIsLoading(false);
      }
    }
  };

  fetchItems();

  return () => {
    ignore = true;
  };
}, [currentCompany]);
```

#### 1.2 Separar efectos por proposito

**Problema**: En `AuthContext.tsx`, el estado de carga se maneja de forma acoplada en multiples funciones.

**Solucion**: Considerar usar un custom hook `useAsyncState` para manejar loading/error de forma consistente:
```tsx
// hooks/useAsyncState.ts
function useAsyncState<T>(asyncFn: () => Promise<T>) {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({ data: null, loading: true, error: null });

  // ... implementacion
}
```

#### 1.3 Considerar React Query o SWR

Para el manejo de datos del servidor, considerar migrar a una biblioteca como React Query o SWR que maneja automaticamente:
- Caching
- Revalidacion
- Race conditions
- Estados de carga/error

---

## 2. TypeScript 5.8

### Lo que se hace bien

- **Tipos bien definidos**: Los tipos en `src/types/` estan bien organizados.
- **Enums para valores constantes**: Uso correcto de enums (`ExtinguisherType`, `QRDocumentType`).
- **Interfaces para objetos**: Uso consistente de interfaces.

### Mejoras recomendadas

#### 2.1 Habilitar strict mode completo

**Problema**: El `tsconfig.json` no tiene habilitado el modo estricto completo.

**Solucion**: Agregar las siguientes opciones:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

#### 2.2 Usar readonly para inmutabilidad

**Problema**: Los tipos no usan `readonly` para propiedades que no deben mutarse.

**Solucion**: En `src/types/company.ts`:
```tsx
// Antes
export interface Company {
  id: string;
  name: string;
  // ...
}

// Despues
export interface Company {
  readonly id: string;
  readonly userId: string;
  name: string;
  // ... propiedades mutables sin readonly
}
```

#### 2.3 Usar tipos literales en lugar de strings genericos

**Problema**: En `fire-extinguisher.ts:47-58`, se usan strings literales directamente.

**Solucion**: Crear un tipo union reutilizable:
```tsx
// Antes
visibilityObstructed: 'Si' | 'No';
signageFloor: 'Si' | 'No' | 'N/A';

// Despues
type YesNo = 'Si' | 'No';
type YesNoNA = 'Si' | 'No' | 'N/A';

visibilityObstructed: YesNo;
signageFloor: YesNoNA;
```

#### 2.4 Usar satisfies para validacion de tipos

```tsx
// Para constantes que deben cumplir un tipo
const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'valid', label: 'Vigente' },
] as const satisfies readonly { value: string; label: string }[];
```

---

## 3. Vite 6.2

### Lo que se hace bien

- **Variables de entorno con prefijo VITE_**: Correcto uso del prefijo.
- **loadEnv para configuracion**: Se usa correctamente en `vite.config.ts`.
- **Path aliases configurados**: El alias `@/*` esta bien configurado.

### Mejoras recomendadas

#### 3.1 Agregar build optimizations

**Solucion**: Actualizar `vite.config.ts`:
```ts
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    },
    // AGREGAR: Optimizaciones de build
    build: {
      target: 'es2022',
      minify: 'esbuild',
      sourcemap: mode !== 'production',
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-supabase': ['@supabase/supabase-js'],
            'vendor-ui': ['lucide-react', '@radix-ui/react-dialog'],
          }
        }
      }
    },
    // AGREGAR: Optimizaciones para dependencias
    optimizeDeps: {
      include: ['react', 'react-dom', '@supabase/supabase-js']
    }
  };
});
```

#### 3.2 Crear archivos .env por ambiente

**Solucion**: Crear los siguientes archivos:
- `.env.development` - Variables para desarrollo
- `.env.staging` - Variables para staging
- `.env.production` - Variables para produccion

```bash
# .env.production
VITE_SUPABASE_URL=https://production.supabase.co
VITE_SUPABASE_ANON_KEY=production_key
```

#### 3.3 Validar variables de entorno al inicio

**Solucion**: Crear `src/lib/env.ts`:
```ts
import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_GEMINI_API_KEY: z.string().optional(),
});

export const env = envSchema.parse({
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  VITE_GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
});
```

---

## 4. Supabase

### Lo que se hace bien

- **Row Level Security (RLS)**: Excelente implementacion en todas las tablas.
  ```sql
  -- fire_extinguishers migration - Correcto
  ALTER TABLE fire_extinguishers ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Users can view their company's fire extinguishers"
    ON fire_extinguishers FOR SELECT
    USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));
  ```

- **Tipos generados automaticamente**: Se usa `Database` type del archivo auto-generado.
- **Cliente tipado**: El cliente Supabase esta correctamente tipado.
  ```ts
  export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {...});
  ```

- **Validacion de variables de entorno**: Se valida que existan antes de crear el cliente.
- **Indices en columnas frecuentes**: Se crean indices para optimizar queries.
- **Triggers para updated_at**: Automatizacion correcta de timestamps.

### Mejoras recomendadas

#### 4.1 Usar PKCE flow para mayor seguridad

**Solucion**: Actualizar `src/lib/supabase/client.ts`:
```ts
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce' // AGREGAR: Usar PKCE para mayor seguridad
  }
});
```

#### 4.2 Implementar manejo de errores centralizado

**Solucion**: Crear un wrapper para queries:
```ts
// lib/supabase/query.ts
export async function safeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: Error | null }>
): Promise<T> {
  const { data, error } = await queryFn();

  if (error) {
    // Log del error
    logger.error('Supabase query error', error);

    // Transformar a error de aplicacion
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Recurso no encontrado');
    }
    // ... mas casos

    throw new DatabaseError(error.message);
  }

  if (!data) {
    throw new NotFoundError('Recurso no encontrado');
  }

  return data;
}
```

#### 4.3 Agregar indices compuestos para queries comunes

```sql
-- Para queries de dashboard que filtran por company_id y fechas
CREATE INDEX IF NOT EXISTS idx_certificates_company_expiration
ON conservation_certificates(company_id, expiration_date);

CREATE INDEX IF NOT EXISTS idx_systems_company_expiration
ON self_protection_systems(company_id, expiration_date);
```

---

## 5. Tailwind CSS

### Lo que se hace bien

- **Design system semantico**: Excelente uso de colores semanticos (`content`, `surface`, `status`).
- **Tema extendido correctamente**: Se usa `theme.extend` en lugar de sobrescribir.
- **Animaciones personalizadas**: Bien definidas y con buenos timings.
- **Sombras consistentes**: Sistema de sombras bien pensado.
- **Plugin tailwindcss-animate**: Integrado correctamente.

### Mejoras recomendadas

#### 5.1 Documentar el design system

**Solucion**: Crear `src/styles/design-tokens.md` con la documentacion:
```md
# Design Tokens

## Colores
- `content-*`: Colores para texto
- `surface-*`: Colores para fondos
- `status-*`: Colores para estados (success, warning, danger, info)

## Uso
- Texto principal: `text-content`
- Texto secundario: `text-content-secondary`
- Fondo de tarjeta: `bg-surface-card`
```

#### 5.2 Crear clases utilitarias compuestas

**Solucion**: Agregar a `tailwind.config.js` o crear componentes:
```js
// En un archivo CSS
@layer components {
  .card-base {
    @apply bg-surface-card border border-borderClr rounded-xl shadow-card;
  }

  .btn-primary {
    @apply bg-brand text-content-inverse px-4 py-2 rounded-lg
           hover:bg-brand-700 transition-colors;
  }
}
```

#### 5.3 Purge de CSS mas agresivo

**Solucion**: Verificar que el content de Tailwind incluya todos los archivos:
```js
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
  // Si usas componentes de librerias externas
  "./node_modules/@your-ui-lib/**/*.{js,ts,jsx,tsx}",
],
```

---

## Resumen de Acciones Prioritarias

### Alta Prioridad
1. [ ] Habilitar modo estricto de TypeScript (`strict: true`)
2. [ ] Agregar prevencion de race conditions en useEffect
3. [ ] Habilitar PKCE flow en Supabase
4. [ ] Validar variables de entorno con zod

### Media Prioridad
5. [ ] Configurar optimizaciones de build en Vite
6. [ ] Usar readonly en interfaces donde corresponda
7. [ ] Crear indices compuestos en Supabase
8. [ ] Documentar el design system de Tailwind

### Baja Prioridad
9. [ ] Considerar React Query para data fetching
10. [ ] Crear utilidades CSS compuestas
11. [ ] Implementar wrapper de queries Supabase
12. [ ] Crear archivos .env por ambiente

---

## Comandos para Implementar Mejoras

```bash
# 1. Instalar zod para validacion de env
npm install zod

# 2. Regenerar tipos de Supabase
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts

# 3. Verificar errores de TypeScript tras activar strict
npx tsc --noEmit
```

---

*Documento generado el 29/01/2026*
*Basado en documentacion oficial de Context7*

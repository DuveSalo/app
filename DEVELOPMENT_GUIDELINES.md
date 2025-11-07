# Directrices de Desarrollo - SafetyGuard Pro

Este documento establece las mejores prácticas y directrices para el desarrollo de SafetyGuard Pro.

## 📋 Principios Fundamentales

### 1. Formato de Código
- **Usa siempre 2 espacios** para indentación (no tabs)
- El proyecto incluye `.editorconfig` y `.prettierrc` para mantener consistencia automática
- Los editores compatibles aplicarán estas reglas automáticamente

### 2. Simplicidad Ante Todo
- Prioriza **siempre soluciones simples** sobre complejas
- Si una solución requiere mucha configuración o dependencias nuevas, reconsidera el enfoque
- Pregunta: "¿Hay una forma más simple de hacer esto?"

### 3. Gestión del Servidor de Desarrollo

**Cuando realices cambios:**
- Vite tiene Hot Module Replacement (HMR), pero algunos cambios requieren reinicio completo
- Si ves comportamiento extraño, reinicia el servidor

**Antes de iniciar un nuevo servidor:**
```bash
# En Windows (PowerShell/CMD)
taskkill /F /IM node.exe

# O busca el proceso específico
netstat -ano | findstr :5173
taskkill /F /PID <PID>
```

**Luego inicia limpiamente:**
```bash
npm run dev
```

### 4. Reutilización de Código

**SIEMPRE busca código existente antes de crear nuevo:**

1. **Componentes comunes** → `src/components/common/`
2. **Hooks personalizados** → `src/hooks/`
3. **Utilidades** → `src/lib/utils/`
4. **Tipos** → `src/types/`
5. **Constantes** → `src/constants/`

**Usa la búsqueda del proyecto:**
```bash
# Buscar implementaciones similares
grep -r "functionName" src/
```

### 5. Evitar Duplicación de Código

**Antes de escribir código:**
1. ¿Ya existe esta funcionalidad en otro componente?
2. ¿Puedo extraer lógica compartida a un hook personalizado?
3. ¿Puedo crear un componente reutilizable?

**Patrón DRY (Don't Repeat Yourself):**
```typescript
// ❌ MALO - Duplicación
function ComponentA() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData);
  }, []);
  // ...
}

function ComponentB() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData);
  }, []);
  // ...
}

// ✅ BUENO - Hook reutilizable
function useData() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData);
  }, []);
  return data;
}

function ComponentA() {
  const data = useData();
  // ...
}
```

### 6. Entornos de Ejecución

El código debe considerar diferentes entornos:

**Variables de entorno:**
```typescript
// Usa import.meta.env en Vite
const apiUrl = import.meta.env.VITE_API_URL;
const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;
```

**Configuración por entorno:**
- Desarrollo: `.env.local` (no committear)
- Producción: Variables de entorno en el hosting
- Ejemplo: `.env.example` como plantilla

### 7. Cambios Controlados

**Haz SOLO los cambios solicitados:**
- No refactorices código no relacionado "porque sí"
- No agregues features no solicitadas
- Si ves oportunidades de mejora, coméntalas primero

**Excepciones permitidas:**
- Correcciones de errores evidentes (typos, bugs claros)
- Actualizaciones de imports cuando cambias nombres
- Ajustes de formato automáticos (Prettier)

### 8. Corrección de Bugs

**Antes de introducir nuevos patrones o tecnologías:**

1. ✅ Revisa la implementación actual
2. ✅ Intenta resolver con herramientas/patrones existentes
3. ✅ Consulta si una nueva dependencia es realmente necesaria
4. ❌ No agregues librerías sin evaluar alternativas

**Ejemplo:**
```typescript
// ❌ MALO - Agregar una librería nueva sin evaluar
import _ from 'lodash'; // +70KB solo para esto
const unique = _.uniq(array);

// ✅ BUENO - Usar JavaScript nativo
const unique = [...new Set(array)];
```

## 🛠️ Herramientas de Desarrollo

### Scripts Disponibles
```bash
npm run dev      # Servidor de desarrollo (puerto 5173)
npm run build    # Build de producción
npm run preview  # Vista previa del build
```

### Extensiones Recomendadas (VS Code)
- EditorConfig for VS Code
- Prettier - Code formatter
- ESLint
- TypeScript and JavaScript Language Features

## 📁 Estructura del Proyecto

```
src/
├── components/common/  → Componentes reutilizables
├── features/          → Módulos de funcionalidad
├── hooks/             → Custom hooks
├── lib/               → Utilidades y APIs
├── types/             → TypeScript types
└── constants/         → Configuración y constantes
```

### Imports Organizados

Usa path aliases configurados en `tsconfig.json`:
```typescript
// ✅ BUENO
import { Button } from '@/components/common';
import { supabase } from '@/lib/supabase/client';

// ❌ EVITAR
import { Button } from '../../../components/common/Button';
```

## 🔍 Checklist Antes de Commit

- [ ] ¿El código sigue el estilo de 2 espacios?
- [ ] ¿Reutilicé código existente cuando fue posible?
- [ ] ¿Evité duplicación innecesaria?
- [ ] ¿Los cambios están relacionados con la tarea?
- [ ] ¿Probé en el servidor de desarrollo?
- [ ] ¿Consideré diferentes entornos (dev/prod)?

## 📚 Recursos

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- Documentación del proyecto: `docs/`

---

**Recuerda:** Estas directrices existen para mantener el código limpio, consistente y fácil de mantener. Cuando tengas dudas, pregunta antes de implementar.

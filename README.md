# SafetyGuard Pro

Aplicación web de gestión de conservación y sistemas de autoprotección desarrollada con React, TypeScript, Vite y Supabase.

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- Cuenta de Supabase (para backend)
- API Key de Google Gemini (para funcionalidades de IA)

### Instalación

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**

   Crea un archivo `.env.local` basado en `.env.example`:
   ```bash
   VITE_SUPABASE_URL=tu_supabase_url
   VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
   VITE_GEMINI_API_KEY=tu_gemini_api_key
   ```

3. **Configurar base de datos:**

   Ejecuta los scripts SQL en tu proyecto de Supabase:
   - `docs/supabase-schema.sql`
   - `docs/supabase-migration-conservation-certificates.sql`

4. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

   La aplicación estará disponible en `http://localhost:5173`

## 📜 Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run preview  # Vista previa del build
npm run format   # Formatear código con Prettier
```

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── common/          # Componentes reutilizables (Button, Card, Input, etc.)
│   └── layout/          # Layouts de la aplicación
├── features/            # Módulos por funcionalidad
│   ├── auth/           # Autenticación y gestión de usuarios
│   ├── conservation-certificates/
│   ├── self-protection-systems/
│   ├── qr/             # Módulos QR (ascensores, calentadores, etc.)
│   ├── event-information/
│   └── settings/
├── hooks/              # Custom hooks de React
├── lib/
│   ├── api/           # Llamadas a Supabase
│   ├── supabase/      # Cliente y tipos de Supabase
│   └── utils/         # Utilidades y validaciones
├── types/             # TypeScript types organizados por dominio
├── constants/         # Constantes, rutas y configuración
└── App.tsx           # Componente raíz
```

## 🛠️ Tecnologías

- **Frontend:** React 19 + TypeScript
- **Build Tool:** Vite 6
- **Routing:** React Router DOM 7
- **Backend:** Supabase (PostgreSQL + Auth)
- **UI Icons:** Lucide React
- **PDF Generation:** jsPDF + jsPDF-AutoTable
- **IA:** Google Gemini

## 📖 Documentación

- **[Directrices de Desarrollo](./DEVELOPMENT_GUIDELINES.md)** - Mejores prácticas y guías de código
- **[Configuración MCP](./MCP_SETUP.md)** - Integración con Model Context Protocol de Supabase
- **[Notificaciones por Email](./EMAIL_NOTIFICATIONS_SETUP.md)** - Sistema automático de emails para vencimientos
- **[Resumen de Refactorización](./REFACTOR_SUMMARY.md)** - Historial de cambios estructurales
- **[Configuración de Supabase](./docs/SUPABASE-CONFIG.md)** - Guía de configuración del backend
- **[Esquema de Base de Datos](./docs/supabase-schema.sql)** - Schema completo

## 🎯 Características Principales

- ✅ Autenticación y gestión de usuarios
- ✅ Gestión de empresas y empleados
- ✅ Certificados de conservación
- ✅ Sistemas de autoprotección
- ✅ Módulos QR (ascensores, calentadores, sistemas contra incendios, etc.)
- ✅ Información de eventos
- ✅ Generación de reportes PDF
- ✅ Integración con IA (Google Gemini)
- ✅ MCP de Supabase - Consultas a base de datos con lenguaje natural
- ✅ **Notificaciones automáticas por email** - Alertas 30 días antes del vencimiento de servicios

## 🔒 Configuración de EditorConfig y Prettier

El proyecto incluye configuración automática de formato:
- **2 espacios** para indentación
- **LF** para fin de línea
- **UTF-8** encoding

Los editores compatibles aplicarán estas reglas automáticamente.

## 🤝 Contribución

Antes de contribuir, lee las [Directrices de Desarrollo](./DEVELOPMENT_GUIDELINES.md) para mantener la consistencia del código.

## 📝 Licencia

Proyecto privado - Todos los derechos reservados

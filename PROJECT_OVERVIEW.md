# SafetyGuard Pro - Documentación del Proyecto

## Propósito del Proyecto
SafetyGuard Pro es una plataforma integral de gestión de seguridad, mantenimiento y cumplimiento normativo diseñada para edificios, empresas e instalaciones industriales. Su objetivo principal es centralizar y digitalizar el seguimiento de elementos críticos de seguridad (como extintores, ascensores, sistemas eléctricos) y facilitar el acceso a su documentación y estado de mantenimiento, posiblemente mediante el uso de códigos QR.

El sistema permite a los administradores llevar un control riguroso de vencimientos, inspecciones y certificaciones, asegurando que las instalaciones cumplan con las normativas vigentes.

## Características Principales

### 1. Gestión de Seguridad y Cumplimiento
El núcleo de la aplicación se centra en módulos específicos para diferentes tipos de instalaciones y equipos:

*   **Certificados de Conservación**: Gestión de certificaciones obligatorias del edificio.
*   **Sistemas de Autoprotección**: Registro y seguimiento de planes y sistemas de autoprotección.
*   **Seguridad contra Incendios**:
    *   Gestión detallada de **Extintores** (inventario, vencimientos, ubicación).
    *   Sistemas de detección de incendios.
    *   Sistemas generales de seguridad contra incendios.

### 2. Módulos de Mantenimiento con QR
La aplicación incluye un sistema dinámico para la gestión de equipos que requieren inspecciones periódicas, permitiendo asociar documentación accesible (probablemente vía QR). Los módulos incluyen:
*   **Elevadores (Ascensores)**
*   **Termotanques / Calderas**
*   **Instalaciones Eléctricas**
*   **Sistemas de Detección**

### 3. Gestión de Eventos e Información
*   **Información de Eventos**: Registro de sucesos relevantes o inspecciones.
*   **Notificaciones**: Sistema para alertar sobre vencimientos o tareas pendientes.

### 4. Funcionalidades en Desarrollo (Placeholders)
El sistema está escalando para incluir:
*   Tanques de Agua.
*   Especies Vegetales (probablemente para control de plagas o mantenimiento de espacios verdes).
*   Sanitización.

### 5. Plataforma y Administración
*   **Dashboard**: Panel de control general para visualizar el estado de la seguridad.
*   **Multi-empresa / Gestión de Compañías**: Flujo de onboarding para crear perfil de empresa.
*   **Suscripciones**: Gestión de planes de servicio.
*   **Autenticación Robusta**: Registro, inicio de sesión y recuperación de contraseñas seguros.

## Stack Tecnológico

### Frontend
*   **Framework**: React 19 con Vite.
*   **Lenguaje**: TypeScript.
*   **Estilos**: Tailwind CSS con componentes de Radix UI (shadcn/ui probablemente) para una interfaz moderna y accesible. `lucide-react` para iconos.
*   **Ruteo**: React Router v7 con carga perezosa (Lazy Loading) para optimizar el rendimiento.

### Backend y Servicios
*   **Borg/Database**: Supabase (Baza de datos PostgreSQL, Autenticación y Almacenamiento).
*   **Inteligencia Artificial**: Integración con Google GenAI (Gemini) para funcionalidades avanzadas (posiblemente análisis de documentos o asistencia).

### Utilidades
*   **Reportes**: Generación de PDFs con `jspdf`.
*   **Calidad de Código**: ESLint, Prettier, Vitest para pruebas unitarias.

## Cómo Funciona

1.  **Inicio**: Los usuarios se autentican o registran su empresa.
2.  **Configuración**: Configuran los detalles de su instalación en el Dashboard.
3.  **Gestión Diaria**:
    *   Los técnicos o administradores cargan información sobre nuevos extintores, certificados o sistemas.
    *   Se suben documentos digitales (PDFs, imágenes) asociados a cada equipo.
    *   El sistema monitorea fechas de vencimiento y estado.
4.  **Verificación**: A través de módulos QR, se puede acceder rápidamente a la información de cumplimiento de un activo específico (como un ascensor o un extintor).

## Estructura del Proyecto (`src`)
*   `/features`: Contiene la lógica de negocio dividida por dominios (auth, dashboard, extintores, qr, etc.).
*   `/components`: Componentes reutilizables de UI.
*   `/routes`: Configuración de navegación y protección de rutas.
*   `/lib`: Utilidades y configuraciones de clientes externos (Supabase, API clients).

# Configuración MCP (Model Context Protocol) - SafetyGuard Pro

## ¿Qué es MCP?

El **Model Context Protocol (MCP)** es un protocolo desarrollado por Anthropic que permite a Claude Code conectarse directamente con servicios externos como Supabase, GitHub, bases de datos PostgreSQL, y más.

## ✅ MCP de Supabase Configurado

Este proyecto ya tiene configurado el MCP de Supabase en el archivo `.mcp.json`.

### ¿Qué puedes hacer con el MCP de Supabase?

- 🔍 **Consultar tu base de datos** usando lenguaje natural
- 📊 **Crear y modificar tablas** sin escribir SQL
- 🔄 **Generar migraciones** automáticamente
- 📝 **Ejecutar queries SQL** con asistencia de IA
- ⚙️ **Gestionar configuraciones** de tu proyecto Supabase
- 🐛 **Revisar logs** para debugging

## 🔐 Autenticación

### Primera vez usando MCP de Supabase

1. **Inicia Claude Code** en este proyecto
2. **Ejecuta el comando:** `/mcp`
3. **Se abrirá tu navegador** para autenticarte con Supabase
4. **Selecciona tu organización** y proyecto
5. Claude Code guardará el token automáticamente

### Reconectar o cambiar de proyecto

Si necesitas cambiar de proyecto o reconectarte:
```bash
/mcp
```

## ⚠️ Mejores Prácticas de Seguridad

### 🚫 NO uses MCP en producción

**IMPORTANTE:** El MCP de Supabase debe usarse SOLO con proyectos de desarrollo:

- ❌ **Nunca** conectes tu base de datos de producción
- ✅ **Usa** un proyecto de desarrollo/staging separado
- ✅ **Considera** usar modo read-only si tienes datos reales

### 🔒 Modo Read-Only (Opcional)

Si necesitas trabajar con datos reales pero quieres prevenir cambios accidentales, puedes configurar el servidor en modo read-only:

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp",
      "readOnly": true
    }
  }
}
```

## 🎯 Ejemplos de Uso

Una vez autenticado, puedes usar Claude Code para:

### Consultar datos
```
"Muéstrame todos los usuarios registrados en los últimos 7 días"
"¿Cuántos certificados de conservación hay por estado?"
"Lista los sistemas de autoprotección que vencen este mes"
```

### Crear tablas
```
"Crea una tabla para almacenar notificaciones con título, mensaje, usuario_id y fecha"
```

### Generar migraciones
```
"Agrega una columna 'prioridad' a la tabla event_information"
"Crea un índice en la columna email de la tabla users"
```

### Revisar estructura
```
"¿Qué columnas tiene la tabla companies?"
"Muéstrame el esquema completo de conservation_certificates"
```

## 📁 Archivos de Configuración

### `.mcp.json`
Contiene la configuración del servidor MCP. Este archivo está incluido en el repositorio porque solo contiene información pública (URL del servidor).

**Ubicación:** Raíz del proyecto
**Compartible:** ✅ Sí (no contiene secretos)
**Control de versiones:** ✅ Incluido en Git

### Tokens de autenticación
Los tokens OAuth se almacenan de forma segura por Claude Code y **no** están en el proyecto.

**Ubicación:** Configuración local de Claude Code
**Compartible:** ❌ No (privados)
**Control de versiones:** ❌ Nunca se commitean

## 🔄 Desinstalar o Desactivar

### Desactivar temporalmente
Renombra o elimina `.mcp.json`:
```bash
mv .mcp.json .mcp.json.backup
```

### Eliminar configuración completa
```bash
# Eliminar del proyecto
rm .mcp.json

# Revocar autenticación (en Claude Code)
/mcp revoke supabase
```

## 🌐 MCP Servidor Local (Opcional)

Si estás ejecutando Supabase localmente con Supabase CLI, puedes usar el servidor MCP local:

```json
{
  "mcpServers": {
    "supabase-local": {
      "type": "http",
      "url": "http://localhost:54321/mcp"
    }
  }
}
```

**Nota:** El servidor local tiene un subconjunto limitado de herramientas comparado con el servidor remoto.

## 📚 Recursos Adicionales

- [Documentación oficial de Supabase MCP](https://supabase.com/docs/guides/getting-started/mcp)
- [Guía MCP de Claude Code](https://docs.claude.com/en/docs/claude-code/mcp.md)
- [Repositorio GitHub de Supabase MCP](https://github.com/supabase-community/supabase-mcp)

## 🆘 Troubleshooting

### Error: "No se puede conectar al servidor MCP"
1. Verifica tu conexión a internet
2. Confirma que la URL es correcta: `https://mcp.supabase.com/mcp`
3. Intenta reconectar con `/mcp`

### Error: "Token expirado"
```bash
/mcp
```
Esto te pedirá que te re-autentiques.

### Error: "Acceso denegado"
Verifica que:
- Tienes permisos en la organización de Supabase
- El proyecto seleccionado es el correcto
- Tu cuenta de Supabase está activa

---

**Última actualización:** Octubre 2025
**Versión MCP:** HTTP Transport con OAuth 2.0

# Configuración de Supabase para SafetyGuard Pro

## ✅ Configuración de Email (ACTIVADO)

La aplicación tiene **confirmación de email ACTIVADA** para mayor seguridad. Esta es la configuración correcta.

### 1. Configurar URLs de Redirect (IMPORTANTE)

1. **Ve a tu proyecto de Supabase**: https://supabase.com/dashboard

2. **Project Settings → Authentication → URL Configuration**:
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: Agrega estas URLs (una por línea):
     - `http://localhost:3000/**`
     - `http://localhost:3000/create-company`
     - `http://localhost:3000/create-company/**`

   ⚠️ **MUY IMPORTANTE**: Sin estas URLs configuradas, el flujo de confirmación de email NO funcionará correctamente.

### 2. Verificar Configuración de Email

1. **Authentication → Email Templates**:
   - Verifica que las plantillas estén configuradas
   - Puedes personalizarlas según tu marca

2. **Authentication → Providers → Email**:
   - **"Confirm email" debe estar ACTIVADO** ✅
   - Esto es importante para seguridad y prevenir spam

### 3. Flujo de Registro Correcto (NUEVO)

Cuando un usuario se registre en SafetyGuard Pro:

1. **Paso 1 - Registro**: El usuario completa el formulario de registro
2. **Paso 2 - Email enviado**: Supabase envía automáticamente un email de confirmación
3. **Paso 3 - Pantalla de instrucciones**: La aplicación muestra instrucciones claras para confirmar el email
4. **Paso 4 - Usuario verifica**: El usuario revisa su bandeja de entrada (o carpeta de spam) y hace clic en el enlace de confirmación
5. **Paso 5 - Redirección automática**: Al confirmar el email, Supabase redirige DIRECTAMENTE a "Crear Empresa"
6. **Paso 6 - Mensaje de confirmación**: Aparece un mensaje verde confirmando que el email fue verificado
7. **Paso 7 - Crear empresa**: El usuario completa el formulario de empresa
8. **Paso 8 - Suscripción**: Después de crear la empresa, va a la página de suscripción
9. **Paso 9 - Dashboard**: Una vez completada la suscripción, accede al dashboard completo

### 4. Comportamiento Esperado

**Para usuarios nuevos (registro completo):**
```
Registro → Email de confirmación →
Confirmar email → Crear Empresa (automático) →
Suscripción → Dashboard
```

**Para usuarios existentes (login):**
```
Login → Dashboard (si ya tiene empresa y suscripción)
```

**IMPORTANTE**: El usuario **NO necesita hacer login** después de confirmar su email. Supabase crea la sesión automáticamente al confirmar.

---

## 📧 Para Producción

Cuando vayas a producción, considera estos pasos adicionales:

1. **Configurar un proveedor de email profesional** (SMTP, SendGrid, AWS SES, etc.)
   - Por defecto, Supabase usa su propio servicio de email limitado
   - Para producción, es mejor usar tu propio proveedor

2. **Personalizar las plantillas de email**
   - Ve a: Authentication → Email Templates
   - Añade tu logo y branding
   - Personaliza los mensajes según tu marca

3. **Configurar dominio personalizado**
   - Actualiza el Site URL a tu dominio de producción
   - Actualiza las Redirect URLs

---

## 🔐 Configuración de Reset de Contraseña (Recomendado)

Para permitir a los usuarios recuperar su contraseña:

1. Ve a **Authentication → URL Configuration**
2. Agrega tu URL de reset: `http://localhost:3000/reset-password`
   - En producción: `https://tudominio.com/reset-password`

---

## ✅ Verificación del Flujo Completo

Para verificar que todo funciona correctamente:

1. **Registro**:
   - Abre tu aplicación: `http://localhost:3000`
   - Registra un nuevo usuario con un email real
   - Deberías ver un mensaje indicando que se envió el email de confirmación

2. **Confirmación**:
   - Revisa tu bandeja de entrada (o spam)
   - Haz clic en el enlace de confirmación de Supabase
   - Deberías ser redirigido a la aplicación

3. **Inicio de Sesión**:
   - Inicia sesión con tus credenciales
   - Como es un usuario nuevo, serás redirigido a "Crear Empresa"

4. **Completar Setup**:
   - Completa el formulario de empresa
   - Selecciona un plan de suscripción
   - Accede al dashboard completo

---

## 🐛 Si sigues teniendo errores:

### Error 404 o 400 después de confirmar email
**Causa**: Las Redirect URLs no están configuradas correctamente en Supabase
**Solución**:
1. Ve a Supabase Dashboard → Project Settings → Authentication → URL Configuration
2. Verifica que `http://localhost:3000/create-company` esté en la lista de Redirect URLs
3. Guarda los cambios y espera unos segundos
4. Intenta el flujo de registro nuevamente

### Error 429: "Too many requests"
**Causa**: Demasiados intentos de registro en poco tiempo
**Solución**:
1. Espera 1-2 minutos antes de intentar nuevamente
2. Ve a Supabase Dashboard → Authentication → Users
3. Elimina el usuario si fue creado parcialmente
4. Intenta registrarte de nuevo

### Error: "Invalid login credentials" después de confirmar email
**Causa**: Intentando hacer login manualmente cuando no es necesario
**Solución**:
- **NO hagas login manualmente** después de confirmar el email
- Supabase crea la sesión automáticamente al confirmar
- Simplemente haz clic en el enlace del email y serás redirigido

### Error: "User already registered"
**Solución**:
1. Ve a Authentication → Users en Supabase Dashboard
2. Busca tu email y elimina el usuario
3. Espera 30 segundos
4. Vuelve a registrarte

### Error: "Failed to create company"
**Causa**: Las tablas no existen en Supabase
**Solución**:
1. Ve a SQL Editor en Supabase Dashboard
2. Ejecuta el archivo `supabase-schema.sql` completo
3. Verifica en Table Editor que todas las tablas estén creadas:
   - companies
   - employees
   - conservation_certificates
   - self_protection_systems
   - qr_documents
   - events

#!/bin/bash

# Script para desplegar la función de envío de emails
# Uso: ./scripts/deploy-email-function.sh

set -e

echo "🚀 Desplegando Edge Function: send-expiration-emails"
echo "================================================"

# Verificar que Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI no está instalado"
    echo "Instálalo con: npm install -g supabase"
    exit 1
fi

echo "✓ Supabase CLI encontrado"

# Verificar que estamos en el directorio correcto
if [ ! -d "supabase/functions/send-expiration-emails" ]; then
    echo "❌ Error: No se encuentra la carpeta de la función"
    echo "Asegúrate de ejecutar este script desde la raíz del proyecto"
    exit 1
fi

echo "✓ Carpeta de función encontrada"

# Verificar login
echo ""
echo "Verificando autenticación..."
if ! supabase projects list &> /dev/null; then
    echo "⚠️  No estás autenticado. Iniciando login..."
    supabase login
fi

echo "✓ Autenticado correctamente"

# Listar proyectos
echo ""
echo "Proyectos disponibles:"
supabase projects list

# Preguntar por el project ref si no está vinculado
if [ ! -f ".supabase/config.toml" ]; then
    echo ""
    read -p "Ingresa tu Project Ref (ejemplo: abcdefghijklmnop): " PROJECT_REF
    echo ""
    echo "Vinculando proyecto..."
    supabase link --project-ref "$PROJECT_REF"
fi

echo "✓ Proyecto vinculado"

# Desplegar función
echo ""
echo "Desplegando función..."
supabase functions deploy send-expiration-emails

echo ""
echo "✅ Función desplegada exitosamente!"
echo ""
echo "Próximos pasos:"
echo "1. Configura las variables de entorno en Supabase Dashboard:"
echo "   - RESEND_API_KEY"
echo "   - SENDER_EMAIL"
echo "   - FUNCTION_SECRET"
echo "   - APP_URL"
echo ""
echo "2. Configura GitHub Actions secrets:"
echo "   - SUPABASE_PROJECT_URL"
echo "   - SUPABASE_FUNCTION_SECRET"
echo ""
echo "3. Prueba la función:"
echo "   supabase functions invoke send-expiration-emails --body '{}'"
echo ""
echo "Ver documentación completa: EMAIL_NOTIFICATIONS_SETUP.md"

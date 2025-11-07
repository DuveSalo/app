#!/bin/bash

# Script para probar la función de envío de emails
# Uso: ./scripts/test-email-function.sh

set -e

echo "🧪 Probando función de envío de emails"
echo "======================================"

# Leer variables
read -p "URL del proyecto Supabase: " SUPABASE_URL
read -s -p "Function Secret: " FUNCTION_SECRET
echo ""

if [ -z "$SUPABASE_URL" ] || [ -z "$FUNCTION_SECRET" ]; then
    echo "❌ Error: Debes proporcionar tanto la URL como el secret"
    exit 1
fi

echo ""
echo "Ejecutando función..."
echo ""

# Ejecutar función
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "${SUPABASE_URL}/functions/v1/send-expiration-emails" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${FUNCTION_SECRET}" \
  -d '{}')

# Separar body y status code
HTTP_BODY=$(echo "$RESPONSE" | head -n -1)
HTTP_STATUS=$(echo "$RESPONSE" | tail -n 1)

echo "Status HTTP: $HTTP_STATUS"
echo ""
echo "Respuesta:"
echo "$HTTP_BODY" | jq '.' 2>/dev/null || echo "$HTTP_BODY"

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo ""
    echo "✅ Función ejecutada exitosamente!"
    echo ""
    echo "Verifica:"
    echo "1. Los logs en Supabase Dashboard → Edge Functions"
    echo "2. Los emails enviados en Resend Dashboard → Logs"
    echo "3. Tu bandeja de entrada (o spam)"
else
    echo ""
    echo "❌ Error al ejecutar la función"
    echo "Revisa los logs en Supabase Dashboard"
fi

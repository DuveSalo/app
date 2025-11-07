/**
 * Authentication utilities for Edge Function
 */

const FUNCTION_SECRET = Deno.env.get("FUNCTION_SECRET");

/**
 * Valida que la request esté autenticada correctamente
 * Acepta tanto el FUNCTION_SECRET como JWT válido de Supabase (anon key)
 */
export function validateAuth(request: Request): { valid: boolean; error?: string } {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader) {
    return {
      valid: false,
      error: "Missing Authorization header"
    };
  }

  // Si la función tiene verify_jwt=true, Supabase ya validó el JWT
  // En ese caso, aceptamos cualquier JWT válido (anon o service_role)
  // Para llamadas desde cron/GitHub Actions con FUNCTION_SECRET, validamos el secret

  if (FUNCTION_SECRET) {
    const expectedAuth = `Bearer ${FUNCTION_SECRET}`;

    // Si coincide con el FUNCTION_SECRET, autorizar
    if (authHeader === expectedAuth) {
      return { valid: true };
    }
  }

  // Si llegamos aquí y hay un Bearer token, asumimos que Supabase ya validó el JWT
  // (porque si verify_jwt=true y el JWT es inválido, Supabase rechaza la request antes de llegar aquí)
  if (authHeader.startsWith("Bearer ")) {
    console.log("Request autenticada via JWT de Supabase");
    return { valid: true };
  }

  console.warn("Intento de acceso no autorizado");
  return {
    valid: false,
    error: "Invalid credentials"
  };
}

/**
 * Crea un cliente de Supabase con privilegios de servicio
 */
export async function createServiceClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase credentials not configured");
  }

  const { createClient } = await import("jsr:@supabase/supabase-js@2");
  return createClient(supabaseUrl, supabaseServiceKey);
}

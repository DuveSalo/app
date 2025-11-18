
import { supabase } from '../../supabase/client';
import { User } from '../../../types/index';
import { AuthError, ValidationError, EmailConfirmationRequiredError, handleSupabaseError } from '../../utils/errors';

// Password validation
const validatePassword = (password: string): { valid: boolean; error?: string } => {
  if (password.length < 8) {
    return { valid: false, error: "La contraseña debe tener al menos 8 caracteres" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: "La contraseña debe contener al menos una mayúscula" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: "La contraseña debe contener al menos una minúscula" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: "La contraseña debe contener al menos un número" };
  }
  return { valid: true };
};

export const login = async (email: string, password: string): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new AuthError("Credenciales inválidas. Por favor verifica tu email o regístrate.", 'INVALID_CREDENTIALS');
  }

  if (!data.user) {
    throw new AuthError("Error al iniciar sesión.", 'LOGIN_ERROR');
  }

  return {
    id: data.user.id,
    name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Usuario',
    email: data.user.email || '',
  };
};

export const register = async (name: string, email: string, password: string): Promise<User> => {
  // Validate password
  const validation = validatePassword(password);
  if (!validation.valid) {
    throw new ValidationError(validation.error || 'Contraseña inválida');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
      emailRedirectTo: `${window.location.origin}/create-company`,
    },
  });

  if (error) {
    throw new AuthError(error.message || "Error al registrar usuario.", 'REGISTRATION_ERROR');
  }

  if (!data.user) {
    throw new AuthError("Error al crear usuario.", 'USER_CREATION_ERROR');
  }

  // Check if email confirmation is required (session will be null if email confirmation is enabled)
  if (!data.session) {
    throw new EmailConfirmationRequiredError();
  }

  return {
    id: data.user.id,
    name,
    email: data.user.email || email,
  };
};

export const logout = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    handleSupabaseError(error);
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
    email: user.email || '',
  };
};

export const updateUser = async (userData: Partial<User>): Promise<User> => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new AuthError("Usuario no autenticado");

  const { data, error } = await supabase.auth.updateUser({
    data: {
      name: userData.name,
    },
  });

  if (error) {
    handleSupabaseError(error);
  }

  // Also update in company employees if exists
  if (userData.name) {
    const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', currentUser.id)
        .single();

    if (company) {
      const { data: employees } = await supabase
        .from('employees')
        .select('id')
        .eq('company_id', company.id)
        .eq('email', currentUser.email);

      if (employees && employees.length > 0) {
        await supabase
          .from('employees')
          .update({ name: userData.name })
          .eq('id', employees[0].id);
      }
    }
  }

  return {
    ...currentUser,
    ...userData,
  };
};

export const sendPasswordResetEmail = async (email: string): Promise<void> => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    handleSupabaseError(error);
  }
};

export const signInWithGoogle = async (): Promise<void> => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    throw new AuthError(error.message || "Error al iniciar sesión con Google.", 'GOOGLE_AUTH_ERROR');
  }
};

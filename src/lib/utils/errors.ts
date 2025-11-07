// Custom error classes for better error handling

/**
 * Base application error class
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Authentication related errors
 */
export class AuthError extends AppError {
  constructor(message: string, code?: string) {
    super(message, code, 401);
    this.name = 'AuthError';
  }
}

/**
 * Validation errors
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly field?: string
  ) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

/**
 * Not found errors
 */
export class NotFoundError extends AppError {
  constructor(message: string, public readonly resource?: string) {
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Database operation errors
 */
export class DatabaseError extends AppError {
  constructor(message: string, code?: string) {
    super(message, code, 500);
    this.name = 'DatabaseError';
  }
}

/**
 * Network errors
 */
export class NetworkError extends AppError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR', 503);
    this.name = 'NetworkError';
  }
}

/**
 * Email confirmation required error (special case)
 */
export class EmailConfirmationRequiredError extends AuthError {
  constructor() {
    super(
      'Por favor confirma tu email antes de continuar. Revisa tu bandeja de entrada.',
      'EMAIL_CONFIRMATION_REQUIRED'
    );
  }
}

/**
 * Maps common generic error messages to structured error objects.
 * This is useful for errors originating from external sources that don't
 * provide structured error objects or custom error classes.
 */
const mapGenericErrorMessage = (
  message: string
): { message: string; code: string } | null => {
  if (message.includes('EMAIL_CONFIRMATION_REQUIRED')) {
    return {
      message: 'Por favor confirma tu email antes de continuar.',
      code: 'EMAIL_CONFIRMATION_REQUIRED',
    };
  }
  if (message.includes('Invalid login credentials')) {
    return {
      message: 'Credenciales inválidas. Verifica tu email y contraseña.',
      code: 'INVALID_CREDENTIALS',
    };
  }
  if (message.includes('User already registered')) {
    return {
      message: 'Este email ya está registrado.',
      code: 'USER_EXISTS',
    };
  }
  return null;
};

/**
 * Type guard to check if error is an AppError
 */
export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

/**
 * Type guard to check if error is a standard Error
 */
export const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};

/**
 * Safely extracts error message from unknown error
 */
export const getErrorMessage = (error: unknown): string => {
  if (isAppError(error)) {
    return error.message;
  }
  if (isError(error)) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'Error desconocido';
};

/**
 * Handles unknown errors and converts them to user-friendly messages
 */
export const handleError = (error: unknown): { message: string; code?: string } => {
  if (isAppError(error)) {
    return {
      message: error.message,
      code: error.code,
    };
  }

  if (isError(error)) {
    const mappedError = mapGenericErrorMessage(error.message);
    if (mappedError) {
      return mappedError;
    }
    return {
      message: error.message,
    };
  }

  if (typeof error === 'string') {
    const mappedError = mapGenericErrorMessage(error);
    if (mappedError) {
      return mappedError;
    }
    return {
      message: error,
    };
  }

  return {
    message: 'Ha ocurrido un error inesperado. Por favor intenta nuevamente.',
    code: 'UNKNOWN_ERROR',
  };
};

/**
 * Throws appropriate error based on Supabase error
 */
export const handleSupabaseError = (error: { message: string; code?: string }, context?: string): never => {
  const message = context ? `${context}: ${error.message}` : error.message;

  if (error.code === '23505') {
    throw new DatabaseError('Este registro ya existe en la base de datos.', 'DUPLICATE_ENTRY');
  }

  if (error.code === '23503') {
    throw new DatabaseError('No se puede realizar esta operación debido a restricciones de integridad.', 'FOREIGN_KEY_VIOLATION');
  }

  if (error.code === '42P01') {
    throw new DatabaseError('Error de configuración de base de datos.', 'TABLE_NOT_FOUND');
  }

  throw new DatabaseError(message, error.code);
};

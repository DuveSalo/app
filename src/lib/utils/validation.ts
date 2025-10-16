
// Date validation utilities

export const validateDateRange = (startDate: string, endDate: string): { valid: boolean; error?: string } => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, error: 'Fechas inválidas' };
  }

  if (end <= start) {
    return { valid: false, error: 'La fecha de vencimiento debe ser posterior a la fecha de presentación' };
  }

  return { valid: true };
};

export const validateExpirationDate = (expirationDate: string, presentationDate?: string): { valid: boolean; error?: string } => {
  const expiry = new Date(expirationDate);

  if (isNaN(expiry.getTime())) {
    return { valid: false, error: 'Fecha de vencimiento inválida' };
  }

  if (presentationDate) {
    const presentation = new Date(presentationDate);
    if (expiry <= presentation) {
      return { valid: false, error: 'La fecha de vencimiento debe ser posterior a la fecha de presentación' };
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (expiry < today) {
    return { valid: false, error: 'La fecha de vencimiento no puede estar en el pasado' };
  }

  return { valid: true };
};

export const validateFutureDate = (date: string): { valid: boolean; error?: string } => {
  const inputDate = new Date(date);

  if (isNaN(inputDate.getTime())) {
    return { valid: false, error: 'Fecha inválida' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (inputDate < today) {
    return { valid: false, error: 'La fecha no puede estar en el pasado' };
  }

  return { valid: true };
};

export const validatePastDate = (date: string): { valid: boolean; error?: string } => {
  const inputDate = new Date(date);

  if (isNaN(inputDate.getTime())) {
    return { valid: false, error: 'Fecha inválida' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (inputDate > today) {
    return { valid: false, error: 'La fecha no puede estar en el futuro' };
  }

  return { valid: true };
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/<[^>]*>/g, '');
};

export const sanitizeHtml = (html: string): string => {
  const tempDiv = document.createElement('div');
  tempDiv.textContent = html;
  return tempDiv.innerHTML;
};

// Email validation
export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email)) {
    return { valid: false, error: 'Email inválido' };
  }

  return { valid: true };
};

// CUIT validation (Argentina)
export const validateCUIT = (cuit: string): { valid: boolean; error?: string } => {
  const cleanCuit = cuit.replace(/[-_]/g, '');

  if (!/^\d{11}$/.test(cleanCuit)) {
    return { valid: false, error: 'El CUIT debe tener 11 dígitos' };
  }

  return { valid: true };
};

// Phone validation
export const validatePhone = (phone: string): { valid: boolean; error?: string } => {
  const cleanPhone = phone.replace(/[\s\-()]/g, '');

  if (!/^\d{8,15}$/.test(cleanPhone)) {
    return { valid: false, error: 'Número de teléfono inválido' };
  }

  return { valid: true };
};

// Required field validation
export const validateRequired = (value: any, fieldName: string = 'Campo'): { valid: boolean; error?: string } => {
  if (value === null || value === undefined || value === '' || (typeof value === 'string' && value.trim() === '')) {
    return { valid: false, error: `${fieldName} es requerido` };
  }

  return { valid: true };
};

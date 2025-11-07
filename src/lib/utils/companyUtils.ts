
/**
 * Validates a company field.
 * @param name - The name of the field to validate.
 * @param value - The value of the field to validate.
 * @param options - Validation options.
 * @returns An error message or an empty string if the value is valid.
 */
export const validateCompanyField = (
  name: string,
  value: string,
  options?: { allowAlphanumericPostalCode?: boolean }
): string => {
  const { allowAlphanumericPostalCode = false } = options || {};

  switch (name) {
    case 'name':
    case 'city':
    case 'province':
    case 'country':
      return /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(value)
        ? ''
        : 'Solo se permiten letras y espacios.';

    case 'cuit':
      return /^\d{2}-\d{8}-\d{1}$/.test(value)
        ? ''
        : 'Formato de CUIT inválido. Use XX-XXXXXXXX-X.';

    case 'postalCode':
      const postalCodeRegex = allowAlphanumericPostalCode
        ? /^[a-zA-Z0-9]{4,8}$/
        : /^\d{4,8}$/;
      const errorMessage = allowAlphanumericPostalCode
        ? 'El código postal debe tener entre 4 y 8 caracteres.'
        : 'El código postal debe tener entre 4 y 8 dígitos.';
      return postalCodeRegex.test(value) ? '' : errorMessage;

    default:
      return '';
  }
};

/**
 * Formats a CUIT input value as the user types.
 * @param value - The raw input value.
 * @returns The formatted CUIT string.
 */
export const formatCUITInput = (value: string): string => {
  const digits = value.replace(/\D/g, '');

  if (digits.length <= 2) {
    return digits;
  } else if (digits.length <= 10) {
    return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  } else {
    return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10, 11)}`;
  }
};

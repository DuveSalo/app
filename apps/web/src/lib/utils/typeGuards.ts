
// Type guards and safe type converters for database JSON types
import type { Json } from '../../types/database.types';
import type { CompanyServices, PaymentMethod } from '../../types/company';

/**
 * Safely converts Json to CompanyServices
 */
export const toCompanyServices = (json: Json | null | undefined): CompanyServices => {
  if (!json || typeof json !== 'object' || Array.isArray(json)) {
    return {};
  }
  return json as CompanyServices;
};

/**
 * Safely converts Json to PaymentMethod array
 */
export const toPaymentMethods = (json: Json | null | undefined): PaymentMethod[] => {
  if (!json || !Array.isArray(json)) {
    return [];
  }
  return json.map((item): PaymentMethod => {
    if (typeof item !== 'object' || !item) {
      throw new Error('Invalid payment method data');
    }
    return item as unknown as PaymentMethod;
  });
};

/**
 * Safely converts Json to string array
 */
export const toStringArray = (json: Json | null | undefined): string[] => {
  if (!json || !Array.isArray(json)) {
    return [];
  }
  return json.filter((item): item is string => typeof item === 'string');
};

/**
 * Safely converts Json to string boolean record
 */
export const toBooleanRecord = (json: Json | null | undefined): Record<string, boolean> => {
  if (!json || typeof json !== 'object' || Array.isArray(json)) {
    return {};
  }

  const result: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(json)) {
    if (typeof value === 'boolean') {
      result[key] = value;
    } else if (typeof value === 'string') {
      result[key] = value === 'true';
    }
  }
  return result;
};


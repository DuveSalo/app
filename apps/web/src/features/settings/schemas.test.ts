import { describe, it, expect } from 'vitest';
import { companyInfoSchema, employeeSchema, changeEmailSchema } from './schemas';

// ─── Company Info Schema ──────────────────────────────
describe('companyInfoSchema', () => {
  const validCompany = {
    name: "Escuela San Martín",
    cuit: '30-12345678-9',
    postalCode: '1425',
    address: 'Av. Libertador 1234',
    city: 'Buenos Aires',
    province: 'Buenos Aires',
    country: 'Argentina',
    phone: '+54 11 1234-5678',
    services: ['Matafuegos'],
  };

  it('should accept valid company info', () => {
    const result = companyInfoSchema.safeParse(validCompany);
    expect(result.success).toBe(true);
  });

  it('should accept empty phone (optional)', () => {
    const result = companyInfoSchema.safeParse({ ...validCompany, phone: '' });
    expect(result.success).toBe(true);
  });

  it('should accept empty services array', () => {
    const result = companyInfoSchema.safeParse({ ...validCompany, services: [] });
    expect(result.success).toBe(true);
  });

  it('should reject missing name', () => {
    const { name: _, ...data } = validCompany;
    const result = companyInfoSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject invalid CUIT format', () => {
    const result = companyInfoSchema.safeParse({ ...validCompany, cuit: '1234' });
    expect(result.success).toBe(false);
  });

  it('should reject name with special characters', () => {
    const result = companyInfoSchema.safeParse({ ...validCompany, name: 'Escuela @#$!' });
    expect(result.success).toBe(false);
  });

  it('should reject invalid phone format', () => {
    const result = companyInfoSchema.safeParse({ ...validCompany, phone: 'abc-phone' });
    expect(result.success).toBe(false);
  });

  it('should reject postal code with fewer than 4 characters', () => {
    const result = companyInfoSchema.safeParse({ ...validCompany, postalCode: '12' });
    expect(result.success).toBe(false);
  });
});

// ─── Employee Schema ──────────────────────────────────
describe('employeeSchema', () => {
  const validEmployee = {
    name: 'María López',
    email: 'maria@example.com',
    role: 'Docente',
  };

  it('should accept valid employee data', () => {
    const result = employeeSchema.safeParse(validEmployee);
    expect(result.success).toBe(true);
  });

  it('should reject missing name', () => {
    const { name: _, ...data } = validEmployee;
    const result = employeeSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject invalid email', () => {
    const result = employeeSchema.safeParse({ ...validEmployee, email: 'not-email' });
    expect(result.success).toBe(false);
  });

  it('should reject empty role', () => {
    const result = employeeSchema.safeParse({ ...validEmployee, role: '' });
    expect(result.success).toBe(false);
  });

  it('should reject empty email', () => {
    const result = employeeSchema.safeParse({ ...validEmployee, email: '' });
    expect(result.success).toBe(false);
  });
});

// ─── Change Email Schema ──────────────────────────────
describe('changeEmailSchema', () => {
  it('should accept a valid email', () => {
    const result = changeEmailSchema.safeParse({ newEmail: 'nuevo@example.com' });
    expect(result.success).toBe(true);
  });

  it('should reject an empty email', () => {
    const result = changeEmailSchema.safeParse({ newEmail: '' });
    expect(result.success).toBe(false);
  });

  it('should reject an invalid email format', () => {
    const result = changeEmailSchema.safeParse({ newEmail: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('should reject an email longer than 254 characters', () => {
    const long = 'a'.repeat(249) + '@b.com'; // 255 chars total
    const result = changeEmailSchema.safeParse({ newEmail: long });
    expect(result.success).toBe(false);
  });

  it('should reject missing newEmail field', () => {
    const result = changeEmailSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

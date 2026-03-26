import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  createCompanySchema,
  otpSchema,
  resetPasswordSchema,
} from './schemas';

// ─── Login Schema ──────────────────────────────────────
describe('loginSchema', () => {
  const validLogin = { email: 'user@example.com', password: 'password123' };

  it('should accept valid login data', () => {
    const result = loginSchema.safeParse(validLogin);
    expect(result.success).toBe(true);
  });

  it('should reject missing email', () => {
    const result = loginSchema.safeParse({ password: 'password123' });
    expect(result.success).toBe(false);
  });

  it('should reject missing password', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com' });
    expect(result.success).toBe(false);
  });

  it('should reject invalid email format', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'password123' });
    expect(result.success).toBe(false);
  });

  it('should reject empty email string', () => {
    const result = loginSchema.safeParse({ email: '', password: 'password123' });
    expect(result.success).toBe(false);
  });

  it('should reject empty password string', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: '' });
    expect(result.success).toBe(false);
  });
});

// ─── Register Schema ──────────────────────────────────
describe('registerSchema', () => {
  const validRegister = {
    name: 'Juan Pérez',
    email: 'juan@example.com',
    password: 'SecurePass1',
    confirmPassword: 'SecurePass1',
  };

  it('should accept valid registration data', () => {
    const result = registerSchema.safeParse(validRegister);
    expect(result.success).toBe(true);
  });

  it('should reject missing name', () => {
    const { name: _, ...data } = validRegister;
    const result = registerSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject password shorter than 8 characters', () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      password: 'short',
      confirmPassword: 'short',
    });
    expect(result.success).toBe(false);
  });

  it('should reject mismatched passwords', () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      confirmPassword: 'DifferentPass1',
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty confirm password', () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      confirmPassword: '',
    });
    expect(result.success).toBe(false);
  });
});

// ─── Create Company Schema ────────────────────────────
describe('createCompanySchema', () => {
  const validCompany = {
    name: 'Escuela San Martín',
    cuit: '30-12345678-9',
    address: 'Av. Libertador 1234',
    postalCode: '1425',
    city: '',
    province: 'Buenos Aires',
    country: 'Argentina',
    phone: '+54 11 1234-5678',
    services: ['Matafuegos'],
  };

  it('should accept valid company data', () => {
    const result = createCompanySchema.safeParse(validCompany);
    expect(result.success).toBe(true);
  });

  it('should accept empty city (optional)', () => {
    const result = createCompanySchema.safeParse({ ...validCompany, city: '' });
    expect(result.success).toBe(true);
  });

  it('should reject invalid CUIT format', () => {
    const result = createCompanySchema.safeParse({ ...validCompany, cuit: '12345678' });
    expect(result.success).toBe(false);
  });

  it('should reject invalid postal code (non-digits)', () => {
    const result = createCompanySchema.safeParse({ ...validCompany, postalCode: 'ABCD' });
    expect(result.success).toBe(false);
  });

  it('should reject invalid phone format', () => {
    const result = createCompanySchema.safeParse({ ...validCompany, phone: 'abc-phone' });
    expect(result.success).toBe(false);
  });

  it('should reject missing required name', () => {
    const { name: _, ...data } = validCompany;
    const result = createCompanySchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

// ─── OTP Schema ───────────────────────────────────────
describe('otpSchema', () => {
  it('should accept a 6-character token', () => {
    const result = otpSchema.safeParse({ token: '123456' });
    expect(result.success).toBe(true);
  });

  it('should reject a token shorter than 6 characters', () => {
    const result = otpSchema.safeParse({ token: '12345' });
    expect(result.success).toBe(false);
  });

  it('should reject a token longer than 6 characters', () => {
    const result = otpSchema.safeParse({ token: '1234567' });
    expect(result.success).toBe(false);
  });

  it('should reject an empty token', () => {
    const result = otpSchema.safeParse({ token: '' });
    expect(result.success).toBe(false);
  });
});

// ─── Reset Password Schema ───────────────────────────
describe('resetPasswordSchema', () => {
  const validReset = {
    newPassword: 'Secure1pass',
    confirmPassword: 'Secure1pass',
  };

  it('should accept a valid reset password', () => {
    const result = resetPasswordSchema.safeParse(validReset);
    expect(result.success).toBe(true);
  });

  it('should reject password without uppercase letter', () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: 'secure1pass',
      confirmPassword: 'secure1pass',
    });
    expect(result.success).toBe(false);
  });

  it('should reject password without lowercase letter', () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: 'SECURE1PASS',
      confirmPassword: 'SECURE1PASS',
    });
    expect(result.success).toBe(false);
  });

  it('should reject password without a digit', () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: 'SecurePass',
      confirmPassword: 'SecurePass',
    });
    expect(result.success).toBe(false);
  });

  it('should reject mismatched passwords', () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: 'Secure1pass',
      confirmPassword: 'Different1pass',
    });
    expect(result.success).toBe(false);
  });

  it('should reject password shorter than 8 characters', () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: 'Sh1r',
      confirmPassword: 'Sh1r',
    });
    expect(result.success).toBe(false);
  });
});

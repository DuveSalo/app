import { describe, it, expect } from 'vitest';

// Test password validation logic extracted from auth.ts
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

describe('validatePassword', () => {
    it('should reject passwords shorter than 8 characters', () => {
        const result = validatePassword('Abc123');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('8 caracteres');
    });

    it('should reject passwords without uppercase letters', () => {
        const result = validatePassword('abcdefgh1');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('mayúscula');
    });

    it('should reject passwords without lowercase letters', () => {
        const result = validatePassword('ABCDEFGH1');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('minúscula');
    });

    it('should reject passwords without numbers', () => {
        const result = validatePassword('Abcdefghi');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('número');
    });

    it('should accept valid passwords', () => {
        const result = validatePassword('Abcdefg1');
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
    });

    it('should accept complex valid passwords', () => {
        const result = validatePassword('MySecurePassword123!');
        expect(result.valid).toBe(true);
    });
});

import { describe, it, expect } from 'vitest';
import { validateCompanyField, formatCUITInput } from './companyUtils';

describe('validateCompanyField', () => {
    describe('CUIT validation', () => {
        it('should accept valid CUIT format XX-XXXXXXXX-X', () => {
            expect(validateCompanyField('cuit', '20-12345678-9')).toBe('');
            expect(validateCompanyField('cuit', '27-34567890-1')).toBe('');
            expect(validateCompanyField('cuit', '30-71234567-0')).toBe('');
        });

        it('should reject CUIT without dashes', () => {
            expect(validateCompanyField('cuit', '20123456789')).toContain('CUIT');
        });

        it('should reject CUIT with wrong dash positions', () => {
            expect(validateCompanyField('cuit', '2-012345678-9')).toContain('CUIT');
            expect(validateCompanyField('cuit', '201-2345678-9')).toContain('CUIT');
        });

        it('should reject CUIT with letters', () => {
            expect(validateCompanyField('cuit', 'AB-12345678-9')).toContain('CUIT');
        });

        it('should reject empty CUIT', () => {
            expect(validateCompanyField('cuit', '')).toContain('CUIT');
        });

        it('should reject CUIT with too few digits', () => {
            expect(validateCompanyField('cuit', '20-1234567-9')).toContain('CUIT');
        });

        it('should reject CUIT with too many digits', () => {
            expect(validateCompanyField('cuit', '20-123456789-9')).toContain('CUIT');
        });
    });

    describe('name validation', () => {
        it('should accept valid names with letters and spaces', () => {
            expect(validateCompanyField('name', 'Escuela San Martín')).toBe('');
        });

        it('should accept names with accented characters', () => {
            expect(validateCompanyField('name', 'Institución María Señora')).toBe('');
        });

        it('should reject names with numbers', () => {
            expect(validateCompanyField('name', 'Escuela 123')).toContain('letras');
        });
    });

    describe('postalCode validation', () => {
        it('should accept 4-digit postal codes', () => {
            expect(validateCompanyField('postalCode', '1234')).toBe('');
        });

        it('should accept 8-digit postal codes', () => {
            expect(validateCompanyField('postalCode', '12345678')).toBe('');
        });

        it('should reject postal codes shorter than 4 digits', () => {
            expect(validateCompanyField('postalCode', '123')).toContain('código postal');
        });

        it('should accept alphanumeric postal codes when option is set', () => {
            expect(validateCompanyField('postalCode', 'B1234ABC', { allowAlphanumericPostalCode: true })).toBe('');
        });
    });

    describe('unknown fields', () => {
        it('should return empty for unknown field names', () => {
            expect(validateCompanyField('unknown', 'anything')).toBe('');
        });
    });
});

describe('formatCUITInput', () => {
    it('should return digits as-is when 2 or fewer', () => {
        expect(formatCUITInput('20')).toBe('20');
        expect(formatCUITInput('2')).toBe('2');
    });

    it('should add first dash after 2 digits', () => {
        expect(formatCUITInput('201')).toBe('20-1');
        expect(formatCUITInput('2012345')).toBe('20-12345');
    });

    it('should add second dash after 10 digits', () => {
        expect(formatCUITInput('20123456789')).toBe('20-12345678-9');
    });

    it('should strip non-digit characters', () => {
        expect(formatCUITInput('20-123')).toBe('20-123');
        expect(formatCUITInput('abc')).toBe('');
    });

    it('should handle empty string', () => {
        expect(formatCUITInput('')).toBe('');
    });

    it('should truncate to 11 digits max', () => {
        expect(formatCUITInput('201234567890')).toBe('20-12345678-9');
    });
});

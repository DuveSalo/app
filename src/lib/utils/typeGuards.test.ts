import { describe, it, expect } from 'vitest';
import { toCompanyServices, toPaymentMethods, toStringArray, toBooleanRecord } from './typeGuards';

describe('toCompanyServices', () => {
    it('should return the object when given a valid object', () => {
        const input = { matafuegos: true, sps: false };
        expect(toCompanyServices(input)).toEqual(input);
    });

    it('should return empty object for null', () => {
        expect(toCompanyServices(null)).toEqual({});
    });

    it('should return empty object for undefined', () => {
        expect(toCompanyServices(undefined)).toEqual({});
    });

    it('should return empty object for array', () => {
        expect(toCompanyServices([1, 2, 3])).toEqual({});
    });

    it('should return empty object for primitive', () => {
        expect(toCompanyServices('string' as any)).toEqual({});
    });
});

describe('toPaymentMethods', () => {
    it('should return mapped array for valid input', () => {
        const input = [{ type: 'card', last4: '1234' }];
        expect(toPaymentMethods(input as any)).toEqual(input);
    });

    it('should return empty array for null', () => {
        expect(toPaymentMethods(null)).toEqual([]);
    });

    it('should return empty array for non-array', () => {
        expect(toPaymentMethods({ key: 'value' })).toEqual([]);
    });

    it('should throw for invalid items in array', () => {
        expect(() => toPaymentMethods(['invalid'] as any)).toThrow('Invalid payment method');
    });
});

describe('toStringArray', () => {
    it('should filter strings from array', () => {
        expect(toStringArray(['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
    });

    it('should filter out non-string values', () => {
        expect(toStringArray(['a', 1, true, 'b'] as any)).toEqual(['a', 'b']);
    });

    it('should return empty array for null', () => {
        expect(toStringArray(null)).toEqual([]);
    });

    it('should return empty array for non-array', () => {
        expect(toStringArray({ key: 'value' })).toEqual([]);
    });
});

describe('toBooleanRecord', () => {
    it('should return record with boolean values', () => {
        const input = { active: true, deleted: false };
        expect(toBooleanRecord(input)).toEqual({ active: true, deleted: false });
    });

    it('should convert string "true" to boolean true', () => {
        const input = { active: 'true', deleted: 'false' };
        expect(toBooleanRecord(input as any)).toEqual({ active: true, deleted: false });
    });

    it('should return empty object for null', () => {
        expect(toBooleanRecord(null)).toEqual({});
    });

    it('should return empty object for array', () => {
        expect(toBooleanRecord([1, 2])).toEqual({});
    });

    it('should skip non-boolean non-string values', () => {
        const input = { valid: true, number: 42, nested: { a: 1 } };
        expect(toBooleanRecord(input as any)).toEqual({ valid: true });
    });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    calculateDaysUntilExpiration,
    calculateExpirationStatus,
    formatDateLocal,
    isWithinNotificationWindow,
    normalizeDate
} from './dateUtils';

describe('calculateDaysUntilExpiration', () => {
    beforeEach(() => {
        // Mock today as 2026-01-20
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-01-20T12:00:00'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should return positive days for future dates', () => {
        const result = calculateDaysUntilExpiration('2026-01-25');
        expect(result).toBe(5);
    });

    it('should return 0 for today', () => {
        const result = calculateDaysUntilExpiration('2026-01-20');
        expect(result).toBe(0);
    });

    it('should return negative days for past dates', () => {
        const result = calculateDaysUntilExpiration('2026-01-15');
        expect(result).toBe(-5);
    });

    it('should handle ISO format with time', () => {
        const result = calculateDaysUntilExpiration('2026-01-30T10:00:00');
        expect(result).toBe(10);
    });
});

describe('calculateExpirationStatus', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-01-20T12:00:00'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should return "expired" for past dates', () => {
        const result = calculateExpirationStatus('2026-01-15');
        expect(result).toBe('expired');
    });

    it('should return "expired" for today (0 days remaining)', () => {
        const result = calculateExpirationStatus('2026-01-20');
        expect(result).toBe('expired');
    });

    it('should return "expiring" for dates within threshold', () => {
        // Default threshold is 31 days
        const result = calculateExpirationStatus('2026-02-10');
        expect(result).toBe('expiring');
    });

    it('should return "valid" for dates beyond threshold', () => {
        const result = calculateExpirationStatus('2026-06-01');
        expect(result).toBe('valid');
    });

    it('should respect custom threshold', () => {
        // 10 days from now with 15-day threshold = expiring
        const expiring = calculateExpirationStatus('2026-01-30', 15);
        expect(expiring).toBe('expiring');

        // 10 days from now with 5-day threshold = valid
        const valid = calculateExpirationStatus('2026-01-30', 5);
        expect(valid).toBe('valid');
    });
});

describe('formatDateLocal', () => {
    it('should format date in es-AR locale', () => {
        const result = formatDateLocal('2026-01-20');
        expect(result).toMatch(/20\/1\/2026|20\/01\/2026/);
    });

    it('should return "-" for null input', () => {
        const result = formatDateLocal(null);
        expect(result).toBe('-');
    });

    it('should return "-" for undefined input', () => {
        const result = formatDateLocal(undefined);
        expect(result).toBe('-');
    });

    it('should handle ISO format with time', () => {
        const result = formatDateLocal('2026-12-25T10:30:00');
        expect(result).toMatch(/25\/12\/2026|25\/12\/26/);
    });
});

describe('isWithinNotificationWindow', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-01-20T12:00:00'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should return true for dates within window', () => {
        const result = isWithinNotificationWindow('2026-02-01', 31);
        expect(result).toBe(true);
    });

    it('should return false for dates outside window', () => {
        const result = isWithinNotificationWindow('2026-06-01', 31);
        expect(result).toBe(false);
    });

    it('should return false for past dates', () => {
        const result = isWithinNotificationWindow('2026-01-10', 31);
        expect(result).toBe(false);
    });
});

describe('normalizeDate', () => {
    it('should set time to 00:00:00.000', () => {
        const date = new Date('2026-01-20T15:30:45.123');
        const result = normalizeDate(date);

        expect(result.getHours()).toBe(0);
        expect(result.getMinutes()).toBe(0);
        expect(result.getSeconds()).toBe(0);
        expect(result.getMilliseconds()).toBe(0);
    });

    it('should not modify the original date', () => {
        const original = new Date('2026-01-20T15:30:45.123');
        const originalTime = original.getTime();
        normalizeDate(original);

        expect(original.getTime()).toBe(originalTime);
    });
});

import { describe, it, expect } from 'vitest';
import { USER_TABLES, ADMIN_TABLES } from './tableQueryMap';

describe('tableQueryMap', () => {
  describe('USER_TABLES', () => {
    it('has exactly 8 entries', () => {
      expect(USER_TABLES).toHaveLength(8);
    });

    it('contains correct table names', () => {
      const tableNames = USER_TABLES.map((t) => t.table);
      expect(tableNames).toContain('fire_extinguishers');
      expect(tableNames).toContain('conservation_certificates');
      expect(tableNames).toContain('self_protection_systems');
      expect(tableNames).toContain('qr_documents');
      expect(tableNames).toContain('events');
      expect(tableNames).toContain('manual_payments');
      expect(tableNames).toContain('subscriptions');
      expect(tableNames).toContain('notifications');
    });

    it('all entries have filterColumn = "company_id"', () => {
      USER_TABLES.forEach((config) => {
        expect(config.filterColumn).toBe('company_id');
      });
    });

    it('getQueryKeys returns non-empty arrays for a sample companyId', () => {
      const companyId = 'comp-test-123';
      USER_TABLES.forEach((config) => {
        const keys = config.getQueryKeys(companyId);
        expect(keys.length).toBeGreaterThan(0);
        keys.forEach((key) => {
          expect(Array.isArray(key)).toBe(true);
          expect(key.length).toBeGreaterThan(0);
        });
      });
    });

    it('fire_extinguishers invalidates fireExtinguishers.list and dashboard', () => {
      const config = USER_TABLES.find((t) => t.table === 'fire_extinguishers')!;
      const keys = config.getQueryKeys('comp-1');
      expect(keys).toContainEqual(['fireExtinguishers', 'comp-1']);
      expect(keys).toContainEqual(['dashboard', 'comp-1']);
    });

    it('notifications invalidates notifications and notificationCount', () => {
      const config = USER_TABLES.find((t) => t.table === 'notifications')!;
      const keys = config.getQueryKeys('comp-1');
      expect(keys).toContainEqual(['notifications', 'comp-1']);
      expect(keys).toContainEqual(['notificationCount', 'comp-1']);
    });

    it('manual_payments invalidates payments', () => {
      const config = USER_TABLES.find((t) => t.table === 'manual_payments')!;
      const keys = config.getQueryKeys('comp-1');
      expect(keys).toContainEqual(['payments', 'comp-1']);
    });

    it('subscriptions invalidates subscription', () => {
      const config = USER_TABLES.find((t) => t.table === 'subscriptions')!;
      const keys = config.getQueryKeys('comp-1');
      expect(keys).toContainEqual(['subscription', 'comp-1']);
    });
  });

  describe('ADMIN_TABLES', () => {
    it('has exactly 3 entries', () => {
      expect(ADMIN_TABLES).toHaveLength(3);
    });

    it('contains correct table names', () => {
      const tableNames = ADMIN_TABLES.map((t) => t.table);
      expect(tableNames).toContain('companies');
      expect(tableNames).toContain('manual_payments');
      expect(tableNames).toContain('subscriptions');
      expect(tableNames).not.toContain('payment_transactions');
    });

    it('all entries have filterColumn = null', () => {
      ADMIN_TABLES.forEach((config) => {
        expect(config.filterColumn).toBeNull();
      });
    });

    it('getQueryKeys returns non-empty arrays (companyId is irrelevant for admin)', () => {
      ADMIN_TABLES.forEach((config) => {
        const keys = config.getQueryKeys(null);
        expect(keys.length).toBeGreaterThan(0);
        keys.forEach((key) => {
          expect(Array.isArray(key)).toBe(true);
          expect(key.length).toBeGreaterThan(0);
        });
      });
    });

    it('companies invalidates adminSchools, adminRecentSchools(10) and adminStats', () => {
      const config = ADMIN_TABLES.find((t) => t.table === 'companies')!;
      const keys = config.getQueryKeys(null);
      expect(keys).toContainEqual(['admin', 'schools']);
      expect(keys).toContainEqual(['admin', 'recentSchools', 10]);
      expect(keys).toContainEqual(['admin', 'stats']);
    });

    it('admin manual_payments invalidates adminPayments, adminPendingPayments, adminRecentSales(10) and adminStats', () => {
      const config = ADMIN_TABLES.find((t) => t.table === 'manual_payments')!;
      const keys = config.getQueryKeys(null);
      expect(keys).toContainEqual(['admin', 'payments']);
      expect(keys).toContainEqual(['admin', 'pendingPayments']);
      expect(keys).toContainEqual(['admin', 'recentSales', 10]);
      expect(keys).toContainEqual(['admin', 'stats']);
    });

    it('admin subscriptions invalidates adminStats', () => {
      const config = ADMIN_TABLES.find((t) => t.table === 'subscriptions')!;
      const keys = config.getQueryKeys(null);
      expect(keys).toContainEqual(['admin', 'stats']);
    });
  });
});

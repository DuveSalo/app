/**
 * Centralized subscription and company status mappings.
 * All Edge Functions must use these constants instead of hardcoding strings.
 */

export type SubscriptionStatus = 'active' | 'pending' | 'cancelled' | 'suspended';

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
} as const;

export const COMPANY_STATUS = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  PAUSED: 'paused',
} as const;

/** Maps MercadoPago preapproval status strings to internal SubscriptionStatus values. */
export const MP_STATUS_MAP: Record<string, SubscriptionStatus> = {
  authorized: 'active',
  paused: 'suspended',
  cancelled: 'cancelled',
  pending: 'pending',
};

export const STATUS_MAP: Record<string, { subscription: string; company: string }> = {
  cancel: { subscription: SUBSCRIPTION_STATUS.CANCELLED, company: COMPANY_STATUS.CANCELLED },
  suspend: { subscription: SUBSCRIPTION_STATUS.SUSPENDED, company: COMPANY_STATUS.PAUSED },
  reactivate: { subscription: SUBSCRIPTION_STATUS.ACTIVE, company: COMPANY_STATUS.ACTIVE },
};

/**
 * Valid state transitions for subscription management actions.
 * Key = action, value = list of subscription statuses from which this action is valid.
 */
export const VALID_TRANSITIONS: Record<string, string[]> = {
  cancel: [SUBSCRIPTION_STATUS.ACTIVE, SUBSCRIPTION_STATUS.SUSPENDED],
  suspend: [SUBSCRIPTION_STATUS.ACTIVE],
  reactivate: [SUBSCRIPTION_STATUS.SUSPENDED],
};

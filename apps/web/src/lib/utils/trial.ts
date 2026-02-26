import type { Company } from '@/types';

export type TrialStatus = 'active' | 'expired' | 'none';

/**
 * Returns the trial status for a company.
 * - 'none':    paid subscriber, no trial set, or legacy company
 * - 'active':  within trial period and not yet subscribed
 * - 'expired': trial ended and not subscribed
 */
export function getTrialStatus(company: Company | null): TrialStatus {
  if (!company) return 'none';
  if (company.isSubscribed) return 'none';
  if (!company.trialEndsAt) return 'none';

  return new Date() < new Date(company.trialEndsAt) ? 'active' : 'expired';
}

/**
 * Returns the number of full days remaining in the trial.
 * Returns 0 if trial is expired or non-existent.
 */
export function getTrialDaysRemaining(company: Company | null): number {
  if (!company?.trialEndsAt || company.isSubscribed) return 0;

  const diffMs = new Date(company.trialEndsAt).getTime() - Date.now();
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Whether the user should be allowed access to the app.
 * True if subscribed OR trial is active.
 */
export function hasAppAccess(company: Company | null): boolean {
  if (!company) return false;
  if (company.isSubscribed) return true;
  return getTrialStatus(company) === 'active';
}

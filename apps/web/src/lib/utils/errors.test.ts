import { describe, expect, it } from 'vitest';
import { DatabaseError, NetworkError, handleSupabaseError, isNetworkError } from './errors';

describe('handleSupabaseError', () => {
  it('maps fetch failures to network errors', () => {
    expect(() => handleSupabaseError({ message: 'TypeError: Failed to fetch' })).toThrow(
      NetworkError
    );
  });

  it('maps Supabase auth LockManager timeouts to network errors', () => {
    expect(() =>
      handleSupabaseError({
        message:
          'Error: Acquiring an exclusive Navigator LockManager lock "lock:sb-project-auth-token" timed out waiting 10000ms',
      })
    ).toThrow(NetworkError);
  });

  it('keeps database errors as database errors', () => {
    expect(() => handleSupabaseError({ message: 'relation does not exist', code: '42P01' })).toThrow(
      DatabaseError
    );
  });

  it('detects raw browser fetch TypeErrors as network errors', () => {
    expect(isNetworkError(new TypeError('Failed to fetch'))).toBe(true);
  });
});

type RefreshTokenSession = {
  refresh_token?: string | null;
};

type GetSessionResult = {
  data: { session: RefreshTokenSession | null };
  error: unknown | null;
};

type RefreshSessionResult = {
  data: { session: RefreshTokenSession | null; user: unknown | null };
  error: unknown | null;
};

type SignOutResult = {
  error: unknown | null;
};

export type AuthRecoveryResult =
  | { status: 'skipped-server' }
  | { status: 'no-session' }
  | { status: 'recovered' }
  | { status: 'signed-out' }
  | { status: 'session-check-failed'; error: unknown }
  | { status: 'refresh-failed'; error: unknown };

export interface AuthRecoveryClient {
  auth: {
    getSession: () => Promise<GetSessionResult>;
    refreshSession: (currentSession?: { refresh_token: string }) => Promise<RefreshSessionResult>;
    signOut: (options: { scope: 'local' }) => Promise<SignOutResult>;
  };
}

type ErrorDetails = {
  message?: unknown;
  code?: unknown;
  status?: unknown;
};

const INVALID_REFRESH_TOKEN_CODES = new Set([
  'refresh_token_not_found',
  'refresh_token_already_used',
]);

const getErrorDetails = (error: unknown): ErrorDetails | null => {
  if (typeof error !== 'object' || error === null) {
    return null;
  }

  return error as ErrorDetails;
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  const details = getErrorDetails(error);
  return typeof details?.message === 'string' ? details.message : '';
};

const getErrorCode = (error: unknown): string => {
  const details = getErrorDetails(error);
  return typeof details?.code === 'string' ? details.code : '';
};

export const isInvalidRefreshTokenError = (error: unknown): boolean => {
  if (!error) {
    return false;
  }

  const code = getErrorCode(error).toLowerCase();
  if (INVALID_REFRESH_TOKEN_CODES.has(code)) {
    return true;
  }

  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes('invalid refresh token') ||
    message.includes('refresh token not found') ||
    message.includes('refresh token already used') ||
    message.includes('refresh_token_not_found') ||
    message.includes('refresh_token_already_used')
  );
};

const signOutLocally = async (client: AuthRecoveryClient): Promise<void> => {
  await client.auth.signOut({ scope: 'local' }).catch(() => undefined);
};

export const recoverSupabaseAuthSession = async (
  client: AuthRecoveryClient
): Promise<AuthRecoveryResult> => {
  if (typeof window === 'undefined') {
    return { status: 'skipped-server' };
  }

  const sessionResult = await client.auth.getSession();
  if (isInvalidRefreshTokenError(sessionResult.error)) {
    await signOutLocally(client);
    return { status: 'signed-out' };
  }

  if (sessionResult.error) {
    return { status: 'session-check-failed', error: sessionResult.error };
  }

  const session = sessionResult.data.session;
  if (!session) {
    return { status: 'no-session' };
  }

  if (!session.refresh_token) {
    await signOutLocally(client);
    return { status: 'signed-out' };
  }

  const refreshResult = await client.auth.refreshSession({
    refresh_token: session.refresh_token,
  });
  if (isInvalidRefreshTokenError(refreshResult.error)) {
    await signOutLocally(client);
    return { status: 'signed-out' };
  }

  if (refreshResult.error) {
    return { status: 'refresh-failed', error: refreshResult.error };
  }

  return { status: 'recovered' };
};

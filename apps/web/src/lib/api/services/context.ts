
import { getCurrentUser } from './auth';
import { getCompanyIdByUserId } from './company';
import { AuthError } from '../../utils/errors';

let _cachedUserId: string | null = null;
let _cachedCompanyId: string | null = null;

export function setServiceContext(userId: string, companyId: string) {
  _cachedUserId = userId;
  _cachedCompanyId = companyId;
}

export function clearServiceContext() {
  _cachedUserId = null;
  _cachedCompanyId = null;
}

export async function getAuthenticatedUserId(): Promise<string> {
  if (_cachedUserId) return _cachedUserId;
  const user = await getCurrentUser();
  if (!user) throw new AuthError('Usuario no autenticado');
  _cachedUserId = user.id;
  return user.id;
}

export async function getAuthenticatedCompanyId(): Promise<string> {
  if (_cachedCompanyId) return _cachedCompanyId;
  const userId = await getAuthenticatedUserId();
  const companyId = await getCompanyIdByUserId(userId);
  _cachedCompanyId = companyId;
  return companyId;
}

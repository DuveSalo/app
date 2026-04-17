import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Company } from '@/types/index';
import * as api from '@/lib/api/services';
import { ROUTE_PATHS } from '@/constants/index';
import { toast } from 'sonner';
import { createLogger } from '@/lib/utils/logger';
import { NotFoundError } from '@/lib/utils/errors';
import { getTrialStatus } from '@/lib/utils/trial';
import {
  recoverSupabaseAuthSession,
  startManagedSupabaseAutoRefresh,
  supabase,
} from '@/lib/supabase/client';
import { setServiceContext, clearServiceContext } from '@/lib/api/services/context';

const logger = createLogger('AuthContext');

export type PendingCompanyData = Omit<
  Company,
  'id' | 'userId' | 'employees' | 'isSubscribed' | 'selectedPlan'
>;

interface AuthContextType {
  currentUser: User | null;
  currentCompany: Company | null;
  pendingCompanyData: PendingCompanyData | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    pass: string
  ) => Promise<{ confirmationSent: boolean; email: string }>;
  resendConfirmationEmail: (email: string) => Promise<void>;
  verifyEmailOtp: (email: string, token: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setCompany: (company: Company) => void;
  setPendingCompanyData: (data: PendingCompanyData) => void;
  refreshCompany: (silent?: boolean) => Promise<void>;
  updateUserDetails: (details: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [pendingCompanyData, setPendingCompanyData] = useState<PendingCompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      await recoverSupabaseAuthSession();
      startManagedSupabaseAutoRefresh();

      const user = await api.getCurrentUser();
      setCurrentUser(user);
      if (user) {
        // Admin users don't have a company — skip the lookup to avoid PGRST116
        if (user.role === 'admin') {
          setCurrentCompany(null);
        } else {
          try {
            const company = await api.getCompanyByUserId(user.id);
            setCurrentCompany(company);
            setServiceContext(user.id, company.id);
          } catch (error) {
            setCurrentCompany(null);
          }
        }
      } else {
        setCurrentCompany(null);
      }
    } catch (error) {
      logger.error('Error fetching initial data', error);
      // If the refresh token is invalid/expired, sign out cleanly to clear corrupt session.
      // Supabase AuthApiError has status 400 for invalid/expired refresh tokens.
      // Fall back to message check for non-standard error shapes.
      const isRefreshTokenError =
        (error instanceof Error &&
          'status' in error &&
          (error as { status?: number }).status === 400) ||
        (error instanceof Error &&
          (error.message.includes('Refresh Token') ||
            error.message.includes('Invalid Refresh Token') ||
            error.message.includes('refresh_token_not_found')));
      if (isRefreshTokenError) {
        await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
      }
      setCurrentUser(null);
      setCurrentCompany(null);
      clearServiceContext();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Mirror currentUser into a ref so the onAuthStateChange callback can read
  // the latest value without being listed as a reactive dependency (which would
  // cause the listener to tear down and re-subscribe on every auth state change).
  const currentUserRef = useRef(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // Sync React state with Supabase auth events (token refresh failures, sign-outs from other tabs)
  const isHandlingAuthEvent = useRef(false);
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (isHandlingAuthEvent.current) return;
      isHandlingAuthEvent.current = true;

      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setCurrentCompany(null);
        clearServiceContext();
        setIsLoading(false);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Re-fetch user data on new sign-in (e.g. OAuth callback) or successful token refresh
        // Use the ref to avoid stale closure — we need the latest value without re-subscribing
        if (event === 'SIGNED_IN' && !currentUserRef.current) {
          fetchInitialData();
        }
      }

      // Use queueMicrotask to avoid re-entrancy within the same listener cycle
      queueMicrotask(() => {
        isHandlingAuthEvent.current = false;
      });
    });
    return () => subscription.unsubscribe();
  }, [fetchInitialData]); // currentUser removed — accessed via ref to prevent listener churn

  const loginUser = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const user = await api.login(email, pass);
      setCurrentUser(user);
      // Admin users go directly to admin dashboard (no company required)
      if (user.role === 'admin') {
        navigate(ROUTE_PATHS.ADMIN_DASHBOARD);
        return;
      }
      try {
        const company = await api.getCompanyByUserId(user.id);
        setCurrentCompany(company);
        setServiceContext(user.id, company.id);
        const trialStatus = getTrialStatus(company);
        const isRejected =
          company.subscriptionStatus === 'rejected' || company.bankTransferStatus === 'rejected';
        if (isRejected) {
          navigate(ROUTE_PATHS.BANK_TRANSFER_STATUS);
        } else if (company.isSubscribed || trialStatus === 'active') {
          navigate(ROUTE_PATHS.DASHBOARD);
        } else if (trialStatus === 'expired') {
          navigate(ROUTE_PATHS.TRIAL_EXPIRED);
        } else {
          navigate(ROUTE_PATHS.SUBSCRIPTION);
        }
      } catch (companyError) {
        if (companyError instanceof NotFoundError) {
          setCurrentCompany(null);
          navigate(ROUTE_PATHS.CREATE_COMPANY);
        } else {
          setCurrentCompany(null);
          throw companyError;
        }
      }
    } catch (error) {
      setCurrentUser(null);
      setCurrentCompany(null);
      clearServiceContext();
      throw error; // Re-throw to be handled by the UI
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (
    name: string,
    email: string,
    pass: string
  ): Promise<{ confirmationSent: boolean; email: string }> => {
    setIsLoading(true);
    try {
      const result = await api.register(name, email, pass);

      if (result.status === 'confirmation_sent') {
        // Don't set user yet — they need to confirm email via link first
        return { confirmationSent: true, email: result.email };
      }

      // Session was created immediately (email confirmation disabled)
      setCurrentUser(result.user);
      setCurrentCompany(null);
      navigate(ROUTE_PATHS.CREATE_COMPANY);
      return { confirmationSent: false, email: result.user.email };
    } catch (error: unknown) {
      setCurrentUser(null);
      setCurrentCompany(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resendConfirmationEmailUser = async (email: string) => {
    await api.resendConfirmationEmail(email);
  };

  const verifyEmailOtpUser = async (email: string, token: string) => {
    const user = await api.verifyEmailOtp(email, token);
    setCurrentUser(user);
    navigate(ROUTE_PATHS.CREATE_COMPANY);
  };

  const logoutUser = async () => {
    try {
      await api.logout();
    } catch (error) {
      logger.error('Error during logout', error);
    }
    setCurrentUser(null);
    setCurrentCompany(null);
    clearServiceContext();
    toast.info('Sesión cerrada');
    navigate(ROUTE_PATHS.LOGIN);
  };

  const setCompanyContext = (company: Company) => {
    setCurrentCompany(company);
  };

  const refreshCompanyData = useCallback(
    async (silent = false) => {
      if (currentUser) {
        if (!silent) setIsLoading(true);
        try {
          const company = await api.getCompanyByUserId(currentUser.id);
          setCurrentCompany(company);
        } catch (error) {
          logger.error('Error refreshing company data', error, { userId: currentUser.id });
          setCurrentCompany(null);
        } finally {
          if (!silent) setIsLoading(false);
        }
      }
    },
    [currentUser]
  );

  const updateUserDetailsContext = async (details: Partial<User>) => {
    if (!currentUser) throw new Error('No user is logged in.');
    setIsLoading(true);
    try {
      const updatedUser = await api.updateUser(details);
      setCurrentUser(updatedUser);
      // Also refresh company data in case the user name is used as an employee name
      await refreshCompanyData();
    } catch (error) {
      logger.error('Error updating user details', error, { userId: currentUser.id });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogleProvider = async () => {
    setIsLoading(true);
    try {
      await api.signInWithGoogle();
      // The OAuth flow will redirect to the callback URL
      // The user will be authenticated after the redirect
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentCompany,
        pendingCompanyData,
        isAdmin: currentUser?.role === 'admin',
        isLoading,
        login: loginUser,
        register: registerUser,
        resendConfirmationEmail: resendConfirmationEmailUser,
        verifyEmailOtp: verifyEmailOtpUser,
        loginWithGoogle: loginWithGoogleProvider,
        logout: logoutUser,
        setCompany: setCompanyContext,
        setPendingCompanyData,
        refreshCompany: refreshCompanyData,
        updateUserDetails: updateUserDetailsContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

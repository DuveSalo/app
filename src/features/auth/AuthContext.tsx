

import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Company } from '../../types/index';
import * as api from '../../lib/api/supabaseApi';
import { ROUTE_PATHS } from '../../constants/index';
import { createLogger } from '../../lib/utils/logger';

const logger = createLogger('AuthContext');

interface AuthContextType {
  currentUser: User | null;
  currentCompany: Company | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setCompany: (company: Company) => void;
  refreshCompany: (silent?: boolean) => Promise<void>;
  changePlan: (newPlanId: string) => Promise<string | undefined>;
  cancelSubscription: () => Promise<void>;
  pauseSubscription: () => Promise<void>;
  updateUserDetails: (details: Partial<User>) => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await api.getCurrentUser();
      setCurrentUser(user);
      if (user) {
        try {
          const company = await api.getCompanyByUserId(user.id);
          setCurrentCompany(company);
        } catch (error) {
          setCurrentCompany(null);
        }
      } else {
        setCurrentCompany(null);
      }
    } catch (error) {
      logger.error("Error fetching initial data", error);
      setCurrentUser(null);
      setCurrentCompany(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const loginUser = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const user = await api.login(email, pass);
      setCurrentUser(user);
      try {
        const company = await api.getCompanyByUserId(user.id);
        setCurrentCompany(company);
        if (company.isSubscribed) {
          navigate(ROUTE_PATHS.DASHBOARD);
        } else {
          navigate(ROUTE_PATHS.SUBSCRIPTION);
        }
      } catch {
        setCurrentCompany(null);
        navigate(ROUTE_PATHS.CREATE_COMPANY); 
      }
    } catch (error) {
      setCurrentUser(null);
      setCurrentCompany(null);
      throw error; // Re-throw to be handled by the UI
    } finally {
      setIsLoading(false);
    }
  };
  
  const registerUser = async (name: string, email: string, pass: string) => {
    setIsLoading(true);
    try {
      // Register the user (Supabase creates session automatically if email confirmation is disabled)
      const user = await api.register(name, email, pass);
      // Set the user in context
      setCurrentUser(user);
      setCurrentCompany(null);
      // Redirect to create company page (they don't have a company yet)
      navigate(ROUTE_PATHS.CREATE_COMPANY);
    } catch (error: unknown) {
        setCurrentUser(null);
        setCurrentCompany(null);
        // Check if the error is due to email confirmation requirement
        const errorMessage = error instanceof Error ? error.message : '';
        if (errorMessage.includes('EMAIL_CONFIRMATION_REQUIRED') || errorMessage.includes('confirma tu email') || errorMessage.includes('email confirmation')) {
          // Re-throw with a clear message about email confirmation
          throw new Error('EMAIL_CONFIRMATION_REQUIRED');
        }
        throw error;
    } finally {
        setIsLoading(false);
    }
  };

  const logoutUser = async () => {
    await api.logout();
    setCurrentUser(null);
    setCurrentCompany(null);
    navigate(ROUTE_PATHS.LOGIN);
  };
  
  const setCompanyContext = (company: Company) => {
    setCurrentCompany(company);
  };

  const refreshCompanyData = async (silent = false) => {
    if (currentUser) {
      if (!silent) setIsLoading(true);
      try {
        const company = await api.getCompanyByUserId(currentUser.id);
        setCurrentCompany(company);
      } catch (error) {
        logger.error("Error refreshing company data", error, { userId: currentUser.id });
        setCurrentCompany(null);
      } finally {
        if (!silent) setIsLoading(false);
      }
    }
  };

  const changePlanContext = async (newPlanId: string): Promise<string | undefined> => {
    if (!currentCompany) throw new Error("No company found.");
    setIsLoading(true);
    try {
      const { company, initPoint } = await api.changeSubscriptionPlan(newPlanId);
      setCurrentCompany(company);
      return initPoint;
    } catch (error) {
      logger.error("Error changing subscription plan", error, { companyId: currentCompany.id, newPlanId });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscriptionContext = async () => {
    if (!currentCompany) throw new Error("No company found.");
    setIsLoading(true);
    try {
      const updatedCompany = await api.cancelSubscription();
      setCurrentCompany(updatedCompany);
    } catch (error) {
      logger.error("Error cancelling subscription", error, { companyId: currentCompany.id });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const pauseSubscriptionContext = async () => {
    if (!currentCompany) throw new Error("No company found.");
    setIsLoading(true);
    try {
      const updatedCompany = await api.pauseSubscription();
      setCurrentCompany(updatedCompany);
    } catch (error) {
      logger.error("Error pausing subscription", error, { companyId: currentCompany.id });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateUserDetailsContext = async (details: Partial<User>) => {
    if (!currentUser) throw new Error("No user is logged in.");
    setIsLoading(true);
    try {
        const updatedUser = await api.updateUser(details);
        setCurrentUser(updatedUser);
        // Also refresh company data in case the user name is used as an employee name
        await refreshCompanyData();
    } catch (error) {
        logger.error("Error updating user details", error, { userId: currentUser.id });
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
    <AuthContext.Provider value={{
      currentUser,
      currentCompany,
      isLoading,
      login: loginUser,
      register: registerUser,
      loginWithGoogle: loginWithGoogleProvider,
      logout: logoutUser,
      setCompany: setCompanyContext,
      refreshCompany: refreshCompanyData,
      changePlan: changePlanContext,
      cancelSubscription: cancelSubscriptionContext,
      pauseSubscription: pauseSubscriptionContext,
      updateUserDetails: updateUserDetailsContext,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
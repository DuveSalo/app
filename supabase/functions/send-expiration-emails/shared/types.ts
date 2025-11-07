/**
 * Shared types for Edge Function
 */

export interface ExpiringService {
  id: string;
  type: "certificate" | "inspection";
  name: string;
  expirationDate: string;
  daysUntilExpiration: number;
  companyId: string;
  companyName: string;
  userEmail: string;
}

export interface EmailResponse {
  success: boolean;
  emailId?: string;
  error?: string;
}

export interface FunctionResponse {
  success: boolean;
  message?: string;
  stats?: {
    totalServices: number;
    certificates: number;
    inspections: number;
    emailsSent: number;
    emailsFailed: number;
  };
  error?: string;
}

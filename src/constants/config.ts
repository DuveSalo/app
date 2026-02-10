// Application Configuration Constants

// Mock IDs (for development/testing)
export const MOCK_USER_ID = "user-123";
export const MOCK_COMPANY_ID = "company-abc";

// App Configuration
export const APP_NAME = "Escuela Segura";
export const APP_VERSION = "1.0.0";

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// File Upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = {
  PDF: 'application/pdf',
  IMAGE: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

// Date Formats
export const DATE_FORMAT = 'es-AR';

// Note: EXPIRATION_CONFIG is defined in @/constants/expirationThresholds.ts

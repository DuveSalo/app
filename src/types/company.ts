// Company and employee related types

import { QRDocumentType } from './qr';

export type CompanyServices = {
  [QRDocumentType.Elevators]?: boolean;
  [QRDocumentType.WaterHeaters]?: boolean;
  [QRDocumentType.FireSafetySystem]?: boolean;
  [QRDocumentType.DetectionSystem]?: boolean;
  [QRDocumentType.ElectricalInstallations]?: boolean;
};

export interface PaymentMethod {
  readonly id: string;
  cardType: 'visa' | 'mastercard';
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  isPrimary: boolean;
}

export interface PaymentDetails {
  cardNumber: string;
  cardType: 'visa' | 'mastercard';
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
}

export interface Employee {
  readonly id: string;
  name: string;
  role: string;
  email: string;
}

export interface Company {
  readonly id: string;
  readonly userId: string;
  name: string;
  cuit: string;
  ramaKey: string;
  ownerEntity: string;
  address: string;
  postalCode: string;
  city: string;
  province: string;
  country: string;
  locality: string;
  phone: string;
  employees: Employee[];
  isSubscribed?: boolean;
  selectedPlan?: string;
  trialEndsAt?: string;
  services?: CompanyServices;
  subscriptionRenewalDate?: string;
  subscriptionStatus?: 'active' | 'pending' | 'approval_pending' | 'suspended' | 'canceled' | 'expired';
  paymentMethods?: PaymentMethod[];
}

export interface Plan {
  readonly id: string;
  name: string;
  price: string;
  priceNumber?: number;
  priceSuffix: string;
  features: string[];
  tag?: string;
}


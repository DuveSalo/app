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
  id: string;
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
  id: string;
  name: string;
  role: string;
  email: string;
}

export interface Company {
  id: string;
  userId: string;
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
  services?: CompanyServices;
  subscriptionRenewalDate?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'expired';
  paymentMethods?: PaymentMethod[];
}

export interface Plan {
  id: string;
  name: string;
  price: string;
  priceSuffix: string;
  features: string[];
  tag?: string;
}

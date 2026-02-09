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
  services?: CompanyServices;
  subscriptionRenewalDate?: string;
  subscriptionStatus?: 'active' | 'authorized' | 'pending' | 'paused' | 'canceled' | 'expired';
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

// Mercado Pago types
export type SubscriptionStatus = 'pending' | 'authorized' | 'paused' | 'cancelled' | 'expired';
export type MPPaymentStatus = 'approved' | 'pending' | 'rejected' | 'refunded' | 'cancelled';

export interface Subscription {
  readonly id: string;
  companyId: string;
  mpPreapprovalId?: string;
  mpPayerId?: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  status: SubscriptionStatus;
  startDate?: string;
  endDate?: string;
  nextPaymentDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransaction {
  readonly id: string;
  subscriptionId?: string;
  companyId: string;
  mpPaymentId?: string;
  mpOrderId?: string;
  amount: number;
  currency: string;
  status: MPPaymentStatus;
  statusDetail?: string;
  paymentMethod?: string;
  paymentType?: string;
  installments: number;
  dateCreated: string;
  dateApproved?: string;
  createdAt: string;
}

// CardPayment Brick response data
export interface CardPaymentData {
  token: string;
  payment_method_id: string;
  issuer_id: string;
  installments: number;
  payer: {
    email: string;
    identification: {
      type: string;
      number: string;
    };
  };
}

// Request to create subscription (sent to Edge Function)
export interface CreateSubscriptionRequest {
  planId: string;
  planName: string;
  amount: number;
  payerEmail: string;
  cardToken: string;
  paymentMethodId?: string;
  issuerId?: string;
}

// Response from create-subscription Edge Function
export interface CreateSubscriptionResponse {
  success: boolean;
  subscription?: Subscription;
  mpStatus?: string;
  error?: string;
}

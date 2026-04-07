import type { User, Company, FireExtinguisherControl } from '@/types';
import type { Subscription, PaymentTransaction } from '@/types/subscription';
import { ExtinguisherType, ExtinguisherCapacity } from '@/types/fire-extinguisher';
import type { ConservationCertificate } from '@/types/certificate';
import type { SelfProtectionSystem } from '@/types/system';
import type { QRDocument } from '@/types/qr';
import { QRDocumentType } from '@/types/qr';
import type { EventInformation } from '@/types/event';
import type { Notification } from '@/types/notification';
import type { Employee } from '@/types/company';

export function createMockUser(overrides?: Partial<User>): User {
  return {
    id: 'user-1',
    name: 'María González',
    email: 'maria@escuela-segura.com.ar',
    ...overrides,
  };
}

export function createMockCompany(overrides?: Partial<Company>): Company {
  return {
    id: 'comp-1',
    userId: 'user-1',
    name: 'Escuela N°42 Domingo F. Sarmiento',
    cuit: '30-71234567-9',
    ramaKey: 'rama-1',
    ownerEntity: 'Ministerio de Educación CABA',
    address: 'Av. Rivadavia 4500',
    postalCode: 'C1424',
    city: 'Buenos Aires',
    province: 'Buenos Aires',
    country: 'Argentina',
    locality: 'CABA',
    phone: '+5491155551234',
    employees: [],
    isSubscribed: true,
    selectedPlan: 'basic',
    subscriptionStatus: 'active',
    ...overrides,
  };
}

export function createMockSubscription(overrides?: Partial<Subscription>): Subscription {
  return {
    id: 'sub-1',
    companyId: 'comp-1',
    mpPreapprovalId: 'mp-pre-1',
    mpPlanId: 'mp-plan-1',
    planKey: 'basic',
    planName: 'Básico',
    amount: 5000,
    currency: 'ARS',
    status: 'active',
    paymentProvider: 'mercadopago',
    subscriberEmail: 'maria@escuela-segura.com.ar',
    currentPeriodStart: '2026-03-01',
    currentPeriodEnd: '2026-04-01',
    nextBillingTime: '2026-04-01',
    activatedAt: '2026-02-01',
    cancelledAt: null,
    suspendedAt: null,
    failedPaymentsCount: 0,
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
    ...overrides,
  };
}

export function createMockFireExtinguisher(
  overrides?: Partial<FireExtinguisherControl>
): FireExtinguisherControl {
  return {
    id: 'ext-1',
    companyId: 'comp-1',
    controlDate: '2026-03-01',
    extinguisherNumber: 'MAT-001',
    type: ExtinguisherType.DRY_CHEMICAL,
    capacity: ExtinguisherCapacity.MEDIUM,
    class: 'ABC',
    positionNumber: 'P-01',
    chargeExpirationDate: '2027-03-01',
    hydraulicPressureExpirationDate: '2031-03-01',
    manufacturingYear: '2022',
    tagColor: 'Rojo',
    labelsLegible: true,
    pressureWithinRange: true,
    hasSealAndSafety: true,
    instructionsLegible: true,
    containerCondition: 'Bueno',
    nozzleCondition: 'Bueno',
    visibilityObstructed: 'No',
    accessObstructed: 'No',
    signageCondition: 'Bueno',
    signageFloor: 'Sí',
    signageWall: 'Sí',
    signageHeight: 'Sí',
    glassCondition: 'N/A',
    doorOpensEasily: 'N/A',
    cabinetClean: 'N/A',
    observations: '',
    ...overrides,
  };
}

export function createMockPaymentTransaction(
  overrides?: Partial<PaymentTransaction>
): PaymentTransaction {
  return {
    id: 'txn-1',
    subscriptionId: 'sub-1',
    companyId: 'comp-1',
    transactionId: 'mp-txn-123456',
    grossAmount: 5000,
    feeAmount: 250,
    netAmount: 4750,
    currency: 'ARS',
    status: 'completed',
    paidAt: '2026-03-01T12:00:00Z',
    createdAt: '2026-03-01T12:00:00Z',
    ...overrides,
  };
}

export function createMockConservationCertificate(
  overrides?: Partial<ConservationCertificate>
): ConservationCertificate {
  return {
    id: 'cert-1',
    companyId: 'comp-1',
    presentationDate: '2026-01-15',
    expirationDate: '2027-01-15',
    intervener: 'Ing. Roberto Díaz',
    registrationNumber: 'REG-2026-001',
    ...overrides,
  };
}

export function createMockSelfProtectionSystem(
  overrides?: Partial<SelfProtectionSystem>
): SelfProtectionSystem {
  return {
    id: 'sps-1',
    companyId: 'comp-1',
    extensionDate: '2026-01-01',
    expirationDate: '2027-01-01',
    drills: [],
    intervener: 'Lic. Ana Martínez',
    registrationNumber: 'SPS-2026-001',
    ...overrides,
  };
}

export function createMockQRDocument(overrides?: Partial<QRDocument>): QRDocument {
  return {
    id: 'qr-1',
    companyId: 'comp-1',
    type: QRDocumentType.Elevators,
    documentName: 'Certificado Ascensor Principal',
    uploadDate: '2026-03-01',
    extractedDate: '2027-03-01',
    ...overrides,
  };
}

export function createMockEventInformation(
  overrides?: Partial<EventInformation>
): EventInformation {
  return {
    id: 'evt-1',
    companyId: 'comp-1',
    date: '2026-03-15',
    time: '10:00',
    description: 'Simulacro de evacuación general',
    correctiveActions: 'Señalizar mejor las salidas de emergencia',
    testimonials: [],
    observations: [],
    finalChecks: {},
    ...overrides,
  };
}

export function createMockNotification(overrides?: Partial<Notification>): Notification {
  return {
    id: 'notif-1',
    companyId: 'comp-1',
    type: 'expiration_warning',
    category: 'certificate',
    title: 'Certificado por vencer',
    message: 'El certificado de conservación vence en 15 días.',
    isRead: false,
    createdAt: '2026-03-01T00:00:00Z',
    ...overrides,
  };
}

export function createMockEmployee(overrides?: Partial<Employee>): Employee {
  return {
    id: 'emp-1',
    name: 'Carlos Rodríguez',
    role: 'Director',
    email: 'carlos@escuela-segura.com.ar',
    ...overrides,
  };
}

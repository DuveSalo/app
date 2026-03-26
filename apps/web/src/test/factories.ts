import type { User, Company, FireExtinguisherControl } from '@/types';
import type { Subscription, PaymentTransaction } from '@/types/subscription';
import { ExtinguisherType, ExtinguisherCapacity } from '@/types/fire-extinguisher';

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
  overrides?: Partial<FireExtinguisherControl>,
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
  overrides?: Partial<PaymentTransaction>,
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

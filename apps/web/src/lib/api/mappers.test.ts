import { describe, it, expect } from 'vitest';
import {
    mapCompanyFromDb,
    mapEmployeeFromDb,
    mapCertificateFromDb,
    mapSystemFromDb,
    mapQRDocumentFromDb,
    mapEventFromDb,
} from './mappers';

// Minimal mock data matching Supabase Tables<'x'> shapes

const mockEmployee = {
    id: 'emp-1',
    name: 'Juan Pérez',
    email: 'juan@test.com',
    role: 'docente',
    company_id: 'comp-1',
    created_at: '2026-01-01T00:00:00Z',
};

const mockCompany = {
    id: 'comp-1',
    user_id: 'user-1',
    name: 'Escuela Test',
    cuit: '20-12345678-9',
    address: 'Av. Siempre Viva 742',
    postal_code: '1234',
    city: 'Buenos Aires',
    locality: 'CABA',
    province: 'Buenos Aires',
    country: 'Argentina',
    rama_key: 'rama-1',
    owner_entity: 'Entity S.A.',
    phone: '+5491112345678',
    is_subscribed: true,
    selected_plan: 'pro',
    trial_ends_at: '2026-02-01',
    subscription_status: 'active',
    subscription_renewal_date: '2026-03-01',
    services: { matafuegos: true, sps: false },
    payment_methods: [{ type: 'card', last4: '1234' }],
    employees: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
};

const mockCertificate = {
    id: 'cert-1',
    company_id: 'comp-1',
    presentation_date: '2025-06-01',
    expiration_date: '2026-06-01',
    intervener: 'Inspector García',
    registration_number: 'REG-001',
    pdf_file_url: 'https://example.com/cert.pdf',
    pdf_file_name: 'cert.pdf',
    created_at: '2025-06-01T00:00:00Z',
    updated_at: '2025-06-01T00:00:00Z',
};

const mockSystem = {
    id: 'sys-1',
    company_id: 'comp-1',
    probatory_disposition_date: '2025-01-15',
    probatory_disposition_pdf_name: 'disp.pdf',
    probatory_disposition_pdf_url: 'https://example.com/disp.pdf',
    extension_date: '2025-06-15',
    extension_pdf_name: 'ext.pdf',
    extension_pdf_url: 'https://example.com/ext.pdf',
    expiration_date: '2026-06-15',
    drills: [{ date: '2025-03-01', pdfUrl: 'https://example.com/drill.pdf' }],
    intervener: 'Inspector López',
    registration_number: 'SPS-001',
    created_at: '2025-01-15T00:00:00Z',
    updated_at: '2025-01-15T00:00:00Z',
};

const mockQRDocument = {
    id: 'qr-1',
    company_id: 'comp-1',
    type: 'evacuation_plan',
    document_name: 'Plan Evacuación',
    floor: '3',
    unit: 'A',
    pdf_file_url: 'https://example.com/plan.pdf',
    upload_date: '2025-06-01',
    qr_code_data: 'https://qr.example.com/plan-1',
    extracted_date: '2025-06-01',
    created_at: '2025-06-01T00:00:00Z',
    updated_at: '2025-06-01T00:00:00Z',
};

const mockEvent = {
    id: 'evt-1',
    company_id: 'comp-1',
    date: '2025-06-01',
    time: '14:00',
    description: 'Incendio menor en cocina',
    corrective_actions: 'Revisión de extintores',
    testimonials: ['testigo 1', 'testigo 2'],
    observations: ['obs 1'],
    final_checks: { evacuated: true, injuries: false },
    created_at: '2025-06-01T00:00:00Z',
    updated_at: '2025-06-01T00:00:00Z',
};

describe('mapEmployeeFromDb', () => {
    it('should map all employee fields', () => {
        const result = mapEmployeeFromDb(mockEmployee as any);
        expect(result).toEqual({
            id: 'emp-1',
            name: 'Juan Pérez',
            email: 'juan@test.com',
            role: 'docente',
        });
    });
});

describe('mapCompanyFromDb', () => {
    it('should map all company fields', () => {
        const result = mapCompanyFromDb(mockCompany as any);
        expect(result.id).toBe('comp-1');
        expect(result.name).toBe('Escuela Test');
        expect(result.cuit).toBe('20-12345678-9');
        expect(result.isSubscribed).toBe(true);
        expect(result.selectedPlan).toBe('pro');
        expect(result.subscriptionStatus).toBe('active');
    });

    it('should map employees when provided', () => {
        const result = mapCompanyFromDb(mockCompany as any, [mockEmployee as any]);
        expect(result.employees).toHaveLength(1);
        expect(result.employees[0].name).toBe('Juan Pérez');
    });

    it('should default employees to empty array when not provided', () => {
        const result = mapCompanyFromDb(mockCompany as any);
        expect(result.employees).toEqual([]);
    });

    it('should handle null optional fields', () => {
        const withNulls = {
            ...mockCompany,
            rama_key: null,
            owner_entity: null,
            phone: null,
            is_subscribed: null,
            selected_plan: null,
            trial_ends_at: null,
            subscription_renewal_date: null,
        };
        const result = mapCompanyFromDb(withNulls as any);
        expect(result.ramaKey).toBe('');
        expect(result.ownerEntity).toBe('');
        expect(result.phone).toBe('');
        expect(result.isSubscribed).toBe(false);
        expect(result.selectedPlan).toBeUndefined();
        expect(result.trialEndsAt).toBeUndefined();
        expect(result.subscriptionRenewalDate).toBeUndefined();
    });
});

describe('mapCertificateFromDb', () => {
    it('should map all certificate fields', () => {
        const result = mapCertificateFromDb(mockCertificate as any);
        expect(result).toEqual({
            id: 'cert-1',
            companyId: 'comp-1',
            presentationDate: '2025-06-01',
            expirationDate: '2026-06-01',
            intervener: 'Inspector García',
            registrationNumber: 'REG-001',
            pdfFile: 'https://example.com/cert.pdf',
            pdfFileName: 'cert.pdf',
        });
    });

    it('should handle null pdf fields', () => {
        const withNulls = { ...mockCertificate, pdf_file_url: null, pdf_file_name: null };
        const result = mapCertificateFromDb(withNulls as any);
        expect(result.pdfFile).toBeUndefined();
        expect(result.pdfFileName).toBeUndefined();
    });
});

describe('mapSystemFromDb', () => {
    it('should map all system fields including drills', () => {
        const result = mapSystemFromDb(mockSystem as any);
        expect(result.id).toBe('sys-1');
        expect(result.expirationDate).toBe('2026-06-15');
        expect(result.drills).toHaveLength(1);
        expect(result.drills[0].date).toBe('2025-03-01');
    });

    it('should handle null optional fields', () => {
        const withNulls = {
            ...mockSystem,
            probatory_disposition_date: null,
            probatory_disposition_pdf_name: null,
            probatory_disposition_pdf_url: null,
            extension_pdf_name: null,
            extension_pdf_url: null,
        };
        const result = mapSystemFromDb(withNulls as any);
        expect(result.probatoryDispositionDate).toBeUndefined();
        expect(result.probatoryDispositionPdfName).toBeUndefined();
        expect(result.extensionPdfName).toBeUndefined();
    });

    it('should default drills to empty array when invalid JSON', () => {
        const withBadDrills = { ...mockSystem, drills: 'not-json' };
        const result = mapSystemFromDb(withBadDrills as any);
        expect(result.drills).toEqual([]);
    });
});

describe('mapQRDocumentFromDb', () => {
    it('should map all QR document fields', () => {
        const result = mapQRDocumentFromDb(mockQRDocument as any);
        expect(result.id).toBe('qr-1');
        expect(result.type).toBe('evacuation_plan');
        expect(result.floor).toBe('3');
        expect(result.unit).toBe('A');
        expect(result.pdfUrl).toBe('https://example.com/plan.pdf');
    });

    it('should handle null optional fields', () => {
        const withNulls = {
            ...mockQRDocument,
            floor: null,
            unit: null,
            pdf_file_url: null,
            qr_code_data: null,
        };
        const result = mapQRDocumentFromDb(withNulls as any);
        expect(result.floor).toBeUndefined();
        expect(result.unit).toBeUndefined();
        expect(result.pdfUrl).toBeUndefined();
        expect(result.qrCodeData).toBeUndefined();
    });
});

describe('mapEventFromDb', () => {
    it('should map all event fields', () => {
        const result = mapEventFromDb(mockEvent as any);
        expect(result.id).toBe('evt-1');
        expect(result.date).toBe('2025-06-01');
        expect(result.testimonials).toEqual(['testigo 1', 'testigo 2']);
        expect(result.observations).toEqual(['obs 1']);
        expect(result.finalChecks).toEqual({ evacuated: true, injuries: false });
    });

    it('should default arrays/records for null JSON fields', () => {
        const withNulls = {
            ...mockEvent,
            testimonials: null,
            observations: null,
            final_checks: null,
        };
        const result = mapEventFromDb(withNulls as any);
        expect(result.testimonials).toEqual([]);
        expect(result.observations).toEqual([]);
        expect(result.finalChecks).toEqual({});
    });
});

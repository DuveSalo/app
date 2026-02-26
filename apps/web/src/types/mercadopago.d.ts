/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * MercadoPago SDK global type declarations
 * The SDK is loaded via <script> tag and attaches to window.MercadoPago
 */

interface MercadoPagoField {
    mount: (containerId: string) => Promise<void> | void;
    unmount: () => void;
    on: (event: string, callback: (...args: any[]) => void) => void;
    update: (settings: Record<string, any>) => void;
}

interface MercadoPagoCardToken {
    id: string;
    status?: string;
    [key: string]: any;
}

interface MercadoPagoFields {
    create: (fieldType: string, options?: Record<string, any>) => MercadoPagoField;
    createCardToken: (data: Record<string, string>) => Promise<MercadoPagoCardToken>;
}

interface IdentificationType {
    id: string;
    name: string;
    type: string;
    min_length: number;
    max_length: number;
}

declare class MercadoPago {
    constructor(publicKey: string, options?: { locale?: string });
    fields: MercadoPagoFields;
    getIdentificationTypes: () => Promise<IdentificationType[]>;
    createCardToken: (data: Record<string, any>) => Promise<MercadoPagoCardToken>;
}

interface Window {
    MercadoPago: typeof MercadoPago;
}

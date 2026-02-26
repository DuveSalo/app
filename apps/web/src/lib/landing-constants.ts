export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://app.escuelasegura.com";

export const APP_ROUTES = {
  REGISTER: `${APP_URL}/app/register`,
  LOGIN: `${APP_URL}/app/login`,
} as const;

export const SITE_CONFIG = {
  name: "Escuela Segura",
  description:
    "Centralice certificados, inspecciones y vencimientos de seguridad de su escuela. Alertas automáticas, dashboard de cumplimiento y preparación de auditorías en minutos.",
  url: "https://escuelasegura.com",
} as const;

export interface PlanData {
  id: string;
  name: string;
  price: string;
  priceNumber: number;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  tag?: string;
}

// Mirrors data from supabase/functions/_shared/mp-plans.ts and src/features/auth/SubscriptionPage.tsx
export const PLANS: PlanData[] = [
  {
    id: "basic",
    name: "Basic",
    price: "25.000",
    priceNumber: 25000,
    period: "/mes",
    description: "Para escuelas pequeñas",
    features: [
      "Gestión de 5 módulos",
      "Dashboard de vencimientos",
      "Soporte por email",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    price: "49.000",
    priceNumber: 49000,
    period: "/mes",
    description: "La opción más popular",
    features: [
      "Gestión de 10 módulos",
      "Alertas avanzadas",
      "Soporte prioritario",
    ],
    highlighted: true,
    tag: "Más Popular",
  },
  {
    id: "premium",
    name: "Premium",
    price: "89.000",
    priceNumber: 89000,
    period: "/mes",
    description: "Acceso completo sin límites",
    features: [
      "Módulos ilimitados",
      "Reportes personalizados",
      "Soporte 24/7 por teléfono",
    ],
  },
];

export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ_DATA: FAQItem[] = [
  {
    question: "¿Qué es Escuela Segura?",
    answer:
      "Escuela Segura es una plataforma web para gestionar toda la documentación de seguridad y cumplimiento normativo de su escuela. Centralice certificados, inspecciones de matafuegos, documentos QR y más en un solo lugar.",
  },
  {
    question: "¿Necesito instalar algo?",
    answer:
      "No. Escuela Segura es una aplicación web que funciona directamente desde su navegador. Solo necesita una cuenta de Google para registrarse y comenzar a usar la plataforma.",
  },
  {
    question: "¿Qué incluye la prueba gratuita?",
    answer:
      "La prueba gratuita de 14 días incluye acceso completo a todas las funcionalidades de la plataforma, sin necesidad de ingresar datos de pago.",
  },
  {
    question: "¿Qué métodos de pago aceptan?",
    answer:
      "Procesamos todos los pagos a través de MercadoPago. Puede pagar con tarjeta de crédito o débito de cualquier banco argentino.",
  },
  {
    question: "¿Puedo cambiar de plan en cualquier momento?",
    answer:
      "Sí. Puede actualizar o cambiar su plan desde la sección de Configuración de su cuenta. Los cambios se aplican en el siguiente ciclo de facturación.",
  },
  {
    question: "¿Mis datos están seguros?",
    answer:
      "Absolutamente. Utilizamos Supabase con Row Level Security (RLS), lo que garantiza que cada escuela solo pueda acceder a sus propios datos. Toda la comunicación está encriptada con TLS.",
  },
  {
    question: "¿Cómo funcionan las alertas de vencimiento?",
    answer:
      "El sistema monitorea automáticamente las fechas de vencimiento de todos sus documentos y certificados. Recibirá notificaciones con anticipación para que nunca se le pase una renovación.",
  },
  {
    question: "¿Puedo agregar más usuarios a mi cuenta?",
    answer:
      "Sí. Desde la sección de Configuración puede invitar a otros miembros de su equipo para que colaboren en la gestión de la documentación.",
  },
];

import { env } from '@/lib/env';

export const APP_URL = env.NEXT_PUBLIC_APP_URL;

export const APP_ROUTES = {
  REGISTER: `${APP_URL}/app/register`,
  LOGIN: `${APP_URL}/app/login`,
} as const;

export const SITE_CONFIG = {
  name: 'Escuela Segura',
  description:
    'Centralice certificados, inspecciones y vencimientos de seguridad de su escuela. Alertas automáticas, dashboard de cumplimiento y preparación de auditorías en minutos.',
  url: 'https://escuelasegura.com',
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

export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ_DATA: FAQItem[] = [
  {
    question: '¿Qué es Escuela Segura?',
    answer:
      'Escuela Segura es una plataforma web para gestionar toda la documentación de seguridad y cumplimiento normativo de su escuela. Centralice certificados, inspecciones de matafuegos, documentos QR y más en un solo lugar.',
  },
  {
    question: '¿Necesito instalar algo?',
    answer:
      'No. Escuela Segura es una aplicación web que funciona directamente desde su navegador. Solo necesita una cuenta de Google para registrarse y comenzar a usar la plataforma.',
  },
  {
    question: '¿Qué incluye la prueba gratuita?',
    answer:
      'La prueba gratuita de 14 días incluye acceso completo a todas las funcionalidades de la plataforma, sin necesidad de ingresar datos de pago.',
  },
  {
    question: '¿Qué métodos de pago aceptan?',
    answer:
      'Aceptamos pagos mediante transferencia bancaria. Una vez realizada la transferencia, suba el comprobante y su pago será verificado en menos de 24 horas.',
  },
  {
    question: '¿Puedo cambiar de plan en cualquier momento?',
    answer:
      'Sí. Puede actualizar o cambiar su plan desde la sección de Configuración de su cuenta. Los cambios se aplican en el siguiente ciclo de facturación.',
  },
  {
    question: '¿Mis datos están seguros?',
    answer:
      'Absolutamente. Utilizamos Supabase con Row Level Security (RLS), lo que garantiza que cada escuela solo pueda acceder a sus propios datos. Toda la comunicación está encriptada con TLS.',
  },
  {
    question: '¿Cómo funcionan las alertas de vencimiento?',
    answer:
      'El sistema monitorea automáticamente las fechas de vencimiento de todos sus documentos y certificados. Recibirá notificaciones con anticipación para que nunca se le pase una renovación.',
  },
  {
    question: '¿Puedo agregar más usuarios a mi cuenta?',
    answer:
      'Sí. Desde la sección de Configuración puede invitar a otros miembros de su equipo para que colaboren en la gestión de la documentación.',
  },
];

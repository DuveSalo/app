'use client';

import {
  FireExtinguisher,
  FileCheck,
  ShieldCheck,
  CalendarDays,
  Bell,
  Zap,
  ArrowUpDown,
  Thermometer,
  FlameKindling,
  ScanSearch,
} from 'lucide-react';
import { useInView } from '@/lib/hooks/useInView';

const SERVICES = [
  {
    icon: FireExtinguisher,
    title: 'Control de Extintores',
    description:
      'Inspecciones digitales con más de 40 campos de verificación. Historial completo y trazabilidad por unidad.',
    items: [
      'Tipo, capacidad y ubicación',
      'Fechas de recarga y vencimiento',
      'Estado y observaciones',
    ],
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
    dotColor: 'bg-orange-500',
    ringColor: 'ring-orange-200',
  },
  {
    icon: FileCheck,
    title: 'Certificado de Conservación',
    description:
      'Cargue y rastree todos los certificados obligatorios de su edificio con alertas de vencimiento automáticas.',
    items: ['N° de expediente e interventor', 'Fecha de presentación y vencimiento', 'PDF adjunto'],
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    dotColor: 'bg-blue-500',
    ringColor: 'ring-blue-200',
  },
  {
    icon: ShieldCheck,
    title: 'Sistema de Autoprotección',
    description:
      'Gestione disposiciones, extensiones y simulacros del plan de autoprotección de su institución.',
    items: ['Disposición probatoria', 'Registro de simulacros con actas', 'Fecha de vencimiento'],
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    dotColor: 'bg-violet-500',
    ringColor: 'ring-violet-200',
  },
  {
    icon: CalendarDays,
    title: 'Información del Evento',
    description:
      'Documente simulacros, incidentes y acciones correctivas con todo el detalle normativo requerido.',
    items: ['Simulacros de evacuación', 'Incidentes y accidentes', 'Acciones correctivas'],
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    dotColor: 'bg-emerald-500',
    ringColor: 'ring-emerald-200',
  },
  {
    icon: Bell,
    title: 'Alertas Automáticas',
    description:
      'Notificaciones proactivas por email antes de cada vencimiento. Panel de estado centralizado.',
    items: [
      'Alertas programadas con anticipación',
      'Dashboard con código de colores',
      'Historial de notificaciones',
    ],
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    dotColor: 'bg-amber-500',
    ringColor: 'ring-amber-200',
  },
  {
    icon: Zap,
    title: 'Medición de Puesta a Tierra',
    description: 'Mediciones de puesta a tierra e instalaciones eléctricas.',
    items: ['Medición de resistencia', 'Informe técnico', 'Certificación profesional'],
    iconBg: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
    dotColor: 'bg-yellow-500',
    ringColor: 'ring-yellow-200',
  },
  {
    icon: ArrowUpDown,
    title: 'Ascensores',
    description:
      'Gestione la documentación obligatoria de ascensores y montacargas de su institución.',
    items: ['Habilitación vigente', 'Certificado de mantenimiento', 'Fecha de vencimiento'],
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    dotColor: 'bg-teal-500',
    ringColor: 'ring-teal-200',
  },
  {
    icon: Thermometer,
    title: 'Termotanques y Calderas',
    description:
      'Control de termotanques, calderas y equipos de calefacción con seguimiento de habilitaciones.',
    items: ['Habilitación del equipo', 'Mantenimiento periódico', 'Certificación profesional'],
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    dotColor: 'bg-rose-500',
    ringColor: 'ring-rose-200',
  },
  {
    icon: FlameKindling,
    title: 'Inst. Fija Contra Incendios',
    description:
      'Registro y seguimiento de instalaciones fijas contra incendios: rociadores, hidrantes y más.',
    items: ['Sistema de rociadores', 'Red de hidrantes', 'Certificación y vencimiento'],
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
    dotColor: 'bg-red-500',
    ringColor: 'ring-red-200',
  },
  {
    icon: ScanSearch,
    title: 'Detección',
    description:
      'Sistemas de detección de incendio y monóxido de carbono con control de mantenimiento.',
    items: ['Detectores de humo', 'Detectores de monóxido', 'Fecha de revisión y vencimiento'],
    iconBg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
    dotColor: 'bg-cyan-500',
    ringColor: 'ring-cyan-200',
  },
] as const;

export function Features() {
  const { ref, isInView } = useInView({ threshold: 0.05 });

  return (
    <section id="funcionalidades" className="bg-muted py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-xl mx-auto text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Funcionalidades
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
            Todo lo que necesita para cumplir
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Gestione cada servicio de seguridad de su institución desde un único panel centralizado.
          </p>
        </div>

        <div
          ref={ref}
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 landing-fade-in ${isInView ? 'is-visible' : ''}`}
        >
          {SERVICES.map((service) => {
            const Icon = service.icon;

            return (
              <div
                key={service.title}
                className="landing-stagger-item group relative border border-border rounded-lg p-6 bg-background hover:border-foreground/20 transition-all duration-200 overflow-hidden"
              >
                {/* Subtle corner accent */}
                <div
                  className={`absolute -top-12 -right-12 w-24 h-24 rounded-full ${service.iconBg} opacity-50 transition-opacity group-hover:opacity-80`}
                />

                <div className="relative">
                  <div
                    className={`inline-flex items-center justify-center rounded-lg p-2.5 ring-1 ${service.iconBg} ${service.ringColor}`}
                  >
                    <Icon className={`h-5 w-5 ${service.iconColor}`} />
                  </div>

                  <h3 className="text-base font-semibold text-foreground mt-4">{service.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {service.description}
                  </p>
                  <ul className="mt-3 space-y-1.5">
                    {service.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <span
                          className={`w-1 h-1 rounded-full flex-shrink-0 ${service.dotColor}`}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

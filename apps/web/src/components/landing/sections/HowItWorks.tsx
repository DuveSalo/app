'use client';

import { UserPlus, Building2, ShieldCheck } from 'lucide-react';
import { useInView } from '@/lib/hooks/useInView';

const STEPS = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Regístrese',
    description: 'Cree su cuenta en segundos. Sin formularios largos ni contraseñas que recordar.',
  },
  {
    number: '02',
    icon: Building2,
    title: 'Configure su escuela',
    description: 'Ingrese los datos de su institución y active los módulos según sus necesidades.',
  },
  {
    number: '03',
    icon: ShieldCheck,
    title: 'Gestione su cumplimiento',
    description: 'Cargue documentos, reciba alertas y mantenga todo al día desde un solo panel.',
  },
] as const;

export function HowItWorks() {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section className="bg-background py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-xl mx-auto text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Cómo funciona
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
            Comience en tres simples pasos
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            De la registración al cumplimiento total en minutos.
          </p>
        </div>

        <div
          ref={ref}
          className={`relative grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 landing-fade-in ${isInView ? 'is-visible' : ''}`}
        >
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-20 left-[calc(16.667%+40px)] right-[calc(16.667%+40px)] border-t border-dashed border-border" />

          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="landing-stagger-item relative flex flex-col items-center text-center"
              >
                {/* Large watermark number */}
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[140px] font-bold text-foreground/[0.03] leading-none select-none pointer-events-none">
                  {step.number}
                </span>

                {/* Icon circle */}
                <div className="relative z-10">
                  <div className="flex items-center justify-center bg-primary text-primary-foreground rounded-full w-16 h-16">
                    <Icon className="h-7 w-7" />
                  </div>
                  <span className="absolute -top-1 -right-1 bg-background border-2 border-border text-foreground text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center leading-none">
                    {step.number}
                  </span>
                </div>

                <div className="mt-6 px-2 relative z-10">
                  <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-xs leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

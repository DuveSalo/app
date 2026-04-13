'use client';

import { Star } from 'lucide-react';
import { useInView } from '@/lib/hooks/useInView';

const TESTIMONIALS = [
  {
    quote:
      'Antes tardábamos semanas en preparar las auditorías. Ahora con Escuela Segura tenemos todo centralizado y listo en minutos.',
    name: 'María González',
    role: 'Directora',
    school: 'Instituto San Martín',
    initials: 'MG',
    avatarBg: 'bg-blue-100',
    avatarText: 'text-blue-700',
  },
  {
    quote:
      'El control de extintores digital es increíble. Las inspecciones que antes se hacían en papel ahora están digitalizadas con más de 40 campos de verificación.',
    name: 'Carlos Ruiz',
    role: 'Jefe de Mantenimiento',
    school: 'Colegio Belgrano',
    initials: 'CR',
    avatarBg: 'bg-violet-100',
    avatarText: 'text-violet-700',
  },
  {
    quote:
      'Las alertas automáticas nos salvaron de varias multas. Ahora recibimos notificaciones antes de que venzan los certificados.',
    name: 'Laura Fernández',
    role: 'Administradora',
    school: 'Escuela Técnica N°5',
    initials: 'LF',
    avatarBg: 'bg-emerald-100',
    avatarText: 'text-emerald-700',
  },
] as const;

export function Testimonials() {
  const { ref, isInView } = useInView({ threshold: 0.15 });

  return (
    <section className="bg-background py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-xl mx-auto text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Testimonios
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
            Lo que dicen nuestros clientes
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Instituciones educativas de todo el país confían en Escuela Segura.
          </p>
        </div>

        <div
          ref={ref}
          className={`grid grid-cols-1 md:grid-cols-3 gap-4 landing-fade-in ${isInView ? 'is-visible' : ''}`}
        >
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="landing-stagger-item border border-border rounded-lg p-6 bg-background flex flex-col transition-all duration-200"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                ))}
              </div>

              <p className="text-sm text-foreground leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="pt-4 mt-5 border-t border-border flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center ${t.avatarBg} ${t.avatarText} text-xs font-bold rounded-lg flex-shrink-0`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground leading-none">{t.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t.role}, {t.school}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

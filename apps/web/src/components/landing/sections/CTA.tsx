'use client';

import { ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_ROUTES } from '@/constants/landing';
import { useInView } from '@/lib/hooks/useInView';

export function CTA() {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section className="relative py-28 lg:py-36 overflow-hidden bg-foreground">
      {/* Geometric circle decorations */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full border border-white/[0.06]" />
      <div className="absolute -bottom-40 -left-20 w-80 h-80 rounded-full border border-white/[0.06]" />
      <div className="absolute top-1/4 right-1/3 w-64 h-64 rounded-full border border-white/[0.04]" />
      <div className="absolute bottom-1/3 left-1/4 w-40 h-40 rounded-full bg-white/[0.02]" />
      <div className="absolute top-1/2 -translate-y-1/2 right-1/4 w-48 h-48 rounded-full bg-white/[0.02]" />

      {/* Radial spotlight */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.05) 0%, transparent 60%)',
        }}
      />

      {/* Dot grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: 'radial-gradient(circle, #fafafa 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div
        ref={ref}
        className={`relative mx-auto max-w-6xl px-6 text-center landing-fade-in ${isInView ? 'is-visible' : ''}`}
      >
        <div className="inline-flex items-center justify-center bg-white/10 rounded-full w-14 h-14 mb-6">
          <Shield className="h-7 w-7 text-white" />
        </div>

        <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight max-w-2xl mx-auto">
          Comience a proteger su escuela hoy
        </h2>

        <p className="text-sm text-white/60 mt-4 max-w-md mx-auto leading-relaxed">
          14 días gratis. Sin tarjeta de crédito. Configure en 5 minutos.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            asChild
            className="bg-white text-foreground hover:bg-white/90 h-11 px-8 text-base"
          >
            <a href={APP_ROUTES.REGISTER}>
              Comenzar gratis
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="text-white hover:text-white hover:bg-white/10 h-11 px-8 text-base"
          >
            <a href="#funcionalidades">Ver funcionalidades</a>
          </Button>
        </div>

        <p className="mt-6 text-xs text-white/40 font-medium">
          Más de 50 instituciones educativas ya confían en Escuela Segura
        </p>
      </div>
    </section>
  );
}

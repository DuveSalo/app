'use client';

import {
  ArrowRight,
  LayoutDashboard,
  FireExtinguisher,
  FileCheck,
  ShieldCheck,
  ArrowUpDown,
  CalendarDays,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { APP_ROUTES } from '@/constants/landing';
import { useInView } from '@/lib/hooks/useInView';

const SIDEBAR_NAV = [
  { icon: LayoutDashboard, label: 'Inicio', active: true },
  { icon: FireExtinguisher, label: 'Extintores', active: false },
  { icon: FileCheck, label: 'Certificados', active: false },
  { icon: ShieldCheck, label: 'Autoprotección', active: false },
  { icon: ArrowUpDown, label: 'Ascensores', active: false },
  { icon: CalendarDays, label: 'Eventos', active: false },
] as const;

const DOCUMENTS = [
  {
    module: 'Extintores',
    doc: 'Inspector Grupo Norte',
    date: '15/08/2025',
    status: 'Vigente',
    statusClass: 'text-emerald-600',
    dotClass: 'bg-emerald-500',
  },
  {
    module: 'Certificados',
    doc: 'Habilitación Calderas',
    date: '03/04/2025',
    status: 'Por vencer',
    statusClass: 'text-amber-600',
    dotClass: 'bg-amber-500',
  },
  {
    module: 'Autoprotección',
    doc: 'Plan de Evacuación 2025',
    date: '20/06/2025',
    status: 'Vigente',
    statusClass: 'text-emerald-600',
    dotClass: 'bg-emerald-500',
  },
  {
    module: 'Ascensores',
    doc: 'Ascensor - Planta Baja',
    date: '01/03/2025',
    status: 'Vencido',
    statusClass: 'text-red-600',
    dotClass: 'bg-red-500',
  },
] as const;

export function Hero() {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section className="relative bg-background pt-28 lg:pt-40 pb-24 lg:pb-32 overflow-hidden">
      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: 'radial-gradient(circle, #d4d4d8 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div
          ref={ref}
          className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center landing-fade-in ${isInView ? 'is-visible' : ''}`}
        >
          {/* Left content */}
          <div>
            <div className="landing-stagger-item">
              <Badge variant="secondary" className="mb-6 rounded-lg text-xs font-medium px-3 py-1">
                Plataforma de cumplimiento escolar
              </Badge>
            </div>

            <h1 className="landing-stagger-item text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-foreground leading-[1.08]">
              Toda la seguridad
              <br />
              de tu escuela, <span className="text-muted-foreground">bajo control.</span>
            </h1>

            <p className="landing-stagger-item mt-6 text-lg text-muted-foreground max-w-lg leading-relaxed">
              Centraliza certificados, inspecciones y vencimientos. Alertas automáticas y auditorías
              en minutos.
            </p>

            <div className="landing-stagger-item mt-8 flex flex-col sm:flex-row gap-3">
              <Button asChild className="h-11 px-8 text-base">
                <a href={APP_ROUTES.REGISTER}>
                  Comenzar prueba gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" asChild className="h-11 px-8 text-base">
                <a href="#funcionalidades">Ver funcionalidades</a>
              </Button>
            </div>

            <p className="landing-stagger-item mt-4 text-xs text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Prueba gratis — Sin tarjeta de crédito
            </p>
          </div>

          {/* Right — Dashboard Mockup with perspective */}
          <div className="hidden md:block">
            <div
              className="rounded-lg border border-border overflow-hidden bg-background md:scale-90 lg:scale-100"
              style={{
                boxShadow: '0 25px 60px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.03)',
                transform: 'perspective(1500px) rotateY(-4deg)',
              }}
            >
              {/* Browser chrome */}
              <div className="bg-muted border-b border-border px-4 py-2.5 flex items-center gap-3">
                <div className="flex gap-1.5 flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/20" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-background border border-border rounded-lg px-4 py-0.5 text-[10px] text-muted-foreground/70 font-medium">
                    app.escuelasegura.com
                  </div>
                </div>
                <div className="w-12 flex-shrink-0" />
              </div>

              {/* App layout */}
              <div className="flex h-[348px] bg-background">
                {/* Sidebar */}
                <div className="w-[148px] border-r border-border bg-muted/30 flex flex-col py-2.5 flex-shrink-0">
                  <div className="px-3 mb-3 flex items-center gap-1.5">
                    <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-foreground text-[8px] font-bold">ES</span>
                    </div>
                    <span className="text-[10px] font-semibold text-foreground leading-tight">
                      Escuela Segura
                    </span>
                  </div>

                  <div className="h-px bg-border mx-2 mb-2" />

                  <nav className="flex flex-col gap-0.5 px-1.5">
                    {SIDEBAR_NAV.map(({ icon: Icon, label, active }) => (
                      <div
                        key={label}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px] font-medium ${
                          active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        <Icon className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{label}</span>
                      </div>
                    ))}
                  </nav>
                </div>

                {/* Main content */}
                <div className="flex-1 overflow-hidden flex flex-col gap-3 p-3">
                  <div>
                    <p className="text-xs font-semibold text-foreground">Panel de Control</p>
                    <p className="text-[10px] text-muted-foreground">Colegio San Martín</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        label: 'Al día',
                        value: '24',
                        valueClass: 'text-emerald-600',
                        bgClass: 'bg-emerald-50',
                      },
                      {
                        label: 'Por vencer',
                        value: '3',
                        valueClass: 'text-amber-600',
                        bgClass: 'bg-amber-50',
                      },
                      {
                        label: 'Vencidos',
                        value: '1',
                        valueClass: 'text-red-600',
                        bgClass: 'bg-red-50',
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className={`rounded-lg border border-border p-2.5 ${stat.bgClass}`}
                      >
                        <p className={`text-lg font-bold ${stat.valueClass}`}>{stat.value}</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5 font-medium">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Document list */}
                  <div className="flex-1 flex flex-col gap-1.5">
                    <p className="text-[10px] font-medium text-muted-foreground">
                      Documentos recientes
                    </p>
                    {DOCUMENTS.map((doc) => (
                      <div
                        key={doc.doc}
                        className="flex items-center justify-between py-1.5 px-2.5 border border-border rounded-lg bg-muted/30"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-[9px] text-muted-foreground/60 uppercase tracking-wide leading-none mb-0.5">
                            {doc.module}
                          </p>
                          <p className="text-[11px] text-foreground font-medium truncate">
                            {doc.doc}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="text-[9px] text-muted-foreground">{doc.date}</p>
                          <div className="flex items-center gap-1 justify-end mt-0.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${doc.dotClass}`} />
                            <span className={`text-[9px] font-medium ${doc.statusClass}`}>
                              {doc.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

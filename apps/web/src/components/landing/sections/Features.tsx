"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileCheck,
  FlameKindling,
  QrCode,
  Bell,
  ClipboardList,
} from "lucide-react";
import { useInView } from "@/hooks/useInView";

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: "Panel de Vencimientos",
    description:
      "Visualice el estado de toda su documentación en un dashboard centralizado con códigos de color.",
  },
  {
    icon: FileCheck,
    title: "Certificados de Conservación",
    description:
      "Cargue, rastree y reciba alertas de vencimiento para todos sus certificados obligatorios.",
  },
  {
    icon: FlameKindling,
    title: "Control de Matafuegos",
    description:
      "Inspecciones digitales con más de 40 campos de verificación. Nunca pierda un control.",
  },
  {
    icon: QrCode,
    title: "Documentos QR",
    description:
      "Gestione documentación de ascensores, termotanques, instalaciones eléctricas y más.",
  },
  {
    icon: Bell,
    title: "Alertas Automáticas",
    description:
      "Notificaciones proactivas antes de que sus documentos venzan. Cero multas por olvido.",
  },
  {
    icon: ClipboardList,
    title: "Registro de Eventos",
    description:
      "Documente simulacros, incidentes y acciones correctivas con todo el detalle requerido.",
  },
] as const;

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
} as const;

export function Features() {
  const { ref, isInView } = useInView({ threshold: 0.15 });

  return (
    <section id="funcionalidades" className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-warm-900 tracking-tight font-[family-name:var(--font-heading)]">
            Todo lo que necesita para cumplir con las normativas
          </h2>
          <p className="mt-4 text-warm-500 text-lg leading-relaxed">
            Herramientas diseñadas para simplificar la gestión de seguridad en
            instituciones educativas.
          </p>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="group relative rounded-2xl border border-warm-200 bg-white shadow-card p-6 transition-all hover:shadow-card-hover hover:border-brand-200"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 mb-4 transition-colors group-hover:bg-brand-100">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-warm-900 mb-2 font-[family-name:var(--font-heading)]">
                  {feature.title}
                </h3>
                <p className="text-sm text-warm-500 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

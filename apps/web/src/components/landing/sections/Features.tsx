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
    transition: { staggerChildren: 0.06 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
} as const;

export function Features() {
  const { ref, isInView } = useInView({ threshold: 0.15 });

  return (
    <section id="funcionalidades" className="py-16 lg:py-24 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">
            Todo lo que necesita para cumplir
          </h2>
          <p className="mt-3 text-neutral-500 text-sm leading-relaxed">
            Herramientas diseñadas para simplificar la gestión de seguridad en
            instituciones educativas.
          </p>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="group border border-neutral-200 bg-white p-5 transition-colors hover:border-neutral-300 rounded-lg"
              >
                <div className="flex h-9 w-9 items-center justify-center bg-neutral-100 text-neutral-900 mb-3 transition-colors group-hover:bg-neutral-200 rounded-md">
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
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

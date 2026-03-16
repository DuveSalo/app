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
import { useInView } from "@/lib/hooks/useInView";

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
    <section id="funcionalidades" className="bg-muted py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-foreground tracking-tight">
            Todo lo que necesita para cumplir
          </h2>
          <p className="mt-3 text-muted-foreground">
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
                className="border border-border rounded-lg p-6 bg-background hover:border-foreground/20 transition-colors"
              >
                <div className="inline-flex items-center justify-center bg-muted rounded-lg p-2.5">
                  <Icon className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="text-base font-semibold text-foreground mt-4">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
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

"use client";

import { motion } from "framer-motion";
import { useInView } from "@/lib/hooks/useInView";

const STEPS = [
  {
    number: 1,
    title: "Regístrese con Google",
    description:
      "Cree su cuenta en segundos usando su cuenta de Google. Sin formularios largos ni contraseñas.",
  },
  {
    number: 2,
    title: "Configure su escuela",
    description:
      "Ingrese los datos de su institución y personalice los módulos según sus necesidades.",
  },
  {
    number: 3,
    title: "Gestione su cumplimiento",
    description:
      "Cargue documentos, reciba alertas y mantenga todo al día desde un solo panel.",
  },
] as const;

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
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

export function HowItWorks() {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section className="bg-background py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-foreground tracking-tight">
            Comience en tres simples pasos
          </h2>
          <p className="mt-3 text-muted-foreground">
            De la registración al cumplimiento total en minutos.
          </p>
        </div>

        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="relative grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
        >
          {/* Connecting dashed lines between step circles (desktop only) */}
          <div className="hidden md:block absolute top-5 left-[calc(16.667%+20px)] right-[calc(16.667%+20px)] border-t border-dashed border-border" />

          {STEPS.map((step) => (
            <motion.div
              key={step.number}
              variants={itemVariants}
              className="relative text-center"
            >
              <div className="flex items-center justify-center bg-primary text-primary-foreground rounded-full w-10 h-10 text-sm font-bold mx-auto">
                {step.number}
              </div>
              <h3 className="text-base font-semibold text-foreground mt-4 text-center">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-2 text-center max-w-xs mx-auto leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

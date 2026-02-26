"use client";

import { motion } from "framer-motion";
import { UserPlus, Building, ShieldCheck } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const STEPS = [
  {
    icon: UserPlus,
    step: "01",
    title: "Regístrese con Google",
    description:
      "Cree su cuenta en segundos usando su cuenta de Google. Sin formularios largos ni contraseñas.",
  },
  {
    icon: Building,
    step: "02",
    title: "Configure su escuela",
    description:
      "Ingrese los datos de su institución y personalice los módulos según sus necesidades.",
  },
  {
    icon: ShieldCheck,
    step: "03",
    title: "Gestione su cumplimiento",
    description:
      "Cargue documentos, reciba alertas y mantenga todo al día desde un solo panel.",
  },
] as const;

export function HowItWorks() {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section className="py-20 lg:py-28 bg-warm-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-warm-900 tracking-tight font-[family-name:var(--font-heading)]">
            Comience en tres simples pasos
          </h2>
          <p className="mt-4 text-warm-500 text-lg leading-relaxed">
            De la registración al cumplimiento total en minutos.
          </p>
        </div>

        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } },
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
        >
          {STEPS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.5, ease: "easeOut" as const },
                  },
                }}
                className="relative text-center"
              >
                {/* Connecting line (desktop only) */}
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-brand-300 to-warm-300" />
                )}

                <div className="relative inline-flex flex-col items-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white border border-warm-200 shadow-sm mb-5">
                    <Icon className="h-8 w-8 text-brand-700" />
                  </div>
                  <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-brand-700 text-white text-xs font-bold font-[family-name:var(--font-mono)]">
                    {item.step}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-warm-900 mb-2 font-[family-name:var(--font-heading)]">
                  {item.title}
                </h3>
                <p className="text-sm text-warm-500 leading-relaxed max-w-xs mx-auto">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

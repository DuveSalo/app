"use client";

import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";

const TESTIMONIALS = [
  {
    quote:
      "Antes tardábamos semanas en preparar las auditorías. Ahora con Escuela Segura tenemos todo centralizado y listo en minutos. Nos cambió la forma de trabajar.",
    name: "María González",
    role: "Directora",
    school: "Instituto San Martín",
    initials: "MG",
  },
  {
    quote:
      "El control de matafuegos digital es increíble. Las inspecciones que antes se hacían en papel ahora están digitalizadas con más de 40 campos de verificación.",
    name: "Carlos Ruiz",
    role: "Jefe de Mantenimiento",
    school: "Colegio Belgrano",
    initials: "CR",
  },
  {
    quote:
      "Las alertas automáticas nos salvaron de varias multas. Ahora recibimos notificaciones antes de que venzan los certificados y podemos actuar a tiempo.",
    name: "Laura Fernández",
    role: "Administradora",
    school: "Escuela Técnica N°5",
    initials: "LF",
  },
] as const;

export function Testimonials() {
  const { ref, isInView } = useInView({ threshold: 0.15 });

  return (
    <section className="py-20 lg:py-28 bg-warm-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-warm-900 tracking-tight font-[family-name:var(--font-heading)]">
            Lo que dicen nuestros clientes
          </h2>
          <p className="mt-4 text-warm-500 text-lg leading-relaxed">
            Instituciones educativas de todo el país confían en Escuela Segura.
          </p>
        </div>

        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6"
        >
          {TESTIMONIALS.map((t) => (
            <motion.div
              key={t.name}
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: "easeOut" as const },
                },
              }}
              className="rounded-2xl border border-warm-200 bg-white shadow-card p-6 lg:p-7"
            >
              {/* Quote */}
              <div className="mb-6">
                <svg
                  className="h-8 w-8 text-brand-200 mb-3"
                  fill="currentColor"
                  viewBox="0 0 32 32"
                >
                  <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z" />
                </svg>
                <p className="text-sm text-warm-600 leading-relaxed">
                  {t.quote}
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-warm-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-sm font-bold font-[family-name:var(--font-heading)]">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-warm-900">
                    {t.name}
                  </p>
                  <p className="text-xs text-warm-500">
                    {t.role}, {t.school}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

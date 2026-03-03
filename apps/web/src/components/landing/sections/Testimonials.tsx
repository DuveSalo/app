"use client";

import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";

const TESTIMONIALS = [
  {
    quote:
      "Antes tardábamos semanas en preparar las auditorías. Ahora con Escuela Segura tenemos todo centralizado y listo en minutos.",
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
      "Las alertas automáticas nos salvaron de varias multas. Ahora recibimos notificaciones antes de que venzan los certificados.",
    name: "Laura Fernández",
    role: "Administradora",
    school: "Escuela Técnica N°5",
    initials: "LF",
  },
] as const;

export function Testimonials() {
  const { ref, isInView } = useInView({ threshold: 0.15 });

  return (
    <section className="py-16 lg:py-24 bg-neutral-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">
            Lo que dicen nuestros clientes
          </h2>
          <p className="mt-3 text-neutral-500 text-sm leading-relaxed">
            Instituciones educativas de todo el país confían en Escuela Segura.
          </p>
        </div>

        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {TESTIMONIALS.map((t) => (
            <motion.div
              key={t.name}
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.4, ease: "easeOut" as const },
                },
              }}
              className="border border-neutral-200 bg-white p-5 rounded-lg"
            >
              {/* Quote */}
              <div className="mb-5">
                <svg
                  className="h-6 w-6 text-neutral-200 mb-2.5"
                  fill="currentColor"
                  viewBox="0 0 32 32"
                >
                  <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z" />
                </svg>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {t.quote}
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-2.5 pt-3.5 border-t border-neutral-100">
                <div className="flex h-8 w-8 items-center justify-center bg-neutral-100 text-neutral-900 text-[11px] font-bold rounded-md">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    {t.name}
                  </p>
                  <p className="text-[11px] text-neutral-500">
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

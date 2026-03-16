"use client";

import { motion } from "framer-motion";
import { useInView } from "@/lib/hooks/useInView";

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
    <section className="bg-background py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground tracking-tight">
            Lo que dicen nuestros clientes
          </h2>
          <p className="mt-3 text-muted-foreground">
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
              className="border border-border rounded-lg p-6 bg-background"
            >
              <svg
                className="h-6 w-6 text-muted-foreground/30 mb-3"
                fill="currentColor"
                viewBox="0 0 32 32"
              >
                <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z" />
              </svg>

              <p className="text-sm text-foreground italic leading-relaxed">{t.quote}</p>

              <div className="pt-4 mt-4 border-t border-border flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center bg-muted text-foreground text-xs font-bold rounded-lg">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">
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

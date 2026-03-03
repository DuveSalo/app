"use client";

import { motion } from "framer-motion";
import { Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/landing/ui/button";
import { Badge } from "@/components/landing/ui/badge";
import { APP_ROUTES } from "@/lib/landing-constants";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-neutral-950">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-[0.04]"
        style={{
          background: "radial-gradient(circle, white 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-28 lg:py-36">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Badge
              variant="outline"
              className="mb-5 border-neutral-700 bg-neutral-800/50 text-neutral-400 px-2.5 py-1 text-xs font-medium rounded-md"
            >
              <Shield className="w-3 h-3 mr-1.5" />
              Plataforma de cumplimiento escolar
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.1] tracking-tight ">
              Toda la seguridad
              <br />
              de tu escuela,{" "}
              <span className="text-neutral-500">
                bajo control.
              </span>
            </h1>

            <p className="mt-5 text-base text-neutral-400 max-w-md leading-relaxed">
              Centraliza certificados, inspecciones y vencimientos. Alertas
              automáticas y auditorías en minutos.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                size="lg"
                className="bg-white hover:bg-neutral-100 text-neutral-900 px-6 h-11 text-sm font-medium transition-colors"
              >
                <a href={APP_ROUTES.REGISTER}>
                  Comenzar prueba gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white px-6 h-11 text-sm bg-transparent"
              >
                <a href="#funcionalidades">Ver funcionalidades</a>
              </Button>
            </div>

            <p className="mt-4 text-xs text-neutral-600">
              14 días gratis — Sin tarjeta de crédito
            </p>
          </motion.div>

          {/* Right — Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="relative bg-neutral-900/80 border border-neutral-800 p-5 rounded-lg backdrop-blur">
                {/* Title bar */}
                <div className="flex items-center gap-1.5 mb-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
                  <span className="ml-2 text-[11px] text-neutral-600 font-medium">
                    Panel de Control
                  </span>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2.5 mb-4">
                  {[
                    { label: "Al día", value: "24", color: "text-emerald-400" },
                    { label: "Por vencer", value: "3", color: "text-amber-400" },
                    { label: "Vencidos", value: "1", color: "text-red-400" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-neutral-800/60 border border-neutral-700/40 p-3 text-center rounded-md"
                    >
                      <p className={`text-xl font-bold font-mono ${stat.color}`}>
                        {stat.value}
                      </p>
                      <p className="text-[10px] text-neutral-500 mt-0.5 font-medium">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Document list */}
                <div className="space-y-1.5">
                  {[
                    { name: "Certificado Matafuegos", status: "Vigente", dot: "bg-emerald-500" },
                    { name: "Habilitación Calderas", status: "Por vencer", dot: "bg-amber-500" },
                    { name: "Cert. Inst. Eléctrica", status: "Vigente", dot: "bg-emerald-500" },
                    { name: "Plan de Evacuación", status: "Vigente", dot: "bg-emerald-500" },
                  ].map((doc) => (
                    <div
                      key={doc.name}
                      className="flex items-center justify-between py-2 px-3 bg-neutral-800/30 border border-neutral-700/20 rounded-md"
                    >
                      <span className="text-sm text-neutral-300">{doc.name}</span>
                      <span className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                        <span className={`w-1.5 h-1.5 rounded-full ${doc.dot}`} />
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

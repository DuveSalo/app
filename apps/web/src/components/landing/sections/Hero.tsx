"use client";

import { motion } from "framer-motion";
import { Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/landing/ui/button";
import { Badge } from "@/components/landing/ui/badge";
import { APP_ROUTES } from "@/lib/landing-constants";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-warm-950">
      {/* Dot grid pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Gradient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-brand-900/40 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-brand-800/30 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/2 right-0 w-[300px] h-[300px] bg-warm-800/20 rounded-full blur-[100px]" />
      </div>

      {/* Geometric accent lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-transparent via-white/[0.04] to-transparent" />
        <div className="absolute top-0 left-2/3 w-px h-full bg-gradient-to-b from-transparent via-white/[0.03] to-transparent" />
        <div className="absolute top-1/3 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Badge
              variant="outline"
              className="mb-6 border-brand-400/30 bg-brand-400/10 text-brand-300 px-3 py-1.5 text-xs font-medium rounded-full"
            >
              <Shield className="w-3.5 h-3.5 mr-1.5" />
              Plataforma de cumplimiento para escuelas
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight font-[family-name:var(--font-heading)]">
              Toda la documentación de seguridad,{" "}
              <span className="bg-gradient-to-r from-brand-400 to-brand-300 bg-clip-text text-transparent">
                en un solo lugar
              </span>
            </h1>

            <p className="mt-6 text-lg text-warm-400 max-w-lg leading-relaxed">
              Centralice certificados, inspecciones y vencimientos. Reciba
              alertas automáticas y prepare auditorías en minutos, no en días.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-xl bg-brand-600 hover:bg-brand-500 text-white px-7 h-12 text-base font-semibold shadow-md shadow-brand-600/25 transition-all hover:shadow-lg hover:shadow-brand-500/30"
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
                className="rounded-xl border-warm-700 text-warm-300 hover:bg-warm-800/50 hover:text-white px-7 h-12 text-base bg-transparent"
              >
                <a href="#funcionalidades">Ver funcionalidades</a>
              </Button>
            </div>

            <p className="mt-4 text-sm text-warm-500 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-400" />
              14 días gratis. Sin tarjeta de crédito.
            </p>
          </motion.div>

          {/* Right — Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="hidden lg:block"
          >
            <div className="relative">
              {/* Glow behind card */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-brand-600/20 to-brand-400/10 rounded-lg blur-2xl" />

              {/* Dashboard card mockup */}
              <div className="relative bg-warm-900/80 backdrop-blur-sm rounded-2xl border border-warm-700/50 p-6 shadow-none">
                {/* Title bar */}
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-3 h-3 rounded-full bg-red-400/60" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/60" />
                  <div className="w-3 h-3 rounded-full bg-brand-400/60" />
                  <span className="ml-3 text-xs text-warm-500">
                    Panel de Cumplimiento
                  </span>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    {
                      label: "Al día",
                      value: "24",
                      color: "bg-brand-500/20 text-brand-400",
                    },
                    {
                      label: "Por vencer",
                      value: "3",
                      color: "bg-amber-500/20 text-amber-400",
                    },
                    {
                      label: "Vencidos",
                      value: "1",
                      color: "bg-red-500/20 text-red-400",
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl bg-warm-800/50 border border-warm-700/30 p-3 text-center"
                    >
                      <p
                        className={`text-2xl font-bold font-[family-name:var(--font-mono)] ${stat.color.split(" ")[1]}`}
                      >
                        {stat.value}
                      </p>
                      <p className="text-xs text-warm-500 mt-1">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Document list */}
                <div className="space-y-2">
                  {[
                    {
                      name: "Certificado Matafuegos",
                      status: "Vigente",
                      statusColor: "bg-brand-500",
                    },
                    {
                      name: "Habilitación Calderas",
                      status: "Por vencer",
                      statusColor: "bg-amber-500",
                    },
                    {
                      name: "Cert. Inst. Eléctrica",
                      status: "Vigente",
                      statusColor: "bg-brand-500",
                    },
                    {
                      name: "Plan de Evacuación",
                      status: "Vigente",
                      statusColor: "bg-brand-500",
                    },
                  ].map((doc) => (
                    <div
                      key={doc.name}
                      className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-warm-800/30 border border-warm-700/20"
                    >
                      <span className="text-sm text-warm-300">{doc.name}</span>
                      <span className="flex items-center gap-1.5 text-xs text-warm-500">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${doc.statusColor}`}
                        />
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

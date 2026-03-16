"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { APP_ROUTES } from "@/constants/landing";

export function Hero() {
  return (
    <section className="bg-background pt-28 lg:pt-36 pb-16 lg:pb-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Badge variant="secondary" className="mb-5 rounded-lg text-xs font-medium">
              Plataforma de cumplimiento escolar
            </Badge>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
              Toda la seguridad
              <br />
              de tu escuela,{" "}
              <span className="text-muted-foreground">bajo control.</span>
            </h1>

            <p className="mt-5 text-lg text-muted-foreground max-w-lg leading-relaxed">
              Centraliza certificados, inspecciones y vencimientos. Alertas automáticas y
              auditorías en minutos.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button asChild className="h-11 px-8 text-base">
                <a href={APP_ROUTES.REGISTER}>
                  Comenzar prueba gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" asChild className="h-11 px-8 text-base">
                <a href="#funcionalidades">Ver funcionalidades</a>
              </Button>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Prueba gratis — Sin tarjeta de crédito
            </p>
          </motion.div>

          {/* Right — Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="hidden lg:block"
          >
            <div className="bg-muted/50 border border-border rounded-lg p-5 shadow-sm">
              {/* Title bar */}
              <div className="flex items-center gap-1.5 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/20" />
                <span className="ml-2 text-xs text-muted-foreground font-medium">
                  Panel de Control
                </span>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2.5 mb-4">
                {[
                  { label: "Al día", value: "24", color: "text-emerald-600" },
                  { label: "Por vencer", value: "3", color: "text-amber-600" },
                  { label: "Vencidos", value: "1", color: "text-red-600" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-background border border-border rounded-lg p-3 text-center"
                  >
                    <p className={`text-xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
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
                    className="flex items-center justify-between py-2 px-3 bg-muted/50 border border-border rounded-lg"
                  >
                    <span className="text-sm text-foreground">{doc.name}</span>
                    <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className={`w-1.5 h-1.5 rounded-full ${doc.dot}`} />
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/landing/ui/accordion";
import { FAQ_DATA } from "@/lib/landing-constants";
import { useInView } from "@/hooks/useInView";

export function FAQ() {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section id="faq" className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-warm-900 tracking-tight font-[family-name:var(--font-heading)]">
            Preguntas Frecuentes
          </h2>
          <p className="mt-4 text-warm-500 text-lg leading-relaxed">
            Todo lo que necesita saber sobre Escuela Segura.
          </p>
        </div>

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {FAQ_DATA.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-xl border border-warm-200 px-5 data-[state=open]:bg-warm-50/50 data-[state=open]:border-brand-200 transition-colors"
              >
                <AccordionTrigger className="text-sm font-semibold text-warm-800 hover:text-brand-700 py-4 hover:no-underline font-[family-name:var(--font-heading)]">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-warm-500 leading-relaxed pb-4">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}

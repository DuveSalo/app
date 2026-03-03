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
    <section id="faq" className="py-16 lg:py-24 bg-white">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">
            Preguntas Frecuentes
          </h2>
          <p className="mt-3 text-neutral-500 text-sm leading-relaxed">
            Todo lo que necesita saber sobre Escuela Segura.
          </p>
        </div>

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Accordion type="single" collapsible className="space-y-2">
            {FAQ_DATA.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border border-neutral-200 px-4 data-[state=open]:bg-neutral-50/50 transition-colors rounded-lg"
              >
                <AccordionTrigger className="text-sm font-semibold text-neutral-800 hover:text-neutral-900 py-3.5 hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-neutral-500 leading-relaxed pb-3.5">
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

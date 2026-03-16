"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ_DATA } from "@/constants/landing";
import { useInView } from "@/lib/hooks/useInView";

export function FAQ() {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section id="faq" className="bg-muted py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground tracking-tight">
            Preguntas Frecuentes
          </h2>
          <p className="mt-3 text-muted-foreground">
            Todo lo que necesita saber sobre Escuela Segura.
          </p>
        </div>

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="max-w-2xl mx-auto"
        >
          <Accordion type="single" collapsible>
            {FAQ_DATA.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-sm font-medium text-left hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
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

'use client';

import { HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FAQ_DATA } from '@/constants/landing';
import { useInView } from '@/lib/hooks/useInView';

export function FAQ() {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section id="faq" className="bg-muted py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-xl mx-auto text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            FAQ
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
            Preguntas frecuentes
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Todo lo que necesita saber sobre Escuela Segura.
          </p>
        </div>

        <div
          ref={ref}
          className={`max-w-2xl mx-auto landing-fade-in ${isInView ? 'is-visible' : ''}`}
        >
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {FAQ_DATA.length} preguntas respondidas
            </span>
          </div>

          <div className="bg-background border border-border rounded-lg overflow-hidden">
            <Accordion type="single" collapsible>
              {FAQ_DATA.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className={i === FAQ_DATA.length - 1 ? 'border-b-0' : ''}
                >
                  <AccordionTrigger className="text-sm font-medium text-left hover:no-underline px-5">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed px-5">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}

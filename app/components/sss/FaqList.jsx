'use client';

import {
 Accordion,
 AccordionContent,
 AccordionItem,
 AccordionTrigger,
} from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function FaqList({ items = [] }) {
 if (!items?.length) {
  return (
   <Card className="max-w-3xl mx-auto p-10 text-center border-gray-200/80 dark:border-dark-500/40">
    <p className="text-body">Henüz soru eklenmemiş.</p>
   </Card>
  );
 }

 return (
  <div className="max-w-3xl mx-auto animate-slideUp">
   <Card className="overflow-hidden border-gray-200/80 dark:border-dark-500/40 shadow-sm">
    <Accordion type="single" collapsible className="w-full px-6 md:px-8">
     {items.map((item, index) => (
      <AccordionItem
       key={index}
       value={`faq-${index}`}
       className={cn(
        'border-gray-200/80 dark:border-dark-500/40',
        index === items.length - 1 && 'border-b-0'
       )}
      >
       <AccordionTrigger className="hover:no-underline">
        {item.question}
       </AccordionTrigger>
       <AccordionContent>
        <p className="whitespace-pre-line text-body leading-relaxed">
         {item.answer}
        </p>
       </AccordionContent>
      </AccordionItem>
     ))}
    </Accordion>
   </Card>
  </div>
 );
}

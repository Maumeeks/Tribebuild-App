
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  children,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white mb-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors group"
      >
        <span className="font-bold text-slate-800 text-lg">{title}</span>
        <div className={cn(
          'p-1.5 rounded-full border border-slate-200 transition-all group-hover:border-brand-blue group-hover:bg-brand-blue group-hover:text-white',
          isOpen ? 'bg-brand-blue text-white border-brand-blue rotate-180' : 'text-slate-400'
        )}>
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-50 pt-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface AccordionProps {
  children: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> & { Item: typeof AccordionItem } = ({ children }) => {
  return <div className="w-full">{children}</div>;
};

Accordion.Item = AccordionItem;

export default Accordion;


import React from 'react';
import { cn } from '../lib/utils';

interface CardProps {
  variant?: 'default' | 'glass' | 'gradient';
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  children,
  header,
  footer,
  className,
  hover = false,
}) => {
  const variants = {
    default: 'bg-white border border-slate-100 shadow-sm',
    glass: 'bg-white/80 backdrop-blur-md border border-white/20 shadow-glass',
    gradient: 'bg-gradient-to-br from-white to-blue-50/50 border border-blue-100/50 shadow-sm',
  };

  return (
    <div
      className={cn(
        'rounded-[2rem] overflow-hidden transition-all duration-300',
        variants[variant],
        hover && 'hover:-translate-y-2 hover:shadow-xl',
        className
      )}
    >
      {header && (
        <div className="px-6 py-4 border-b border-slate-100/50">
          {header}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 border-t border-slate-100/50 bg-slate-50/30">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;

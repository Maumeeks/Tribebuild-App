
import React from 'react';
import { LucideIcon, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface BadgeProps {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: LucideIcon;
  onRemove?: () => void;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon: Icon,
  onRemove,
  className,
}) => {
  const variants = {
    primary: 'bg-brand-blue/10 text-brand-blue',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    gray: 'bg-slate-100 text-slate-700',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 font-bold',
    md: 'text-xs px-3 py-1 font-bold',
    lg: 'text-sm px-4 py-1.5 font-bold',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full uppercase tracking-tighter transition-all duration-300',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 hover:opacity-70 transition-opacity p-0.5 rounded-full hover:bg-black/5"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

export default Badge;

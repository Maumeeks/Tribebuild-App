
import React from 'react';
import { User } from 'lucide-react';
import { cn } from '../lib/utils';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy';
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  fallback,
  size = 'md',
  status,
}) => {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-slate-400',
    busy: 'bg-red-500',
  };

  const dotSizes = {
    xs: 'w-2 h-2 border',
    sm: 'w-2.5 h-2.5 border',
    md: 'w-3.5 h-3.5 border-2',
    lg: 'w-4 h-4 border-2',
    xl: 'w-5 h-5 border-[3px]',
  };

  return (
    <div className="relative inline-flex">
      <div className={cn(
        'rounded-2xl overflow-hidden flex items-center justify-center bg-slate-100 border border-slate-200 text-slate-500 font-bold uppercase',
        sizes[size]
      )}>
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : fallback ? (
          <span>{fallback}</span>
        ) : (
          <User className="w-1/2 h-1/2" />
        )}
      </div>
      
      {status && (
        <div className={cn(
          'absolute -bottom-0.5 -right-0.5 rounded-full border-white',
          statusColors[status],
          dotSizes[size]
        )} />
      )}
    </div>
  );
};

export default Avatar;

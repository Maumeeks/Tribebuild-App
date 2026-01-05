
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <Loader2 
      className={cn('animate-spin text-brand-blue', sizes[size], className)} 
    />
  );
};

interface SkeletonProps {
  className?: string;
}

const LoadingSkeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div 
      className={cn('bg-slate-200 animate-pulse rounded-xl', className)} 
    />
  );
};

export const Loading = {
  Spinner: LoadingSpinner,
  Skeleton: LoadingSkeleton,
};

export default Loading;

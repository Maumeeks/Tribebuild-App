
import React from 'react';

interface TribeBuildLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export default function TribeBuildLogo({ 
  size = 'md', 
  showText = true,
  className = '' 
}: TribeBuildLogoProps) {
  
  const sizes = {
    sm: { icon: 28, text: 'text-lg' },
    md: { icon: 40, text: 'text-2xl' },
    lg: { icon: 56, text: 'text-3xl' },
    xl: { icon: 80, text: 'text-4xl' },
  };

  const { icon, text } = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg 
        width={icon} 
        height={icon} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 hover:scale-110 drop-shadow-md"
      >
        <path d="M20 40 L40 60 L20 80 L0 60 Z" fill="#2563EB"/>
        <path d="M20 40 L40 60 L40 85 L20 65 Z" fill="#1D4ED8"/>
        <path d="M60 40 L80 60 L60 80 L40 60 Z" fill="#2563EB"/>
        <path d="M60 40 L80 60 L80 85 L60 65 Z" fill="#1D4ED8"/>
        <path d="M40 20 L60 40 L40 60 L20 40 Z" fill="#FF6B6B"/>
      </svg>

      {showText && (
        <span className={`font-display font-black tracking-tighter ${text} text-slate-900 dark:text-white`}>
          Tribe<span className="text-brand-blue">Build</span>
        </span>
      )}
    </div>
  );
}


import React, { useState } from 'react';
import { LucideIcon, Eye, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className,
  type = 'text',
  disabled,
  required,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      {label && (
        <label className="block text-sm font-semibold text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative group">
        {LeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-blue transition-colors">
            <LeftIcon className="w-5 h-5" />
          </div>
        )}
        
        <input
          type={inputType}
          disabled={disabled}
          className={cn(
            'w-full py-3.5 bg-slate-50 border transition-all duration-300 outline-none rounded-2xl',
            'placeholder:text-slate-400 font-medium',
            LeftIcon ? 'pl-12' : 'px-4',
            (RightIcon || isPassword) ? 'pr-12' : 'px-4',
            error 
              ? 'border-red-500 text-red-500 focus:ring-red-100' 
              : 'border-slate-100 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 text-slate-900',
            disabled && 'bg-slate-100 cursor-not-allowed opacity-60'
          )}
          {...props}
        />

        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        ) : (
          RightIcon && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
              <RightIcon className="w-5 h-5" />
            </div>
          )
        )}
      </div>

      {(error || helperText) && (
        <p className={cn('text-xs font-medium', error ? 'text-red-500' : 'text-slate-400')}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Input;

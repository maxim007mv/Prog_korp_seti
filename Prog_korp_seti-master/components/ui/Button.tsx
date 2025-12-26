import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
        {
          'bg-accent text-white hover:bg-accent-dark': variant === 'primary',
          'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
          'border-2 border-accent text-accent hover:bg-accent hover:text-white':
            variant === 'outline',
          'hover:bg-gray-100': variant === 'ghost',
          'px-3 py-1.5 text-sm min-h-[36px]': size === 'sm',
          'px-4 py-2 min-h-touch': size === 'md',
          'px-6 py-3 text-lg min-h-[52px]': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

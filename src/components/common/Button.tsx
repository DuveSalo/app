
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary: 'bg-zinc-900 text-white hover:bg-zinc-800 focus-visible:ring-zinc-400 shadow-sm hover:shadow',
        secondary: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 focus-visible:ring-zinc-400',
        outline: 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 focus-visible:ring-zinc-400',
        ghost: 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:ring-zinc-400',
        danger: 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-400 shadow-sm hover:shadow',
        success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-400 shadow-sm hover:shadow',
        soft: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 focus-visible:ring-indigo-400',
      },
      size: {
        xs: 'px-2.5 py-1.5 text-xs',
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-5 py-2.5 text-base',
        xl: 'px-6 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant,
  size,
  loading = false,
  disabled,
  className,
  ...props
}) => {
  return (
    <button
      className={clsx(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};

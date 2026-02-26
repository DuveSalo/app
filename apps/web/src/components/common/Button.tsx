import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-900 border border-brand-700 hover:border-brand-800 shadow-sm hover:shadow-md focus-visible:ring-brand-700/30',
        secondary:
          'bg-neutral-100 text-neutral-800 hover:bg-neutral-200 active:bg-neutral-300 border border-neutral-200 shadow-xs hover:shadow-sm focus-visible:ring-neutral-400/30',
        outline:
          'border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50 active:bg-neutral-100 shadow-xs hover:shadow-sm focus-visible:ring-neutral-400/30',
        ghost:
          'text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 border border-transparent focus-visible:ring-neutral-400/30',
        danger:
          'bg-red-700 text-white hover:bg-red-800 active:bg-red-900 border border-red-700 shadow-sm hover:shadow-md focus-visible:ring-red-700/30',
        success:
          'bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-900 border border-brand-700 shadow-sm hover:shadow-md focus-visible:ring-brand-700/30',
        soft:
          'bg-brand-50 text-brand-800 border border-brand-200 hover:bg-brand-100 active:bg-brand-200 focus-visible:ring-brand-400/30',
        link:
          'text-brand-700 underline-offset-4 hover:underline border border-transparent focus-visible:ring-brand-400/30',
      },
      size: {
        xs: 'h-7 px-2.5 text-xs rounded-md',
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4',
        lg: 'h-10 px-5',
        xl: 'h-11 px-6 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { buttonVariants };

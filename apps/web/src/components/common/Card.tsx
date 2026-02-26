import { forwardRef, type HTMLAttributes, type KeyboardEvent, type MouseEvent } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'bg-white border rounded-xl transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'border-neutral-200 shadow-card',
        elevated: 'border-neutral-200 shadow-md',
        flat: 'border-neutral-100',
        outline: 'border-neutral-300',
      },
      padding: {
        none: 'p-0',
        sm: 'p-3 sm:p-4',
        md: 'p-4 sm:p-5',
        lg: 'p-5 sm:p-6',
        xl: 'p-6 sm:p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof cardVariants> {
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, onClick, children, ...props }, ref) => {
    const isClickable = !!onClick;

    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant, padding }),
          isClickable && 'cursor-pointer hover:shadow-card-hover hover:border-neutral-300',
          className
        )}
        onClick={onClick}
        {...(isClickable && {
          role: 'button',
          tabIndex: 0,
          onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClick?.(e as unknown as MouseEvent<HTMLDivElement>);
            }
          },
        })}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 pb-4', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-base font-semibold leading-none text-neutral-900 tracking-tight font-[family-name:var(--font-heading)]', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-neutral-500', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
));
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

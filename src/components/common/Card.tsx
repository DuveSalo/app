
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';

const cardVariants = cva(
  'bg-white rounded-xl border border-zinc-200/80 transition-all duration-200 ease-out overflow-hidden',
  {
    variants: {
      padding: {
        sm: 'p-4',
        md: 'p-5',
        lg: 'p-6',
        xl: 'p-8',
        none: 'p-0',
      },
      variant: {
        default: 'shadow-card',
        elevated: 'shadow-md',
        flat: 'shadow-none border-zinc-100',
        outline: 'shadow-none border-zinc-200',
      },
      clickable: {
        true: 'cursor-pointer hover:shadow-card-hover hover:border-zinc-300/60 active:scale-[0.995]',
      },
    },
    defaultVariants: {
      padding: 'md',
      variant: 'default',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding,
  variant,
  ...props
}) => {
  const isClickable = !!props.onClick;

  return (
    <div
      className={clsx(cardVariants({ padding, variant, clickable: isClickable, className }))}
      {...props}
    >
      {children}
    </div>
  );
};

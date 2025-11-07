
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';

const cardVariants = cva('bg-white rounded-lg shadow-sm border border-gray-200 transition-shadow duration-200', {
  variants: {
    padding: {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      none: 'p-0',
    },
    clickable: {
      true: 'cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200',
    },
  },
  defaultVariants: {
    padding: 'md',
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding,
  ...props
}) => {
  const isClickable = !!props.onClick;

  return (
    <div
      className={clsx(cardVariants({ padding, clickable: isClickable, className }))}
      {...props}
    >
      {children}
    </div>
  );
};

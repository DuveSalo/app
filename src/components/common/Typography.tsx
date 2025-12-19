import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Heading component
const headingVariants = cva('font-semibold text-zinc-900 tracking-tight', {
  variants: {
    level: {
      1: 'text-3xl lg:text-4xl',
      2: 'text-2xl lg:text-3xl',
      3: 'text-xl lg:text-2xl',
      4: 'text-lg lg:text-xl',
      5: 'text-base lg:text-lg',
      6: 'text-sm lg:text-base',
    },
  },
  defaultVariants: {
    level: 2,
  },
});

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    Omit<VariantProps<typeof headingVariants>, 'level'> {
  level?: HeadingLevel;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const Heading: React.FC<HeadingProps> = ({
  level = 2,
  as,
  className,
  children,
  ...props
}) => {
  const Component = as || (`h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6');

  return (
    <Component className={cn(headingVariants({ level: level as HeadingLevel }), className)} {...props}>
      {children}
    </Component>
  );
};

// Text component
const textVariants = cva('', {
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
    color: {
      default: 'text-zinc-900',
      secondary: 'text-zinc-600',
      muted: 'text-zinc-500',
      light: 'text-zinc-400',
      success: 'text-emerald-600',
      warning: 'text-amber-600',
      danger: 'text-red-600',
      info: 'text-blue-600',
    },
    leading: {
      tight: 'leading-tight',
      normal: 'leading-normal',
      relaxed: 'leading-relaxed',
    },
  },
  defaultVariants: {
    size: 'base',
    weight: 'normal',
    color: 'default',
    leading: 'normal',
  },
});

interface TextProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {
  as?: 'p' | 'span' | 'div';
  truncate?: boolean;
  lines?: number;
}

export const Text: React.FC<TextProps> = ({
  size,
  weight,
  color,
  leading,
  as: Component = 'p',
  truncate,
  lines,
  className,
  style,
  children,
  ...props
}) => {
  const truncateStyles = truncate
    ? 'truncate'
    : lines
    ? `overflow-hidden`
    : '';

  const lineClampStyle = lines
    ? {
        display: '-webkit-box',
        WebkitLineClamp: lines,
        WebkitBoxOrient: 'vertical' as const,
        ...style,
      }
    : style;

  return (
    <Component
      className={cn(textVariants({ size, weight, color, leading }), truncateStyles, className)}
      style={lineClampStyle}
      {...props}
    >
      {children}
    </Component>
  );
};

// Label component
interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label: React.FC<LabelProps> = ({
  required,
  className,
  children,
  ...props
}) => {
  return (
    <label
      className={cn('block text-sm font-medium text-zinc-700', className)}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};

// Caption/Helper text
export const Caption: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <p className={cn('text-sm text-zinc-500', className)} {...props}>
      {children}
    </p>
  );
};

// Error text
export const ErrorText: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <p className={cn('text-sm text-red-600', className)} {...props}>
      {children}
    </p>
  );
};

// Code/Mono text
export const Code: React.FC<React.HTMLAttributes<HTMLElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <code
      className={cn(
        'px-1.5 py-0.5 rounded bg-zinc-100 font-mono text-sm text-zinc-800',
        className
      )}
      {...props}
    >
      {children}
    </code>
  );
};

// Link text (styled, not actual link)
export const LinkText: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        'text-zinc-900 font-medium underline underline-offset-4 hover:text-zinc-700 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

// Page Header component
interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  backButton?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
  backButton,
  className,
}) => {
  return (
    <div className={cn('mb-6', className)}>
      {backButton && <div className="mb-4">{backButton}</div>}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Heading level={2}>{title}</Heading>
          {description && (
            <Text color="muted" size="sm">
              {description}
            </Text>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
};

// Section Header component
interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  action,
  className,
}) => {
  return (
    <div className={cn('flex items-center justify-between gap-4 mb-4', className)}>
      <div>
        <Heading level={4}>{title}</Heading>
        {description && (
          <Text color="muted" size="sm">
            {description}
          </Text>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

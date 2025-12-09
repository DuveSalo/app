
import React from 'react';
import { Card as AntCard } from 'antd';
import type { CardProps as AntCardProps } from 'antd';

export interface CardProps extends Omit<AntCardProps, 'size'> {
  padding?: 'sm' | 'md' | 'lg' | 'xl' | 'none';
  variant?: 'default' | 'elevated' | 'flat' | 'outline';
  clickable?: boolean;
}

const paddingMap: Record<string, number | undefined> = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  none: 0,
};

export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'md',
  variant = 'default',
  style,
  onClick,
  ...props
}) => {
  const isClickable = !!onClick;
  const paddingValue = paddingMap[padding];

  const variantStyles: React.CSSProperties = {
    default: { borderColor: '#e5e7eb' },
    elevated: { boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.06), 0 8px 20px -4px rgb(0 0 0 / 0.04)', borderColor: '#e5e7eb' },
    flat: { boxShadow: 'none', borderColor: '#e5e7eb' },
    outline: { boxShadow: 'none', borderColor: '#e5e7eb' },
  }[variant];

  return (
    <AntCard
      className={className}
      style={{
        borderRadius: 12,
        cursor: isClickable ? 'pointer' : undefined,
        transition: 'all 0.2s ease',
        ...variantStyles,
        ...style,
      }}
      styles={{
        body: { padding: paddingValue },
      }}
      onClick={onClick}
      hoverable={isClickable}
      {...props}
    >
      {children}
    </AntCard>
  );
};

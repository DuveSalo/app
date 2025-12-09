
import React from 'react';
import { Button as AntButton } from 'antd';
import type { ButtonProps as AntButtonProps } from 'antd';

export interface ButtonProps extends Omit<AntButtonProps, 'type' | 'size'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'soft';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  type?: 'submit' | 'button' | 'reset';
}

const variantMap: Record<string, { type: AntButtonProps['type']; danger?: boolean; style?: React.CSSProperties }> = {
  primary: { type: 'primary' },
  secondary: { type: 'default', style: { background: '#f4f4f5', borderColor: '#e4e4e7' } },
  outline: { type: 'default' },
  ghost: { type: 'text' },
  danger: { type: 'primary', danger: true },
  success: { type: 'primary', style: { background: '#059669', borderColor: '#059669' } },
  soft: { type: 'default', style: { background: '#eef2ff', borderColor: '#c7d2fe', color: '#4f46e5' } },
};

const sizeMap: Record<string, AntButtonProps['size']> = {
  xs: 'small',
  sm: 'small',
  md: 'middle',
  lg: 'large',
  xl: 'large',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled,
  className,
  style,
  ...props
}) => {
  const variantProps = variantMap[variant] || variantMap.primary;
  const antSize = sizeMap[size] || 'middle';

  return (
    <AntButton
      type={variantProps.type}
      danger={variantProps.danger}
      size={antSize}
      loading={loading}
      disabled={disabled}
      className={className}
      style={{ ...variantProps.style, ...style }}
      htmlType={type}
      {...props}
    >
      {children}
    </AntButton>
  );
};

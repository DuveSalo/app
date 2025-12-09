
import React from 'react';
import { Input as AntInput, Form } from 'antd';
import type { InputProps as AntInputProps } from 'antd';

export interface InputProps extends Omit<AntInputProps, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className,
  id,
  disabled,
  ...props
}) => {
  const hasError = !!error;

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <label
          htmlFor={id}
          style={{
            display: 'block',
            fontSize: 14,
            fontWeight: 500,
            color: '#3f3f46',
            marginBottom: 6,
          }}
        >
          {label}
        </label>
      )}
      <AntInput
        id={id}
        status={hasError ? 'error' : undefined}
        disabled={disabled}
        className={className}
        {...props}
      />
      {error && (
        <p style={{ marginTop: 6, fontSize: 14, color: '#e11d48' }}>{error}</p>
      )}
      {helperText && !error && (
        <p style={{ marginTop: 6, fontSize: 14, color: '#71717a' }}>{helperText}</p>
      )}
    </div>
  );
};

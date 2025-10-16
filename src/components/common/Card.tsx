
import React, { ReactNode } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  padding = 'md',
  ...props 
}) => {
  const paddingStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    none: 'p-0',
  };

  const hasClick = props.onClick !== undefined;

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${paddingStyles[padding]} ${hasClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200' : 'transition-shadow duration-200'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;

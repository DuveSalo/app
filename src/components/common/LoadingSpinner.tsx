
import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className }) => {
  const iconSize = sizeMap[size];

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} className={className}>
      <Spin indicator={<LoadingOutlined style={{ fontSize: iconSize }} spin />} />
    </div>
  );
};

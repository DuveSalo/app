
import React from 'react';
import { Modal as AntModal } from 'antd';
import type { ModalProps as AntModalProps } from 'antd';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
}

const sizeMap: Record<string, number> = {
  sm: 400,
  md: 520,
  lg: 720,
  xl: 1000,
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  footer,
}) => {
  return (
    <AntModal
      open={isOpen}
      onCancel={onClose}
      title={title}
      width={sizeMap[size]}
      footer={footer}
      centered
      destroyOnHidden
      styles={{
        header: {
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: 16,
          marginBottom: 0,
        },
        body: {
          padding: 24,
        },
        footer: {
          borderTop: '1px solid #e5e7eb',
          paddingTop: 16,
        },
      }}
    >
      {children}
    </AntModal>
  );
};

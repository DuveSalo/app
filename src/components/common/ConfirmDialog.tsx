
import React from 'react';
import { Modal, Typography } from 'antd';
import { ExclamationCircleOutlined, InfoCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { Button } from './Button';

const { Text, Title } = Typography;

const variantStyles = {
  danger: {
    icon: <ExclamationCircleOutlined style={{ fontSize: 24, color: '#e11d48' }} />,
    iconBg: '#fff1f2',
    buttonVariant: 'danger' as const,
  },
  warning: {
    icon: <WarningOutlined style={{ fontSize: 24, color: '#d97706' }} />,
    iconBg: '#fffbeb',
    buttonVariant: 'secondary' as const,
  },
  info: {
    icon: <InfoCircleOutlined style={{ fontSize: 24, color: '#0284c7' }} />,
    iconBg: '#f0f9ff',
    buttonVariant: 'primary' as const,
  },
};

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Estas seguro?',
  message = 'Esta accion no se puede deshacer.',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false,
}) => {
  const styles = variantStyles[variant];

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      width={440}
      closable={false}
      styles={{
        body: { padding: 0 },
      }}
    >
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: styles.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {styles.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Title level={5} style={{ margin: 0, marginBottom: 6 }}>
              {title}
            </Title>
            <Text type="secondary" style={{ lineHeight: 1.6 }}>
              {message}
            </Text>
          </div>
        </div>
      </div>
      <div
        style={{
          padding: '16px 24px',
          background: '#fafafa',
          borderRadius: '0 0 12px 12px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 10,
        }}
      >
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button variant={styles.buttonVariant} onClick={onConfirm} loading={isLoading}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

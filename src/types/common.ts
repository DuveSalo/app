// Common/shared types

import type { ReactElement } from 'react';
import { QRDocumentType } from './qr';

export interface NavItem {
  path: string;
  label: string;
  icon: ReactElement<{ className?: string }>;
  service?: QRDocumentType;
}

export interface DynamicListItem {
  id: string;
  value: string;
}

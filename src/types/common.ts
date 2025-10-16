// Common/shared types

import { QRDocumentType } from './qr';

export interface NavItem {
  path: string;
  label: string;
  icon: React.ReactElement<{ className?: string }>;
  service?: QRDocumentType;
}

export interface DynamicListItem {
  id: string;
  value: string;
}

import type { UseFormReturn } from 'react-hook-form';
import type { FireExtinguisherFormValues } from './schemas';

export type { FireExtinguisherFormValues };

export interface SectionProps {
  form: UseFormReturn<FireExtinguisherFormValues>;
}

export interface ObservationsSectionProps extends SectionProps {
  formError?: string;
}

// Event information related types

export interface EventInformation {
  id: string;
  companyId: string;
  date: string;
  time: string;
  description: string;
  correctiveActions: string;
  testimonials: string[];
  observations: string[];
  finalChecks: { [key: string]: boolean };
}

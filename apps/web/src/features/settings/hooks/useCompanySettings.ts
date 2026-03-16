import { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import * as api from '@/lib/api/services';
import { QRDocumentType, CompanyServices, Company } from '../../../types/index';
import { toast } from 'sonner';
import type { CompanyInfoFormValues } from '../schemas';

export const useCompanySettings = () => {
  const { currentCompany, refreshCompany } = useAuth();
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCompanySubmit = async (values: CompanyInfoFormValues) => {
    if (!currentCompany) return;
    setIsLoading(true);
    setError('');
    try {
      const services: CompanyServices = values.services.reduce((acc, service) => {
        acc[service as QRDocumentType] = true;
        return acc;
      }, {} as CompanyServices);

      const updatePayload: Partial<Company> = {
        id: currentCompany.id,
        name: values.name,
        cuit: values.cuit,
        address: values.address,
        postalCode: values.postalCode,
        city: values.city,
        province: values.province,
        country: values.country,
        phone: values.phone,
        services,
      };

      await api.updateCompany(updatePayload);
      await refreshCompany();
      setIsEditingCompany(false);
      toast.success('Información de empresa actualizada');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al actualizar la empresa';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelCompanyEdit = () => {
    setIsEditingCompany(false);
    setError('');
  };

  return {
    isEditingCompany,
    setIsEditingCompany,
    handleCompanySubmit,
    handleCancelCompanyEdit,
    isLoading,
    error,
  };
};

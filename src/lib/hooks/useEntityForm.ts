
import { useEffect, useMemo } from 'react';
import { useForm } from './useForm';

export interface UseEntityFormOptions<T> {
  id?: string;
  emptyData: T;
  fetchFn: (id: string) => Promise<T>;
  validate: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit: (values: T) => void;
  onError?: (message: string) => void;
  onNavigate?: (path: string) => void;
  errorNavigationPath?: string;
}

export const useEntityForm = <T extends Record<string, any>>({
  id,
  emptyData,
  fetchFn,
  validate,
  onSubmit,
  onError,
  onNavigate,
  errorNavigationPath,
}: UseEntityFormOptions<T>) => {
  const isEditMode = useMemo(() => !!id, [id]);

  const { 
    values: data, 
    setValues: setData, 
    errors: fieldErrors, 
    setErrors: setFieldErrors, 
    ...form
  } = useForm({
    initialValues: emptyData,
    validate,
    onSubmit,
  });

  useEffect(() => {
    if (id) {
      form.setIsSubmitting(true);
      fetchFn(id)
        .then(fetchedData => {
          setData({ ...emptyData, ...fetchedData });
        })
        .catch(error => {
          const message = error instanceof Error ? error.message : 'Error al cargar los datos';
          onError?.(message);
          if (errorNavigationPath && onNavigate) {
            onNavigate(errorNavigationPath);
          }
        })
        .finally(() => {
          form.setIsSubmitting(false);
        });
    }
  }, [id, fetchFn, setData, onError, onNavigate, errorNavigationPath, form.setIsSubmitting]);

  return {
    data,
    setData,
    isLoading: form.isSubmitting,
    fieldErrors,
    setFieldErrors,
    handleChange: form.handleChange,
    handleCheckboxChange: form.handleChange, // useForm's handleChange handles checkboxes
    handleFieldChange: form.setFieldValue,
    resetForm: form.resetForm,
    handleSubmit: form.handleSubmit,
    isEditMode,
  };
};


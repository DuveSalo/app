
import { useState, useCallback, type ChangeEvent, type FocusEvent, type FormEvent } from 'react';

interface UseFormOptions<T> {
  initialValues: T;
  validate: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit: (values: T) => void;
}

export const useForm = <T extends Record<string, unknown>>({ initialValues, validate, onSubmit }: UseFormOptions<T>) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    
    if (type === 'checkbox') {
        const { checked } = event.target as HTMLInputElement;
        setValues(prev => ({ ...prev, [name]: checked }));
    } else {
        setValues(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleBlur = useCallback((event: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = event.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const validationErrors = validate(values);
    setErrors(prev => ({ ...prev, [name]: validationErrors[name] }));
  }, [values, validate]);

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setTouched(Object.keys(initialValues).reduce((acc, key) => ({ ...acc, [key]: true }), {}));

    const validationErrors = validate(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      await onSubmit(values);
    }

    setIsSubmitting(false);
  }, [values, initialValues, validate, onSubmit]);

  const setFieldValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    setValues,
    errors,
    setErrors,
    touched,
    setTouched,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    resetForm,
  };
};

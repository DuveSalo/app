import { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import * as api from '@/lib/api/services';
import { Employee } from '../../../types/index';
import { toast } from 'sonner';
import type { EmployeeFormValues } from '../schemas';

export const useEmployeeManagement = () => {
  const { currentUser, currentCompany, refreshCompany } = useAuth();
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // ConfirmDialog state for delete
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  const handleEmployeeSubmit = async (values: EmployeeFormValues) => {
    setIsLoading(true);
    setError('');
    try {
      if (editingEmployee) {
        await api.updateEmployee({ ...values, id: editingEmployee.id });
      } else {
        await api.addEmployee(values);
      }
      setShowEmployeeModal(false);
      setEditingEmployee(null);
      await refreshCompany();
      toast.success('Empleado guardado');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar el empleado';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const requestDeleteEmployee = (employee: Employee) => {
    if (currentUser?.email === employee.email) {
      toast.info('No puedes eliminar tu propia cuenta.');
      return;
    }
    if ((currentCompany?.employees?.length ?? 0) <= 1) {
      toast.info('No se puede eliminar al único empleado.');
      return;
    }
    setDeleteTarget(employee);
  };

  const confirmDeleteEmployee = async () => {
    if (!deleteTarget) return;
    setIsLoading(true);
    setError('');
    try {
      await api.deleteEmployee(deleteTarget.id);
      await refreshCompany();
      toast.success('Empleado eliminado');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al eliminar el empleado';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
      setDeleteTarget(null);
    }
  };

  const cancelDeleteEmployee = () => {
    setDeleteTarget(null);
  };

  const openEmployeeModal = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
    } else {
      setEditingEmployee(null);
    }
    setShowEmployeeModal(true);
  };

  return {
    showEmployeeModal,
    setShowEmployeeModal,
    editingEmployee,
    openEmployeeModal,
    handleEmployeeSubmit,
    requestDeleteEmployee,
    confirmDeleteEmployee,
    cancelDeleteEmployee,
    deleteTarget,
    isLoading,
    error,
  };
};

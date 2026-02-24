import { type Dispatch, type SetStateAction, type FormEvent } from 'react';
import { Employee } from '../../../types/index';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingEmployee: Employee | null;
  employeeForm: Omit<Employee, 'id'>;
  setEmployeeForm: Dispatch<SetStateAction<Omit<Employee, 'id'>>>;
  handleSubmit: (e: FormEvent) => void;
  isLoading: boolean;
}

export const EmployeeModal = ({
  isOpen,
  onClose,
  editingEmployee,
  employeeForm,
  setEmployeeForm,
  handleSubmit,
  isLoading,
}: EmployeeModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingEmployee ? 'Editar empleado' : 'Agregar empleado'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input id="empName" label="Nombre" value={employeeForm.name} onChange={(e) => setEmployeeForm(prev => ({ ...prev, name: e.target.value }))} required />
        <Input id="empEmail" label="Email" type="email" value={employeeForm.email} onChange={(e) => setEmployeeForm(prev => ({ ...prev, email: e.target.value }))} required />
        <Input id="empRole" label="Rol" value={employeeForm.role} onChange={(e) => setEmployeeForm(prev => ({ ...prev, role: e.target.value }))} required placeholder="Ej: Administrador, Usuario" />
        <div className="flex justify-end space-x-4 pt-4 mt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={isLoading}>{editingEmployee ? 'Guardar' : 'Agregar'}</Button>
        </div>
      </form>
    </Modal>
  );
};

import { Employee } from '../../../types/index';
import { Button } from '../../../components/common/Button';
import { EditIcon, TrashIcon } from '../../../components/common/Icons';
import type { Company, User } from '../../../types/index';

interface EmployeeSectionProps {
  currentCompany: Company;
  currentUser: User;
  isLoading: boolean;
  openEmployeeModal: (employee?: Employee) => void;
  handleDeleteEmployee: (employee: Employee) => void;
}

export const EmployeeSection = ({
  currentCompany,
  currentUser,
  isLoading,
  openEmployeeModal,
  handleDeleteEmployee,
}: EmployeeSectionProps) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6 flex-shrink-0">
        <h2 className="text-base font-medium text-neutral-900">Empleados</h2>
        <Button onClick={() => openEmployeeModal()} className="w-full sm:w-auto">Agregar empleado</Button>
      </div>

      {/* Desktop Table */}
      <div className="overflow-y-auto flex-grow min-h-0 border border-neutral-200 rounded-md bg-white hidden md:block">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-neutral-100/50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Rol</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {currentCompany.employees.map((employee) => (
              <tr key={employee.id} className="hover:bg-neutral-100 transition-colors">
                <td className="px-4 py-3.5 text-sm text-neutral-900">{employee.name}</td>
                <td className="px-4 py-3.5 text-sm text-neutral-900">{employee.email}</td>
                <td className="px-4 py-3.5 text-sm">
                  <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-md ${employee.role === 'Administrador' ? 'bg-neutral-900 text-white' : 'bg-gray-100 text-neutral-900'}`}>
                    {employee.role}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="sm" onClick={() => openEmployeeModal(employee)} disabled={isLoading}><EditIcon /></Button>
                    {currentUser.email !== employee.email && (
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteEmployee(employee)} className="text-red-600 hover:bg-red-50 hover:text-red-700" disabled={isLoading}><TrashIcon /></Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3 flex-grow overflow-y-auto">
        {currentCompany.employees.map((employee) => (
          <div key={employee.id} className="bg-white rounded-md border border-neutral-200 p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-neutral-900 truncate">{employee.name}</p>
                <p className="text-sm text-neutral-500 truncate">{employee.email}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button variant="ghost" size="sm" onClick={() => openEmployeeModal(employee)} disabled={isLoading}><EditIcon className="w-5 h-5" /></Button>
                {currentUser.email !== employee.email && (
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteEmployee(employee)} className="text-red-600 hover:bg-red-50 hover:text-red-700" disabled={isLoading}><TrashIcon className="w-5 h-5" /></Button>
                )}
              </div>
            </div>
            <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-md ${employee.role === 'Administrador' ? 'bg-neutral-900 text-white' : 'bg-gray-100 text-neutral-900'}`}>
              {employee.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

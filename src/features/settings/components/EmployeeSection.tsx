import React from 'react';
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

export const EmployeeSection: React.FC<EmployeeSectionProps> = ({
  currentCompany,
  currentUser,
  isLoading,
  openEmployeeModal,
  handleDeleteEmployee,
}) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6 flex-shrink-0">
        <h2 className="text-base font-semibold text-gray-900">Empleados</h2>
        <Button onClick={() => openEmployeeModal()} className="w-full sm:w-auto">Agregar empleado</Button>
      </div>

      {/* Desktop Table */}
      <div className="overflow-y-auto flex-grow min-h-0 border border-gray-200 rounded-xl bg-white shadow-sm hidden md:block">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {currentCompany.employees.map((employee) => (
              <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3.5 text-sm text-gray-700">{employee.name}</td>
                <td className="px-4 py-3.5 text-sm text-gray-700">{employee.email}</td>
                <td className="px-4 py-3.5 text-sm">
                  <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-md ${employee.role === 'Administrador' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}>
                    {employee.role}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="sm" onClick={() => openEmployeeModal(employee)} disabled={isLoading}><EditIcon /></Button>
                    {currentUser.email !== employee.email && (
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteEmployee(employee)} className="text-red-500 hover:bg-red-50 hover:text-red-600" disabled={isLoading}><TrashIcon /></Button>
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
          <div key={employee.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 truncate">{employee.name}</p>
                <p className="text-sm text-gray-500 truncate">{employee.email}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button variant="ghost" size="sm" onClick={() => openEmployeeModal(employee)} disabled={isLoading}><EditIcon className="w-4 h-4" /></Button>
                {currentUser.email !== employee.email && (
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteEmployee(employee)} className="text-red-500 hover:bg-red-50 hover:text-red-600" disabled={isLoading}><TrashIcon className="w-4 h-4" /></Button>
                )}
              </div>
            </div>
            <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-md ${employee.role === 'Administrador' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}>
              {employee.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

import { Employee } from '../../../types/index';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SplitPaneLayout } from '../../../components/layout/SplitPaneLayout';
import type { Company, User } from '../../../types/index';
import { useState, useEffect } from 'react';

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
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (currentCompany.employees.length > 0 && !selectedId) {
      setSelectedId(currentCompany.employees[0].id);
    }
  }, [currentCompany.employees, selectedId]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-4 flex-shrink-0">
        <h2 className="text-base font-medium text-neutral-900">Empleados</h2>
        <Button onClick={() => openEmployeeModal()} className="w-full sm:w-auto">Agregar empleado</Button>
      </div>

      {/* Desktop: Split Pane */}
      <div className="hidden md:flex flex-1 min-h-0">
        <SplitPaneLayout
          items={currentCompany.employees}
          selectedId={selectedId}
          onSelect={setSelectedId}
          listLabel="Equipo"
          renderListItem={(employee, isSelected) => (
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className={`text-sm ${isSelected ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-900'}`}>
                  {employee.name}
                </h3>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 ${employee.role === 'Administrador' ? 'bg-neutral-900 text-white' : 'bg-neutral-50 text-neutral-600'}`}>
                  {employee.role}
                </span>
              </div>
              <p className="text-xs text-neutral-500 truncate">{employee.email}</p>
            </div>
          )}
          renderDetail={(employee) => (
            <>
              {/* Header */}
              <div className="flex items-start justify-between mb-10">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium ${employee.role === 'Administrador' ? 'bg-neutral-900 text-white' : 'bg-neutral-50 text-neutral-900'}`}>
                      {employee.role}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
                    {employee.name}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEmployeeModal(employee)}
                    disabled={isLoading}
                    className="p-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-500 disabled:opacity-50"
                    title="Editar"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  {currentUser.email !== employee.email && (
                    <button
                      onClick={() => handleDeleteEmployee(employee)}
                      disabled={isLoading}
                      className="p-2 border border-neutral-200 hover:bg-neutral-50 text-red-600 disabled:opacity-50"
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-8 mb-12">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-neutral-500">Email</p>
                  <p className="text-sm text-neutral-900">{employee.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-neutral-500">Rol</p>
                  <p className="text-sm text-neutral-900">{employee.role}</p>
                </div>
              </div>
            </>
          )}
        />
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3 flex-grow overflow-y-auto">
        {currentCompany.employees.map((employee) => (
          <div key={employee.id} className="bg-white border border-neutral-200 p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-neutral-900 truncate">{employee.name}</p>
                <p className="text-sm text-neutral-500 truncate">{employee.email}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => openEmployeeModal(employee)} disabled={isLoading} className="p-1.5 text-neutral-400 hover:text-neutral-900 transition-colors"><Pencil className="w-4 h-4" /></button>
                {currentUser.email !== employee.email && (
                  <button onClick={() => handleDeleteEmployee(employee)} disabled={isLoading} className="p-1.5 text-red-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                )}
              </div>
            </div>
            <span className={`inline-flex px-2.5 py-1 text-xs font-medium ${employee.role === 'Administrador' ? 'bg-neutral-900 text-white' : 'bg-neutral-50 text-neutral-900'}`}>
              {employee.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

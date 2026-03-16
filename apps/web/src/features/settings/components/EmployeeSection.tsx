import { MoreHorizontal, Pencil, Trash2, Plus } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '../../../components/common/DataTable';
import { Empty } from '../../../components/common/Empty';
import type { Employee, Company, User } from '../../../types/index';

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
  const columns: ColumnDef<Employee, string>[] = [
    {
      accessorKey: 'name',
      header: 'Nombre',
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'role',
      header: 'Rol',
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
            row.original.role === 'Administrador'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {row.original.role}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()} disabled={isLoading}>
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Acciones</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEmployeeModal(row.original); }}>
              <Pencil className="h-4 w-4" />
              Editar
            </DropdownMenuItem>
            {currentUser.email !== row.original.email && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteEmployee(row.original); }}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                  Eliminar
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const toolbar = (
    <Button onClick={() => openEmployeeModal()}>
      <Plus className="w-4 h-4" />
      Agregar empleado
    </Button>
  );

  if (currentCompany.employees.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">{toolbar}</div>
        <Empty
          icon="list"
          title="No hay empleados registrados"
          action={{ label: 'Agregar primer empleado', onClick: () => openEmployeeModal() }}
        />
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={currentCompany.employees}
      searchKey="name"
      searchPlaceholder="Buscar empleado..."
      toolbar={toolbar}
    />
  );
};

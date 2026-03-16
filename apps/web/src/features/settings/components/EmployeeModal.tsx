import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Employee } from '../../../types/index';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '../../../components/common/Input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { employeeSchema, type EmployeeFormValues } from '../schemas';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingEmployee: Employee | null;
  onSubmit: (values: EmployeeFormValues) => void;
  isLoading: boolean;
}

export const EmployeeModal = ({
  isOpen,
  onClose,
  editingEmployee,
  onSubmit,
  isLoading,
}: EmployeeModalProps) => {
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      email: '',
      role: 'Usuario',
    },
  });

  // Reset form when dialog opens with employee data (edit) or empty defaults (create)
  useEffect(() => {
    if (isOpen) {
      if (editingEmployee) {
        form.reset({
          name: editingEmployee.name,
          email: editingEmployee.email,
          role: editingEmployee.role,
        });
      } else {
        form.reset({
          name: '',
          email: '',
          role: 'Usuario',
        });
      }
    }
  }, [isOpen, editingEmployee, form]);

  const handleClose = () => {
    form.reset({ name: '', email: '', role: 'Usuario' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingEmployee ? 'Editar empleado' : 'Agregar empleado'}</DialogTitle>
          <DialogDescription>
            {editingEmployee
              ? 'Modificá los datos del empleado.'
              : 'Completá los datos del nuevo empleado.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input id="empName" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input id="empEmail" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <FormControl>
                    <Input id="empRole" placeholder="Ej: Administrador, Usuario" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" loading={isLoading}>
                {editingEmployee ? 'Guardar' : 'Agregar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

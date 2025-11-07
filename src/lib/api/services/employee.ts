
import { supabase } from '../../supabase/client';
import { Employee } from '../../../types/index';
import { handleSupabaseError } from '../../utils/errors';
import { getCurrentUser } from './auth';
import { getCompanyByUserId } from './company';

export const addEmployee = async (employee: Omit<Employee, 'id'>): Promise<Employee> => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Empresa no encontrada");

  const company = await getCompanyByUserId(currentUser.id);

  const { data, error } = await supabase
    .from('employees')
    .insert({
      company_id: company.id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
    })
    .select()
    .single();

  if (error) {
    handleSupabaseError(error);
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
  };
};

export const updateEmployee = async (employee: Employee): Promise<Employee> => {
  const { data, error } = await supabase
    .from('employees')
    .update({
      name: employee.name,
      email: employee.email,
      role: employee.role,
    })
    .eq('id', employee.id)
    .select()
    .single();

  if (error) {
    handleSupabaseError(error);
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
  };
};

export const deleteEmployee = async (employeeId: string): Promise<void> => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Empresa no encontrada");

  const company = await getCompanyByUserId(currentUser.id);

  // Check if this is the last employee
  const { data: employees } = await supabase
    .from('employees')
    .select('id')
    .eq('company_id', company.id);

  if (employees && employees.length <= 1) {
    throw new Error("No se puede eliminar al único empleado de la empresa.");
  }

  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', employeeId);

  if (error) {
    handleSupabaseError(error);
  }
};

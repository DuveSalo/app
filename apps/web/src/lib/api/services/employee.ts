import { supabase } from '../../supabase/client';
import { Employee } from '../../../types/index';
import { handleSupabaseError } from '../../utils/errors';
import { getAuthenticatedCompanyId } from './context';

export const addEmployee = async (employee: Omit<Employee, 'id'>): Promise<Employee> => {
  const companyId = await getAuthenticatedCompanyId();

  const { data, error } = await supabase
    .from('employees')
    .insert({
      company_id: companyId,
      name: employee.name,
      email: employee.email,
      role: employee.role,
    })
    .select()
    .single();

  if (error) {
    handleSupabaseError(error);
  }

  if (!data) throw new Error('No se pudo crear el empleado');
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

  if (!data) throw new Error('No se pudo actualizar el empleado');
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
  };
};

export const deleteEmployee = async (employeeId: string): Promise<void> => {
  const companyId = await getAuthenticatedCompanyId();

  // Check if this is the last employee (count only, no full data fetch)
  const { count, error: countError } = await supabase
    .from('employees')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', companyId);

  if (countError) {
    handleSupabaseError(countError);
  }

  if (count !== null && count <= 1) {
    throw new Error('No se puede eliminar al único empleado de la empresa.');
  }

  const { error } = await supabase.from('employees').delete().eq('id', employeeId);

  if (error) {
    handleSupabaseError(error);
  }
};

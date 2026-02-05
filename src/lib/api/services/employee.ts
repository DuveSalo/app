
import { supabase } from '../../supabase/client';
import { Employee } from '../../../types/index';
import { handleSupabaseError, AuthError, NotFoundError } from '../../utils/errors';
import { getCurrentUser } from './auth';

// Helper to get company_id without loading employees (N+1 fix)
const getCompanyIdByUserId = async (userId: string): Promise<string> => {
  const { data, error } = await supabase
    .from('companies')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw new NotFoundError("Empresa no encontrada", "company");
  }

  return data.id;
};

export const addEmployee = async (employee: Omit<Employee, 'id'>): Promise<Employee> => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new AuthError("Usuario no autenticado");

  // Use lightweight query to get only company_id (N+1 fix)
  const companyId = await getCompanyIdByUserId(currentUser.id);

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
  if (!currentUser) throw new AuthError("Usuario no autenticado");

  // Use lightweight query to get only company_id (N+1 fix)
  const companyId = await getCompanyIdByUserId(currentUser.id);

  // Check if this is the last employee (count only, no full data fetch)
  const { count, error: countError } = await supabase
    .from('employees')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', companyId);

  if (countError) {
    handleSupabaseError(countError);
  }

  if (count !== null && count <= 1) {
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

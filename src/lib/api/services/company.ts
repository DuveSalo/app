
import { supabase } from '../../supabase/client';
import { Company, Employee } from '../../../types/index';
import { mapCompanyFromDb } from '../mappers';
import { AuthError, NotFoundError, handleSupabaseError } from '../../utils/errors';
import { getCurrentUser } from './auth';
import { Tables, TablesUpdate } from '../../../types/database.types';

export const createCompany = async (companyData: Omit<Company, 'id' | 'userId' | 'employees' | 'isSubscribed' | 'selectedPlan'>): Promise<Company> => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new AuthError("Usuario no autenticado");

  const { data, error } = await supabase
    .from('companies')
    .insert({
      user_id: currentUser.id,
      name: companyData.name,
      cuit: companyData.cuit,
      address: companyData.address,
      postal_code: companyData.postalCode,
      city: companyData.city,
      locality: companyData.locality,
      province: companyData.province,
      country: companyData.country,
      rama_key: companyData.ramaKey,
      owner_entity: companyData.ownerEntity,
      phone: companyData.phone,
      is_subscribed: false,
      services: companyData.services || {},
      payment_methods: [],
    })
    .select()
    .single();

  if (error) {
    handleSupabaseError(error);
  }

  // Create initial employee (the owner)
  const { data: employeeData } = await supabase
    .from('employees')
    .insert({
      company_id: data.id,
      name: currentUser.name,
      email: currentUser.email,
      role: 'Administrador',
    })
    .select()
    .single();

  // Return with the created employee (no extra query needed)
  return mapCompanyFromDb(data, employeeData ? [employeeData] : []);
};

/**
 * Lightweight helper to get only company_id without loading employees (N+1 optimization)
 * Use this when you only need the company_id for queries or file paths
 */
export const getCompanyIdByUserId = async (userId: string): Promise<string> => {
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

export const getCompanyByUserId = async (userId: string): Promise<Company> => {
  // Use relational query to fetch company with employees in a single query (N+1 fix)
  const { data, error } = await supabase
    .from('companies')
    .select('*, employees(*)')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw new NotFoundError("Empresa no encontrada", "company");
  }

  // Extract employees from the joined result
  const { employees, ...companyData } = data;

  return mapCompanyFromDb(companyData as Tables<'companies'>, employees || []);
};

export const updateCompany = async (companyData: Partial<Company>): Promise<Company> => {
  if (!companyData.id) throw new Error("ID de empresa requerido");

  const updateData: TablesUpdate<'companies'> = {};
  if (companyData.name) updateData.name = companyData.name;
  if (companyData.cuit) updateData.cuit = companyData.cuit;
  if (companyData.address) updateData.address = companyData.address;
  if (companyData.postalCode) updateData.postal_code = companyData.postalCode;
  if (companyData.city) updateData.city = companyData.city;
  if (companyData.locality) updateData.locality = companyData.locality;
  if (companyData.province) updateData.province = companyData.province;
  if (companyData.country) updateData.country = companyData.country;
  if (companyData.ramaKey) updateData.rama_key = companyData.ramaKey;
  if (companyData.ownerEntity) updateData.owner_entity = companyData.ownerEntity;
  if (companyData.phone) updateData.phone = companyData.phone;
  if (companyData.isSubscribed !== undefined) updateData.is_subscribed = companyData.isSubscribed;
  if (companyData.selectedPlan) updateData.selected_plan = companyData.selectedPlan;
  if (companyData.subscriptionStatus) updateData.subscription_status = companyData.subscriptionStatus;
  if (companyData.subscriptionRenewalDate) updateData.subscription_renewal_date = companyData.subscriptionRenewalDate;
  if (companyData.trialEndsAt !== undefined) updateData.trial_ends_at = companyData.trialEndsAt;
  if (companyData.services !== undefined) {
    updateData.services = companyData.services;
  }
  if (companyData.paymentMethods) updateData.payment_methods = JSON.parse(JSON.stringify(companyData.paymentMethods));

  // Use relational query to fetch updated company with employees in a single query (N+1 fix)
  const { data, error } = await supabase
    .from('companies')
    .update(updateData)
    .eq('id', companyData.id)
    .select('*, employees(*)')
    .single();

  if (error) {
    handleSupabaseError(error);
  }

  // Extract employees from the joined result
  const { employees, ...companyResult } = data;

  return mapCompanyFromDb(companyResult as Tables<'companies'>, employees || []);
};

export const activateTrial = async (companyId: string): Promise<Company> => {
  const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('companies')
    .update({ trial_ends_at: trialEndsAt })
    .eq('id', companyId)
    .select('*, employees(*)')
    .single();

  if (error) {
    handleSupabaseError(error);
  }

  const { employees, ...companyResult } = data;
  return mapCompanyFromDb(companyResult as Tables<'companies'>, employees || []);
};


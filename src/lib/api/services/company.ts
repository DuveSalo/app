
import { supabase } from '../../supabase/client';
import { Company, Employee, PaymentDetails } from '../../../types/index';
import { mapCompanyFromDb } from '../mappers';
import { AuthError, NotFoundError, handleSupabaseError } from '../../utils/errors';
import { getCurrentUser } from './auth';
import { TablesUpdate } from '../../../types/database.types';

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
  await supabase
    .from('employees')
    .insert({
      company_id: data.id,
      name: currentUser.name,
      email: currentUser.email,
      role: 'Administrador',
    });

  // Fetch employees
  const { data: employees } = await supabase
    .from('employees')
    .select('*')
    .eq('company_id', data.id);

  return mapCompanyFromDb(data, employees || []);
};

export const getCompanyByUserId = async (userId: string): Promise<Company> => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw new NotFoundError("Empresa no encontrada", "company");
  }

  // Fetch employees
  const { data: employees } = await supabase
    .from('employees')
    .select('*')
    .eq('company_id', data.id);

  return mapCompanyFromDb(data, employees || []);
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
  if (companyData.services !== undefined) {
    updateData.services = companyData.services;
  }
  if (companyData.paymentMethods) updateData.payment_methods = JSON.parse(JSON.stringify(companyData.paymentMethods));

  const { data, error } = await supabase
    .from('companies')
    .update(updateData)
    .eq('id', companyData.id)
    .select()
    .single();

  if (error) {
    handleSupabaseError(error);
  }

  // Fetch employees
  const { data: employees } = await supabase
    .from('employees')
    .select('*')
    .eq('company_id', data.id);

  return mapCompanyFromDb(data, employees || []);
};

export const subscribeCompany = async (_companyId: string, plan: string, _paymentDetails: PaymentDetails): Promise<Company> => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new AuthError("Usuario no autenticado");

  const company = await getCompanyByUserId(currentUser.id);

  const renewalDate = new Date();
  renewalDate.setDate(renewalDate.getDate() + 30);

  return updateCompany({
    id: company.id,
    isSubscribed: true,
    selectedPlan: plan,
    subscriptionStatus: 'active',
    subscriptionRenewalDate: renewalDate.toISOString().split('T')[0],
  });
};

export const changeSubscriptionPlan = async (newPlanId: string): Promise<Company> => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("No company found.");

  const company = await getCompanyByUserId(currentUser.id);

  return updateCompany({
    id: company.id,
    selectedPlan: newPlanId,
  });
};

export const cancelSubscription = async (): Promise<Company> => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("No company found.");

  const company = await getCompanyByUserId(currentUser.id);

  return updateCompany({
    id: company.id,
    subscriptionStatus: 'canceled',
  });
};

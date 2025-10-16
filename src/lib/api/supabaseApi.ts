import { supabase } from '../supabase/client';
import { User, Company, ConservationCertificate, SelfProtectionSystem, QRDocument, QRDocumentType, EventInformation, Employee } from '../../types/index';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Password validation
const validatePassword = (password: string): { valid: boolean; error?: string } => {
  if (password.length < 8) {
    return { valid: false, error: "La contraseña debe tener al menos 8 caracteres" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: "La contraseña debe contener al menos una mayúscula" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: "La contraseña debe contener al menos una minúscula" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: "La contraseña debe contener al menos un número" };
  }
  return { valid: true };
};

// --- Auth ---
export const login = async (email: string, password: string): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error("Credenciales inválidas. Por favor verifica tu email o regístrate.");
  }

  if (!data.user) {
    throw new Error("Error al iniciar sesión.");
  }

  return {
    id: data.user.id,
    name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Usuario',
    email: data.user.email || '',
  };
};

export const register = async (name: string, email: string, password: string): Promise<User> => {
  // Validate password
  const validation = validatePassword(password);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
      emailRedirectTo: `${window.location.origin}/create-company`,
    },
  });

  if (error) {
    throw new Error(error.message || "Error al registrar usuario.");
  }

  if (!data.user) {
    throw new Error("Error al crear usuario.");
  }

  // Check if email confirmation is required (session will be null if email confirmation is enabled)
  if (!data.session) {
    throw new Error("EMAIL_CONFIRMATION_REQUIRED");
  }

  return {
    id: data.user.id,
    name,
    email: data.user.email || email,
  };
};

export const logout = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
    email: user.email || '',
  };
};

export const updateUser = async (userData: Partial<User>): Promise<User> => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Usuario no autenticado");

  const { data, error } = await supabase.auth.updateUser({
    data: {
      name: userData.name,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  // Also update in company employees if exists
  if (userData.name) {
    const company = await getCompanyByUserId(currentUser.id).catch(() => null);
    if (company) {
      const { data: employees } = await supabase
        .from('employees')
        .select('*')
        .eq('company_id', company.id)
        .eq('email', currentUser.email);

      if (employees && employees.length > 0) {
        await supabase
          .from('employees')
          .update({ name: userData.name })
          .eq('id', employees[0].id);
      }
    }
  }

  return {
    ...currentUser,
    ...userData,
  };
};

export const sendPasswordResetEmail = async (email: string): Promise<void> => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    throw new Error(error.message);
  }
};

// --- Company ---
export const createCompany = async (companyData: Omit<Company, 'id' | 'userId' | 'employees' | 'isSubscribed' | 'selectedPlan'>): Promise<Company> => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Usuario no autenticado");

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
    throw new Error(error.message);
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

  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    cuit: data.cuit,
    address: data.address,
    postalCode: data.postal_code,
    city: data.city,
    locality: data.locality,
    province: data.province,
    country: data.country,
    ramaKey: data.rama_key || '',
    ownerEntity: data.owner_entity || '',
    phone: data.phone || '',
    isSubscribed: data.is_subscribed,
    selectedPlan: data.selected_plan || undefined,
    subscriptionStatus: data.subscription_status || undefined,
    subscriptionRenewalDate: data.subscription_renewal_date || undefined,
    services: (data.services as any) || {},
    paymentMethods: (data.payment_methods as any) || [],
    employees: (employees || []).map(e => ({
      id: e.id,
      name: e.name,
      email: e.email,
      role: e.role,
    })),
  };
};

export const getCompanyByUserId = async (userId: string): Promise<Company> => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw new Error("Empresa no encontrada");
  }

  // Fetch employees
  const { data: employees } = await supabase
    .from('employees')
    .select('*')
    .eq('company_id', data.id);

  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    cuit: data.cuit,
    address: data.address,
    postalCode: data.postal_code,
    city: data.city,
    locality: data.locality,
    province: data.province,
    country: data.country,
    ramaKey: data.rama_key || '',
    ownerEntity: data.owner_entity || '',
    phone: data.phone || '',
    isSubscribed: data.is_subscribed,
    selectedPlan: data.selected_plan || undefined,
    subscriptionStatus: data.subscription_status || undefined,
    subscriptionRenewalDate: data.subscription_renewal_date || undefined,
    services: (data.services as any) || {},
    paymentMethods: (data.payment_methods as any) || [],
    employees: (employees || []).map(e => ({
      id: e.id,
      name: e.name,
      email: e.email,
      role: e.role,
    })),
  };
};

export const updateCompany = async (companyData: Partial<Company>): Promise<Company> => {
  if (!companyData.id) throw new Error("ID de empresa requerido");

  const updateData: any = {};
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
  if (companyData.services) updateData.services = companyData.services;
  if (companyData.paymentMethods) updateData.payment_methods = companyData.paymentMethods;

  const { data, error } = await supabase
    .from('companies')
    .update(updateData)
    .eq('id', companyData.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Fetch employees
  const { data: employees } = await supabase
    .from('employees')
    .select('*')
    .eq('company_id', data.id);

  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    cuit: data.cuit,
    address: data.address,
    postalCode: data.postal_code,
    city: data.city,
    locality: data.locality,
    province: data.province,
    country: data.country,
    ramaKey: data.rama_key || '',
    ownerEntity: data.owner_entity || '',
    phone: data.phone || '',
    isSubscribed: data.is_subscribed,
    selectedPlan: data.selected_plan || undefined,
    subscriptionStatus: data.subscription_status || undefined,
    subscriptionRenewalDate: data.subscription_renewal_date || undefined,
    services: (data.services as any) || {},
    paymentMethods: (data.payment_methods as any) || [],
    employees: (employees || []).map(e => ({
      id: e.id,
      name: e.name,
      email: e.email,
      role: e.role,
    })),
  };
};

export const subscribeCompany = async (_companyId: string, plan: string, _paymentDetails: any): Promise<Company> => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Usuario no autenticado");

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

// --- Employees ---
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
    throw new Error(error.message);
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
    throw new Error(error.message);
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
    throw new Error(error.message);
  }
};

// --- Conservation Certificates ---
export const getCertificates = async (): Promise<ConservationCertificate[]> => {
  const currentUser = await getCurrentUser();
  if (!currentUser) return [];

  const company = await getCompanyByUserId(currentUser.id).catch(() => null);
  if (!company) return [];

  const { data, error } = await supabase
    .from('conservation_certificates')
    .select('*')
    .eq('company_id', company.id);

  if (error) {
    console.error('Error fetching certificates:', error);
    return [];
  }

  return (data || []).map(cert => ({
    id: cert.id,
    companyId: cert.company_id,
    presentationDate: cert.presentation_date,
    expirationDate: cert.expiration_date,
    intervener: cert.intervener,
    registrationNumber: cert.registration_number,
    pdfFile: cert.pdf_file_url || undefined,
    pdfFileName: cert.pdf_file_name || undefined,
  }));
};

export const createCertificate = async (certData: Omit<ConservationCertificate, 'id' | 'companyId'>): Promise<ConservationCertificate> => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Empresa no asociada");

  const company = await getCompanyByUserId(currentUser.id);

  // TODO: Handle file upload to Supabase Storage
  const { data, error } = await supabase
    .from('conservation_certificates')
    .insert({
      company_id: company.id,
      presentation_date: certData.presentationDate,
      expiration_date: certData.expirationDate,
      intervener: certData.intervener,
      registration_number: certData.registrationNumber,
      pdf_file_url: null, // Will be updated after file upload
      pdf_file_path: null,
      pdf_file_name: certData.pdfFileName || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    companyId: data.company_id,
    presentationDate: data.presentation_date,
    expirationDate: data.expiration_date,
    intervener: data.intervener,
    registrationNumber: data.registration_number,
    pdfFile: data.pdf_file_url || undefined,
    pdfFileName: data.pdf_file_name || undefined,
  };
};

export const updateCertificate = async (certData: ConservationCertificate): Promise<ConservationCertificate> => {
  const { data, error } = await supabase
    .from('conservation_certificates')
    .update({
      presentation_date: certData.presentationDate,
      expiration_date: certData.expirationDate,
      intervener: certData.intervener,
      registration_number: certData.registrationNumber,
      pdf_file_name: certData.pdfFileName || null,
    })
    .eq('id', certData.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    companyId: data.company_id,
    presentationDate: data.presentation_date,
    expirationDate: data.expiration_date,
    intervener: data.intervener,
    registrationNumber: data.registration_number,
    pdfFile: data.pdf_file_url || undefined,
    pdfFileName: data.pdf_file_name || undefined,
  };
};

export const deleteCertificate = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('conservation_certificates')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

// --- Self Protection Systems ---
export const getSelfProtectionSystems = async (): Promise<SelfProtectionSystem[]> => {
  const currentUser = await getCurrentUser();
  if (!currentUser) return [];

  const company = await getCompanyByUserId(currentUser.id).catch(() => null);
  if (!company) return [];

  const { data, error } = await supabase
    .from('self_protection_systems')
    .select('*')
    .eq('company_id', company.id);

  if (error) {
    console.error('Error fetching systems:', error);
    return [];
  }

  return (data || []).map(sys => ({
    id: sys.id,
    companyId: sys.company_id,
    systemName: sys.system_name,
    systemType: sys.system_type,
    location: sys.location,
    installationDate: sys.installation_date || undefined,
    lastInspectionDate: sys.last_inspection_date,
    nextInspectionDate: sys.next_inspection_date,
    inspectionFrequency: sys.inspection_frequency,
    responsibleCompany: sys.responsible_company,
    status: sys.status,
    observations: sys.observations || undefined,
  }));
};

export const createSelfProtectionSystem = async (systemData: Omit<SelfProtectionSystem, 'id' | 'companyId'>): Promise<SelfProtectionSystem> => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Empresa no asociada");

  const company = await getCompanyByUserId(currentUser.id);

  const { data, error } = await supabase
    .from('self_protection_systems')
    .insert({
      company_id: company.id,
      system_name: systemData.systemName,
      system_type: systemData.systemType,
      location: systemData.location,
      installation_date: systemData.installationDate || null,
      last_inspection_date: systemData.lastInspectionDate,
      next_inspection_date: systemData.nextInspectionDate,
      inspection_frequency: systemData.inspectionFrequency,
      responsible_company: systemData.responsibleCompany,
      status: systemData.status,
      observations: systemData.observations || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    companyId: data.company_id,
    systemName: data.system_name,
    systemType: data.system_type,
    location: data.location,
    installationDate: data.installation_date || undefined,
    lastInspectionDate: data.last_inspection_date,
    nextInspectionDate: data.next_inspection_date,
    inspectionFrequency: data.inspection_frequency,
    responsibleCompany: data.responsible_company,
    status: data.status,
    observations: data.observations || undefined,
  };
};

export const updateSelfProtectionSystem = async (systemData: SelfProtectionSystem): Promise<SelfProtectionSystem> => {
  const { data, error } = await supabase
    .from('self_protection_systems')
    .update({
      system_name: systemData.systemName,
      system_type: systemData.systemType,
      location: systemData.location,
      installation_date: systemData.installationDate || null,
      last_inspection_date: systemData.lastInspectionDate,
      next_inspection_date: systemData.nextInspectionDate,
      inspection_frequency: systemData.inspectionFrequency,
      responsible_company: systemData.responsibleCompany,
      status: systemData.status,
      observations: systemData.observations || null,
    })
    .eq('id', systemData.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    companyId: data.company_id,
    systemName: data.system_name,
    systemType: data.system_type,
    location: data.location,
    installationDate: data.installation_date || undefined,
    lastInspectionDate: data.last_inspection_date,
    nextInspectionDate: data.next_inspection_date,
    inspectionFrequency: data.inspection_frequency,
    responsibleCompany: data.responsible_company,
    status: data.status,
    observations: data.observations || undefined,
  };
};

export const deleteSelfProtectionSystem = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('self_protection_systems')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

// --- QR Documents ---
// Note: File storage will need to be implemented with Supabase Storage
export const getQRDocuments = async (type: QRDocumentType): Promise<QRDocument[]> => {
  const allDocs = await getAllQRDocuments();
  return allDocs.filter(d => d.type === type);
};

export const getAllQRDocuments = async (): Promise<QRDocument[]> => {
  const currentUser = await getCurrentUser();
  if (!currentUser) return [];

  const company = await getCompanyByUserId(currentUser.id).catch(() => null);
  if (!company) return [];

  const { data, error } = await supabase
    .from('qr_documents')
    .select('*')
    .eq('company_id', company.id);

  if (error) {
    console.error('Error fetching QR documents:', error);
    return [];
  }

  return (data || []).map(doc => ({
    id: doc.id,
    companyId: doc.company_id,
    type: doc.type as QRDocumentType,
    documentName: doc.document_name,
    floor: doc.floor || undefined,
    unit: doc.unit || undefined,
    pdfUrl: doc.pdf_file_url || undefined,
    uploadDate: doc.upload_date,
    qrCodeData: doc.qr_code_data || undefined,
  }));
};

export const uploadQRDocument = async (docData: Omit<QRDocument, 'id' | 'companyId' | 'uploadDate' | 'pdfUrl'>): Promise<QRDocument> => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Empresa no asociada");

  const company = await getCompanyByUserId(currentUser.id);

  // TODO: Implement file upload to Supabase Storage
  // For now, we'll store a placeholder
  const { data, error } = await supabase
    .from('qr_documents')
    .insert({
      company_id: company.id,
      type: docData.type,
      document_name: docData.documentName,
      floor: docData.floor || null,
      unit: docData.unit || null,
      pdf_file_url: null, // Will be updated after storage upload
      pdf_file_path: null,
      qr_code_data: docData.qrCodeData || null,
      upload_date: new Date().toISOString().split('T')[0],
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    companyId: data.company_id,
    type: data.type as QRDocumentType,
    documentName: data.document_name,
    floor: data.floor || undefined,
    unit: data.unit || undefined,
    pdfUrl: data.pdf_file_url || undefined,
    uploadDate: data.upload_date,
    qrCodeData: data.qr_code_data || undefined,
  };
};

export const deleteQRDocument = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('qr_documents')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

// --- Event Information ---
export const getEvents = async (): Promise<EventInformation[]> => {
  const currentUser = await getCurrentUser();
  if (!currentUser) return [];

  const company = await getCompanyByUserId(currentUser.id).catch(() => null);
  if (!company) return [];

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('company_id', company.id);

  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }

  return (data || []).map(event => ({
    id: event.id,
    companyId: event.company_id,
    date: event.date,
    time: event.time,
    description: event.description,
    correctiveActions: event.corrective_actions,
    testimonials: (event.testimonials as string[]) || [],
    observations: (event.observations as string[]) || [],
    finalChecks: (event.final_checks as any) || {},
  }));
};

export const createEvent = async (eventData: Omit<EventInformation, 'id' | 'companyId'>): Promise<EventInformation> => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Empresa no asociada");

  const company = await getCompanyByUserId(currentUser.id);

  const { data, error } = await supabase
    .from('events')
    .insert({
      company_id: company.id,
      date: eventData.date,
      time: eventData.time,
      description: eventData.description,
      corrective_actions: eventData.correctiveActions,
      testimonials: eventData.testimonials || [],
      observations: eventData.observations || [],
      final_checks: eventData.finalChecks || {},
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    companyId: data.company_id,
    date: data.date,
    time: data.time,
    description: data.description,
    correctiveActions: data.corrective_actions,
    testimonials: (data.testimonials as string[]) || [],
    observations: (data.observations as string[]) || [],
    finalChecks: (data.final_checks as any) || {},
  };
};

export const updateEvent = async (eventData: EventInformation): Promise<EventInformation> => {
  const { data, error } = await supabase
    .from('events')
    .update({
      date: eventData.date,
      time: eventData.time,
      description: eventData.description,
      corrective_actions: eventData.correctiveActions,
      testimonials: eventData.testimonials || [],
      observations: eventData.observations || [],
      final_checks: eventData.finalChecks || {},
    })
    .eq('id', eventData.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    companyId: data.company_id,
    date: data.date,
    time: data.time,
    description: data.description,
    correctiveActions: data.corrective_actions,
    testimonials: (data.testimonials as string[]) || [],
    observations: (data.observations as string[]) || [],
    finalChecks: (data.final_checks as any) || {},
  };
};

export const deleteEvent = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

// PDF generation (same as before)
export const downloadEventPDF = async (event: EventInformation, companyName: string): Promise<void> => {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4'
  });

  doc.setFont('helvetica');

  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 20;

  const addWrappedText = (text: string, x: number, startY: number, maxWidth: number): number => {
    const lines = doc.splitTextToSize(text, maxWidth);
    let newY = startY;
    if (newY + (lines.length * 7) > pageHeight - margin) {
      doc.addPage();
      newY = margin;
    }
    doc.text(lines, x, newY);
    return newY + (lines.length * 7);
  };

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text("Informe de Evento", pageWidth / 2, y, { align: "center" });
  y += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Empresa: ${companyName}`, margin, y);
  y += 8;

  const eventDate = new Date(event.date).toLocaleDateString('es-AR', { timeZone: 'UTC' });
  doc.text(`Fecha y Hora: ${eventDate} - ${event.time}`, margin, y);
  y += 8;

  doc.setLineWidth(0.2);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  const addSectionTitle = (title: string, startY: number): number => {
      let newY = startY;
      if (newY > pageHeight - 30) {
          doc.addPage();
          newY = margin;
      }
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin, newY);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      return newY + 8;
  }

  y = addSectionTitle("Descripción Detallada", y);
  y = addWrappedText(event.description, margin, y, pageWidth - margin * 2);
  y += 5;

  y = addSectionTitle("Acciones Correctivas Propuestas", y);
  y = addWrappedText(event.correctiveActions, margin, y, pageWidth - margin * 2);
  y += 5;

  const validTestimonials = event.testimonials?.filter(t => t?.trim()) || [];
  if (validTestimonials.length > 0) {
    if (y > pageHeight - 40) { doc.addPage(); y = margin; }
    autoTable(doc, {
      startY: y,
      head: [['Testimonios']],
      body: validTestimonials.map(t => [t]),
      theme: 'grid',
      headStyles: { fillColor: '#4A90E2', textColor: 255 },
    });
    const table1 = (doc as typeof doc & { lastAutoTable?: { finalY: number } });
    y = (table1.lastAutoTable?.finalY ?? y) + 10;
  }

  const validObservations = event.observations?.filter(o => o?.trim()) || [];
  if (validObservations.length > 0) {
    if (y > pageHeight - 40) { doc.addPage(); y = margin; }
    autoTable(doc, {
      startY: y,
      head: [['Observaciones']],
      body: validObservations.map(o => [o]),
      theme: 'grid',
      headStyles: { fillColor: '#50E3C2', textColor: 255 },
    });
    const table2 = (doc as typeof doc & { lastAutoTable?: { finalY: number } });
    y = (table2.lastAutoTable?.finalY ?? y) + 10;
  }

  const finalCheckItems = [
    { key: 'usoMatafuegos', label: "Uso de matafuegos y otros elementos de extinción." },
    { key: 'requerimientosServicios', label: "Requerimientos de servicios médicos privados, SAME, bomberos, Defensa Civil, Guardia de auxilio y Policia." },
    { key: 'danoPersonas', label: "Daño a personas." },
    { key: 'danosEdilicios', label: "Daños edilicios." },
    { key: 'evacuacion', label: "Evacuación parcial o total del edificio." },
  ];
  const checkedItems = finalCheckItems.filter(item => event.finalChecks?.[item.key]);

  if (checkedItems.length > 0) {
      y = addSectionTitle("Verificaciones Finales", y);
      checkedItems.forEach(item => {
          y = addWrappedText(`• ${item.label}`, margin + 2, y, pageWidth - (margin * 2) - 2);
          y += 2;
      });
  }

  doc.save(`informe-evento-${event.date}.pdf`);
  return Promise.resolve();
};

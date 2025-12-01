
import { supabase } from '../../supabase/client';
import { EventInformation } from '../../../types/index';
import { mapEventFromDb } from '../mappers';
import { AuthError, NotFoundError, handleSupabaseError } from '../../utils/errors';
import { getCurrentUser } from './auth';
import { getCompanyByUserId } from './company';

// Note: getCurrentUser and getCompanyByUserId are still used by createEvent

export const getEvents = async (companyId: string): Promise<EventInformation[]> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('company_id', companyId)
    .order('date', { ascending: false });

  if (error) {
    handleSupabaseError(error, 'Error al obtener eventos');
  }

  return (data || []).map(mapEventFromDb);
};

export const getEventById = async (id: string): Promise<EventInformation> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    throw new NotFoundError('Evento no encontrado', 'event');
  }

  return mapEventFromDb(data);
};

export const createEvent = async (eventData: Omit<EventInformation, 'id' | 'companyId'>): Promise<EventInformation> => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new AuthError("Usuario no autenticado");

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
    handleSupabaseError(error);
  }

  return mapEventFromDb(data);
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
    handleSupabaseError(error);
  }

  return mapEventFromDb(data);
};

export const deleteEvent = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) {
    handleSupabaseError(error);
  }
};

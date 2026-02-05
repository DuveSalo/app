
import { supabase } from '../../supabase/client';
import { EventInformation } from '../../../types/index';
import { mapEventFromDb } from '../mappers';
import { AuthError, NotFoundError, handleSupabaseError } from '../../utils/errors';
import { getCurrentUser } from './auth';
import { getCompanyIdByUserId } from './company';
import { PaginationParams, CursorPaginationParams, CursorPaginatedResult } from '../../../types/common';

// Explicit column selection (avoid SELECT *)
const EVENT_COLUMNS = 'id, company_id, date, time, description, corrective_actions, testimonials, observations, final_checks';

export const getEvents = async (
  companyId: string,
  pagination?: PaginationParams
): Promise<EventInformation[]> => {
  let query = supabase
    .from('events')
    .select(EVENT_COLUMNS)
    .eq('company_id', companyId)
    .order('date', { ascending: false });

  if (pagination?.page && pagination?.pageSize) {
    const offset = (pagination.page - 1) * pagination.pageSize;
    query = query.range(offset, offset + pagination.pageSize - 1);
  }

  const { data, error } = await query;

  if (error) {
    handleSupabaseError(error, 'Error al obtener eventos');
  }

  return (data || []).map(mapEventFromDb);
};

/**
 * Cursor-based pagination for events (O(1) performance on any page)
 */
export const getEventsCursor = async (
  companyId: string,
  params: CursorPaginationParams = {}
): Promise<CursorPaginatedResult<EventInformation>> => {
  const limit = params.limit || 20;
  const fetchLimit = limit + 1;

  let query = supabase
    .from('events')
    .select(EVENT_COLUMNS)
    .eq('company_id', companyId)
    .order('date', { ascending: false })
    .order('id', { ascending: false })
    .limit(fetchLimit);

  if (params.cursor) {
    try {
      const decoded = atob(params.cursor);
      const [cursorDate, cursorId] = decoded.split('|');
      if (cursorDate && cursorId) {
        query = query.or(`date.lt.${cursorDate},and(date.eq.${cursorDate},id.lt.${cursorId})`);
      }
    } catch { /* Invalid cursor */ }
  }

  const { data, error } = await query;
  if (error) handleSupabaseError(error);

  const items = (data || []).slice(0, limit).map(mapEventFromDb);
  const hasMore = (data || []).length > limit;
  const firstItem = items[0];
  const lastItem = items[items.length - 1];

  return {
    items,
    nextCursor: hasMore && lastItem ? btoa(`${lastItem.date}|${lastItem.id}`) : null,
    prevCursor: params.cursor && firstItem ? btoa(`${firstItem.date}|${firstItem.id}`) : null,
    hasMore,
  };
};

export const getEventById = async (id: string): Promise<EventInformation> => {
  const { data, error } = await supabase
    .from('events')
    .select(EVENT_COLUMNS)
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

  // Use lightweight helper - only get company_id (N+1 optimization)
  const companyId = await getCompanyIdByUserId(currentUser.id);

  const { data, error } = await supabase
    .from('events')
    .insert({
      company_id: companyId,
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

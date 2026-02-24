import { supabase } from '../../supabase/client';
import { FireExtinguisherControl, ExtinguisherType, ExtinguisherCapacity, YesNo, YesNoNA } from '../../../types/index';
import { handleSupabaseError } from '../../utils/errors';
import { Tables } from '../../../types/database.types';
import { PaginationParams, CursorPaginationParams, CursorPaginatedResult } from '../../../types/common';

type FireExtinguisherRow = Tables<'fire_extinguishers'>;

// Explicit column selection (avoid SELECT *)
const FIRE_EXTINGUISHER_COLUMNS = `
  id, company_id, control_date, extinguisher_number, type, capacity, class, position_number,
  charge_expiration_date, hydraulic_pressure_expiration_date, manufacturing_year, tag_color,
  labels_legible, pressure_within_range, has_seal_and_safety, instructions_legible,
  container_condition, nozzle_condition, visibility_obstructed, access_obstructed,
  signage_condition, signage_floor, signage_wall, signage_height, glass_condition,
  door_opens_easily, cabinet_clean, observations, created_at, updated_at
`.replace(/\s+/g, ' ').trim();

const mapDbToFireExtinguisher = (item: FireExtinguisherRow): FireExtinguisherControl => ({
  id: item.id,
  companyId: item.company_id,
  controlDate: item.control_date,
  extinguisherNumber: item.extinguisher_number,
  type: item.type as ExtinguisherType,
  capacity: item.capacity as ExtinguisherCapacity,
  class: item.class,
  positionNumber: item.position_number,
  chargeExpirationDate: item.charge_expiration_date,
  hydraulicPressureExpirationDate: item.hydraulic_pressure_expiration_date,
  manufacturingYear: item.manufacturing_year,
  tagColor: item.tag_color,
  labelsLegible: item.labels_legible,
  pressureWithinRange: item.pressure_within_range,
  hasSealAndSafety: item.has_seal_and_safety,
  instructionsLegible: item.instructions_legible,
  containerCondition: item.container_condition,
  nozzleCondition: item.nozzle_condition,
  visibilityObstructed: item.visibility_obstructed as YesNo,
  accessObstructed: item.access_obstructed as YesNo,
  signageCondition: item.signage_condition,
  signageFloor: item.signage_floor as YesNoNA,
  signageWall: item.signage_wall as YesNoNA,
  signageHeight: item.signage_height as YesNoNA,
  glassCondition: item.glass_condition as YesNoNA,
  doorOpensEasily: item.door_opens_easily as YesNoNA,
  cabinetClean: item.cabinet_clean as YesNoNA,
  observations: item.observations,
  createdAt: item.created_at,
  updatedAt: item.updated_at,
});

export const getFireExtinguishers = async (
  companyId: string,
  pagination?: PaginationParams
): Promise<FireExtinguisherControl[]> => {
  let query = supabase
    .from('fire_extinguishers')
    .select(FIRE_EXTINGUISHER_COLUMNS)
    .eq('company_id', companyId)
    .order('control_date', { ascending: false });

  if (pagination?.page && pagination?.pageSize) {
    const offset = (pagination.page - 1) * pagination.pageSize;
    query = query.range(offset, offset + pagination.pageSize - 1);
  }

  const { data, error } = await query;

  if (error) {
    handleSupabaseError(error);
  }

  return (data || []).map(mapDbToFireExtinguisher);
};

/**
 * Cursor-based pagination for fire extinguishers (O(1) performance on any page)
 * Uses control_date + id as composite cursor for stable ordering
 */
export const getFireExtinguishersCursor = async (
  companyId: string,
  params: CursorPaginationParams = {}
): Promise<CursorPaginatedResult<FireExtinguisherControl>> => {
  const limit = params.limit || 20;
  const fetchLimit = limit + 1; // Fetch one extra to determine hasMore

  let query = supabase
    .from('fire_extinguishers')
    .select(FIRE_EXTINGUISHER_COLUMNS)
    .eq('company_id', companyId)
    .order('control_date', { ascending: false })
    .order('id', { ascending: false })
    .limit(fetchLimit);

  // Apply cursor filter if provided
  if (params.cursor) {
    try {
      const decoded = atob(params.cursor);
      const [cursorDate, cursorId] = decoded.split('|');
      if (cursorDate && cursorId) {
        // Keyset pagination: get items where (control_date, id) < (cursorDate, cursorId)
        query = query.or(`control_date.lt.${cursorDate},and(control_date.eq.${cursorDate},id.lt.${cursorId})`);
      }
    } catch {
      // Invalid cursor, ignore
    }
  }

  const { data, error } = await query;

  if (error) {
    handleSupabaseError(error);
  }

  const items = (data || []).slice(0, limit).map(mapDbToFireExtinguisher);
  const hasMore = (data || []).length > limit;

  // Generate cursors
  const firstItem = items[0];
  const lastItem = items[items.length - 1];

  return {
    items,
    nextCursor: hasMore && lastItem
      ? btoa(`${lastItem.controlDate}|${lastItem.id}`)
      : null,
    prevCursor: params.cursor && firstItem
      ? btoa(`${firstItem.controlDate}|${firstItem.id}`)
      : null,
    hasMore,
  };
};

export const getFireExtinguisherById = async (id: string): Promise<FireExtinguisherControl> => {
  const { data, error } = await supabase
    .from('fire_extinguishers')
    .select(FIRE_EXTINGUISHER_COLUMNS)
    .eq('id', id)
    .single();

  if (error) {
    handleSupabaseError(error);
  }

  return mapDbToFireExtinguisher(data);
};

export const createFireExtinguisher = async (
  extinguisher: Omit<FireExtinguisherControl, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>
): Promise<FireExtinguisherControl> => {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) throw new Error('No authenticated user');

  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('user_id', sessionData.session.user.id)
    .single();

  if (!company) throw new Error('No company found for user');

  const { data, error } = await supabase
    .from('fire_extinguishers')
    .insert({
      company_id: company.id,
      control_date: extinguisher.controlDate,
      extinguisher_number: extinguisher.extinguisherNumber,
      type: extinguisher.type,
      capacity: extinguisher.capacity,
      class: extinguisher.class,
      position_number: extinguisher.positionNumber,
      charge_expiration_date: extinguisher.chargeExpirationDate,
      hydraulic_pressure_expiration_date: extinguisher.hydraulicPressureExpirationDate,
      manufacturing_year: extinguisher.manufacturingYear,
      tag_color: extinguisher.tagColor,
      labels_legible: extinguisher.labelsLegible,
      pressure_within_range: extinguisher.pressureWithinRange,
      has_seal_and_safety: extinguisher.hasSealAndSafety,
      instructions_legible: extinguisher.instructionsLegible,
      container_condition: extinguisher.containerCondition,
      nozzle_condition: extinguisher.nozzleCondition,
      visibility_obstructed: extinguisher.visibilityObstructed,
      access_obstructed: extinguisher.accessObstructed,
      signage_condition: extinguisher.signageCondition,
      signage_floor: extinguisher.signageFloor,
      signage_wall: extinguisher.signageWall,
      signage_height: extinguisher.signageHeight,
      glass_condition: extinguisher.glassCondition,
      door_opens_easily: extinguisher.doorOpensEasily,
      cabinet_clean: extinguisher.cabinetClean,
      observations: extinguisher.observations,
    })
    .select(FIRE_EXTINGUISHER_COLUMNS)
    .single();

  if (error) {
    handleSupabaseError(error);
  }

  return mapDbToFireExtinguisher(data);
};

export const updateFireExtinguisher = async (
  extinguisher: Omit<FireExtinguisherControl, 'createdAt' | 'updatedAt'>
): Promise<FireExtinguisherControl> => {
  const { data, error } = await supabase
    .from('fire_extinguishers')
    .update({
      control_date: extinguisher.controlDate,
      extinguisher_number: extinguisher.extinguisherNumber,
      type: extinguisher.type,
      capacity: extinguisher.capacity,
      class: extinguisher.class,
      position_number: extinguisher.positionNumber,
      charge_expiration_date: extinguisher.chargeExpirationDate,
      hydraulic_pressure_expiration_date: extinguisher.hydraulicPressureExpirationDate,
      manufacturing_year: extinguisher.manufacturingYear,
      tag_color: extinguisher.tagColor,
      labels_legible: extinguisher.labelsLegible,
      pressure_within_range: extinguisher.pressureWithinRange,
      has_seal_and_safety: extinguisher.hasSealAndSafety,
      instructions_legible: extinguisher.instructionsLegible,
      container_condition: extinguisher.containerCondition,
      nozzle_condition: extinguisher.nozzleCondition,
      visibility_obstructed: extinguisher.visibilityObstructed,
      access_obstructed: extinguisher.accessObstructed,
      signage_condition: extinguisher.signageCondition,
      signage_floor: extinguisher.signageFloor,
      signage_wall: extinguisher.signageWall,
      signage_height: extinguisher.signageHeight,
      glass_condition: extinguisher.glassCondition,
      door_opens_easily: extinguisher.doorOpensEasily,
      cabinet_clean: extinguisher.cabinetClean,
      observations: extinguisher.observations,
      updated_at: new Date().toISOString(),
    })
    .eq('id', extinguisher.id)
    .select(FIRE_EXTINGUISHER_COLUMNS)
    .single();

  if (error) {
    handleSupabaseError(error);
  }

  return mapDbToFireExtinguisher(data);
};

export const deleteFireExtinguisher = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('fire_extinguishers')
    .delete()
    .eq('id', id);

  if (error) {
    handleSupabaseError(error);
  }
};

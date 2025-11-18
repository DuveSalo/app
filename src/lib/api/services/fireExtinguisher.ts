import { supabase } from '../../supabase/client';
import { FireExtinguisherControl } from '../../../types/index';
import { handleSupabaseError } from '../../utils/errors';

export const getFireExtinguishers = async (companyId: string): Promise<FireExtinguisherControl[]> => {
  const { data, error } = await supabase
    .from('fire_extinguishers')
    .select('*')
    .eq('company_id', companyId)
    .order('control_date', { ascending: false });

  if (error) {
    handleSupabaseError(error);
  }

  return (data || []).map(item => ({
    id: item.id,
    companyId: item.company_id,
    controlDate: item.control_date,
    extinguisherNumber: item.extinguisher_number,
    type: item.type,
    capacity: item.capacity,
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
    visibilityObstructed: item.visibility_obstructed,
    accessObstructed: item.access_obstructed,
    signageCondition: item.signage_condition,
    signageFloor: item.signage_floor,
    signageWall: item.signage_wall,
    signageHeight: item.signage_height,
    glassCondition: item.glass_condition,
    doorOpensEasily: item.door_opens_easily,
    cabinetClean: item.cabinet_clean,
    observations: item.observations,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }));
};

export const getFireExtinguisherById = async (id: string): Promise<FireExtinguisherControl> => {
  const { data, error } = await supabase
    .from('fire_extinguishers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    handleSupabaseError(error);
  }

  return {
    id: data.id,
    companyId: data.company_id,
    controlDate: data.control_date,
    extinguisherNumber: data.extinguisher_number,
    type: data.type,
    capacity: data.capacity,
    class: data.class,
    positionNumber: data.position_number,
    chargeExpirationDate: data.charge_expiration_date,
    hydraulicPressureExpirationDate: data.hydraulic_pressure_expiration_date,
    manufacturingYear: data.manufacturing_year,
    tagColor: data.tag_color,
    labelsLegible: data.labels_legible,
    pressureWithinRange: data.pressure_within_range,
    hasSealAndSafety: data.has_seal_and_safety,
    instructionsLegible: data.instructions_legible,
    containerCondition: data.container_condition,
    nozzleCondition: data.nozzle_condition,
    visibilityObstructed: data.visibility_obstructed,
    accessObstructed: data.access_obstructed,
    signageCondition: data.signage_condition,
    signageFloor: data.signage_floor,
    signageWall: data.signage_wall,
    signageHeight: data.signage_height,
    glassCondition: data.glass_condition,
    doorOpensEasily: data.door_opens_easily,
    cabinetClean: data.cabinet_clean,
    observations: data.observations,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
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
    .select()
    .single();

  if (error) {
    handleSupabaseError(error);
  }

  return getFireExtinguisherById(data.id);
};

export const updateFireExtinguisher = async (
  extinguisher: Omit<FireExtinguisherControl, 'createdAt' | 'updatedAt'>
): Promise<FireExtinguisherControl> => {
  const { error } = await supabase
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
    .eq('id', extinguisher.id);

  if (error) {
    handleSupabaseError(error);
  }

  return getFireExtinguisherById(extinguisher.id);
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

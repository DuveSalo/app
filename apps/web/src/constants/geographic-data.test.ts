import { describe, expect, it } from 'vitest';
import { CABA_PROVINCE_VALUE, CITIES_BY_PROVINCE, isCabaProvince } from './geographic-data';

describe('geographic data', () => {
  it('does not expose CABA neighborhoods as city/locality options', () => {
    expect(CITIES_BY_PROVINCE[CABA_PROVINCE_VALUE]).toEqual([]);
  });

  it('identifies Ciudad Autónoma de Buenos Aires by its province value', () => {
    expect(isCabaProvince('CABA')).toBe(true);
    expect(isCabaProvince('Buenos Aires')).toBe(false);
    expect(isCabaProvince(undefined)).toBe(false);
  });
});

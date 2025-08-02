
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { airlinesTable } from '../db/schema';
import { getAirlines } from '../handlers/get_airlines';

describe('getAirlines', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no airlines exist', async () => {
    const result = await getAirlines();
    expect(result).toEqual([]);
  });

  it('should return all airlines', async () => {
    // Create test airlines
    await db.insert(airlinesTable)
      .values([
        {
          code: 'AF',
          name: 'Air France',
          logo_url: 'https://example.com/af-logo.png'
        },
        {
          code: 'LH',
          name: 'Lufthansa',
          logo_url: null
        },
        {
          code: 'BA',
          name: 'British Airways',
          logo_url: 'https://example.com/ba-logo.png'
        }
      ])
      .execute();

    const result = await getAirlines();

    expect(result).toHaveLength(3);
    
    // Check that all expected fields are present
    result.forEach(airline => {
      expect(airline.id).toBeDefined();
      expect(airline.code).toBeDefined();
      expect(airline.name).toBeDefined();
      expect(airline.created_at).toBeInstanceOf(Date);
      expect(typeof airline.logo_url === 'string' || airline.logo_url === null).toBe(true);
    });

    // Check specific airline data
    const airFrance = result.find(a => a.code === 'AF');
    expect(airFrance?.name).toBe('Air France');
    expect(airFrance?.logo_url).toBe('https://example.com/af-logo.png');

    const lufthansa = result.find(a => a.code === 'LH');
    expect(lufthansa?.name).toBe('Lufthansa');
    expect(lufthansa?.logo_url).toBe(null);
  });

  it('should return airlines in consistent order', async () => {
    // Create airlines
    await db.insert(airlinesTable)
      .values([
        { code: 'ZZ', name: 'Last Airline', logo_url: null },
        { code: 'AA', name: 'First Airline', logo_url: null },
        { code: 'MM', name: 'Middle Airline', logo_url: null }
      ])
      .execute();

    const result1 = await getAirlines();
    const result2 = await getAirlines();

    // Results should be consistent between calls
    expect(result1).toHaveLength(3);
    expect(result2).toHaveLength(3);
    expect(result1.map(a => a.code)).toEqual(result2.map(a => a.code));
  });
});

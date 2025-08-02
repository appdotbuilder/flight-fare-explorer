
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { airportsTable } from '../db/schema';
import { getAirports } from '../handlers/get_airports';

describe('getAirports', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no airports exist', async () => {
    const result = await getAirports();

    expect(result).toEqual([]);
  });

  it('should return all airports', async () => {
    // Create test airports
    await db.insert(airportsTable)
      .values([
        {
          code: 'CDG',
          name: 'Charles de Gaulle Airport',
          city: 'Paris',
          country: 'France',
          latitude: 49.0097,
          longitude: 2.5479
        },
        {
          code: 'JFK',
          name: 'John F. Kennedy International Airport',
          city: 'New York',
          country: 'United States',
          latitude: 40.6413,
          longitude: -73.7781
        }
      ])
      .execute();

    const result = await getAirports();

    expect(result).toHaveLength(2);
    
    // Check first airport
    const cdg = result.find(airport => airport.code === 'CDG');
    expect(cdg).toBeDefined();
    expect(cdg!.name).toEqual('Charles de Gaulle Airport');
    expect(cdg!.city).toEqual('Paris');
    expect(cdg!.country).toEqual('France');
    expect(typeof cdg!.latitude).toBe('number');
    expect(typeof cdg!.longitude).toBe('number');
    expect(cdg!.latitude).toEqual(49.0097);
    expect(cdg!.longitude).toEqual(2.5479);
    expect(cdg!.id).toBeDefined();
    expect(cdg!.created_at).toBeInstanceOf(Date);

    // Check second airport
    const jfk = result.find(airport => airport.code === 'JFK');
    expect(jfk).toBeDefined();
    expect(jfk!.name).toEqual('John F. Kennedy International Airport');
    expect(jfk!.city).toEqual('New York');
    expect(jfk!.country).toEqual('United States');
    expect(typeof jfk!.latitude).toBe('number');
    expect(typeof jfk!.longitude).toBe('number');
    expect(jfk!.latitude).toEqual(40.6413);
    expect(jfk!.longitude).toEqual(-73.7781);
  });

  it('should return airports with correct field types', async () => {
    await db.insert(airportsTable)
      .values({
        code: 'LHR',
        name: 'Heathrow Airport',
        city: 'London',
        country: 'United Kingdom',
        latitude: 51.4700,
        longitude: -0.4543
      })
      .execute();

    const result = await getAirports();

    expect(result).toHaveLength(1);
    const airport = result[0];
    
    // Verify all field types
    expect(typeof airport.id).toBe('number');
    expect(typeof airport.code).toBe('string');
    expect(typeof airport.name).toBe('string');
    expect(typeof airport.city).toBe('string');
    expect(typeof airport.country).toBe('string');
    expect(typeof airport.latitude).toBe('number');
    expect(typeof airport.longitude).toBe('number');
    expect(airport.created_at).toBeInstanceOf(Date);
  });
});

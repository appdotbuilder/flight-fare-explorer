
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { airportsTable } from '../db/schema';
import { getAirportsByCity } from '../handlers/get_airports_by_city';

describe('getAirportsByCity', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return airports for a specific city', async () => {
    // Create test airports
    await db.insert(airportsTable).values([
      {
        code: 'CDG',
        name: 'Charles de Gaulle Airport',
        city: 'Paris',
        country: 'France',
        latitude: 49.0097,
        longitude: 2.5479
      },
      {
        code: 'ORY',
        name: 'Orly Airport',
        city: 'Paris',
        country: 'France',
        latitude: 48.7233,
        longitude: 2.3794
      },
      {
        code: 'JFK',
        name: 'John F. Kennedy International Airport',
        city: 'New York',
        country: 'USA',
        latitude: 40.6413,
        longitude: -73.7781
      }
    ]).execute();

    const result = await getAirportsByCity('Paris');

    expect(result).toHaveLength(2);
    expect(result[0].city).toEqual('Paris');
    expect(result[1].city).toEqual('Paris');
    
    // Verify all expected fields are present
    result.forEach(airport => {
      expect(airport.id).toBeDefined();
      expect(airport.code).toBeDefined();
      expect(airport.name).toBeDefined();
      expect(airport.city).toEqual('Paris');
      expect(airport.country).toEqual('France');
      expect(typeof airport.latitude).toBe('number');
      expect(typeof airport.longitude).toBe('number');
      expect(airport.created_at).toBeInstanceOf(Date);
    });

    // Check specific airports
    const cdg = result.find(a => a.code === 'CDG');
    const ory = result.find(a => a.code === 'ORY');
    
    expect(cdg).toBeDefined();
    expect(cdg?.name).toEqual('Charles de Gaulle Airport');
    expect(cdg?.latitude).toEqual(49.0097);
    expect(cdg?.longitude).toEqual(2.5479);
    
    expect(ory).toBeDefined();
    expect(ory?.name).toEqual('Orly Airport');
    expect(ory?.latitude).toEqual(48.7233);
    expect(ory?.longitude).toEqual(2.3794);
  });

  it('should return empty array for city with no airports', async () => {
    // Create some airports in different cities
    await db.insert(airportsTable).values([
      {
        code: 'CDG',
        name: 'Charles de Gaulle Airport',
        city: 'Paris',
        country: 'France',
        latitude: 49.0097,
        longitude: 2.5479
      }
    ]).execute();

    const result = await getAirportsByCity('NonexistentCity');

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should handle case-sensitive city search', async () => {
    // Create test airport
    await db.insert(airportsTable).values([
      {
        code: 'CDG',
        name: 'Charles de Gaulle Airport',
        city: 'Paris',
        country: 'France',
        latitude: 49.0097,
        longitude: 2.5479
      }
    ]).execute();

    const resultExact = await getAirportsByCity('Paris');
    const resultWrongCase = await getAirportsByCity('paris');

    expect(resultExact).toHaveLength(1);
    expect(resultWrongCase).toHaveLength(0);
  });

  it('should return airports with correct numeric types for coordinates', async () => {
    // Create test airport with specific coordinates
    await db.insert(airportsTable).values([
      {
        code: 'LAX',
        name: 'Los Angeles International Airport',
        city: 'Los Angeles',
        country: 'USA',
        latitude: 33.9425,
        longitude: -118.4081
      }
    ]).execute();

    const result = await getAirportsByCity('Los Angeles');

    expect(result).toHaveLength(1);
    const airport = result[0];
    
    // Verify numeric types and precision
    expect(typeof airport.latitude).toBe('number');
    expect(typeof airport.longitude).toBe('number');
    expect(airport.latitude).toEqual(33.9425);
    expect(airport.longitude).toEqual(-118.4081);
    
    // Verify negative longitude is handled correctly
    expect(airport.longitude).toBeLessThan(0);
  });

  it('should handle multiple airports in same city with different countries', async () => {
    // Create airports with same city name but different countries
    await db.insert(airportsTable).values([
      {
        code: 'LHR',
        name: 'Heathrow Airport',
        city: 'London',
        country: 'United Kingdom',
        latitude: 51.4700,
        longitude: -0.4543
      },
      {
        code: 'YXU',
        name: 'London Airport',
        city: 'London',
        country: 'Canada',
        latitude: 43.0389,
        longitude: -81.1517
      }
    ]).execute();

    const result = await getAirportsByCity('London');

    expect(result).toHaveLength(2);
    
    const ukAirport = result.find(a => a.country === 'United Kingdom');
    const canadaAirport = result.find(a => a.country === 'Canada');
    
    expect(ukAirport).toBeDefined();
    expect(ukAirport?.code).toEqual('LHR');
    expect(canadaAirport).toBeDefined();
    expect(canadaAirport?.code).toEqual('YXU');
    
    // Both should have same city name
    result.forEach(airport => {
      expect(airport.city).toEqual('London');
    });
  });
});

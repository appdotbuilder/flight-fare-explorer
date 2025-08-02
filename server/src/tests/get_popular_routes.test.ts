
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { airlinesTable, airportsTable, routesTable } from '../db/schema';
import { getPopularRoutes } from '../handlers/get_popular_routes';

describe('getPopularRoutes', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no routes exist', async () => {
    const result = await getPopularRoutes();
    expect(result).toEqual([]);
  });

  it('should return popular routes with airport details', async () => {
    // Create test airports
    const airports = await db.insert(airportsTable)
      .values([
        {
          code: 'CDG',
          name: 'Charles de Gaulle',
          city: 'Paris',
          country: 'France',
          latitude: 49.0097,
          longitude: 2.5479
        },
        {
          code: 'JFK',
          name: 'John F. Kennedy International',
          city: 'New York',
          country: 'USA',
          latitude: 40.6413,
          longitude: -73.7781
        }
      ])
      .returning()
      .execute();

    // Create test route
    await db.insert(routesTable)
      .values({
        origin_airport_id: airports[0].id,
        destination_airport_id: airports[1].id,
        min_price: '299.99',
        max_price: '899.99',
        flight_count: 25
      })
      .execute();

    const result = await getPopularRoutes();

    expect(result).toHaveLength(1);
    const route = result[0];

    // Verify route data
    expect(route.id).toBeDefined();
    expect(route.flight_count).toEqual(25);
    expect(route.last_updated).toBeInstanceOf(Date);

    // Verify numeric conversions
    expect(typeof route.min_price).toBe('number');
    expect(typeof route.max_price).toBe('number');
    expect(route.min_price).toEqual(299.99);
    expect(route.max_price).toEqual(899.99);
    expect(typeof route.origin_latitude).toBe('number');
    expect(typeof route.origin_longitude).toBe('number');

    // Verify origin airport data
    expect(route.origin_airport_code).toEqual('CDG');
    expect(route.origin_airport_name).toEqual('Charles de Gaulle');
    expect(route.origin_city).toEqual('Paris');
    expect(route.origin_country).toEqual('France');
    expect(route.origin_latitude).toEqual(49.0097);
    expect(route.origin_longitude).toEqual(2.5479);

    // Verify destination airport data
    expect(route.destination_airport_code).toEqual('JFK');
    expect(route.destination_airport_name).toEqual('John F. Kennedy International');
    expect(route.destination_city).toEqual('New York');
    expect(route.destination_country).toEqual('USA');
    expect(route.destination_latitude).toEqual(40.6413);
    expect(route.destination_longitude).toEqual(-73.7781);
  });

  it('should return routes ordered by flight count descending', async () => {
    // Create test airports
    const airports = await db.insert(airportsTable)
      .values([
        {
          code: 'CDG',
          name: 'Charles de Gaulle',
          city: 'Paris',
          country: 'France',
          latitude: 49.0097,
          longitude: 2.5479
        },
        {
          code: 'JFK',
          name: 'John F. Kennedy International',
          city: 'New York',
          country: 'USA',
          latitude: 40.6413,
          longitude: -73.7781
        },
        {
          code: 'LHR',
          name: 'Heathrow',
          city: 'London',
          country: 'UK',
          latitude: 51.4700,
          longitude: -0.4543
        }
      ])
      .returning()
      .execute();

    // Create routes with different flight counts
    await db.insert(routesTable)
      .values([
        {
          origin_airport_id: airports[0].id,
          destination_airport_id: airports[1].id,
          min_price: '299.99',
          max_price: '899.99',
          flight_count: 10 // Lower count
        },
        {
          origin_airport_id: airports[1].id,
          destination_airport_id: airports[2].id,
          min_price: '199.99',
          max_price: '599.99',
          flight_count: 30 // Higher count
        }
      ])
      .execute();

    const result = await getPopularRoutes();

    expect(result).toHaveLength(2);
    // Should be ordered by flight_count descending
    expect(result[0].flight_count).toEqual(30);
    expect(result[1].flight_count).toEqual(10);
    expect(result[0].origin_airport_code).toEqual('JFK');
    expect(result[0].destination_airport_code).toEqual('LHR');
  });

  it('should handle multiple routes correctly', async () => {
    // Create multiple airports
    const airports = await db.insert(airportsTable)
      .values([
        {
          code: 'CDG',
          name: 'Charles de Gaulle',
          city: 'Paris',
          country: 'France',
          latitude: 49.0097,
          longitude: 2.5479
        },
        {
          code: 'JFK',
          name: 'John F. Kennedy International',
          city: 'New York',
          country: 'USA',
          latitude: 40.6413,
          longitude: -73.7781
        }
      ])
      .returning()
      .execute();

    // Create multiple routes
    await db.insert(routesTable)
      .values([
        {
          origin_airport_id: airports[0].id,
          destination_airport_id: airports[1].id,
          min_price: '299.99',
          max_price: '899.99',
          flight_count: 25
        },
        {
          origin_airport_id: airports[1].id,
          destination_airport_id: airports[0].id,
          min_price: '249.99',
          max_price: '799.99',
          flight_count: 20
        }
      ])
      .execute();

    const result = await getPopularRoutes();

    expect(result).toHaveLength(2);
    // Verify both routes are returned with correct data
    expect(result.every(route => route.id !== undefined)).toBe(true);
    expect(result.every(route => typeof route.min_price === 'number')).toBe(true);
    expect(result.every(route => typeof route.max_price === 'number')).toBe(true);
    expect(result.every(route => route.origin_airport_code !== undefined)).toBe(true);
    expect(result.every(route => route.destination_airport_code !== undefined)).toBe(true);
  });
});

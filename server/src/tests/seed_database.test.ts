import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { airlinesTable, airportsTable, routesTable, flightsTable } from '../db/schema';
import { seedDatabase } from '../handlers/seed_database';

describe('seedDatabase', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should seed database with sample data', async () => {
    const result = await seedDatabase();

    expect(result.success).toBe(true);
    expect(result.message).toContain('airlines');
    expect(result.message).toContain('airports');
    expect(result.message).toContain('routes');
    expect(result.message).toContain('flights');

    // Verify airlines were created
    const airlines = await db.select().from(airlinesTable);
    expect(airlines.length).toBeGreaterThan(0);
    expect(airlines.some(a => a.code === 'AF')).toBe(true);
    expect(airlines.some(a => a.code === 'BA')).toBe(true);

    // Verify airports were created with proper coordinates
    const airports = await db.select().from(airportsTable);
    expect(airports.length).toBeGreaterThan(0);
    
    const cdg = airports.find(a => a.code === 'CDG');
    expect(cdg).toBeDefined();
    expect(cdg?.city).toBe('Paris');
    expect(cdg?.latitude).toBeCloseTo(49.0097, 3);
    expect(cdg?.longitude).toBeCloseTo(2.5479, 3);

    const jfk = airports.find(a => a.code === 'JFK');
    expect(jfk).toBeDefined();
    expect(jfk?.city).toBe('New York');
    expect(jfk?.latitude).toBeCloseTo(40.6413, 3);
    expect(jfk?.longitude).toBeCloseTo(-73.7781, 3);

    // Verify routes were created
    const routes = await db.select().from(routesTable);
    expect(routes.length).toBeGreaterThan(0);
    
    const route = routes[0];
    expect(route.origin_airport_id).toBeDefined();
    expect(route.destination_airport_id).toBeDefined();
    expect(parseFloat(route.min_price)).toBeGreaterThan(0);
    expect(parseFloat(route.max_price)).toBeGreaterThan(parseFloat(route.min_price));
    expect(route.flight_count).toBeGreaterThan(0);

    // Verify flights were created
    const flights = await db.select().from(flightsTable);
    expect(flights.length).toBeGreaterThan(0);
    
    const flight = flights[0];
    expect(flight.airline_id).toBeDefined();
    expect(flight.flight_number).toBeDefined();
    expect(flight.origin_airport_id).toBeDefined();
    expect(flight.destination_airport_id).toBeDefined();
    expect(parseFloat(flight.price)).toBeGreaterThan(0);
    expect(flight.available_seats).toBeGreaterThan(0);
    expect(flight.duration_minutes).toBeGreaterThan(0);
    expect(flight.departure_time).toBeInstanceOf(Date);
    expect(flight.arrival_time).toBeInstanceOf(Date);
  });

  it('should skip seeding if data already exists', async () => {
    // First seeding
    await seedDatabase();
    
    // Second seeding should skip
    const result = await seedDatabase();
    
    expect(result.success).toBe(true);
    expect(result.message).toBe('Database already seeded');
  });

  it('should create routes between major cities', async () => {
    await seedDatabase();
    
    const airports = await db.select().from(airportsTable);
    const routes = await db.select().from(routesTable);
    
    // Find Paris CDG and New York JFK
    const cdg = airports.find(a => a.code === 'CDG');
    const jfk = airports.find(a => a.code === 'JFK');
    expect(cdg).toBeDefined();
    expect(jfk).toBeDefined();
    
    // Should have a route from CDG to JFK
    const cdgToJfk = routes.find(r => 
      r.origin_airport_id === cdg!.id && r.destination_airport_id === jfk!.id
    );
    expect(cdgToJfk).toBeDefined();
    expect(cdgToJfk!.flight_count).toBeGreaterThan(0);
  });
});
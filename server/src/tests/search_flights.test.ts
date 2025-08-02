
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { airlinesTable, airportsTable, flightsTable } from '../db/schema';
import { type CompleteFlightSearchInput } from '../schema';
import { searchFlights } from '../handlers/search_flights';

// Test data
const testAirline = {
  code: 'AF',
  name: 'Air France',
  logo_url: 'https://example.com/af-logo.png'
};

const originAirport = {
  code: 'CDG',
  name: 'Charles de Gaulle Airport',
  city: 'Paris',
  country: 'France',
  latitude: 49.0128,
  longitude: 2.5500
};

const destinationAirport = {
  code: 'JFK',
  name: 'John F. Kennedy International Airport',
  city: 'New York',
  country: 'USA',
  latitude: 40.6413,
  longitude: -73.7781
};

const testFlight = {
  flight_number: 'AF007',
  departure_time: new Date('2024-12-25T10:30:00Z'),
  arrival_time: new Date('2024-12-25T16:45:00Z'),
  price: '599.99',
  currency: 'EUR',
  available_seats: 150,
  stops: 0,
  duration_minutes: 375
};

const basicSearchInput: CompleteFlightSearchInput = {
  origin_city: 'Paris',
  destination_city: 'New York',
  departure_date: '2024-12-25',
  passengers: 2,
  trip_type: 'one_way'
};

describe('searchFlights', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should find flights matching basic search criteria', async () => {
    // Create test data
    const airlineResult = await db.insert(airlinesTable)
      .values(testAirline)
      .returning()
      .execute();

    const originResult = await db.insert(airportsTable)
      .values(originAirport)
      .returning()
      .execute();

    const destinationResult = await db.insert(airportsTable)
      .values(destinationAirport)
      .returning()
      .execute();

    await db.insert(flightsTable)
      .values({
        ...testFlight,
        airline_id: airlineResult[0].id,
        origin_airport_id: originResult[0].id,
        destination_airport_id: destinationResult[0].id
      })
      .execute();

    const results = await searchFlights(basicSearchInput);

    expect(results).toHaveLength(1);
    expect(results[0].airline_code).toEqual('AF');
    expect(results[0].airline_name).toEqual('Air France');
    expect(results[0].flight_number).toEqual('AF007');
    expect(results[0].origin_city).toEqual('Paris');
    expect(results[0].destination_city).toEqual('New York');
    expect(results[0].price).toEqual(599.99);
    expect(typeof results[0].price).toBe('number');
    expect(results[0].available_seats).toEqual(150);
  });

  it('should filter by passenger count', async () => {
    // Create test data
    const airlineResult = await db.insert(airlinesTable)
      .values(testAirline)
      .returning()
      .execute();

    const originResult = await db.insert(airportsTable)
      .values(originAirport)
      .returning()
      .execute();

    const destinationResult = await db.insert(airportsTable)
      .values(destinationAirport)
      .returning()
      .execute();

    // Flight with only 1 available seat
    await db.insert(flightsTable)
      .values({
        ...testFlight,
        airline_id: airlineResult[0].id,
        origin_airport_id: originResult[0].id,
        destination_airport_id: destinationResult[0].id,
        available_seats: 1
      })
      .execute();

    // Search for 2 passengers should find no results
    const results = await searchFlights({
      ...basicSearchInput,
      passengers: 2
    });

    expect(results).toHaveLength(0);
  });

  it('should apply price filters', async () => {
    // Create test data
    const airlineResult = await db.insert(airlinesTable)
      .values(testAirline)
      .returning()
      .execute();

    const originResult = await db.insert(airportsTable)
      .values(originAirport)
      .returning()
      .execute();

    const destinationResult = await db.insert(airportsTable)
      .values(destinationAirport)
      .returning()
      .execute();

    // Create two flights with different prices
    await db.insert(flightsTable)
      .values([
        {
          ...testFlight,
          airline_id: airlineResult[0].id,
          origin_airport_id: originResult[0].id,
          destination_airport_id: destinationResult[0].id,
          flight_number: 'AF007',
          price: '299.99'
        },
        {
          ...testFlight,
          airline_id: airlineResult[0].id,
          origin_airport_id: originResult[0].id,
          destination_airport_id: destinationResult[0].id,
          flight_number: 'AF008',
          price: '799.99',
          departure_time: new Date('2024-12-25T14:30:00Z')
        }
      ])
      .execute();

    // Search with max price filter
    const results = await searchFlights({
      ...basicSearchInput,
      filters: {
        max_price: 500
      }
    });

    expect(results).toHaveLength(1);
    expect(results[0].flight_number).toEqual('AF007');
    expect(results[0].price).toEqual(299.99);
  });

  it('should return empty array when no flights match criteria', async () => {
    // Create test data but for different cities
    const airlineResult = await db.insert(airlinesTable)
      .values(testAirline)
      .returning()
      .execute();

    const airports = await db.insert(airportsTable)
      .values([
        originAirport,
        { ...destinationAirport, city: 'London' } // Different city
      ])
      .returning()
      .execute();

    await db.insert(flightsTable)
      .values({
        ...testFlight,
        airline_id: airlineResult[0].id,
        origin_airport_id: airports[0].id,
        destination_airport_id: airports[1].id
      })
      .execute();

    // Search for different route
    const results = await searchFlights({
      ...basicSearchInput,
      destination_city: 'Tokyo' // No flights to Tokyo
    });

    expect(results).toHaveLength(0);
  });
});

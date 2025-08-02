
import { db } from '../db';
import { flightsTable, airlinesTable, airportsTable } from '../db/schema';
import { type CompleteFlightSearchInput, type FlightSearchResult } from '../schema';
import { eq, and, gte, lte, inArray, desc, asc, sql } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';

export async function searchFlights(input: CompleteFlightSearchInput): Promise<FlightSearchResult[]> {
  try {
    // Parse departure date for filtering
    const departureDate = new Date(input.departure_date);
    const nextDay = new Date(departureDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Build the final query using raw SQL for complex joins
    const sortClause = getSortClause(input.sort);
    
    let query = sql`
      SELECT 
        f.id,
        a.code as airline_code,
        a.name as airline_name,
        a.logo_url as airline_logo_url,
        f.flight_number,
        origin.code as origin_airport_code,
        origin.name as origin_airport_name,
        origin.city as origin_city,
        dest.code as destination_airport_code,
        dest.name as destination_airport_name,
        dest.city as destination_city,
        f.departure_time,
        f.arrival_time,
        f.price,
        f.currency,
        f.available_seats,
        f.stops,
        f.duration_minutes
      FROM flights f
      INNER JOIN airlines a ON f.airline_id = a.id
      INNER JOIN airports origin ON f.origin_airport_id = origin.id
      INNER JOIN airports dest ON f.destination_airport_id = dest.id
      WHERE origin.city = ${input.origin_city}
        AND dest.city = ${input.destination_city}
        AND f.departure_time >= ${departureDate}
        AND f.departure_time <= ${nextDay}
        AND f.available_seats >= ${input.passengers}
    `;

    // Add optional filters
    if (input.filters?.min_price !== undefined) {
      query = sql`${query} AND f.price >= ${input.filters.min_price.toString()}`;
    }

    if (input.filters?.max_price !== undefined) {
      query = sql`${query} AND f.price <= ${input.filters.max_price.toString()}`;
    }

    if (input.filters?.max_stops !== undefined) {
      query = sql`${query} AND f.stops <= ${input.filters.max_stops}`;
    }

    if (input.filters?.airlines?.length) {
      query = sql`${query} AND a.code = ANY(${input.filters.airlines})`;
    }

    if (input.filters?.max_duration_hours !== undefined) {
      query = sql`${query} AND f.duration_minutes <= ${input.filters.max_duration_hours * 60}`;
    }

    if (input.filters?.departure_time_range) {
      const startMinutes = timeToMinutes(input.filters.departure_time_range.start);
      const endMinutes = timeToMinutes(input.filters.departure_time_range.end);
      
      query = sql`${query} 
        AND EXTRACT(HOUR FROM f.departure_time) * 60 + EXTRACT(MINUTE FROM f.departure_time) >= ${startMinutes}
        AND EXTRACT(HOUR FROM f.departure_time) * 60 + EXTRACT(MINUTE FROM f.departure_time) <= ${endMinutes}`;
    }

    // Add ORDER BY clause
    query = sql`${query} ORDER BY ${sql.raw(sortClause)}`;

    const result = await db.execute(query);

    // Access the rows from the result
    const rows = result.rows || [];

    // Convert results and numeric fields
    return rows.map((row: any) => ({
      id: row.id,
      airline_code: row.airline_code,
      airline_name: row.airline_name,
      airline_logo_url: row.airline_logo_url,
      flight_number: row.flight_number,
      origin_airport_code: row.origin_airport_code,
      origin_airport_name: row.origin_airport_name,
      origin_city: row.origin_city,
      destination_airport_code: row.destination_airport_code,
      destination_airport_name: row.destination_airport_name,
      destination_city: row.destination_city,
      departure_time: new Date(row.departure_time),
      arrival_time: new Date(row.arrival_time),
      price: parseFloat(row.price),
      currency: row.currency,
      available_seats: row.available_seats,
      stops: row.stops,
      duration_minutes: row.duration_minutes
    }));
  } catch (error) {
    console.error('Flight search failed:', error);
    throw error;
  }
}

// Helper function to convert HH:MM to minutes since midnight
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function getSortClause(sort?: string): string {
  switch (sort) {
    case 'price_asc':
      return 'f.price ASC';
    case 'price_desc':
      return 'f.price DESC';
    case 'duration_asc':
      return 'f.duration_minutes ASC';
    case 'duration_desc':
      return 'f.duration_minutes DESC';
    case 'departure_time_asc':
      return 'f.departure_time ASC';
    case 'departure_time_desc':
      return 'f.departure_time DESC';
    default:
      return 'f.price ASC';
  }
}

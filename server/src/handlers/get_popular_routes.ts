
import { db } from '../db';
import { routesTable, airportsTable } from '../db/schema';
import { type PopularRoute } from '../schema';
import { eq, desc, sql } from 'drizzle-orm';

export async function getPopularRoutes(): Promise<PopularRoute[]> {
  try {
    // Use sql template for complex joins with aliases
    const results = await db.execute(sql`
      SELECT 
        r.id,
        o.code as origin_airport_code,
        o.name as origin_airport_name,
        o.city as origin_city,
        o.country as origin_country,
        o.latitude as origin_latitude,
        o.longitude as origin_longitude,
        d.code as destination_airport_code,
        d.name as destination_airport_name,
        d.city as destination_city,
        d.country as destination_country,
        d.latitude as destination_latitude,
        d.longitude as destination_longitude,
        r.min_price,
        r.max_price,
        r.flight_count,
        r.last_updated
      FROM ${routesTable} r
      INNER JOIN ${airportsTable} o ON r.origin_airport_id = o.id
      INNER JOIN ${airportsTable} d ON r.destination_airport_id = d.id
      ORDER BY r.flight_count DESC
    `);

    // Convert results to PopularRoute format with numeric conversions
    return results.rows.map((row: any) => ({
      id: row.id,
      origin_airport_code: row.origin_airport_code,
      origin_airport_name: row.origin_airport_name,
      origin_city: row.origin_city,
      origin_country: row.origin_country,
      origin_latitude: row.origin_latitude,
      origin_longitude: row.origin_longitude,
      destination_airport_code: row.destination_airport_code,
      destination_airport_name: row.destination_airport_name,
      destination_city: row.destination_city,
      destination_country: row.destination_country,
      destination_latitude: row.destination_latitude,
      destination_longitude: row.destination_longitude,
      min_price: parseFloat(row.min_price),
      max_price: parseFloat(row.max_price),
      flight_count: row.flight_count,
      last_updated: new Date(row.last_updated)
    }));
  } catch (error) {
    console.error('Failed to fetch popular routes:', error);
    throw error;
  }
}

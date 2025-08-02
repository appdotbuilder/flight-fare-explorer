
import { db } from '../db';
import { airportsTable } from '../db/schema';
import { type Airport } from '../schema';
import { eq } from 'drizzle-orm';

export async function getAirportsByCity(city: string): Promise<Airport[]> {
  try {
    const results = await db.select()
      .from(airportsTable)
      .where(eq(airportsTable.city, city))
      .execute();

    return results.map(airport => ({
      ...airport,
      latitude: parseFloat(airport.latitude.toString()), // Convert real to number
      longitude: parseFloat(airport.longitude.toString()) // Convert real to number
    }));
  } catch (error) {
    console.error('Get airports by city failed:', error);
    throw error;
  }
}

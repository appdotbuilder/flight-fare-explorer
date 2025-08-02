
import { db } from '../db';
import { airportsTable } from '../db/schema';
import { type Airport } from '../schema';

export async function getAirports(): Promise<Airport[]> {
  try {
    const results = await db.select()
      .from(airportsTable)
      .execute();

    return results.map(airport => ({
      ...airport,
      latitude: parseFloat(airport.latitude.toString()),
      longitude: parseFloat(airport.longitude.toString())
    }));
  } catch (error) {
    console.error('Failed to fetch airports:', error);
    throw error;
  }
}

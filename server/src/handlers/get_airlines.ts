
import { db } from '../db';
import { airlinesTable } from '../db/schema';
import { type Airline } from '../schema';

export const getAirlines = async (): Promise<Airline[]> => {
  try {
    const results = await db.select()
      .from(airlinesTable)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch airlines:', error);
    throw error;
  }
};

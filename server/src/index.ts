
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

import { completeFlightSearchInputSchema } from './schema';
import { getPopularRoutes } from './handlers/get_popular_routes';
import { searchFlights } from './handlers/search_flights';
import { getAirlines } from './handlers/get_airlines';
import { getAirports } from './handlers/get_airports';
import { getAirportsByCity } from './handlers/get_airports_by_city';
import { seedDatabase } from './handlers/seed_database';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Get popular routes for map display
  getPopularRoutes: publicProcedure
    .query(() => getPopularRoutes()),
  
  // Search flights with filters and sorting
  searchFlights: publicProcedure
    .input(completeFlightSearchInputSchema)
    .query(({ input }) => searchFlights(input)),
  
  // Get all airlines for filter options
  getAirlines: publicProcedure
    .query(() => getAirlines()),
  
  // Get all airports for autocomplete
  getAirports: publicProcedure
    .query(() => getAirports()),
  
  // Get airports by city name
  getAirportsByCity: publicProcedure
    .input(z.object({ city: z.string() }))
    .query(({ input }) => getAirportsByCity(input.city)),
});

export type AppRouter = typeof appRouter;

async function start() {
  // Seed database with sample data on startup
  await seedDatabase();
  
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();

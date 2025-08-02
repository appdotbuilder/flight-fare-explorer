
import { serial, text, pgTable, timestamp, numeric, integer, real } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const airlinesTable = pgTable('airlines', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(), // IATA code like "AF", "LH"
  name: text('name').notNull(),
  logo_url: text('logo_url'), // Nullable URL to airline logo
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const airportsTable = pgTable('airports', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(), // IATA code like "CDG", "JFK"
  name: text('name').notNull(),
  city: text('city').notNull(),
  country: text('country').notNull(),
  latitude: real('latitude').notNull(), // For map display
  longitude: real('longitude').notNull(), // For map display
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const routesTable = pgTable('routes', {
  id: serial('id').primaryKey(),
  origin_airport_id: integer('origin_airport_id').notNull().references(() => airportsTable.id),
  destination_airport_id: integer('destination_airport_id').notNull().references(() => airportsTable.id),
  min_price: numeric('min_price', { precision: 10, scale: 2 }).notNull(), // Minimum price for this route
  max_price: numeric('max_price', { precision: 10, scale: 2 }).notNull(), // Maximum price for this route
  flight_count: integer('flight_count').notNull(), // Number of flights on this route
  last_updated: timestamp('last_updated').defaultNow().notNull(), // When prices were last updated
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const flightsTable = pgTable('flights', {
  id: serial('id').primaryKey(),
  airline_id: integer('airline_id').notNull().references(() => airlinesTable.id),
  flight_number: text('flight_number').notNull(), // e.g., "AF123"
  origin_airport_id: integer('origin_airport_id').notNull().references(() => airportsTable.id),
  destination_airport_id: integer('destination_airport_id').notNull().references(() => airportsTable.id),
  departure_time: timestamp('departure_time').notNull(),
  arrival_time: timestamp('arrival_time').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('EUR'), // Currency code
  available_seats: integer('available_seats').notNull(),
  stops: integer('stops').notNull().default(0), // Number of stops (0 = direct)
  duration_minutes: integer('duration_minutes').notNull(), // Flight duration in minutes
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const airlinesRelations = relations(airlinesTable, ({ many }) => ({
  flights: many(flightsTable),
}));

export const airportsRelations = relations(airportsTable, ({ many }) => ({
  departingFlights: many(flightsTable, { relationName: 'originAirport' }),
  arrivingFlights: many(flightsTable, { relationName: 'destinationAirport' }),
  originRoutes: many(routesTable, { relationName: 'originRoute' }),
  destinationRoutes: many(routesTable, { relationName: 'destinationRoute' }),
}));

export const routesRelations = relations(routesTable, ({ one }) => ({
  originAirport: one(airportsTable, {
    fields: [routesTable.origin_airport_id],
    references: [airportsTable.id],
    relationName: 'originRoute'
  }),
  destinationAirport: one(airportsTable, {
    fields: [routesTable.destination_airport_id],
    references: [airportsTable.id],
    relationName: 'destinationRoute'
  }),
}));

export const flightsRelations = relations(flightsTable, ({ one }) => ({
  airline: one(airlinesTable, {
    fields: [flightsTable.airline_id],
    references: [airlinesTable.id],
  }),
  originAirport: one(airportsTable, {
    fields: [flightsTable.origin_airport_id],
    references: [airportsTable.id],
    relationName: 'originAirport'
  }),
  destinationAirport: one(airportsTable, {
    fields: [flightsTable.destination_airport_id],
    references: [airportsTable.id],
    relationName: 'destinationAirport'
  }),
}));

// Export all tables for proper query building
export const tables = {
  airlines: airlinesTable,
  airports: airportsTable,
  routes: routesTable,
  flights: flightsTable
};

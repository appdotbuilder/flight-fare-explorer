
import { z } from 'zod';

// Airline schema
export const airlineSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  logo_url: z.string().nullable(),
  created_at: z.coerce.date()
});

export type Airline = z.infer<typeof airlineSchema>;

// Airport schema
export const airportSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  city: z.string(),
  country: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  created_at: z.coerce.date()
});

export type Airport = z.infer<typeof airportSchema>;

// Route schema for popular routes with min/max prices
export const routeSchema = z.object({
  id: z.number(),
  origin_airport_id: z.number(),
  destination_airport_id: z.number(),
  min_price: z.number(),
  max_price: z.number(),
  flight_count: z.number().int(),
  last_updated: z.coerce.date(),
  created_at: z.coerce.date()
});

export type Route = z.infer<typeof routeSchema>;

// Flight schema for detailed flight information
export const flightSchema = z.object({
  id: z.number(),
  airline_id: z.number(),
  flight_number: z.string(),
  origin_airport_id: z.number(),
  destination_airport_id: z.number(),
  departure_time: z.coerce.date(),
  arrival_time: z.coerce.date(),
  price: z.number(),
  currency: z.string(),
  available_seats: z.number().int(),
  stops: z.number().int(),
  duration_minutes: z.number().int(),
  created_at: z.coerce.date()
});

export type Flight = z.infer<typeof flightSchema>;

// Input schema for flight search
export const flightSearchInputSchema = z.object({
  origin_city: z.string(),
  destination_city: z.string(),
  departure_date: z.string(), // ISO date string
  return_date: z.string().optional(), // For round trip
  passengers: z.number().int().min(1).max(9),
  trip_type: z.enum(['one_way', 'round_trip'])
});

export type FlightSearchInput = z.infer<typeof flightSearchInputSchema>;

// Flight search result with joined data
export const flightSearchResultSchema = z.object({
  id: z.number(),
  airline_code: z.string(),
  airline_name: z.string(),
  airline_logo_url: z.string().nullable(),
  flight_number: z.string(),
  origin_airport_code: z.string(),
  origin_airport_name: z.string(),
  origin_city: z.string(),
  destination_airport_code: z.string(),
  destination_airport_name: z.string(),
  destination_city: z.string(),
  departure_time: z.coerce.date(),
  arrival_time: z.coerce.date(),
  price: z.number(),
  currency: z.string(),
  available_seats: z.number().int(),
  stops: z.number().int(),
  duration_minutes: z.number().int()
});

export type FlightSearchResult = z.infer<typeof flightSearchResultSchema>;

// Popular route with joined airport data
export const popularRouteSchema = z.object({
  id: z.number(),
  origin_airport_code: z.string(),
  origin_airport_name: z.string(),
  origin_city: z.string(),
  origin_country: z.string(),
  origin_latitude: z.number(),
  origin_longitude: z.number(),
  destination_airport_code: z.string(),
  destination_airport_name: z.string(),
  destination_city: z.string(),
  destination_country: z.string(),
  destination_latitude: z.number(),
  destination_longitude: z.number(),
  min_price: z.number(),
  max_price: z.number(),
  flight_count: z.number().int(),
  last_updated: z.coerce.date()
});

export type PopularRoute = z.infer<typeof popularRouteSchema>;

// Flight search filters
export const flightSearchFiltersSchema = z.object({
  max_price: z.number().optional(),
  min_price: z.number().optional(),
  max_stops: z.number().int().optional(),
  airlines: z.array(z.string()).optional(), // Array of airline codes
  departure_time_range: z.object({
    start: z.string(), // HH:MM format
    end: z.string()    // HH:MM format
  }).optional(),
  max_duration_hours: z.number().optional()
});

export type FlightSearchFilters = z.infer<typeof flightSearchFiltersSchema>;

// Sort options for flight search
export const flightSortSchema = z.enum(['price_asc', 'price_desc', 'duration_asc', 'duration_desc', 'departure_time_asc', 'departure_time_desc']);

export type FlightSort = z.infer<typeof flightSortSchema>;

// Complete flight search input with filters and sort
export const completeFlightSearchInputSchema = flightSearchInputSchema.extend({
  filters: flightSearchFiltersSchema.optional(),
  sort: flightSortSchema.optional()
});

export type CompleteFlightSearchInput = z.infer<typeof completeFlightSearchInputSchema>;

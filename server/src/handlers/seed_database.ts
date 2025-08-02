import { db } from '../db';
import { airlinesTable, airportsTable, routesTable, flightsTable } from '../db/schema';

export const seedDatabase = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Check if data already exists
    const existingAirports = await db.select().from(airportsTable).limit(1);
    if (existingAirports.length > 0) {
      console.log('Database already seeded, skipping...');
      return { success: true, message: 'Database already seeded' };
    }

    console.log('Seeding database with sample data...');

    // Insert airlines
    const airlines = await db.insert(airlinesTable).values([
      { code: 'AF', name: 'Air France', logo_url: 'https://logos-world.net/wp-content/uploads/2020/03/Air-France-Logo.png' },
      { code: 'LH', name: 'Lufthansa', logo_url: 'https://logos-world.net/wp-content/uploads/2020/03/Lufthansa-Logo.png' },
      { code: 'BA', name: 'British Airways', logo_url: 'https://logos-world.net/wp-content/uploads/2020/03/British-Airways-Logo.png' },
      { code: 'AA', name: 'American Airlines', logo_url: 'https://logos-world.net/wp-content/uploads/2020/03/American-Airlines-Logo.png' },
      { code: 'JL', name: 'Japan Airlines', logo_url: 'https://logos-world.net/wp-content/uploads/2020/03/Japan-Airlines-Logo.png' },
      { code: 'QF', name: 'Qantas', logo_url: 'https://logos-world.net/wp-content/uploads/2020/03/Qantas-Logo.png' },
      { code: 'EK', name: 'Emirates', logo_url: 'https://logos-world.net/wp-content/uploads/2020/03/Emirates-Logo.png' },
      { code: 'SQ', name: 'Singapore Airlines', logo_url: 'https://logos-world.net/wp-content/uploads/2020/03/Singapore-Airlines-Logo.png' }
    ]).returning();

    // Insert major airports with realistic coordinates
    const airports = await db.insert(airportsTable).values([
      // Europe
      { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', latitude: 49.0097, longitude: 2.5479 },
      { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom', latitude: 51.4700, longitude: -0.4543 },
      { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', latitude: 50.0379, longitude: 8.5622 },
      { code: 'FCO', name: 'Leonardo da Vinci Airport', city: 'Rome', country: 'Italy', latitude: 41.8003, longitude: 12.2389 },
      { code: 'MAD', name: 'Madrid-Barajas Airport', city: 'Madrid', country: 'Spain', latitude: 40.4719, longitude: -3.5626 },
      
      // North America
      { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States', latitude: 40.6413, longitude: -73.7781 },
      { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'United States', latitude: 34.0522, longitude: -118.2437 },
      { code: 'ORD', name: 'O\'Hare International Airport', city: 'Chicago', country: 'United States', latitude: 41.9742, longitude: -87.9073 },
      { code: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', country: 'Canada', latitude: 43.6777, longitude: -79.6248 },
      
      // Asia-Pacific
      { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan', latitude: 35.7720, longitude: 140.3929 },
      { code: 'ICN', name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea', latitude: 37.4602, longitude: 126.4407 },
      { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', latitude: 1.3644, longitude: 103.9915 },
      { code: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia', latitude: -33.9399, longitude: 151.1753 },
      { code: 'PEK', name: 'Beijing Capital International Airport', city: 'Beijing', country: 'China', latitude: 40.0801, longitude: 116.5846 },
      
      // Middle East & Africa
      { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates', latitude: 25.2532, longitude: 55.3657 },
      { code: 'DOH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar', latitude: 25.2731, longitude: 51.6089 },
      { code: 'JNB', name: 'O.R. Tambo International Airport', city: 'Johannesburg', country: 'South Africa', latitude: -26.1367, longitude: 28.2411 },
      
      // South America
      { code: 'GIG', name: 'Rio de Janeiro-Galeão International Airport', city: 'Rio de Janeiro', country: 'Brazil', latitude: -22.8099, longitude: -43.2505 },
      { code: 'EZE', name: 'Ezeiza International Airport', city: 'Buenos Aires', country: 'Argentina', latitude: -34.8222, longitude: -58.5358 }
    ]).returning();

    // Create airport lookup for route creation
    const airportLookup = Object.fromEntries(airports.map(airport => [airport.code, airport.id]));

    // Insert popular routes with realistic pricing
    const routes = await db.insert(routesTable).values([
      // European routes
      { origin_airport_id: airportLookup['CDG'], destination_airport_id: airportLookup['LHR'], min_price: '89.00', max_price: '450.00', flight_count: 12 },
      { origin_airport_id: airportLookup['LHR'], destination_airport_id: airportLookup['CDG'], min_price: '95.00', max_price: '420.00', flight_count: 11 },
      { origin_airport_id: airportLookup['FRA'], destination_airport_id: airportLookup['CDG'], min_price: '78.00', max_price: '380.00', flight_count: 8 },
      { origin_airport_id: airportLookup['MAD'], destination_airport_id: airportLookup['FCO'], min_price: '65.00', max_price: '320.00', flight_count: 6 },
      
      // Transatlantic routes
      { origin_airport_id: airportLookup['CDG'], destination_airport_id: airportLookup['JFK'], min_price: '320.00', max_price: '1200.00', flight_count: 8 },
      { origin_airport_id: airportLookup['JFK'], destination_airport_id: airportLookup['CDG'], min_price: '340.00', max_price: '1150.00', flight_count: 7 },
      { origin_airport_id: airportLookup['LHR'], destination_airport_id: airportLookup['JFK'], min_price: '290.00', max_price: '1100.00', flight_count: 10 },
      { origin_airport_id: airportLookup['JFK'], destination_airport_id: airportLookup['LHR'], min_price: '310.00', max_price: '1080.00', flight_count: 9 },
      
      // North American routes
      { origin_airport_id: airportLookup['JFK'], destination_airport_id: airportLookup['LAX'], min_price: '180.00', max_price: '650.00', flight_count: 15 },
      { origin_airport_id: airportLookup['LAX'], destination_airport_id: airportLookup['JFK'], min_price: '190.00', max_price: '680.00', flight_count: 14 },
      { origin_airport_id: airportLookup['ORD'], destination_airport_id: airportLookup['LAX'], min_price: '150.00', max_price: '550.00', flight_count: 12 },
      { origin_airport_id: airportLookup['YYZ'], destination_airport_id: airportLookup['JFK'], min_price: '120.00', max_price: '480.00', flight_count: 9 },
      
      // Asian routes
      { origin_airport_id: airportLookup['NRT'], destination_airport_id: airportLookup['ICN'], min_price: '140.00', max_price: '520.00', flight_count: 10 },
      { origin_airport_id: airportLookup['SIN'], destination_airport_id: airportLookup['NRT'], min_price: '280.00', max_price: '950.00', flight_count: 6 },
      { origin_airport_id: airportLookup['PEK'], destination_airport_id: airportLookup['NRT'], min_price: '220.00', max_price: '780.00', flight_count: 8 },
      
      // Transpacific routes
      { origin_airport_id: airportLookup['LAX'], destination_airport_id: airportLookup['NRT'], min_price: '450.00', max_price: '1500.00', flight_count: 5 },
      { origin_airport_id: airportLookup['NRT'], destination_airport_id: airportLookup['LAX'], min_price: '480.00', max_price: '1450.00', flight_count: 5 },
      { origin_airport_id: airportLookup['SYD'], destination_airport_id: airportLookup['LAX'], min_price: '520.00', max_price: '1800.00', flight_count: 4 },
      
      // Europe to Asia routes
      { origin_airport_id: airportLookup['LHR'], destination_airport_id: airportLookup['SIN'], min_price: '380.00', max_price: '1400.00', flight_count: 3 },
      { origin_airport_id: airportLookup['CDG'], destination_airport_id: airportLookup['NRT'], min_price: '420.00', max_price: '1350.00', flight_count: 2 },
      
      // Middle East hub routes
      { origin_airport_id: airportLookup['DXB'], destination_airport_id: airportLookup['LHR'], min_price: '250.00', max_price: '900.00', flight_count: 7 },
      { origin_airport_id: airportLookup['DXB'], destination_airport_id: airportLookup['SIN'], min_price: '180.00', max_price: '650.00', flight_count: 5 },
      { origin_airport_id: airportLookup['DOH'], destination_airport_id: airportLookup['JFK'], min_price: '320.00', max_price: '1200.00', flight_count: 4 },
      
      // Southern Hemisphere routes
      { origin_airport_id: airportLookup['SYD'], destination_airport_id: airportLookup['SIN'], min_price: '160.00', max_price: '580.00', flight_count: 6 },
      { origin_airport_id: airportLookup['GIG'], destination_airport_id: airportLookup['EZE'], min_price: '95.00', max_price: '380.00', flight_count: 8 },
      { origin_airport_id: airportLookup['JNB'], destination_airport_id: airportLookup['DXB'], min_price: '280.00', max_price: '850.00', flight_count: 3 }
    ]).returning();

    // Insert some sample flights for the next few days
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(now);
    dayAfter.setDate(dayAfter.getDate() + 2);

    const flights = await db.insert(flightsTable).values([
      // CDG to JFK flights
      {
        airline_id: airlines.find(a => a.code === 'AF')!.id,
        flight_number: 'AF007',
        origin_airport_id: airportLookup['CDG'],
        destination_airport_id: airportLookup['JFK'],
        departure_time: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 10, 30),
        arrival_time: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 13, 45),
        price: '650.00',
        available_seats: 45,
        stops: 0,
        duration_minutes: 495
      },
      {
        airline_id: airlines.find(a => a.code === 'AF')!.id,
        flight_number: 'AF009',
        origin_airport_id: airportLookup['CDG'],
        destination_airport_id: airportLookup['JFK'],
        departure_time: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 22, 15),
        arrival_time: new Date(dayAfter.getFullYear(), dayAfter.getMonth(), dayAfter.getDate(), 1, 30),
        price: '580.00',
        available_seats: 23,
        stops: 0,
        duration_minutes: 495
      },
      
      // LHR to JFK flights
      {
        airline_id: airlines.find(a => a.code === 'BA')!.id,
        flight_number: 'BA115',
        origin_airport_id: airportLookup['LHR'],
        destination_airport_id: airportLookup['JFK'],
        departure_time: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 11, 0),
        arrival_time: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 14, 20),
        price: '720.00',
        available_seats: 67,
        stops: 0,
        duration_minutes: 500
      },
      
      // JFK to LAX flights
      {
        airline_id: airlines.find(a => a.code === 'AA')!.id,
        flight_number: 'AA123',
        origin_airport_id: airportLookup['JFK'],
        destination_airport_id: airportLookup['LAX'],
        departure_time: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 8, 0),
        arrival_time: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 11, 30),
        price: '320.00',
        available_seats: 89,
        stops: 0,
        duration_minutes: 390
      },
      
      // Asian routes
      {
        airline_id: airlines.find(a => a.code === 'JL')!.id,
        flight_number: 'JL052',
        origin_airport_id: airportLookup['NRT'],
        destination_airport_id: airportLookup['SIN'],
        departure_time: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 16, 45),
        arrival_time: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 30),
        price: '420.00',
        available_seats: 34,
        stops: 0,
        duration_minutes: 465
      }
    ]).returning();

    const message = `Seeded database with:
    - ${airlines.length} airlines
    - ${airports.length} airports
    - ${routes.length} routes
    - ${flights.length} sample flights`;
    
    console.log(message);
    return { success: true, message };

  } catch (error) {
    console.error('Error seeding database:', error);
    return { success: false, message: `Seeding failed: ${error}` };
  }
};
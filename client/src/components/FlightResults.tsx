
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { FlightSearchResult, Airline } from '../../../server/src/schema';

interface FlightResultsProps {
  results: FlightSearchResult[];
  airlines: Airline[];
  onNewSearch: () => void;
}

export function FlightResults({ results, onNewSearch }: FlightResultsProps) {
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins.toString().padStart(2, '0')}m`;
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const getStopsText = (stops: number): string => {
    if (stops === 0) return 'Direct';
    if (stops === 1) return '1 escale';
    return `${stops} escales`;
  };

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">✈️</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Aucun vol trouvé
        </h3>
        <p className="text-gray-600 mb-6">
          Essayez de modifier vos critères de recherche ou vos filtres
        </p>
        <Button onClick={onNewSearch} className="px-6">
          🔍 Nouvelle recherche
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {results.length} vol{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
          </h3>
          <p className="text-gray-600">
            Triés par prix croissant
          </p>
        </div>
        <Button onClick={onNewSearch} variant="outline">
          🔍 Nouvelle recherche
        </Button>
      </div>

      <Separator />

      {/* Flight Cards */}
      <div className="space-y-4">
        {results.map((flight: FlightSearchResult) => (
          <Card key={flight.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                {/* Airline Info */}
                <div className="lg:col-span-2 flex items-center gap-3">
                  {flight.airline_logo_url ? (
                    <img 
                      src={flight.airline_logo_url} 
                      alt={flight.airline_name}
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      ✈️
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-sm">{flight.airline_code}</div>
                    <div className="text-xs text-gray-500">{flight.flight_number}</div>
                  </div>
                </div>

                {/* Flight Times */}
                <div className="lg:col-span-6">
                  <div className="flex items-center justify-between">
                    {/* Departure */}
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatTime(flight.departure_time)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(flight.departure_time)}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {flight.origin_airport_code}
                      </div>
                      <div className="text-xs text-gray-500">
                        {flight.origin_city}
                      </div>
                    </div>

                    {/* Flight Info */}
                    <div className="flex-1 mx-4">
                      <div className="flex items-center justify-center mb-1">
                        <div className="h-px bg-gray-300 flex-1"></div>
                        <div className="px-3 text-xs text-gray-500">
                          {formatDuration(flight.duration_minutes)}
                        </div>
                        <div className="h-px bg-gray-300 flex-1"></div>
                      </div>
                      <div className="text-center">
                        <Badge variant={flight.stops === 0 ? "default" : "secondary"}>
                          {getStopsText(flight.stops)}
                        </Badge>
                      </div>
                    </div>

                    {/* Arrival */}
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatTime(flight.arrival_time)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(flight.arrival_time)}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {flight.destination_airport_code}
                      </div>
                      <div className="text-xs text-gray-500">
                        {flight.destination_city}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price and Book */}
                <div className="lg:col-span-4 text-right">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    €{flight.price.toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-500 mb-3">
                    par passager • {flight.currency}
                  </div>
                  <div className="text-xs text-gray-500 mb-4">
                    {flight.available_seats} place{flight.available_seats > 1 ? 's' : ''} restante{flight.available_seats > 1 ? 's' : ''}
                  </div>
                  <Button className="w-full lg:w-auto px-6" size="lg">
                    📋 Sélectionner
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More / Pagination could go here */}
      {results.length >= 20 && (
        <div className="text-center py-6">
          <Button variant="outline" size="lg">
            📄 Charger plus de résultats
          </Button>
        </div>
      )}
    </div>
  );
}

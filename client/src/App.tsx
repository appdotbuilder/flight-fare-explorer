
import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlightSearchForm } from '@/components/FlightSearchForm';
import { FlightResults } from '@/components/FlightResults';
import { PopularRoutesMap } from '@/components/PopularRoutesMap';
import { trpc } from '@/utils/trpc';
import type { PopularRoute, FlightSearchResult, CompleteFlightSearchInput, Airline } from '../../server/src/schema';

function App() {
  const [popularRoutes, setPopularRoutes] = useState<PopularRoute[]>([]);
  const [searchResults, setSearchResults] = useState<FlightSearchResult[]>([]);
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('search');

  // Load popular routes and airlines on mount
  const loadInitialData = useCallback(async () => {
    try {
      const [routesResult, airlinesResult] = await Promise.all([
        trpc.getPopularRoutes.query(),
        trpc.getAirlines.query()
      ]);
      setPopularRoutes(routesResult);
      setAirlines(airlinesResult);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleFlightSearch = async (searchInput: CompleteFlightSearchInput) => {
    setIsSearching(true);
    try {
      const results = await trpc.searchFlights.query(searchInput);
      setSearchResults(results);
      setActiveTab('results');
    } catch (error) {
      console.error('Flight search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ✈️ Comparateur de Vols
          </h1>
          <p className="text-lg text-gray-600">
            Trouvez les meilleurs tarifs et découvrez les routes populaires
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search">🔍 Recherche de Vols</TabsTrigger>
            <TabsTrigger value="results">📋 Résultats</TabsTrigger>
            <TabsTrigger value="map">🗺️ Routes Populaires</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎯 Rechercher des Vols
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FlightSearchForm
                  onSearch={handleFlightSearch}
                  airlines={airlines}
                  isLoading={isSearching}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📊 Résultats de Recherche
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FlightResults 
                  results={searchResults} 
                  airlines={airlines}
                  onNewSearch={() => setActiveTab('search')}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🌍 Routes Aériennes Populaires
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PopularRoutesMap routes={popularRoutes} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;

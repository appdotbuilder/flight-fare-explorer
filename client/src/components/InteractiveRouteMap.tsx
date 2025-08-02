import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { PopularRoute } from '../../../server/src/schema';

interface InteractiveRouteMapProps {
  routes: PopularRoute[];
}

// World map SVG paths for major continents (simplified for visualization)
const WORLD_MAP_PATHS = {
  northAmerica: "M158,70L175,65L190,75L185,90L170,95L160,85Z",
  southAmerica: "M170,140L180,135L185,155L175,170L165,165L165,145Z",
  europe: "M280,75L295,70L305,80L300,90L285,85Z",
  africa: "M285,90L300,85L310,110L305,135L290,140L280,120L280,95Z",
  asia: "M310,70L350,65L370,75L365,95L340,100L315,85Z",
  oceania: "M355,150L370,145L375,160L365,165L355,160Z"
};

// Convert latitude/longitude to SVG coordinates (simplified projection)
const projectToSVG = (lat: number, lng: number): [number, number] => {
  // Simple equirectangular projection
  const x = ((lng + 180) / 360) * 400 + 50; // SVG width adjustment
  const y = ((90 - lat) / 180) * 200 + 50;  // SVG height adjustment
  return [x, y];
};

// Calculate route arc path for curved flight routes
const createArcPath = (x1: number, y1: number, x2: number, y2: number): string => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dr = Math.sqrt(dx * dx + dy * dy);
  
  // Create a curved path (arc)
  const sweep = dx > 0 ? 1 : 0;
  return `M ${x1} ${y1} A ${dr/2} ${dr/3} 0 0 ${sweep} ${x2} ${y2}`;
};

// Get color based on price range
const getPriceColor = (minPrice: number, maxPrice: number, allRoutes: PopularRoute[]): string => {
  const allPrices = allRoutes.flatMap(r => [r.min_price, r.max_price]);
  const globalMin = Math.min(...allPrices);
  const globalMax = Math.max(...allPrices);
  
  const avgPrice = (minPrice + maxPrice) / 2;
  const normalizedPrice = (avgPrice - globalMin) / (globalMax - globalMin);
  
  if (normalizedPrice < 0.33) return '#10b981'; // Green for cheap
  if (normalizedPrice < 0.66) return '#f59e0b'; // Orange for medium
  return '#ef4444'; // Red for expensive
};

// Get route thickness based on flight count
const getRouteThickness = (flightCount: number, allRoutes: PopularRoute[]): number => {
  const maxFlights = Math.max(...allRoutes.map(r => r.flight_count));
  const minThickness = 1;
  const maxThickness = 4;
  
  const normalized = flightCount / maxFlights;
  return minThickness + (normalized * (maxThickness - minThickness));
};

export function InteractiveRouteMap({ routes }: InteractiveRouteMapProps) {
  const [selectedRoute, setSelectedRoute] = useState<PopularRoute | null>(null);
  const [hoveredRoute, setHoveredRoute] = useState<PopularRoute | null>(null);

  // Calculate route visual properties
  const routeData = useMemo(() => {
    return routes.map(route => {
      const [originX, originY] = projectToSVG(route.origin_latitude, route.origin_longitude);
      const [destX, destY] = projectToSVG(route.destination_latitude, route.destination_longitude);
      const arcPath = createArcPath(originX, originY, destX, destY);
      const color = getPriceColor(route.min_price, route.max_price, routes);
      const thickness = getRouteThickness(route.flight_count, routes);
      
      return {
        ...route,
        originX,
        originY,
        destX,
        destY,
        arcPath,
        color,
        thickness
      };
    });
  }, [routes]);

  // Get unique cities for markers
  const cityMarkers = useMemo(() => {
    const cities = new Map();
    
    routes.forEach(route => {
      const originKey = `${route.origin_city}-${route.origin_country}`;
      const destKey = `${route.destination_city}-${route.destination_country}`;
      
      if (!cities.has(originKey)) {
        const [x, y] = projectToSVG(route.origin_latitude, route.origin_longitude);
        cities.set(originKey, {
          city: route.origin_city,
          country: route.origin_country,
          code: route.origin_airport_code,
          x, y,
          routeCount: 1
        });
      } else {
        cities.get(originKey).routeCount++;
      }
      
      if (!cities.has(destKey)) {
        const [x, y] = projectToSVG(route.destination_latitude, route.destination_longitude);
        cities.set(destKey, {
          city: route.destination_city,
          country: route.destination_country,
          code: route.destination_airport_code,
          x, y,
          routeCount: 1
        });
      } else {
        cities.get(destKey).routeCount++;
      }
    });
    
    return Array.from(cities.values());
  }, [routes]);

  if (routes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🗺️</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Aucune route populaire disponible
        </h3>
        <p className="text-gray-600">
          Les données des routes populaires seront bientôt disponibles
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🌍 Carte Interactive des Routes Aériennes
            </CardTitle>
            <p className="text-sm text-gray-600">
              Cliquez sur une route pour voir les détails. Les couleurs indiquent les prix (vert=économique, orange=modéré, rouge=élevé)
            </p>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <svg 
                viewBox="0 0 500 300" 
                className="w-full h-[400px] border rounded-lg bg-gradient-to-b from-blue-50 to-blue-100"
              >
                {/* World map background */}
                {Object.entries(WORLD_MAP_PATHS).map(([continent, path]) => (
                  <path
                    key={continent}
                    d={path}
                    fill="#e5e7eb"
                    stroke="#d1d5db"
                    strokeWidth="1"
                    className="opacity-60"
                  />
                ))}
                
                {/* Flight routes */}
                {routeData.map((route) => (
                  <g key={route.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <path
                          d={route.arcPath}
                          stroke={route.color}
                          strokeWidth={route.thickness}
                          fill="none"
                          strokeDasharray={hoveredRoute?.id === route.id ? "5,5" : "none"}
                          className="cursor-pointer transition-all duration-200 hover:stroke-width-6"
                          opacity={selectedRoute && selectedRoute.id !== route.id ? 0.3 : 0.8}
                          onClick={() => setSelectedRoute(route)}
                          onMouseEnter={() => setHoveredRoute(route)}
                          onMouseLeave={() => setHoveredRoute(null)}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-sm">
                          <div className="font-semibold">
                            {route.origin_city} → {route.destination_city}
                          </div>
                          <div className="text-xs text-gray-600">
                            {route.origin_country} → {route.destination_country}
                          </div>
                          <div className="mt-1">
                            <div className="text-green-600 font-medium">
                              €{route.min_price} - €{route.max_price}
                            </div>
                            <div className="text-xs">
                              {route.flight_count} vols/jour
                            </div>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </g>
                ))}
                
                {/* City markers */}
                {cityMarkers.map((city, index) => (
                  <g key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <circle
                          cx={city.x}
                          cy={city.y}
                          r={Math.min(3 + city.routeCount * 0.5, 8)}
                          fill="#3b82f6"
                          stroke="white"
                          strokeWidth="2"
                          className="cursor-pointer hover:r-8 transition-all duration-200"
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-sm">
                          <div className="font-semibold">{city.city}</div>
                          <div className="text-xs text-gray-600">{city.country}</div>
                          <div className="text-xs">
                            Code: {city.code} • {city.routeCount} routes
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </g>
                ))}
              </svg>
              
              {/* Legend */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 text-xs">
                <div className="font-semibold mb-2">Légende</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-green-500"></div>
                    <span>Prix économique</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-orange-500"></div>
                    <span>Prix modéré</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-red-500"></div>
                    <span>Prix élevé</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>Aéroports</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected route details */}
        {selectedRoute && (
          <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  ✈️ Route Sélectionnée
                </span>
                <button
                  onClick={() => setSelectedRoute(null)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Itinéraire</h4>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="font-bold text-blue-600 text-lg">
                        {selectedRoute.origin_airport_code}
                      </div>
                      <div className="text-sm font-medium">
                        {selectedRoute.origin_city}
                      </div>
                      <div className="text-xs text-gray-500">
                        {selectedRoute.origin_country}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-1">
                      <div className="h-px bg-gray-300 flex-1"></div>
                      <span className="text-2xl">✈️</span>
                      <div className="h-px bg-gray-300 flex-1"></div>
                    </div>
                    
                    <div className="text-center">
                      <div className="font-bold text-blue-600 text-lg">
                        {selectedRoute.destination_airport_code}
                      </div>
                      <div className="text-sm font-medium">
                        {selectedRoute.destination_city}
                      </div>
                      <div className="text-xs text-gray-500">
                        {selectedRoute.destination_country}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Informations de Prix</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Prix minimum:</span>
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        €{selectedRoute.min_price}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Prix maximum:</span>
                      <Badge variant="outline" className="text-red-600 border-red-200">
                        €{selectedRoute.max_price}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Vols quotidiens:</span>
                      <Badge variant="secondary">
                        {selectedRoute.flight_count}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Dernière mise à jour:</span>
                      <span className="text-sm text-gray-600">
                        {selectedRoute.last_updated.toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Route statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Aperçu Global des Routes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {routes.length}
                </div>
                <div className="text-sm text-gray-600">Routes disponibles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  €{Math.min(...routes.map(r => r.min_price))}
                </div>
                <div className="text-sm text-gray-600">Prix minimum global</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.max(...routes.map(r => r.flight_count))}
                </div>
                <div className="text-sm text-gray-600">Vols max/jour</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {new Set(routes.map(r => r.origin_country)).size + 
                   new Set(routes.map(r => r.destination_country)).size}
                </div>
                <div className="text-sm text-gray-600">Pays connectés</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
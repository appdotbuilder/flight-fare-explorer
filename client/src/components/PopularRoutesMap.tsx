
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { PopularRoute } from '../../../server/src/schema';

interface PopularRoutesMapProps {
  routes: PopularRoute[];
}

export function PopularRoutesMap({ routes }: PopularRoutesMapProps) {
  // Since we don't have a real map library, we'll create a visual representation
  // This is a stub implementation as noted in the guidelines
  const sortedRoutes = [...routes].sort((a: PopularRoute, b: PopularRoute) => b.flight_count - a.flight_count);

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
    <div className="space-y-6">
      {/* Map Placeholder - STUB: Real implementation would use a mapping library */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100">
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Carte Interactive des Routes
          </h3>
          <p className="text-gray-600">
            {/* STUB: This would show an interactive map with flight routes */}
            La carte interactive sera intégrée ici avec les {routes.length} routes populaires
          </p>
        </CardContent>
      </Card>

      {/* Routes List */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          🌟 Routes les Plus Populaires
        </h3>
        <div className="grid gap-4">
          {sortedRoutes.slice(0, 10).map((route: PopularRoute) => (
            <Card key={route.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Route Visual */}
                    <div className="flex items-center gap-2">
                      <div className="text-center">
                        <div className="font-bold text-blue-600">
                          {route.origin_airport_code}
                        </div>
                        <div className="text-xs text-gray-500">
                          {route.origin_city}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-px bg-gray-300 w-8"></div>
                        <span className="text-lg">✈️</span>
                        <div className="h-px bg-gray-300 w-8"></div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-blue-600">
                          {route.destination_airport_code}
                        </div>
                        <div className="text-xs text-gray-500">
                          {route.destination_city}
                        </div>
                      </div>
                    </div>

                    {/* Country Info */}
                    <div className="text-sm text-gray-600">
                      {route.origin_country} → {route.destination_country}
                    </div>
                  </div>

                  <div className="text-right">
                    {/* Price Range */}
                    <div className="text-lg font-semibold text-green-600 mb-1">
                      €{route.min_price} - €{route.max_price}
                    </div>
                    
                    {/* Flight Count Badge */}
                    <Badge variant="secondary" className="mb-2">
                      {route.flight_count} vol{route.flight_count > 1 ? 's' : ''}/jour
                    </Badge>
                    
                    {/* Last Updated */}
                    <div className="text-xs text-gray-500">
                      Mis à jour: {route.last_updated.toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {routes.length > 10 && (
          <div className="text-center mt-6">
            <p className="text-gray-600">
              ... et {routes.length - 10} autres routes populaires
            </p>
          </div>
        )}
      </div>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Statistiques des Routes
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
                €{Math.min(...routes.map((r: PopularRoute) => r.min_price))}
              </div>
              <div className="text-sm text-gray-600">Prix minimum</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.max(...routes.map((r: PopularRoute) => r.flight_count))}
              </div>
              <div className="text-sm text-gray-600">Vols max/jour</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {new Set(routes.map((r: PopularRoute) => r.origin_country)).size}
              </div>
              <div className="text-sm text-gray-600">Pays desservis</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

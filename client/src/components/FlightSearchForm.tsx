
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import type { CompleteFlightSearchInput, Airline } from '../../../server/src/schema';

interface FlightSearchFormProps {
  onSearch: (input: CompleteFlightSearchInput) => Promise<void>;
  airlines: Airline[];
  isLoading?: boolean;
}

export function FlightSearchForm({ onSearch, airlines, isLoading = false }: FlightSearchFormProps) {
  const [searchData, setSearchData] = useState<CompleteFlightSearchInput>({
    origin_city: '',
    destination_city: '',
    departure_date: '',
    return_date: '',
    passengers: 1,
    trip_type: 'one_way',
    filters: {
      max_price: undefined,
      min_price: undefined,
      max_stops: undefined,
      airlines: [],
      departure_time_range: undefined,
      max_duration_hours: undefined
    },
    sort: 'price_asc'
  });

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [maxDuration, setMaxDuration] = useState<[number]>([24]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const searchInput: CompleteFlightSearchInput = {
      ...searchData,
      filters: {
        ...searchData.filters,
        min_price: priceRange[0] > 0 ? priceRange[0] : undefined,
        max_price: priceRange[1] < 2000 ? priceRange[1] : undefined,
        max_duration_hours: maxDuration[0] < 24 ? maxDuration[0] : undefined
      }
    };

    await onSearch(searchInput);
  };

  const handleAirlineFilter = (airlineCode: string, checked: boolean) => {
    setSearchData((prev: CompleteFlightSearchInput) => ({
      ...prev,
      filters: {
        ...prev.filters,
        airlines: checked 
          ? [...(prev.filters?.airlines || []), airlineCode]
          : (prev.filters?.airlines || []).filter((code: string) => code !== airlineCode)
      }
    }));
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Search */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="origin">🛫 Ville de Départ</Label>
          <Input
            id="origin"
            value={searchData.origin_city}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchData((prev: CompleteFlightSearchInput) => ({ ...prev, origin_city: e.target.value }))
            }
            placeholder="Ex: Paris, Londres..."
            required
          />
        </div>

        <div>
          <Label htmlFor="destination">🛬 Ville d'Arrivée</Label>
          <Input
            id="destination"
            value={searchData.destination_city}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchData((prev: CompleteFlightSearchInput) => ({ ...prev, destination_city: e.target.value }))
            }
            placeholder="Ex: New York, Tokyo..."
            required
          />
        </div>

        <div>
          <Label htmlFor="departure">📅 Date de Départ</Label>
          <Input
            id="departure"
            type="date"
            value={searchData.departure_date}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchData((prev: CompleteFlightSearchInput) => ({ ...prev, departure_date: e.target.value }))
            }
            min={today}
            required
          />
        </div>

        <div>
          <Label htmlFor="passengers">👥 Passagers</Label>
          <Select
            value={searchData.passengers.toString()}
            onValueChange={(value: string) =>
              setSearchData((prev: CompleteFlightSearchInput) => ({ ...prev, passengers: parseInt(value) }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1,2,3,4,5,6,7,8,9].map((num: number) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? 'passager' : 'passagers'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Trip Type */}
      <div className="flex gap-4">
        <Label className="text-base font-medium">Type de voyage:</Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="trip_type"
              value="one_way"
              checked={searchData.trip_type === 'one_way'}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchData((prev: CompleteFlightSearchInput) => ({ ...prev, trip_type: e.target.value as 'one_way' | 'round_trip' }))
              }
              className="text-blue-600"
            />
            <span>🎯 Aller simple</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="trip_type"
              value="round_trip"
              checked={searchData.trip_type === 'round_trip'}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchData((prev: CompleteFlightSearchInput) => ({ ...prev, trip_type: e.target.value as 'one_way' | 'round_trip' }))
              }
              className="text-blue-600"
            />
            <span>🔄 Aller-retour</span>
          </label>
        </div>
      </div>

      {/* Return Date for Round Trip */}
      {searchData.trip_type === 'round_trip' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="return_date">📅 Date de Retour</Label>
            <Input
              id="return_date"
              type="date"
              value={searchData.return_date || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchData((prev: CompleteFlightSearchInput) => ({ ...prev, return_date: e.target.value }))
              }
              min={searchData.departure_date || today}
            />
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🔧 Filtres Avancés</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="price" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="price">💰 Prix</TabsTrigger>
              <TabsTrigger value="airlines">✈️ Compagnies</TabsTrigger>
              <TabsTrigger value="stops">🔄 Escales</TabsTrigger>
              <TabsTrigger value="time">⏰ Durée</TabsTrigger>
            </TabsList>

            <TabsContent value="price" className="space-y-4">
              <div>
                <Label>Gamme de prix: €{priceRange[0]} - €{priceRange[1]}</Label>
                <Slider
                  value={priceRange}
                  onValueChange={(value: number[]) => setPriceRange([value[0], value[1]])}
                  max={2000}
                  min={0}
                  step={50}
                  className="mt-2"
                />
              </div>
            </TabsContent>

            <TabsContent value="airlines" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {airlines.map((airline: Airline) => (
                  <div key={airline.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`airline-${airline.code}`}
                      checked={(searchData.filters?.airlines || []).includes(airline.code)}
                      onCheckedChange={(checked: boolean) => 
                        handleAirlineFilter(airline.code, checked)
                      }
                    />
                    <label htmlFor={`airline-${airline.code}`} className="text-sm">
                      {airline.code} - {airline.name}
                    </label>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="stops" className="space-y-4">
              <Select
                value={searchData.filters?.max_stops?.toString() || 'any'}
                onValueChange={(value: string) =>
                  setSearchData((prev: CompleteFlightSearchInput) => ({
                    ...prev,
                    filters: {
                      ...prev.filters,
                      max_stops: value === 'any' ? undefined : parseInt(value)
                    }
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Toutes les escales</SelectItem>
                  <SelectItem value="0">Vol direct seulement</SelectItem>
                  <SelectItem value="1">Maximum 1 escale</SelectItem>
                  <SelectItem value="2">Maximum 2 escales</SelectItem>
                </SelectContent>
              </Select>
            </TabsContent>

            <TabsContent value="time" className="space-y-4">
              <div>
                <Label>Durée maximale: {maxDuration[0]}h</Label>
                <Slider
                  value={maxDuration}
                  onValueChange={(value: number[]) => setMaxDuration([value[0]])}
                  max={24}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Sort Options */}
      <div>
        <Label htmlFor="sort">📊 Trier par:</Label>
        <Select
          value={searchData.sort || 'price_asc'}
          onValueChange={(value: string) =>
            setSearchData((prev: CompleteFlightSearchInput) => ({ 
              ...prev, 
              sort: value as 'price_asc' | 'price_desc' | 'duration_asc' | 'duration_desc' | 'departure_time_asc' | 'departure_time_desc'
            }))
          }
        >
          <SelectTrigger className="w-full md:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price_asc">💰 Prix croissant</SelectItem>
            <SelectItem value="price_desc">💰 Prix décroissant</SelectItem>
            <SelectItem value="duration_asc">⏱️ Durée croissante</SelectItem>
            <SelectItem value="duration_desc">⏱️ Durée décroissante</SelectItem>
            <SelectItem value="departure_time_asc">🕐 Départ tôt</SelectItem>
            <SelectItem value="departure_time_desc">🕐 Départ tard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <Button type="submit" disabled={isLoading} className="w-full h-12 text-lg">
        {isLoading ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            Recherche en cours...
          </>
        ) : (
          <>
            🔍 Rechercher des Vols
          </>
        )}
      </Button>
    </form>
  );
}

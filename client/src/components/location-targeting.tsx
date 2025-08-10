import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, MapPin, Users, Plus, X, Filter } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface LocationFilters {
  countries: string[];
  states: string[];
  cities: string[];
  zipCodes: string[];
}

interface LocationTargetingProps {
  onFiltersChange: (filters: LocationFilters) => void;
  initialFilters?: LocationFilters;
}

export default function LocationTargeting({ onFiltersChange, initialFilters = {
  countries: [],
  states: [],
  cities: [],
  zipCodes: []
} }: LocationTargetingProps) {
  const [filters, setFilters] = useState<LocationFilters>(initialFilters);
  const [searchTerm, setSearchTerm] = useState("");
  const [participantStats, setParticipantStats] = useState<{
    total: number;
    byCountry: Record<string, number>;
    byState: Record<string, number>;
    byCity: Record<string, number>;
  } | null>(null);

  const [availableLocations, setAvailableLocations] = useState<{
    countries: string[];
    states: string[];
    cities: string[];
  }>({
    countries: [],
    states: [],
    cities: []
  });

  useEffect(() => {
    fetchLocationData();
  }, []);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const fetchLocationData = async () => {
    try {
      const response = await apiRequest("GET", "/api/participants/location-stats");
      setParticipantStats(response.stats);
      setAvailableLocations(response.locations);
    } catch (error) {
      console.error("Error fetching location data:", error);
    }
  };

  const addToFilter = (type: keyof LocationFilters, value: string) => {
    if (value && !filters[type].includes(value)) {
      setFilters(prev => ({
        ...prev,
        [type]: [...prev[type], value]
      }));
    }
  };

  const removeFromFilter = (type: keyof LocationFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item !== value)
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      countries: [],
      states: [],
      cities: [],
      zipCodes: []
    });
  };

  const filteredLocations = (locations: string[]) => {
    if (!searchTerm) return locations;
    return locations.filter(location =>
      location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getParticipantCount = (type: string, value: string) => {
    if (!participantStats) return 0;
    
    switch (type) {
      case 'country':
        return participantStats.byCountry[value] || 0;
      case 'state':
        return participantStats.byState[value] || 0;
      case 'city':
        return participantStats.byCity[value] || 0;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-emerald-500" />
            <span>Location Targeting</span>
          </CardTitle>
          <CardDescription>
            Target participants by their geographical location for more precise audience selection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Active Filters */}
          {(filters.countries.length > 0 || filters.states.length > 0 || filters.cities.length > 0 || filters.zipCodes.length > 0) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Active Filters</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-7"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear All
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {filters.countries.map(country => (
                  <Badge key={country} variant="secondary" className="bg-emerald-100 text-emerald-800">
                    🌍 {country}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromFilter('countries', country)}
                      className="h-4 w-4 p-0 ml-2 hover:bg-emerald-200"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
                {filters.states.map(state => (
                  <Badge key={state} variant="secondary" className="bg-blue-100 text-blue-800">
                    🏛️ {state}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromFilter('states', state)}
                      className="h-4 w-4 p-0 ml-2 hover:bg-blue-200"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
                {filters.cities.map(city => (
                  <Badge key={city} variant="secondary" className="bg-purple-100 text-purple-800">
                    🏙️ {city}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromFilter('cities', city)}
                      className="h-4 w-4 p-0 ml-2 hover:bg-purple-200"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
                {filters.zipCodes.map(zip => (
                  <Badge key={zip} variant="secondary" className="bg-amber-100 text-amber-800">
                    📮 {zip}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromFilter('zipCodes', zip)}
                      className="h-4 w-4 p-0 ml-2 hover:bg-amber-200"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Location Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Countries */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Countries</Label>
              <Select onValueChange={(value) => addToFilter('countries', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select countries" />
                </SelectTrigger>
                <SelectContent>
                  {filteredLocations(availableLocations.countries).map(country => (
                    <SelectItem key={country} value={country}>
                      <div className="flex items-center justify-between w-full">
                        <span>{country}</span>
                        <Badge variant="outline" className="ml-2">
                          {getParticipantCount('country', country)}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* States/Provinces */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">States/Provinces</Label>
              <Select onValueChange={(value) => addToFilter('states', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select states/provinces" />
                </SelectTrigger>
                <SelectContent>
                  {filteredLocations(availableLocations.states).map(state => (
                    <SelectItem key={state} value={state}>
                      <div className="flex items-center justify-between w-full">
                        <span>{state}</span>
                        <Badge variant="outline" className="ml-2">
                          {getParticipantCount('state', state)}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cities */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Cities</Label>
              <Select onValueChange={(value) => addToFilter('cities', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cities" />
                </SelectTrigger>
                <SelectContent>
                  {filteredLocations(availableLocations.cities).map(city => (
                    <SelectItem key={city} value={city}>
                      <div className="flex items-center justify-between w-full">
                        <span>{city}</span>
                        <Badge variant="outline" className="ml-2">
                          {getParticipantCount('city', city)}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ZIP Codes */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">ZIP/Postal Codes</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter ZIP code"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const value = e.currentTarget.value.trim();
                      if (value) {
                        addToFilter('zipCodes', value);
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Enter ZIP code"]') as HTMLInputElement;
                    const value = input?.value.trim();
                    if (value) {
                      addToFilter('zipCodes', value);
                      input.value = '';
                    }
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Participant Statistics */}
          {participantStats && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-gray-600" />
                <Label className="text-sm font-medium">Participant Statistics</Label>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">{participantStats.total}</div>
                  <div className="text-gray-600">Total Participants</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{Object.keys(participantStats.byCountry).length}</div>
                  <div className="text-gray-600">Countries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{Object.keys(participantStats.byState).length}</div>
                  <div className="text-gray-600">States/Provinces</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">{Object.keys(participantStats.byCity).length}</div>
                  <div className="text-gray-600">Cities</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
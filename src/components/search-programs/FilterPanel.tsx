import React, { useState } from 'react';
import { DEFAULT_FILTERS, SearchFilters } from '#/validators';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { RefreshCw, ChevronRight, ChevronDown } from "lucide-react";

interface FilterPanelProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters, filterType?: string) => void;
  locations?: Array<{ city: string; state: string }>;
  degreeTypes?: Array<{ value: string; label: string }>;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onChange,
  locations = [],
  degreeTypes = []
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleFilterChange = (key: keyof SearchFilters, value: any, filterType: string = 'default') => {
    onChange({ ...filters, [key]: value }, filterType);
  };

  // Check if any filter is non-default
  const hasActiveFilters = Object.keys(filters).some(key => {
    const filterKey = key as keyof SearchFilters;
    
    // Handle object type filters (like location)
    if (typeof filters[filterKey] === 'object' && filters[filterKey] !== null) {
      return JSON.stringify(filters[filterKey]) !== JSON.stringify(DEFAULT_FILTERS[filterKey]);
    }
    
    // Handle primitive type filters
    return filters[filterKey] !== DEFAULT_FILTERS[filterKey];
  });
  
  // Reset all filters to default
  const handleResetAllFilters = () => {
    onChange(DEFAULT_FILTERS, 'reset');
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="bg-gray-50 p-4 rounded-lg shadow-sm"
    >
      <div className="flex items-center justify-between">
        {/* Filter Panel Header */}
        <CollapsibleTrigger asChild>
          <div className='flex items-center'>
            <Button
              variant="ghost"
              size="sm"
              className="p-1"
              aria-label={isOpen ? "Hide filters" : "Show filters"}
            >
              {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </Button>
            <h3 className="text-lg font-semibold">Filters</h3>
          </div>
        </CollapsibleTrigger>
        {/* Reset Filters Button */}
        {hasActiveFilters && (
          <Button
            onClick={handleResetAllFilters}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset All Filters
          </Button>
        )}
      </div>
      {/* Filter Options */}
      <CollapsibleContent className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Program Type Filter */}
          <div className="space-y-2">
            <Label htmlFor="program-type">Program Type</Label>
            <Select
              value={filters.programType}
              onValueChange={(value) => handleFilterChange('programType', value, 'select')}
            >
              <SelectTrigger id="program-type" className="w-full truncate">
                <SelectValue placeholder="All Programs" className="truncate" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Programs</SelectItem>
                  {degreeTypes.map((degree) => (
                    <SelectItem key={degree.value} value={degree.value}>
                      {degree.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Location Filter */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Select
              value={filters.location?.state}
              onValueChange={(value) => {
                if (value === 'all') {
                  handleFilterChange('location', {
                    state: 'all',
                    city: 'all'
                  }, 'select');
                } else {
                  handleFilterChange('location', {
                    state: value,
                    city: 'all'
                  }, 'select');
                }
              }}
            >
              <SelectTrigger id="location" className="w-full truncate">
                <SelectValue placeholder="All States" className="truncate" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All States</SelectItem>
                  {/* Use Set to filter unique states */}
                  {[...new Set(locations.map(loc => loc.state))].map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            
            {/* City Filter - Only show when a state is selected */}
            {filters.location && filters.location.state !== 'all' && (
              <div className="mt-2">
                <Select
                  value={filters.location.city}
                  onValueChange={(city) => {
                    if (!filters.location) {
                      return; // Safety check
                    }
                    if (city === 'all') {
                      // If "All Cities" is selected, set city to "all"
                      handleFilterChange('location', {
                        state: filters.location.state,
                        city: 'all'
                      }, 'select');
                      return;
                    }
                    // Update the location object with the selected city
                    handleFilterChange('location', {
                      state: filters.location.state,
                      city: city
                    }, 'select');
                  }}
                >
                  <SelectTrigger id="city" className="w-full truncate mt-1">
                    <SelectValue placeholder="All Cities" className="truncate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All Cities</SelectItem>
                      {locations
                        .filter(loc => filters.location?.state !== 'all' && 
                                loc.state === filters.location?.state)
                        .map((location) => (
                          <SelectItem key={`${location.state}-${location.city}`} value={location.city}>
                            {location.city}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Ranking Filter */}
          <div className="space-y-2">
            <Label htmlFor="ranking">Ranking</Label>
            <Select
              value={filters.ranking}
              onValueChange={(value) => handleFilterChange('ranking', value, 'select')}
            >
              <SelectTrigger id="ranking" className="w-full truncate">
                <SelectValue placeholder="All Rankings" className="truncate" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Rankings</SelectItem>
                  <SelectItem value="top_10">Top 10</SelectItem>
                  <SelectItem value="top_50">Top 50</SelectItem>
                  <SelectItem value="top_100">Top 100</SelectItem>
                  <SelectItem value="top_200">Top 200</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Additional Filters */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* GRE Required Filter */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="gre-waiver"
              checked={filters.gre === true}
              onCheckedChange={(checked) =>
                handleFilterChange('gre', checked ? true : false, 'checkbox')
              }
            />
            <Label htmlFor="gre-waiver">GRE Waiver Available</Label>
          </div>

          {/* TOEFL Required Filter */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="toefl-required"
              checked={filters.toefl === true}
              onCheckedChange={(checked) =>
                handleFilterChange('toefl', checked ? true : undefined, 'checkbox')
              }
            />
            <Label htmlFor="toefl-required">TOEFL Waiver Available</Label>
          </div>

          {/* Minimum GPA Filter */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="min-gpa">
                Minimum GPA: {filters.minimumGPA || 'Any'}
              </Label>
              {filters.minimumGPA && (
                <Button
                  onClick={() => handleFilterChange('minimumGPA', undefined, 'reset')}
                  variant="link"
                  className="h-auto p-0 text-xs"
                >
                  Reset
                </Button>
              )}
            </div>
            <Slider
              id="min-gpa"
              min={2.0}
              max={4.0}
              step={0.1}
              value={[filters.minimumGPA || 2.0]}
              onValueChange={(values) => handleFilterChange('minimumGPA', values[0], 'slider')}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>2.0</span>
              <span>2.5</span>
              <span>3.0</span>
              <span>3.5</span>
              <span>4.0</span>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default FilterPanel;

import React from 'react';
import { ProgramSearchFilters } from '../../hooks/useProgramSearch';
import { formatLocation } from "../../lib/formatLocation";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RefreshCw } from "lucide-react";

interface FilterPanelProps {
  filters: ProgramSearchFilters;
  onChange: (filters: ProgramSearchFilters, filterType?: string) => void;
  locations?: string[];
  degreeTypes?: Array<{ value: string; label: string }>;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onChange,
  locations = [],
  degreeTypes = []
}) => {
  const handleFilterChange = (key: keyof ProgramSearchFilters, value: any, filterType: string = 'default') => {
    onChange({ ...filters, [key]: value }, filterType);
  };

  // Default filter values to reset to
  const defaultFilters: ProgramSearchFilters = {
    programType: 'all',
    location: 'all',
    ranking: 'all',
    gre: undefined,
    toefl: undefined,
    minimumGPA: undefined
  };

  // Check if any filter is non-default
  const hasActiveFilters =
    filters.programType !== 'all' ||
    filters.location !== 'all' ||
    filters.ranking !== 'all' ||
    filters.gre !== undefined ||
    filters.toefl !== undefined ||
    filters.minimumGPA !== undefined;

  // Reset all filters to default
  const handleResetAllFilters = () => {
    onChange(defaultFilters, 'reset');
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            value={filters.location}
            onValueChange={(value) => handleFilterChange('location', value, 'select')}
          >
            <SelectTrigger id="location" className="w-full truncate">
              <SelectValue placeholder="All Locations" className="truncate" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {formatLocation(location)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
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
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Reset Filters Button */}
      {hasActiveFilters && (
        <div className="mt-6 flex justify-center">
          <Button
            onClick={handleResetAllFilters}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset All Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;

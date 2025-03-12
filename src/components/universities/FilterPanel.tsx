import React from 'react';
import { UniversityFilters } from '../../hooks/useUniversities';
import { ChevronDown } from 'lucide-react';

interface FilterPanelProps {
  filters: UniversityFilters;
  onChange: (filters: UniversityFilters) => void;
  locations?: string[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({ 
  filters, 
  onChange,
  locations = []
}) => {
  const handleFilterChange = (key: keyof UniversityFilters, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Program Type Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Program Type
          </label>
          <div className="relative">
            <select
              value={filters.programType}
              onChange={(e) => handleFilterChange('programType', e.target.value)}
              className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:ring-primary focus:border-primary"
            >
              <option value="all">All Programs</option>
              <option value="MS">Master of Science (MS)</option>
              <option value="MA">Master of Arts (MA)</option>
              <option value="PhD">Doctor of Philosophy (PhD)</option>
              <option value="MBA">Master of Business Admin (MBA)</option>
              <option value="MFA">Master of Fine Arts (MFA)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Location Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <div className="relative">
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:ring-primary focus:border-primary"
            >
              <option value="all">All Locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Ranking Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Ranking
          </label>
          <div className="relative">
            <select
              value={filters.ranking}
              onChange={(e) => handleFilterChange('ranking', e.target.value)}
              className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:ring-primary focus:border-primary"
            >
              <option value="all">All Rankings</option>
              <option value="top_10">Top 10</option>
              <option value="top_50">Top 50</option>
              <option value="top_100">Top 100</option>
              <option value="top_200">Top 200</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Filters */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* GRE Required Filter */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="gre-waiver"
            checked={filters.gre === false}
            onChange={(e) => handleFilterChange('gre', e.target.checked ? false : undefined)}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="gre-waiver" className="ml-2 text-sm text-gray-700">
            GRE Waiver Available
          </label>
        </div>

        {/* TOEFL Required Filter */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="toefl-required"
            checked={filters.toefl === true}
            onChange={(e) => handleFilterChange('toefl', e.target.checked ? true : undefined)}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="toefl-required" className="ml-2 text-sm text-gray-700">
            TOEFL Required
          </label>
        </div>

        {/* Minimum GPA Filter */}
        <div className="space-y-1">
          <label htmlFor="min-gpa" className="block text-sm font-medium text-gray-700">
            Minimum GPA: {filters.minimumGPA || 'Any'}
          </label>
          <input
            type="range"
            id="min-gpa"
            min="2.0"
            max="4.0"
            step="0.1"
            value={filters.minimumGPA || 2.0}
            onChange={(e) => handleFilterChange('minimumGPA', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>2.0</span>
            <span>3.0</span>
            <span>4.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;

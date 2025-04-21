import React, { useState, useEffect } from 'react';
import SearchField from './SearchField';
import FilterPanel from './FilterPanel';
import { SearchFilters, DEFAULT_FILTERS } from '#/validators';
// TODO: Fix bug where filters are not applied when no results are found
interface ProgramSearchProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: SearchFilters, filterType?: string) => void;
  initialFilters?: Partial<SearchFilters>;
  initialQuery?: string;
  uniqueLocations?: Array<{ city: string; state: string }>;
  uniqueDegreeTypes?: Array<{ value: string; label: string }>;
}

const ProgramSearch: React.FC<ProgramSearchProps> = ({
  onSearch,
  onFilterChange,
  initialFilters = {},
  initialQuery = '',
  uniqueLocations = [],
  uniqueDegreeTypes = [],
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>({...DEFAULT_FILTERS, ...initialFilters});
  
  
  // Trigger search when query changes
  useEffect(() => {
    onSearch(searchQuery);
  }, [searchQuery, onSearch]);

  // Update filters and notify parent component
  const handleFilterChange = (newFilters: SearchFilters, filterType?: string) => {
    setFilters(newFilters);
    onFilterChange(newFilters, filterType);
  };

  return (
    <div className="space-y-4">
      <SearchField 
        value={searchQuery} 
        onChange={setSearchQuery} 
        placeholder="Search for graduate programs..."
      />
      
      <FilterPanel 
        filters={filters} 
        onChange={handleFilterChange}
        locations={uniqueLocations}
        degreeTypes={uniqueDegreeTypes}
      />
    </div>
  );
};

export default ProgramSearch;

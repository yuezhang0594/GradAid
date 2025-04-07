import React, { useState, useEffect } from 'react';
import SearchField from './SearchField';
import FilterPanel from './FilterPanel';
import { ProgramSearchFilters, DEFAULT_FILTERS } from '../../hooks/useProgramSearch';
import { api } from '../../../convex/_generated/api';
import { useQuery } from 'convex/react';
// TODO: Fix bug where filters are not applied when no results are found
interface ProgramSearchProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: ProgramSearchFilters, filterType?: string) => void;
  initialFilters?: Partial<ProgramSearchFilters>;
  initialQuery?: string;
}

const ProgramSearch: React.FC<ProgramSearchProps> = ({
  onSearch,
  onFilterChange,
  initialFilters = {},
  initialQuery = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<ProgramSearchFilters>({...DEFAULT_FILTERS, ...initialFilters});
  
  // Get unique locations from the database for the location filter
  const uniqueLocations = useQuery(api.programs.search.getUniqueLocations) || [];
  
  // Get unique degree types from the database for the program type filter
  const uniqueDegreeTypes = useQuery(api.programs.search.getUniqueDegreeTypes) || [];

  // Trigger search when query changes
  useEffect(() => {
    onSearch(searchQuery);
  }, [searchQuery, onSearch]);

  // Update filters and notify parent component
  const handleFilterChange = (newFilters: ProgramSearchFilters, filterType?: string) => {
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

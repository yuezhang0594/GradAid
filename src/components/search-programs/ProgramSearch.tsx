import React, { useState, useEffect } from 'react';
import SearchField from './SearchField';
import FilterPanel from './FilterPanel';
import { UniversityFilters, DEFAULT_FILTERS } from '../../hooks/useUniversities';
import { api } from '../../../convex/_generated/api';
import { useQuery } from 'convex/react';

interface ProgramSearchProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: UniversityFilters, filterType?: string) => void;
  initialFilters?: Partial<UniversityFilters>;
  initialQuery?: string;
}

const ProgramSearch: React.FC<ProgramSearchProps> = ({
  onSearch,
  onFilterChange,
  initialFilters = {},
  initialQuery = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<UniversityFilters>({...DEFAULT_FILTERS, ...initialFilters});
  
  // Get unique locations from the database for the location filter
  const uniqueLocations = useQuery(api.universities.search.getUniqueLocations) || [];
  
  // Get unique degree types from the database for the program type filter
  const uniqueDegreeTypes = useQuery(api.universities.search.getUniqueDegreeTypes) || [];

  // Trigger search when query changes
  useEffect(() => {
    onSearch(searchQuery);
  }, [searchQuery, onSearch]);

  // Update filters and notify parent component
  const handleFilterChange = (newFilters: UniversityFilters, filterType?: string) => {
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

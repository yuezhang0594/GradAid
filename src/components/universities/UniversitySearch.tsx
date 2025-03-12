import React, { useState, useEffect } from 'react';
import SearchField from './SearchField';
import FilterPanel from './FilterPanel';
import { UniversityFilters, DEFAULT_FILTERS } from '../../hooks/useUniversities';
import { api } from '../../../convex/_generated/api';
import { useQuery } from 'convex/react';

interface UniversitySearchProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: UniversityFilters) => void;
  initialFilters?: Partial<UniversityFilters>;
  initialQuery?: string;
}

const UniversitySearch: React.FC<UniversitySearchProps> = ({
  onSearch,
  onFilterChange,
  initialFilters = {},
  initialQuery = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<UniversityFilters>({...DEFAULT_FILTERS, ...initialFilters});
  
  // Get unique locations from the database for the location filter
  const uniqueLocations = useQuery(api.universities.search.getUniqueLocations) || [];

  // Trigger search when query changes
  useEffect(() => {
    onSearch(searchQuery);
  }, [searchQuery, onSearch]);

  // Update filters and notify parent component
  const handleFilterChange = (newFilters: UniversityFilters) => {
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="space-y-4">
      <SearchField 
        value={searchQuery} 
        onChange={setSearchQuery} 
        placeholder="Search for universities or programs..."
      />
      
      <FilterPanel 
        filters={filters} 
        onChange={handleFilterChange}
        locations={uniqueLocations}
      />
    </div>
  );
};

export default UniversitySearch;

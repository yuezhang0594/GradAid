import React from 'react';
import ProgramTracker from './ProgramTracker';
import programService from '../services/program';

const fetchSavedPrograms = async () => {
  return await programService.getAllPrograms();
};

const SavedPrograms = () => {
  return (
    <ProgramTracker 
      trackerName="Saved Programs" 
      fetchPrograms={fetchSavedPrograms}
      showAddButton={true} 
    />
  );
};

export default SavedPrograms;
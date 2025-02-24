import React from 'react';
import ProgramTracker from './ProgramTracker';
import { supabase } from '../supabaseClient';

const fetchSavedPrograms = async () => {
// Fetch all programs from Supabase
  const { data, error } = await supabase
    .from('Program')   
    .select('*');

  if (error) {
    console.error('Error fetching programs:', error);
    return [];
  }
  
  return data;
};

const SavedPrograms = () => {
  return (
    <ProgramTracker 
      trackerName="Saved Programs" 
      fetchPrograms={fetchSavedPrograms} 
    />
  );
};

export default SavedPrograms; 
import React, { useState, useEffect } from 'react';
import ProgramCard from './ProgramCard';
import AddProgramForm from './AddProgramForm';

/**
 * ProgramTracker component
 * 
 * @param {string} trackerName - The name of the tracker to be displayed
 * @param {function} fetchPrograms - A function to fetch the list of programs, which must return a Promise that resolves to an array of programs
 * @param {boolean} showAddButton - A flag to control whether the "Add Program" button is shown
 */
const ProgramTracker = ({ trackerName, fetchPrograms, showAddButton = false }) => {
  const [programs, setPrograms] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch programs when the component mounts or when fetchPrograms changes
  useEffect(() => {
    const loadPrograms = async () => {
      const fetchedPrograms = await fetchPrograms();
      setPrograms(fetchedPrograms);
    };
    loadPrograms();
  }, [fetchPrograms]);

  // Handle closing of the add program form
  const handleFormClose = () => {
    setShowAddForm(false);
    // Optionally, refresh the programs list after adding a new program
    fetchPrograms().then(setPrograms);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg h-full flex flex-col pb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">{trackerName}</h2>
        {showAddButton && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Program
          </button>
        )}
      </div>

      {showAddForm && (
        <AddProgramForm onComplete={handleFormClose} />
      )}

      <div className="flex flex-wrap gap-4 overflow-y-auto h-[calc(100%-4rem)] pl-4 pb-4">
        {programs.map((program) => (
          <div key={program.program_id} className="w-[250px] flex-none">
            <ProgramCard program={program} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgramTracker;
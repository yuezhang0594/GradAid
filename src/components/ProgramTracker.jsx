import React, { useState, useEffect } from 'react';
import ProgramCard from './ProgramCard';

const ProgramTracker = ({ trackerName, fetchPrograms }) => {
  const [programs, setPrograms] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProgram, setNewProgram] = useState({
    university: '',
    program: '',
    description: '',
    website: '',
    deadline: ''
  });

  // Fetch programs when the component mounts or when fetchPrograms changes
  useEffect(() => {
    const loadPrograms = async () => {
      const fetchedPrograms = await fetchPrograms();
      setPrograms(fetchedPrograms);
    };
    loadPrograms();
  }, [fetchPrograms]);

  const handleAddProgram = (e) => {
    e.preventDefault();
    const program = {
      id: programs.length + 1,
      ...newProgram,
    };
    setPrograms([...programs, program]);
    setNewProgram({ university_id: '', program_name: '', description: '', website: '', deadline: '' });
    setShowAddForm(false);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">{trackerName}</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Program
        </button>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Add New Program</h3>
            <form onSubmit={handleAddProgram}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">University Name</label>
                  <input
                    type="text"
                    value={newProgram.university}
                    onChange={(e) => setNewProgram({...newProgram, university: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Program</label>
                  <input
                    type="text"
                    value={newProgram.program}
                    onChange={(e) => setNewProgram({...newProgram, program: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Deadline</label>
                  <input
                    type="date"
                    value={newProgram.deadline}
                    onChange={(e) => setNewProgram({...newProgram, deadline: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <input
                    type="text"
                    value={newProgram.description}
                    onChange={(e) => setNewProgram({...newProgram, description: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Website</label>
                  <input
                    type="url"
                    value={newProgram.website}
                    onChange={(e) => setNewProgram({...newProgram, website: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 overflow-y-auto h-[calc(100%-4rem)]">
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
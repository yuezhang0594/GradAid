import React, { useState } from 'react';
import UniversityCard from './UniversityCard';

const UniversityTracker = () => {
  const [universities, setUniversities] = useState([
    {
      id: 1,
      name: 'Harvard University',
      program: 'MS in Computer Science',
      progress: 85,
      status: 'In Progress',
      deadline: 'Dec 15, 2025',
      sopStatus: 'Final Draft Ready',
      lorStatus: '2/3 Received',
    },
    {
      id: 2,
      name: 'MIT',
      program: 'MS in Software Engineering',
      progress: 60,
      status: 'In Progress',
      deadline: 'Jan 15, 2026',
      sopStatus: 'First Draft',
      lorStatus: '1/3 Received'
    },
    {
      id: 3,
      name: 'Boston University',
      program: 'MS in Computer Information Systems',
      progress: 40,
      status: 'Not Started',
      deadline: 'Feb 1, 2026',
      sopStatus: 'Not Started',
      lorStatus: 'Pending'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newUniversity, setNewUniversity] = useState({
    name: '',
    program: '',
    deadline: ''
  });

  const handleAddUniversity = (e) => {
    e.preventDefault();
    const university = {
      id: universities.length + 1,
      ...newUniversity,
      progress: 0,
      status: 'Not Started',
      sopStatus: 'Not Started',
      lorStatus: 'Not Started'
    };
    setUniversities([...universities, university]);
    setNewUniversity({ name: '', program: '', deadline: '' });
    setShowAddForm(false);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Application Tracker</h2>
        <div className="flex gap-2">
          
          <button
            onClick={() => setShowAddForm(true)}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add University
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Add New University</h3>
            <form onSubmit={handleAddUniversity}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">University Name</label>
                  <input
                    type="text"
                    value={newUniversity.name}
                    onChange={(e) => setNewUniversity({...newUniversity, name: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Program</label>
                  <input
                    type="text"
                    value={newUniversity.program}
                    onChange={(e) => setNewUniversity({...newUniversity, program: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Deadline</label>
                  <input
                    type="date"
                    value={newUniversity.deadline}
                    onChange={(e) => setNewUniversity({...newUniversity, deadline: e.target.value})}
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
        {universities.map((university) => (
          <div key={university.id} className="w-[250px] flex-none">
            <UniversityCard university={university} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default UniversityTracker;

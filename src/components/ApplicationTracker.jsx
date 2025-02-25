import React, { useState } from 'react';
import ApplicationCard from './ApplicationCard';

const ApplicationTracker = ({ trackerName }) => {
  const [applications, setApplications] = useState([
    {
      id: 1,
      university: 'Harvard University',
      program: 'MS in Computer Science',
      progress: 85,
      status: 'In Progress',
      deadline: 'Dec 15, 2025',
      sopStatus: 'Final Draft Ready',
      lorStatus: '2/3 Received',
    },
    {
      id: 2,
      university: 'MIT',
      program: 'MS in Software Engineering',
      progress: 60,
      status: 'In Progress',
      deadline: 'Jan 15, 2026',
      sopStatus: 'First Draft',
      lorStatus: '1/3 Received'
    },
    {
      id: 3,
      university: 'Boston University',
      program: 'MS in Computer Information Systems',
      progress: 0,
      status: 'Not Started',
      deadline: 'Feb 1, 2026',
      sopStatus: 'Not Started',
      lorStatus: 'Pending'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newApplication, setNewApplication] = useState({
    university: '',
    program: '',
    deadline: ''
  });

  const handleAddApplication = (e) => {
    e.preventDefault();
    const application = {
      id: applications.length + 1,
      ...newApplication,
      progress: 0,
      status: 'Not Started',
      sopStatus: 'Not Started',
      lorStatus: 'Not Started'
    };
    setApplications([...applications, application]);
    setNewApplication({ university: '', program: '', deadline: '' });
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
          Add Application
        </button>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Add New Application</h3>
            <form onSubmit={handleAddApplication}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">University Name</label>
                  <input
                    type="text"
                    value={newApplication.university}
                    onChange={(e) => setNewApplication({...newApplication, university: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Program</label>
                  <input
                    type="text"
                    value={newApplication.program}
                    onChange={(e) => setNewApplication({...newApplication, program: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Deadline</label>
                  <input
                    type="date"
                    value={newApplication.deadline}
                    onChange={(e) => setNewApplication({...newApplication, deadline: e.target.value})}
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

      <div className="flex flex-wrap gap-4 overflow-y-auto h-[calc(100%-4rem)] pl-4 pb-4">
        {applications.map((application) => (
          <div key={application.id} className="w-[250px] flex-none">
            <ApplicationCard application={application} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApplicationTracker;

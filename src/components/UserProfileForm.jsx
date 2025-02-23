import { useState } from 'react';
import { profileService } from '../services/profile';

const API_URL = 'http://localhost:8000/api';

export default function UserProfileForm({ onComplete }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    country: '',
    education_level: '',
    major: '',
    gpa: '',
    gre_score: '',
    toefl_score: '',
    ielts_score: '',
    profile_desc: ''
  });

  const educationLevels = [
    'High School',
    'Bachelor\'s',
    'Master\'s',
    'PhD',
    'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert empty strings to null for numeric fields
      const processedData = {
        ...formData,
        gpa: formData.gpa || null,
        gre_score: formData.gre_score || null,
        toefl_score: formData.toefl_score || null,
        ielts_score: formData.ielts_score || null
      };
      
      await profileService.createProfile(processedData);
      if (onComplete) onComplete();
    } catch (error) {
      alert('Error saving profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Complete Your Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Country</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Education Level</label>
            <select
              name="education_level"
              value={formData.education_level}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select Education Level</option>
              {educationLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Major</label>
            <input
              type="text"
              name="major"
              value={formData.major}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">GPA</label>
            <input
              type="number"
              name="gpa"
              value={formData.gpa}
              onChange={handleChange}
              step="0.01"
              min="0"
              max="4"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">GRE Score</label>
            <input
              type="number"
              name="gre_score"
              value={formData.gre_score}
              onChange={handleChange}
              min="260"
              max="340"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">TOEFL Score</label>
            <input
              type="number"
              name="toefl_score"
              value={formData.toefl_score}
              onChange={handleChange}
              min="0"
              max="120"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">IELTS Score</label>
            <input
              type="number"
              name="ielts_score"
              value={formData.ielts_score}
              onChange={handleChange}
              step="0.5"
              min="0"
              max="9"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Profile Description</label>
            <textarea
              name="profile_desc"
              value={formData.profile_desc}
              onChange={handleChange}
              rows="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
            <button
              type="button"
              onClick={onComplete}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
            >
              Fill Later
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

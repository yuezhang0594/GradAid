import { useState, useEffect, useMemo } from 'react';
import { profileService } from '../services/profile';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { countryOptions, majorOptions, degreeOptions } from '../services/selectOptions';

const API_URL = 'http://localhost:8000/api';

// Helper component for required fields
const RequiredLabel = ({ children }) => (
  <label className="block text-sm font-medium text-gray-700">
    {children} <span className="text-red-500">*</span>
  </label>
);

// Labels for form fields that require validation
const fieldLabels = {
  gpa: 'GPA',
  gre_score: 'GRE Score', 
  toefl_score: 'TOEFL Score',
  ielts_score: 'IELTS Score'
};

const customStyles = {
  control: (provided) => ({
    ...provided,
    border: '1px solid rgb(209, 213, 219)',
    borderRadius: '0.375rem',
    padding: '1px'
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#2563eb' : provided.backgroundColor,
    '&:hover': {
      backgroundColor: state.isSelected ? '#2563eb' : '#f3f4f6'
    }
  })
};

export default function UserProfileForm({ onComplete }) {
  // Form state management
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    country: '',
    education_level: '',
    major: '',
    gpa: '',
    gre_score: '',
    toefl_score: '',
    ielts_score: '',
    profile_description: '',
    dob: ''
  });

  // Add validation functions
  const validateScores = useMemo(() => ({
    gpa: (value) => {
      if (!value) return true; // Optional field
      const num = parseFloat(value);
      return num >= 0 && num <= 4;
    },
    gre_score: (value) => {
      if (!value) return true; // Optional field
      const num = parseInt(value);
      return num >= 260 && num <= 340;
    },
    toefl_score: (value) => {
      if (!value) return true; // Optional field
      const num = parseInt(value);
      return num >= 0 && num <= 120;
    },
    ielts_score: (value) => {
      if (!value) return true; // Optional field
      const num = parseFloat(value);
      return num >= 0 && num <= 9;
    }
  }), []);

  const validateDob = (dob) => {
    if (!dob) return false;
    const birthDate = new Date(dob);
    const today = new Date();
    
    // Check if date is valid
    if (isNaN(birthDate.getTime())) return false;
    
    // Calculate age
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    // Must be at least 16 years old and not born in the future
    return age >= 16 && birthDate <= today;
  };

  // Add error state
  const [errors, setErrors] = useState({});

  // Fetch existing profile data when component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await profileService.getProfile();
        if (profile) {
          // Format date of birth for date input (YYYY-MM-DD)
          const formattedDob = profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : '';
          
          // Pre-fill form with existing profile data
          setFormData({
            country: profile.country || '',
            education_level: profile.education_level || '',
            major: profile.major || '',
            gpa: profile.gpa || '',
            gre_score: profile.gre_score || '',
            toefl_score: profile.toefl_score || '',
            ielts_score: profile.ielts_score || '',
            profile_description: profile.profile_description || '',
            dob: formattedDob
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  // Handle Escape key to close form
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onComplete();
      }
    };

    // Add event listener when component mounts
    document.addEventListener('keydown', handleEscape);

    // Clean up event listener when component unmounts
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onComplete]);

  // Handle form input changes
  const handleChange = (event, fieldName = null) => {
    // Handle react-select/creatable-select changes
    if (event?.hasOwnProperty('label')) {
      setFormData(prev => ({
        ...prev,
        [fieldName]: event?.label || ''
      }));
      setErrors(prev => ({ ...prev, [fieldName]: null }));
      return;
    }

    // Handle regular input changes
    const name = fieldName || event.target.name;
    const value = event.target?.value ?? event;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate the changed field
    if (name === 'dob') {
      if (!validateDob(value)) {
        setErrors(prev => ({
          ...prev,
          dob: 'You must be at least 16 years old'
        }));
      } else {
        setErrors(prev => ({ ...prev, dob: null }));
      }
    } else if (['gpa', 'gre_score', 'toefl_score', 'ielts_score'].includes(name)) {
      if (value && !validateScores[name](value)) {
        setErrors(prev => ({
          ...prev,
          [name]: `Invalid ${fieldLabels[name]}`
        }));
      } else {
        setErrors(prev => ({ ...prev, [name]: null }));
      }
    }
  };

  // Handle Enter key for form navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.type !== 'textarea' && e.target.type !== 'submit') {
      e.preventDefault();
      
      // Get all focusable form elements
      const focusableElements = Array.from(
        e.currentTarget.form.querySelectorAll(
          'input, select, textarea, button[type="submit"]'
        )
      );
      
      // Find the index of the current element
      const index = focusableElements.indexOf(e.target);
      
      // Focus the next element if it exists
      if (index > -1 && index < focusableElements.length - 1) {
        focusableElements[index + 1].focus();
      }
    }
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const newErrors = {};
    
    if (!validateDob(formData.dob)) {
      newErrors.dob = 'You must be at least 16 years old';
    }

    ['gpa', 'gre_score', 'toefl_score', 'ielts_score'].forEach(field => {
      if (formData[field] && !validateScores[field](formData[field])) {
        newErrors[field] = `Invalid ${fieldLabels[field]}`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

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
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={(e) => {
        // Close form when clicking the overlay (not the form itself)
        if (e.target === e.currentTarget) {
          onComplete();
        }
      }}
    >
      {/* Form container */}
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Close button */}
        <button
          type="button"
          onClick={onComplete}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close form"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold mb-6">Complete Your Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <RequiredLabel>Country</RequiredLabel>
            <Select
              options={countryOptions}
              value={countryOptions.find(option => option.label === formData.country)}
              onChange={(option) => handleChange(option, 'country')}
              className="mt-1"
              classNamePrefix="react-select"
              styles={customStyles}
              required
            />
          </div>

          <div>
            <RequiredLabel>Date of Birth</RequiredLabel>
            <input
              type="date"
              id="dob"
              name="dob"
              className={`mt-1 block w-full px-3 py-2 border rounded-md ${
                errors.dob ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.dob || ''}
              onChange={(e) => handleChange(e, 'dob')}
              onKeyDown={handleKeyDown}
              required
            />
            {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
          </div>

          <div>
            <RequiredLabel>Education Level</RequiredLabel>
            <CreatableSelect
              options={degreeOptions}
              value={degreeOptions.find(option => option.label === formData.education_level) || 
                (formData.education_level ? { value: formData.education_level.toLowerCase(), label: formData.education_level } : null)}
              onChange={(option) => handleChange(option, 'education_level')}
              className="mt-1"
              classNamePrefix="react-select"
              styles={customStyles}
              required
              placeholder="Select or type your education level..."
              formatCreateLabel={(inputValue) => `Use "${inputValue}"`}
              isClearable
            />
          </div>

          <div>
            <RequiredLabel>Major</RequiredLabel>
            <CreatableSelect
              options={majorOptions}
              value={majorOptions.find(option => option.label === formData.major) || 
                (formData.major ? { value: formData.major.toLowerCase(), label: formData.major } : null)}
              onChange={(option) => handleChange(option, 'major')}
              className="mt-1"
              classNamePrefix="react-select"
              styles={customStyles}
              required
              placeholder="Select or type your major..."
              formatCreateLabel={(inputValue) => `Use "${inputValue}"`}
              isClearable
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
              onKeyDown={handleKeyDown}
              className={`mt-1 block w-full px-3 py-2 border rounded-md ${
                errors.gpa ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.gpa && <p className="text-red-500 text-sm mt-1">{errors.gpa}</p>}
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
              onKeyDown={handleKeyDown}
              className={`mt-1 block w-full px-3 py-2 border rounded-md ${
                errors.gre_score ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.gre_score && <p className="text-red-500 text-sm mt-1">{errors.gre_score}</p>}
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
              onKeyDown={handleKeyDown}
              className={`mt-1 block w-full px-3 py-2 border rounded-md ${
                errors.toefl_score ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.toefl_score && <p className="text-red-500 text-sm mt-1">{errors.toefl_score}</p>}
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
              onKeyDown={handleKeyDown}
              className={`mt-1 block w-full px-3 py-2 border rounded-md ${
                errors.ielts_score ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.ielts_score && <p className="text-red-500 text-sm mt-1">{errors.ielts_score}</p>}
          </div>

          <div>
            <RequiredLabel>Profile Description</RequiredLabel>
            <textarea
              name="profile_description"
              value={formData.profile_description}
              onChange={handleChange}
              rows="3"
              onKeyDown={handleKeyDown}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* Add note about required fields */}
          <div className="text-sm text-gray-500 mt-4">
            <span className="text-red-500">*</span> = required field
          </div>

          <div className="flex mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

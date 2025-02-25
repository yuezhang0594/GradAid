import React, { useEffect, useState, useMemo } from 'react';
import Program from '../models/Program';
import programService from '../services/program';
import universityService from '../services/university';
import { dbDegreeOptions, majorOptions } from '../services/selectOptions';

const AddProgramForm = ({ onComplete }) => {
    const [universities, setUniversities] = useState([]);
    const [formData, setFormData] = useState({
        university_id: BigInt(0),
        program_name: '',
        degree_type: '',
        deadline: '',
        description: '',
        website: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchUniversities = async () => {
            try {
                const data = await universityService.getAllUniversities();
                setUniversities(data);
            } catch (error) {
                console.error('Failed to fetch universities:', error);
            }
        };

        fetchUniversities();
    }, []);

    const validateDeadline = (value) => {
        if (!value) return false;
        const date = new Date(value);
        const now = new Date();
        return !isNaN(date.getTime()) && date > now;
    }

    const validateWebsite = (value) => {
        if (!value) return true;
        const pattern = /^(https?:\/\/)?([\da-z.-]+)\.edu(\/[\w .-]*)*\/?$/;
        return pattern.test(value);
    };

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
        if (name === 'deadline') {
            if (!validateDeadline(value)) {
                setErrors(prev => ({
                    ...prev,
                    deadline: 'Deadline has already passed'
                }));
            } else {
                setErrors(prev => ({ ...prev, deadline: null }));
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.target.type !== 'textarea' && e.target.type !== 'submit') {
            e.preventDefault();
            const focusableElements = Array.from(
                e.currentTarget.form.querySelectorAll(
                    'input, select, textarea, button[type="submit"]'
                )
            );
            const index = focusableElements.indexOf(e.target);
            if (index > -1 && index < focusableElements.length - 1) {
                focusableElements[index + 1].focus();
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!validateDeadline(formData.deadline)) {
            newErrors.deadline = 'Invalid date';
        }
        if (!validateWebsite(formData.website)) {
            newErrors.website = 'Invalid URL. Must be an .edu domain';
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Ensure the website URL starts with http:// or https://
        let website = formData.website;
        if (website && !/^https?:\/\//i.test(website)) {
            website = `https://${website}`;
        }

        const newProgram = new Program({
            university_id: formData.university_id,
            program_name: formData.program_name,
            degree_type: formData.degree_type,
            deadline: formData.deadline,
            description: formData.description,
            application_fee: 0,
            website: website // Use the coerced website URL
        });

        try {
            await programService.addProgram(newProgram);
            onComplete();
        } catch (error) {
            alert('Failed to add program: ' + error, error);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" // Added z-50
            onClick={(e) => {
                // Close form when clicking the overlay (not the form itself)
                if (e.target === e.currentTarget) {
                    onComplete();
                }
            }}
        >
            {/* Form container */}
            <div className="bg-white p-6 rounded-lg w-96">
                <h3 className="text-lg font-semibold mb-4">Add New Program</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">University Name</label>
                        <select
                            name="university_id"
                            value={formData.university_id}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        >
                            <option value="" disabled>Select a university</option>
                            {universities.map((university_id) => (
                                <option key={university_id.university_id} value={university_id.university_id}>
                                    {university_id.university_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Degree Type</label>
                        <select
                            name="degree_type"
                            value={formData.degree_type}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        >
                            <option value="" disabled>Select a degree type</option>
                            {dbDegreeOptions.map((degree) => (
                                <option key={degree.id} value={degree.value}>
                                    {degree.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Program</label>
                        <select
                            name="program_name"
                            value={formData.program_name}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        >
                            <option value="" disabled>Select or write in the program</option>
                            {majorOptions.map((major) => (
                                <option key={major.id} value={major.value}>
                                    {major.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Deadline</label>
                        <input
                            type="date"
                            name="deadline"
                            value={formData.deadline}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            className={`mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.deadline ? 'border-red-500' : ''
                                }`}
                            required
                        />
                        {errors.deadline && <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            name="description"
                            rows="3"
                            value={formData.description}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Website</label>
                        <input
                            type="text"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            className={`mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.website ? 'border-red-500' : ''}`}
                        />
                        {errors.website && <p className="text-red-500 text-sm mt-1">{errors.website}</p>}
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => onComplete()}
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
    );
};

export default AddProgramForm;
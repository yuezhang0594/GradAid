import countryList from 'react-select-country-list';
import cipCodes from 'cip-codes';

export const degreeOptions = [
  { value: 'high_school', label: 'High School' },
  { value: 'associates', label: 'Associate\'s' },
  { value: 'bachelors', label: 'Bachelor\'s' },
  { value: 'masters', label: 'Master\'s' },
  { value: 'doctorate', label: 'Doctorate' }
];

// Generate major options from CIP codes
const generateMajorOptions = () => {
  const majorsList = [];

  Object.entries(cipCodes).forEach(([code, program]) => {
    // Only include programs that meet our criteria
    if (program.title && 
        !program.title.includes('Other') &&
        !program.title.includes('General') &&
        program.title.length < 50) {
      majorsList.push({
        value: program.title.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        label: program.title
      });
    }
  });

  return majorsList.sort((a, b) => a.label.localeCompare(b.label));
};

export const majorOptions = generateMajorOptions();

export const countryOptions = countryList().getData(); 
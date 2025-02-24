import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';

const ProgramCard = ({ program }) => {
  const [universityName, setUniversityName] = useState('');
  const [universityLocation, setUniversityLocation] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchUniversityDetails = async () => {
      const { data, error } = await supabase
        .from('University')
        .select('university_name, location')
        .eq('university_id', program.university_id)
        .single();

      if (error) {
        console.error('Error fetching university details:', error);
      } else {
        setUniversityName(data.university_name);
        setUniversityLocation(data.location);
      }
    };

    fetchUniversityDetails();
  }, [program.university_id]);

  return (
    <motion.div 
      className="relative h-36 cursor-pointer"
      whileHover={{ 
        scale: 1.05, 
        height: 'auto', 
        transition: { duration: 0.3, ease: "easeInOut" }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="bg-white rounded-lg shadow-lg p-3 h-full min-h-36">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0 mr-2">
            <h3 className={`text-base font-semibold ${isHovered ? '' : 'truncate'}`}>{universityName || program.university_id}</h3>
            <p className={`text-xs text-gray-600 ${isHovered ? '' : 'truncate'}`}>{universityLocation || undefined}</p>
            <p className={`text-xs text-gray-600 ${isHovered ? '' : 'truncate'}`}>{program.degree_type} in {program.program_name}</p>
            <p className={`text-xs text-gray-600 ${isHovered ? '' : 'truncate'}`}>{program.description}</p>
            <p className={`text-xs text-gray-600 ${isHovered ? '' : 'truncate'}`}>Deadline: {program.deadline}</p>
            <a href={program.website} className="text-xs font-semibold text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              {program.website}
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

ProgramCard.propTypes = {
  program: PropTypes.shape({
    university_id: PropTypes.number.isRequired,
    program_name: PropTypes.string.isRequired,
    website: PropTypes.string.isRequired,
  }).isRequired,
};

export default ProgramCard; 
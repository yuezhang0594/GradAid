import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ProgramCard = ({ program }) => {
  return (
    <motion.div className="relative h-36 cursor-pointer" whileHover={{ scale: 1.05 }}>
      <div className="absolute inset-0 bg-white rounded-lg shadow-lg p-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0 mr-2">
            <h3 className="text-base font-semibold truncate">{program.university}</h3>
            <p className="text-xs text-gray-600 truncate">{program.program}</p>
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
    university: PropTypes.string.isRequired,
    program: PropTypes.string.isRequired,
    website: PropTypes.string.isRequired,
  }).isRequired,
};

export default ProgramCard; 
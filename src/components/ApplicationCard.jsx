import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ApplicationCard = ({ application }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <motion.div 
      className="relative h-36 cursor-pointer" 
      onClick={flipCard} 
      whileHover={{ scale: 1.05 }}
    >
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front of card */}
        <div
          className={`absolute inset-0 bg-white rounded-lg shadow-lg p-3 backface-hidden
            ${isFlipped ? 'invisible' : ''}`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0 mr-2">
              <h3 className="text-base font-semibold truncate">{application.university}</h3>
              <p className="text-xs text-gray-600 truncate">{application.program}</p>
            </div>
            <span className={`flex-shrink-0 px-1.5 py-0.5 rounded-full text-xs ${
              application.status === 'Completed' ? 'bg-green-100 text-green-800' :
              application.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {application.status}
            </span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">Progress</span>
              <span className="text-xs font-semibold">{application.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full"
                style={{ width: `${application.progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div
          className={`absolute inset-0 bg-white rounded-lg shadow-lg p-3 backface-hidden
            ${!isFlipped ? 'invisible' : ''}`}
          style={{ transform: 'rotateY(180deg)' }}
        >
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Deadline:</span>
              <p className="text-xs font-medium">{application.deadline}</p>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">SOP:</span>
              <p className="text-xs font-medium">{application.sopStatus}</p>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">LOR:</span>
              <p className="text-xs font-medium">{application.lorStatus}</p>
            </div>
          </div>
          <div className="absolute bottom-3 right-3 flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Handle view SOP
              }}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              SOP
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Handle view LOR
              }}
              className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
            >
              LOR
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ApplicationCard;

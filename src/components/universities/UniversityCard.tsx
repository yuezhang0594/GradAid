import React, { useState } from 'react';
import { Heart, ChevronDown, ChevronUp, ExternalLink, Calendar, DollarSign, Award } from 'lucide-react';

interface UniversityCardProps {
  university: any;
  onSave: (universityId: string, programId?: string) => void;
  isFavorite: (universityId: string, programId?: string) => boolean;
}

const UniversityCard: React.FC<UniversityCardProps> = ({ 
  university, 
  onSave,
  isFavorite
}) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // Format a date from ISO string to readable format
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* University Header */}
      <div className="p-4 flex items-center justify-between border-b">
        <div>
          <h3 className="font-semibold text-lg">{university.name}</h3>
          <p className="text-sm text-gray-600">
            {university.location.city}, {university.location.state}, {university.location.country}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {university.ranking && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Rank #{university.ranking}
            </span>
          )}
          <button 
            onClick={() => onSave(university._id)}
            className={`rounded-full p-1 ${
              isFavorite(university._id) 
                ? "text-red-500 bg-red-50" 
                : "text-gray-400 hover:text-gray-500 bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <Heart className="h-5 w-5" fill={isFavorite(university._id) ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      {/* Programs List */}
      <div className="px-4 py-2">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Programs ({university.programs.length})</h4>
        
        {university.programs.slice(0, expanded ? undefined : 2).map((program: any) => (
          <div key={program.id} className="border rounded-md p-3 mb-2 bg-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <h5 className="font-medium">{program.degree} in {program.name}</h5>
                <p className="text-sm text-gray-600">{program.department}</p>
              </div>
              <button 
                onClick={() => onSave(university._id, program.id)}
                className={`rounded-full p-1 ${
                  isFavorite(university._id, program.id) 
                    ? "text-red-500 bg-red-50" 
                    : "text-gray-400 hover:text-gray-500 bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <Heart 
                  className="h-4 w-4" 
                  fill={isFavorite(university._id, program.id) ? "currentColor" : "none"} 
                />
              </button>
            </div>
            
            <div className="mt-2 grid grid-cols-1 gap-1 md:grid-cols-3 text-xs text-gray-500">
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                <span>Fall: {formatDate(program.deadlines.fall)}</span>
              </div>
              
              {program.tuition && (
                <div className="flex items-center">
                  <DollarSign className="h-3 w-3 mr-1" />
                  <span>${program.tuition.toLocaleString()}/year</span>
                </div>
              )}
              
              {program.acceptanceRate !== undefined && (
                <div className="flex items-center">
                  <Award className="h-3 w-3 mr-1" />
                  <span>{(program.acceptanceRate * 100).toFixed(1)}% acceptance</span>
                </div>
              )}
            </div>
            
            <div className="mt-2 flex flex-wrap gap-1">
              {program.requirements.gre && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  GRE Required
                </span>
              )}
              {program.requirements.toefl && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                  TOEFL Required
                </span>
              )}
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                GPA: {program.requirements.minimumGPA}+
              </span>
            </div>
          </div>
        ))}
        
        {/* Show more/less toggle */}
        {university.programs.length > 2 && (
          <button 
            className="text-sm text-primary flex items-center w-full justify-center py-2 hover:bg-gray-50 rounded-md"
            onClick={toggleExpanded}
          >
            {expanded ? (
              <>Show Less <ChevronUp className="ml-1 h-4 w-4" /></>
            ) : (
              <>Show {university.programs.length - 2} More <ChevronDown className="ml-1 h-4 w-4" /></>
            )}
          </button>
        )}
      </div>

      {/* University Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t flex justify-between items-center">
        <a 
          href={university.website} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-primary hover:text-primary-dark flex items-center"
        >
          Visit Website <ExternalLink className="ml-1 h-4 w-4" />
        </a>
        <a 
          href={`/universities/${university._id}`} 
          className="text-sm font-medium hover:text-primary-dark"
        >
          View Details
        </a>
      </div>
    </div>
  );
};

export default UniversityCard;

import React, { useState } from 'react';
import { Heart, ChevronDown, ChevronUp, ExternalLink, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Id, Doc } from 'convex/_generated/dataModel';

// Define the Program type based on the schema
type Program = Doc<"programs">

// Define the University type based on the schema
type University = Doc<"universities"> & {
  programs?: Program[];
};

interface UniversityCardProps {
  university: University;
  programs: Program[]; // Use the programs passed from parent
  onSave: (programId: Id<"programs">) => Promise<boolean>;
  isFavorite: (programId: Id<"programs">) => boolean;
}

/**
 * A card component that displays a university's information and its associated programs.
 * 
 * @component
 * @param {Object} props - The component props
 * @param {Object} props.university - The university object to display
 * @param {string} props.university._id - Unique identifier for the university
 * @param {string} props.university.name - Name of the university
 * @param {Object} props.university.location - Location information
 * @param {string} props.university.location.city - City where the university is located
 * @param {string} props.university.location.state - State where the university is located
 * @param {number|null} props.university.ranking - Numerical ranking of the university (optional)
 * @param {string} props.university.website - URL to the university's website
 * @param {Array<Program>} props.programs - List of programs offered by the university
 * @param {string} props.programs[].degree - Degree type (e.g., "Master's", "PhD")
 * @param {string} props.programs[].name - Name of the program
 * @param {string} props.programs[].department - Department offering the program
 * @param {string} props.programs[]._id - Unique identifier for the program
 * @param {Object} props.programs[].deadlines - Application deadlines
 * @param {string|null} props.programs[].deadlines.fall - Fall semester application deadline (ISO date string)
 * @param {number|undefined} props.programs[].tuition - Annual tuition cost
 * @param {number|undefined} props.programs[].acceptanceRate - Program acceptance rate (0-1)
 * @param {Object} props.programs[].requirements - Program requirements
 * @param {boolean} props.programs[].requirements.gre - Whether GRE is required
 * @param {boolean} props.programs[].requirements.toefl - Whether TOEFL is required
 * @param {number} props.programs[].requirements.minimumGPA - Minimum GPA requirement
 * @param {Function} props.onSave - Callback function when saving/favoriting a program
 * @param {Function} props.isFavorite - Function to check if a program is favorited
 * 
 * @returns {JSX.Element} The rendered university card component
 */
const UniversityCard: React.FC<UniversityCardProps> = ({
  university,
  programs,
  onSave,
  isFavorite
}) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // Format a date from ISO string to readable format
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A';
    
    const date = new Date(dateStr);
    
    // Check if the dateStr includes a year specification
    const hasYear = /\d{4}/.test(dateStr);
    
    // If no year is specified, set it to the next occurrence
    if (!hasYear) {
      const today = new Date();
      const currentYear = today.getFullYear();
      
      // Set the date to this year
      date.setFullYear(currentYear);
      
      // If this date has already passed this year, set to next year
      if (date < today) {
        date.setFullYear(currentYear + 1);
      }
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="pb-0">
      {/* University Header */}
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="text-left">
            <CardTitle>{university.name}</CardTitle>
            <CardDescription>
              {university.location.city}, {university.location.state}
            </CardDescription>
            {university.ranking && (
              <Badge variant="secondary">
                Rank #{university.ranking}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Programs List */}
      <CardContent>
        <div className="space-y-2">
          {programs.slice(0, expanded ? undefined : 2).map((program) => (
            <div key={program._id} className="border rounded-md p-3 bg-slate-50">
              <div className="flex justify-between items-start text-left">
                <div>
                  <h5 className="font-medium">{program.degree} in {program.name}</h5>
                  <p className="text-sm text-gray-600">{program.department}</p>
                </div>
                <Button
                  onClick={() => onSave(program._id)}
                  variant="ghost"
                  size="icon"
                  className={isFavorite(program._id) ? "text-red-500 h-8 w-8" : "text-gray-400 h-8 w-8"}
                >
                  <Heart
                    className="h-4 w-4"
                    fill={isFavorite(program._id) ? "currentColor" : "none"}
                  />
                </Button>
              </div>

              <div className="mt-2 grid grid-cols-1 gap-1 md:grid-cols-3 text-xs text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>Fall: {formatDate(program.deadlines.fall)}</span>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap gap-1">
                {program.requirements.gre && (
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                    GRE Required
                  </Badge>
                )}
                {program.requirements.toefl && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                    TOEFL Required
                  </Badge>
                )}
                <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                  GPA: {program.requirements.minimumGPA}+
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Show more/less toggle */}
        {programs.length > 2 && (
          <Button
            variant="ghost"
            className="w-full mt-2 text-sm justify-center"
            onClick={toggleExpanded}
          >
            {expanded ? (
              <>Show Less <ChevronUp className="ml-1 h-4 w-4" /></>
            ) : (
              <>Show {programs.length - 2} More <ChevronDown className="ml-1 h-4 w-4" /></>
            )}
          </Button>
        )}
      </CardContent>

      {/* University Footer */}
      <CardFooter className="flex justify-between items-center border-t p-3">
        <Button
          variant="link"
          asChild
          className="text-sm p-0"
        >
          <a
            href={university.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center"
          >
            Visit Website <ExternalLink className="ml-1 h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UniversityCard;

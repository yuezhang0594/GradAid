import React, { useState } from 'react';
import { Heart, ChevronDown, ChevronUp, ExternalLink, Calendar, DollarSign, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
    <Card>
      {/* University Header */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="text-left">
            <CardTitle>{university.name}</CardTitle>
            <CardDescription>
              {university.location.city}, {university.location.state}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {university.ranking && (
              <Badge variant="secondary">
                Rank #{university.ranking}
              </Badge>
            )}
            <Button
              onClick={() => onSave(university._id)}
              variant="ghost"
              size="icon"
              className={isFavorite(university._id) ? "text-red-500" : "text-gray-400"}
            >
              <Heart className="h-5 w-5" fill={isFavorite(university._id) ? "currentColor" : "none"} />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Programs List */}
      <CardContent className="pt-2">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Programs ({university.programs.length})</h4>

        <div className="space-y-2">
          {university.programs.slice(0, expanded ? undefined : 2).map((program: any) => (
            <div key={program.id} className="border rounded-md p-3 bg-slate-50">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-medium">{program.degree} in {program.name}</h5>
                  <p className="text-sm text-gray-600">{program.department}</p>
                </div>
                <Button
                  onClick={() => onSave(university._id, program.id)}
                  variant="ghost"
                  size="icon"
                  className={isFavorite(university._id, program.id) ? "text-red-500 h-8 w-8" : "text-gray-400 h-8 w-8"}
                >
                  <Heart
                    className="h-4 w-4"
                    fill={isFavorite(university._id, program.id) ? "currentColor" : "none"}
                  />
                </Button>
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
        {university.programs.length > 2 && (
          <Button
            variant="ghost"
            className="w-full mt-2 text-sm justify-center"
            onClick={toggleExpanded}
          >
            {expanded ? (
              <>Show Less <ChevronUp className="ml-1 h-4 w-4" /></>
            ) : (
              <>Show {university.programs.length - 2} More <ChevronDown className="ml-1 h-4 w-4" /></>
            )}
          </Button>
        )}
      </CardContent>

      {/* University Footer */}
      <CardFooter className="flex justify-between items-center border-t bg-slate-50 p-3">
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
        <Button
          variant="link"
          asChild
          className="text-sm font-medium p-0"
        >
          <a href={`/universities/${university._id}`}>
            View Details
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UniversityCard;

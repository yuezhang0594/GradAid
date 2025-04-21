import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, GraduationCapIcon, BriefcaseIcon, Globe2Icon } from "lucide-react";
import { Doc } from "../../convex/_generated/dataModel";
import { Button } from "./ui/button";
import formatDate from "@/lib/formatDate";

type Program = Doc<"programs">;

interface ProgramCardProps {
  program: Program;
  onSaveToFavorites?: (program: Program) => void;
  showUniversity?: boolean;
  universityName?: string;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ 
  program, 
  onSaveToFavorites,
  showUniversity = false,
  universityName 
}) => {
  const formattedDeadlines = [];
  
  if (program.deadlines?.fall) {
    formattedDeadlines.push(`Fall: ${formatDate(program.deadlines.fall)}`);
  }
  
  if (program.deadlines?.spring) {
    formattedDeadlines.push(`Spring: ${formatDate(program.deadlines.spring)}`);
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{program.name}</CardTitle>
        {showUniversity && universityName && (
          <div className="text-sm text-muted-foreground">{universityName}</div>
        )}
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        <div className="flex items-start gap-2">
          <GraduationCapIcon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium">Degree</div>
            <div className="text-sm text-muted-foreground">
              {program.degree} in {program.name}
            </div>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <BriefcaseIcon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium">Department</div>
            <div className="text-sm text-muted-foreground">{program.department}</div>
          </div>
        </div>
        
        {program.website && (
          <div className="flex items-start gap-2">
            <Globe2Icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">Website</div>
              <div className="text-sm text-muted-foreground">
                <a 
                  href={program.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Visit Program Website
                </a>
              </div>
            </div>
          </div>
        )}
        
        {formattedDeadlines.length > 0 && (
          <div className="flex items-start gap-2">
            <CalendarIcon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">Deadlines</div>
              <div className="text-sm text-muted-foreground">
                {formattedDeadlines.map((deadline, index) => (
                  <div key={index}>{deadline}</div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 mt-4">
          {program.requirements?.gre && (
            <Badge variant="outline">GRE Required</Badge>
          )}
          {program.requirements?.toefl && (
            <Badge variant="outline">TOEFL Required</Badge>
          )}
          {program.requirements?.minimumGPA && (
            <Badge variant="outline">Min GPA: {program.requirements.minimumGPA}</Badge>
          )}
          {program.requirements?.recommendationLetters && (
            <Badge variant="outline">{program.requirements.recommendationLetters} Letters of Rec</Badge>
          )}
        </div>
      </CardContent>
      
      {onSaveToFavorites && (
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => onSaveToFavorites(program)}
          >
            Save to Favorites
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ProgramCard;
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileTextIcon, ChevronUpIcon, ChevronDownIcon } from "lucide-react";
import { ClickableCard } from "./clickablecard";
import { Id } from "#/_generated/dataModel";

export interface DocumentStat {
  title: string;
  progress: number;
  status: string;
  university: string;
  program: string;
  type: string;
  documentId: string;
  applicationId: string | Id<"applications"> | undefined;
  lastEdited?: string;
  aiSuggestions?: number;
  action: {
    label: string;
    href: string;
    tooltip: string;
  };
}

interface DocumentStatsProps {
  documentStats: DocumentStat[];
  initialDocumentsToShow?: number;
}

// Helper function to format status text
function formatStatus(status: string): string {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function DocumentStats({ 
  documentStats, 
  initialDocumentsToShow = 4 
}: DocumentStatsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAllDocuments, setShowAllDocuments] = useState(false);

  const handleDocumentClick = (doc: DocumentStat) => {
    navigate(`/documents/${encodeURIComponent(doc.university)}/${doc.type.toLowerCase()}?documentId=${doc.documentId}`, {
      state: {
        applicationId: doc.applicationId,
        universityName: doc.university,
        returnPath: location.pathname
      }
    });
  };

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <FileTextIcon className="h-5 w-5 mr-2" />
          Application Documents
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/documents")}
          className="hover:bg-primary/10"
        >
          <span>View all</span>
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </h2>
      {documentStats.length === 0 && (
        <Card className="text-center py-16">
          <CardTitle>
            You haven't started any applications yet.
          </CardTitle>
          <CardDescription>
            You can start a new application on the 'Apply' or 'Saved Programs' pages.
          </CardDescription>
          <CardContent>
            <Button
              onClick={() => navigate("/saved")}
            >
              Start New Application
            </Button>
          </CardContent>
        </Card>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {documentStats
          .slice(0, showAllDocuments ? documentStats.length : initialDocumentsToShow)
          .map((document, index) => (
          <ClickableCard
            key={index}
            action={{
              ...document.action,
              href: document.action.href,
              onClick: () => handleDocumentClick(document)
            }}
          >
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm">{document.title}</CardTitle>
              </div>
              <CardDescription className="flex flex-col space-y-1 text-left">
                <span className="truncate max-w-[200px] text-xs text-muted-foreground text-left">{document.university}</span>
                <span className="truncate max-w-[200px] text-xs text-muted-foreground text-left">{document.program}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center">
                    <Badge
                      variant={
                        document.status === "Complete" || document.status === "completed" ? "default" : "secondary"
                      }
                    >
                      {formatStatus(document.status)}
                    </Badge>
                  </span>
                  <span>{document.progress}%</span>
                </div>
                <Progress value={document.progress} className="h-2" />
              </div>
            </CardContent>
          </ClickableCard>
        ))}
      </div>
      
      {/* Show More Button */}
      {documentStats.length > initialDocumentsToShow && (
        <div className="mt-4 flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => setShowAllDocuments(!showAllDocuments)}
            className="text-sm"
          >
            {showAllDocuments ? (
              <>
                <ChevronUpIcon className="h-4 w-4 mr-2" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDownIcon className="h-4 w-4 mr-2" />
                Show More ({documentStats.length - initialDocumentsToShow} more)
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

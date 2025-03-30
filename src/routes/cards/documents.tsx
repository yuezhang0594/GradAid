import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Helper function to format text
function formatText(text: string) {
  // Special cases for acronyms
  const upperCaseTypes = ['sop', 'cv'];
  if (upperCaseTypes.includes(text.toLowerCase())) {
    return text.toUpperCase();
  }

  // Normal case: capitalize each word
  return text
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

type Document = {
  type: string;
  status: "Complete" | "In Review" | "Draft";
  progress: number;
  count: number;
};

type University = {
  name: string;
  program: string;
  documents: Document[];
};

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [demoMode, setDemoMode] = useState(true);
  const universities = useQuery(api.applications.queries.getDocumentsByUniversity, { demoMode }) ?? [];

  const handleDocumentClick = (university: string, documentType: string) => {
    const universityId = university.toLowerCase().replace(/\s+/g, "-");
    navigate(`/applications/${universityId}/documents/${documentType.toLowerCase()}`);
  };

  return (
    <PageWrapper
      title="Documents"
      description={
        <div className="space-y-8">
          <div className="space-y-1">
            <p className="text-muted-foreground">View and manage application documents for each university</p>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="demo-mode"
              checked={demoMode}
              onCheckedChange={setDemoMode}
            />
            <Label htmlFor="demo-mode">Demo Mode</Label>
          </div>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(universities as University[]).map((uni) => (
          <Card key={uni.name} className="group flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg truncate" title={uni.name}>{uni.name}</CardTitle>
              <CardDescription className="truncate" title={uni.program}>{uni.program}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-8 flex-1">
                <div className="flex flex-wrap gap-2">
                  {uni.documents.length > 0 ? (
                    uni.documents.map((doc: Document, idx: number) => (
                      <div 
                        key={idx} 
                        className="flex items-center gap-2"
                        onClick={() => handleDocumentClick(uni.name, doc.type)}
                      >
                        <Badge 
                          variant={
                            doc.status === "Complete" ? "default" :
                            doc.status === "In Review" ? "secondary" : "outline"
                          }
                          className={cn(
                            "cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors",
                            doc.status === "Complete" && "hover:bg-primary/90",
                            doc.status === "In Review" && "hover:bg-primary/90",
                            doc.status === "Draft" && "hover:bg-primary"
                          )}
                        >
                          {formatText(doc.type)}
                        </Badge>
                        {doc.count > 1 && (
                          <span className="text-xs text-muted-foreground">
                            ({doc.count})
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div 
                      className="flex items-center gap-2 w-full"
                      onClick={() => handleDocumentClick(uni.name, "new")}
                    >
                      <Badge 
                        variant="secondary"
                        className="w-full cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center py-1"
                      >
                        Start Generate Doc
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="mt-auto space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Overall Progress</span>
                    <span>
                      {uni.documents.length > 0 
                        ? Math.round(uni.documents.reduce((acc: number, doc: Document) => acc + doc.progress, 0) / uni.documents.length)
                        : 0}%
                    </span>
                  </div>
                  <Progress 
                    value={uni.documents.length > 0 
                      ? uni.documents.reduce((acc: number, doc: Document) => acc + doc.progress, 0) / uni.documents.length 
                      : 0} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageWrapper>
  );
}

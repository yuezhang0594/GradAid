import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { CardWrapper } from "@/components/ui/card-wrapper";

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

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [demoMode, setDemoMode] = useState(true);
  const universities = useQuery(api.applications.queries.getDocumentsByUniversity, { demoMode }) ?? [];

  const handleDocumentClick = (universityName: string, documentType: string) => {
    const universityId = universityName.toLowerCase().replace(/\s+/g, "-");
    navigate(`/applications/${universityId}/documents/${documentType.toLowerCase()}`);
  };

  return (
    <PageWrapper
      title="Documents"
      description={
        <div className="space-y-4">
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {(universities as University[]).map((uni) => (
          <CardWrapper
            key={uni.name}
            title={uni.name}
            description={uni.program}
            badges={
              uni.documents.length > 0 
                ? uni.documents.map(doc => ({
                    text: formatText(doc.type),
                    count: doc.count,
                    variant: doc.status === "Complete" ? "default" :
                            doc.status === "In Review" ? "secondary" : "outline",
                    onClick: () => handleDocumentClick(uni.name, doc.type)
                  }))
                : [{
                    text: "Start Generate Doc",
                    variant: "secondary",
                    onClick: () => handleDocumentClick(uni.name, "new")
                  }]
            }
            progress={
              uni.documents.length > 0 
                ? {
                    value: Math.round(uni.documents.reduce((acc, doc) => acc + doc.progress, 0) / uni.documents.length),
                    label: "Overall Progress"
                  }
                : {
                    value: 0,
                    label: "Overall Progress"
                  }
            }
          />
        ))}
      </div>
    </PageWrapper>
  );
}

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { CardWrapper } from "@/components/ui/card-wrapper";
import { Id } from "../../../convex/_generated/dataModel";

type Document = {
  type: string;
  status: "Complete" | "In Review" | "Draft";
  progress: number;
  count: number;
  applicationId: Id<"applications">;
  program: string;
};

type Program = {
  name: string;
  applicationId: Id<"applications">;
};

type Card = {
  name: string;
  program: string;
  documents: Document[];
  applicationId: Id<"applications"> | undefined;
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

  // Transform data to create separate cards for multiple programs
  const cards = universities.flatMap((uni) => {
    // For universities with multiple programs, create separate cards
    if (uni.programs.length > 1) {
      return uni.programs.map((prog: Program) => ({
        name: uni.name,
        program: prog.name,
        documents: uni.documents.filter((doc: Document) => doc.applicationId === prog.applicationId),
        applicationId: prog.applicationId
      }));
    }
    // For universities with single program, keep as is
    return [{
      name: uni.name,
      program: uni.programs[0]?.name || "",
      documents: uni.documents,
      applicationId: uni.programs[0]?.applicationId
    }];
  });

  const handleDocumentClick = (applicationId: Id<"applications">, documentType: string) => {
    navigate(`/applications/${applicationId}/documents/${documentType.toLowerCase()}`);
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
        {cards.map((card: Card) => (
          <CardWrapper
            key={`${card.name}-${card.applicationId}`}
            title={card.name}
            description={card.program}
            badges={
              card.documents.length > 0 
                ? card.documents.map((doc: Document) => ({
                    text: formatText(doc.type),
                    count: doc.count,
                    variant: doc.status === "Complete" ? "default" :
                            doc.status === "In Review" ? "secondary" : "outline",
                    onClick: () => handleDocumentClick(card.applicationId!, doc.type)
                  }))
                : [{
                    text: "Start Generate Doc",
                    variant: "secondary",
                    onClick: () => handleDocumentClick(card.applicationId!, "new")
                  }]
            }
            progress={
              card.documents.length > 0 
                ? {
                    value: Math.round(card.documents.reduce((acc: number, doc: Document) => acc + doc.progress, 0) / card.documents.length),
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

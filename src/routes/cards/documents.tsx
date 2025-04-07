import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { CardWrapper } from "@/components/ui/card-wrapper";
import { Id } from "../../../convex/_generated/dataModel";
import { atom, useSetAtom } from "jotai";

export const documentEditorAtom = atom<{
  applicationId: Id<"applications"> | null;
  documentType: string | null;
  demoMode: boolean;
}>({
  applicationId: null,
  documentType: null,
  demoMode: false
});

interface Program {
  name: string;
  applicationId: Id<"applications">;
}

interface Document {
  type: string;
  status: string;
  progress: number;
  count: number;
  program: string;
}

interface Card {
  name: string;
  program: string;
  applicationId: Id<"applications">;
  documents: Array<{
    type: string;
    status: string;
    progress: number;
    count: number;
  }>;
}

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
  const [demoMode, setDemoMode] = useState(false);
  const universities = useQuery(api.applications.queries.getDocumentsByUniversity, { demoMode }) ?? [];
  const setDocumentEditor = useSetAtom(documentEditorAtom);

  // Transform data to create separate cards for multiple programs
  const cards = universities.flatMap((uni) => {
    return uni.programs.map((program: Program) => ({
      name: uni.name,
      program: program.name,
      applicationId: program.applicationId,
      documents: uni.documents
        .filter((doc: Document) => doc.program === program.name)
        .map((doc: Document) => ({
          type: doc.type,
          status: doc.status,
          progress: doc.progress,
          count: doc.count
        }))
    }));
  });

  const handleDocumentClick = (card: Card, documentType: string) => {
    console.log("Handling document click:", { card, documentType });
    if (card.applicationId) {
      const state = {
        applicationId: card.applicationId,
        documentType: documentType.toLowerCase(),
        demoMode
      };
      console.log("Setting editor state:", state);
      setDocumentEditor(state);
      navigate(`/applications/${encodeURIComponent(card.name)}/documents/${documentType.toLowerCase()}`);
    } else {
      console.error("No applicationId found for card:", card);
    }
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
                ? card.documents.map((doc) => ({
                    text: formatText(doc.type),
                    count: doc.count,
                    variant: doc.status === "Complete" ? "default" :
                            doc.status === "In Review" ? "secondary" : "outline",
                    onClick: () => handleDocumentClick(card, doc.type)
                  }))
                : [{
                    text: "Start Generate Doc",
                    variant: "secondary",
                    onClick: () => handleDocumentClick(card, "new")
                  }]
            }
            progress={
              card.documents.length > 0 
                ? {
                    value: Math.round(card.documents.reduce((acc: number, doc) => acc + doc.progress, 0) / card.documents.length),
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

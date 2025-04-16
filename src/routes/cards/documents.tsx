import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { CardWrapper } from "@/components/ui/card-wrapper";
import { Id } from "../../../convex/_generated/dataModel";
import { atom, useSetAtom } from "jotai";
import { DocumentStatus, DocumentType } from "convex/validators";

export const documentEditorAtom = atom<{
  applicationDocumentId: Id<"applicationDocuments"> | null;
}>({
  applicationDocumentId: null,
});

interface Program {
  name: string;
  applicationId: Id<"applications">;
}

interface Document {
  type: DocumentType;
  status: DocumentStatus;
  progress: number;
  count: number;
  program: string;
  documentId: Id<"applicationDocuments">;
}

interface Card {
  name: string;
  program: string;
  applicationId: Id<"applications">;
  documents: Array<{
    type: DocumentType;
    status: DocumentStatus;
    progress: number;
    count: number;
    documentId: Id<"applicationDocuments">;
  }>;
}

// Helper function to format text
function formatText(text: string) {
  // Special cases for acronyms
  const upperCaseTypes = ['sop', 'cv', 'lor'];
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
  const documents = useQuery(api.applications.queries.getDocumentDetails) ?? [];
  const setDocumentEditor = useSetAtom(documentEditorAtom);
  const createDocument = useMutation(api.applications.mutations.createDocument);

  // Transform data to create separate cards for multiple programs
  const cards = documents.flatMap((uni: { name: string, programs: Program[], documents: Document[] }) => {
    return uni.programs.map((program: Program) => ({
      name: uni.name,
      program: program.name,
      applicationId: program.applicationId,
      documents: uni.documents
        .filter((doc: Document) => doc.program === program.name)
        .map((doc: Document) => ({
          type: doc.type,
          status: doc.status,
          progress: doc.status.toLowerCase() === "complete" ? 100 : doc.progress ?? 0,
          count: doc.count,
          documentId: doc.documentId
        }))
    }));
  });

  const handleDocumentClick = async (documentId: Id<"applicationDocuments">, universityName: string, documentType: DocumentType) => {
    console.log("Handling document click:", { documentId, universityName, documentType });

    const state = {
      applicationDocumentId: documentId
    };
    console.log("Setting editor state:", state);
    setDocumentEditor(state);
    navigate(`/applications/${encodeURIComponent(universityName)}/documents/${documentType.toLowerCase()}`);
  };

  const handleNewDocumentClick = async (applicationId: Id<"applications">, universityName: string, documentType: DocumentType) => {
    const documentId = await createDocument({
      applicationId,
      type: documentType,
    });
    
    const state = {
      applicationDocumentId: documentId
    };
    console.log("Setting editor state:", state);
    setDocumentEditor(state);

    navigate(`/applications/${encodeURIComponent(universityName)}/documents/${documentType.toLowerCase()}`);
  };

    
  return (
    <PageWrapper
      title="Documents"
      description="View and manage application documents for each university"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card: Card) => (
          <CardWrapper
            key={`${card.name}-${card.applicationId}`}
            title={card.name}
            description={card.program}
            badges={[
              ...card.documents.map((doc) => ({
                text: formatText(doc.type),
                count: doc.count,
                variant: doc.status === "complete" ? "default" as const :
                  doc.status === "in_review" ? "secondary" as const : "outline" as const,
                onClick: () => handleDocumentClick(doc.documentId, card.name, doc.type)
              })),
              ...(card.documents.some(doc => doc.type.toLowerCase() === "sop") ? [] : [{
                text: "+ SOP",
                variant: "default" as const,
                onClick: () => handleNewDocumentClick(card.applicationId, card.name, "sop")
              }]),
              ...((() => {
                const MAX_LOR = 5;
                const lorCount = card.documents.filter(doc => doc.type.toLowerCase() === "lor").length;
                console.log(lorCount)
                if (lorCount < MAX_LOR) {
                  return [{
                    text: "+ LOR",
                    variant: "default" as const,
                    onClick: () => {handleNewDocumentClick(card.applicationId, card.name, "lor") }
                  }];
                }
                return [];
              })()),
            ]}
        progress={
          card.documents.length > 0
            ? {
              value: Math.round((card.documents.filter(doc => doc.status.toLowerCase() === "complete").length / card.documents.length) * 100),
              label: `${card.documents.filter(doc => doc.status.toLowerCase() === "complete").length}/${card.documents.length} Documents Complete`,
              hidePercentage: true
            }
            : {
              value: 0,
              label: "No Documents",
              hidePercentage: true
            }
        }
          />
        ))}
      </div>
    </PageWrapper>
  );
}


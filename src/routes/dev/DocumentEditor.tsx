import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { documentEditorAtom } from "../cards/documents";
import { toast } from "@/components/ui/toast";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageWrapper } from "@/components/ui/page-wrapper";
import {
  SparklesIcon,
  SaveIcon,
  ArrowLeftIcon,
  MessageSquareIcon,
  HistoryIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AIFeedback {
  id: string;
  type: "suggestion" | "correction" | "improvement";
  content: string;
  section: string;
  status: "pending" | "accepted" | "rejected";
}

interface DocumentVersion {
  id: string;
  date: string;
  changes: string;
}

export default function DocumentEditor() {
  const navigate = useNavigate();
  const editorState = useAtomValue(documentEditorAtom);
  
  const document = editorState.applicationDocumentId ? useQuery(api.applications.queries.getDocumentById, {
    applicationDocumentId: editorState.applicationDocumentId,
    demoMode: editorState.demoMode
  }) : null;
  console.log("Document:", document);
  console.log("Editor State:", editorState);

  if (!editorState.applicationDocumentId) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">Please configure application documents first</h2>
          <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const formatDocumentType = (type: string) => {
    if (!type) return "Document";
    
    const lowerType = type.toLowerCase();
    if (lowerType === "sop") {
      return "Statement of Purpose";
    }
    if (lowerType === "cv") {
      return "Curriculum Vitae";
    }
    if (lowerType === "lor") {
      return "Letter of Recommendation";
    }

    // Replace underscores and hyphens with spaces
    const words = type.replace(/[_-]/g, ' ').split(' ');
    
    // Capitalize first letter of each word
    return words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formatLastEdited = (dateString: string | undefined) => {
    if (!dateString) return "Not edited";
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  const EXAMPLE_TEXT = `Dear Graduate Admissions Committee,

I am writing to express my strong interest in the Master of Science program in Computer Science at Stanford University. With my background in software engineering and my passion for artificial intelligence research, I believe I would be an excellent fit for your program.

During my undergraduate studies at UNAM, I developed a strong foundation in computer science fundamentals...`;

  const [content, setContent] = useState(EXAMPLE_TEXT);

  useEffect(() => {
    if (document?.content) {
      setContent(document.content);
    }
  }, [document?.content]);

  const [isSaving, setIsSaving] = useState(false);

  const saveDocument = useMutation(api.applications.mutations.saveDocumentDraft);

  const handleSave = useCallback(async () => {
    if (!editorState.applicationDocumentId) {
      console.error("Missing required state for saving:", editorState);
      return;
    }
    setIsSaving(true);
    try {
      await saveDocument({
        applicationDocumentId: editorState.applicationDocumentId,
        content,
        demoMode: editorState.demoMode
      });
      toast({
        title: "Document saved successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error("Error saving document:", error);
      toast({
        title: "Error saving document",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [content, editorState, saveDocument]);

  // Mock AI feedback and versions until we implement those features
  const mockData = {
    versions: [
      {
        id: "1",
        date: "2025-03-09",
        changes: "Added research experience section and AI projects",
      },
      {
        id: "2",
        date: "2025-03-08",
        changes: "Initial draft with academic background",
      },
    ] as DocumentVersion[],
  };

  return (
    <PageWrapper
      title={formatDocumentType(document?.type ?? "Document")}
      description={
        <>
          <p className="text-muted-foreground mb-4">
            {document ? formatDocumentType(document.type) : "Loading..."}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => navigate(`/applications`)}
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Applications
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={handleSave}
                disabled={isSaving}
              >
                <SaveIcon className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Draft"}
              </Button>
              {/* <Button
                variant="default"
                size="sm"
                className="h-8"
                onClick={handleSubmit}
              >
                Submit for Review
              </Button> */}
            </div>
          </div>
        </>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Editor</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Last edited: {formatLastEdited(document?.lastEdited)}
                  </Badge>
                  <Badge variant={document?.status === "complete" ? "default" : "secondary"}>
                  {(document?.status ?? "draft").replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[600px] font-mono resize-none"
                placeholder="Start writing your document..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">

          {/* Version History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HistoryIcon className="h-4 w-4" />
                Version History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-4">
                  {mockData.versions.map((version) => (
                    <div
                      key={version.id}
                      className="flex justify-between items-center p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {new Date(version.date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {version.changes}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}

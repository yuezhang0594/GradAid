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
  
  const document = editorState.applicationId ? useQuery(api.applications.queries.getDocumentById, {
    applicationId: editorState.applicationId,
    documentType: editorState.documentType ?? "",
    demoMode: editorState.demoMode
  }) : null;
  console.log("Document:", document);
  console.log("Editor State:", editorState);

  const formatDocumentType = (type: string) => {
    if (!type) return "Document";
    
    const lowerType = type.toLowerCase();
    if (lowerType === "sop") {
      return "SOP";
    }
    if (lowerType === "cv") {
      return "CV";
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
    if (!editorState.applicationId || !editorState.documentType) {
      console.error("Missing required state for saving:", editorState);
      return;
    }

    setIsSaving(true);
    try {
      await saveDocument({
        applicationId: editorState.applicationId,
        documentType: editorState.documentType,
        content,
        demoMode: editorState.demoMode
      });
      toast({
        title: "Document saved",
        description: "Your changes have been saved successfully.",
        duration: 3000
      });
    } catch (error) {
      console.error("Error saving document:", error);
      toast({
        title: "Error saving document",
        description: "There was a problem saving your changes. Please try again.",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setIsSaving(false);
    }
  }, [editorState, content, saveDocument, toast]);

  const handleSubmit = useCallback(async () => {
    // In real app, submit document for review and update status
  }, []);

  // Mock AI feedback and versions until we implement those features
  const mockData = {
    aiCreditsUsed: 50,
    aiFeedback: [
      {
        id: "1",
        type: "suggestion",
        content: "Consider adding more specific details about your research experience in AI and machine learning projects",
        section: "Research Background",
        status: "pending",
      },
      {
        id: "2",
        type: "improvement",
        content: "Strengthen the connection between your past work and future research goals at Stanford",
        section: "Career Goals",
        status: "accepted",
      },
      {
        id: "3",
        type: "correction",
        content: "Fix grammar in the third paragraph discussing your technical contributions",
        section: "Introduction",
        status: "rejected",
      },
    ] as AIFeedback[],
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
            {document ? `${document.university} - ${document.program}` : "Loading..."}
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
                  <Badge variant="secondary" className="text-xs">
                    <SparklesIcon className="h-3 w-3 mr-1" />
                    {mockData.aiCreditsUsed} AI credits used
                  </Badge>
                  <Badge variant={document?.status === "complete" ? "default" : "secondary"}>
                    {document?.status ?? "draft"}
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
          {/* AI Feedback */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SparklesIcon className="h-4 w-4" />
                AI Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] w-full max-w-[600px] p-4">
                <div className="space-y-4 min-w-[100px]">
                  {mockData.aiFeedback.map((feedback) => (
                    <div
                      key={feedback.id}
                      className="p-4 rounded-lg bg-muted/50 space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="text-xs px-2 py-1">
                          {feedback.section}
                        </Badge>
                        <Badge
                          variant={
                            feedback.status === "accepted"
                              ? "default"
                              : feedback.status === "rejected"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-xs px-2 py-1"
                        >
                          {feedback.status}
                        </Badge>
                      </div>
                      <p className="text-sm leading-relaxed">{feedback.content}</p>
                      {feedback.status === "pending" && (
                        <div className="flex gap-3 pt-1">
                          <Button variant="outline" size="sm" className="flex-1 h-8">
                            Reject
                          </Button>
                          <Button size="sm" className="flex-1 h-8">
                            Accept
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <Button variant="outline" size="sm" className="w-full mt-4">
                <MessageSquareIcon className="h-4 w-4 mr-2" />
                Get More Feedback
              </Button>
            </CardContent>
          </Card>

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

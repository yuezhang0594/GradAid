import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAtomValue, useSetAtom } from "jotai";
import { documentEditorAtom } from "../cards/documents";
import { toast } from "@/components/ui/toast";
import { Id } from "@/../convex/_generated/dataModel";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DocumentVersion {
  id: string;
  date: string;
  changes: string;
}

// Storage keys for persisting state
const STORAGE_KEYS = {
  content: 'documentEditor_content',
  recommenderName: 'documentEditor_recommenderName',
  recommenderEmail: 'documentEditor_recommenderEmail',
  documentId: 'documentEditor_documentId'
} as const;

export default function DocumentEditor() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const setEditorState = useSetAtom(documentEditorAtom);
  const editorState = useAtomValue(documentEditorAtom);
  
  // Get document ID from URL or editor state and convert to Convex ID type
  const documentId = (searchParams.get("documentId") || editorState.applicationDocumentId) as Id<"applicationDocuments"> | null;
  
  useEffect(() => {
    // Update URL when document ID changes
    if (editorState.applicationDocumentId) {
      setSearchParams({ documentId: editorState.applicationDocumentId });
    }
  }, [editorState.applicationDocumentId, setSearchParams]);

  useEffect(() => {
    // Restore editor state from URL on page load/refresh
    if (documentId && documentId !== editorState.applicationDocumentId) {
      setEditorState({
        applicationDocumentId: documentId,
        demoMode: editorState.demoMode
      });
    }
  }, [documentId, editorState.applicationDocumentId, editorState.demoMode, setEditorState]);

  const [showRecommenderDialog, setShowRecommenderDialog] = useState(false);

  // Initialize state from localStorage if available
  const [recommenderName, setRecommenderName] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.recommenderName);
    return saved || "";
  });

  const [recommenderEmail, setRecommenderEmail] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.recommenderEmail);
    return saved || "";
  });

  const [content, setContent] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.content);
    return saved || "";
  });

  const document = documentId ? useQuery(api.applications.queries.getDocumentById, {
    applicationDocumentId: documentId,
    demoMode: editorState.demoMode
  }) : null;

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (recommenderName) {
      localStorage.setItem(STORAGE_KEYS.recommenderName, recommenderName);
    } else {
      localStorage.removeItem(STORAGE_KEYS.recommenderName);
    }
  }, [recommenderName]);

  useEffect(() => {
    if (recommenderEmail) {
      localStorage.setItem(STORAGE_KEYS.recommenderEmail, recommenderEmail);
    } else {
      localStorage.removeItem(STORAGE_KEYS.recommenderEmail);
    }
  }, [recommenderEmail]);

  useEffect(() => {
    if (content) {
      localStorage.setItem(STORAGE_KEYS.content, content);
    } else {
      localStorage.removeItem(STORAGE_KEYS.content);
    }
  }, [content]);

  // Save document ID to track if user refreshes on a different document
  useEffect(() => {
    if (documentId) {
      const previousDocId = localStorage.getItem(STORAGE_KEYS.documentId);
      if (previousDocId !== documentId) {
        // Clear stored content when switching documents
        localStorage.removeItem(STORAGE_KEYS.content);
        localStorage.removeItem(STORAGE_KEYS.recommenderName);
        localStorage.removeItem(STORAGE_KEYS.recommenderEmail);
        setContent("");
        setRecommenderName("");
        setRecommenderEmail("");
      }
      localStorage.setItem(STORAGE_KEYS.documentId, documentId);
    }
  }, [documentId]);

  // Load initial document content
  useEffect(() => {
    if (document?.content && !content) {
      setContent(document.content);
    }
  }, [document, content]);

  const [isSaving, setIsSaving] = useState(false);

  const saveDocument = useMutation(api.applications.mutations.saveDocumentDraft);

  const handleSave = useCallback(async () => {
    if (!documentId) {
      console.error("Missing required state for saving:", editorState);
      return;
    }
    setIsSaving(true);
    try {
      await saveDocument({
        applicationDocumentId: documentId,
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
  }, [content, editorState, saveDocument, documentId]);

  const updateRecommender = useMutation(api.applications.mutations.updateRecommender);

  // Check if recommender info is needed when document loads
  useEffect(() => {
    if (document?.type === "lor" && (!document.recommenderName || !document.recommenderEmail)) {
      setShowRecommenderDialog(true);
    }
  }, [document]);

  // Pre-fill recommender info when editing
  useEffect(() => {
    if (document?.type === "lor" && document.recommenderName && document.recommenderEmail && !recommenderName && !recommenderEmail) {
      setRecommenderName(document.recommenderName);
      setRecommenderEmail(document.recommenderEmail);
    }
  }, [document, recommenderName, recommenderEmail]);

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

  const handleRecommenderSubmit = async () => {
    if (!document || !documentId) return;

    try {
      await updateRecommender({
        documentId: documentId,
        recommenderName,
        recommenderEmail,
        demoMode: editorState.demoMode
      });

      toast({
        title: "Success",
        description: "Recommender information saved successfully!",
        variant: "default",
      });
      setShowRecommenderDialog(false);
    } catch (error) {
      console.error("Error updating recommender:", error);
      toast({
        title: "Error",
        description: "Failed to save recommender information. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!documentId) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">Please configure application documents first</h2>
          <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  // Mock versions until we implement those features
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
              {document?.type === "lor" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => setShowRecommenderDialog(true)}
                >
                  <MessageSquareIcon className="h-4 w-4 mr-2" />
                  {document.recommenderName ? "Edit Recommender" : "Add Recommender"}
                </Button>
              )}
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

      {/* Recommender Dialog */}
      <Dialog open={showRecommenderDialog} onOpenChange={setShowRecommenderDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="space-y-3">
            <DialogTitle>Recommender Information</DialogTitle>
            <DialogDescription>
              Please provide the recommender's information for your Letter of Recommendation.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Recommender Name
              </Label>
              <Input
                id="name"
                value={recommenderName}
                onChange={(e) => setRecommenderName(e.target.value)}
                placeholder="Dr. John Doe"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Recommender Email
              </Label>
              <Input
                id="email"
                type="email"
                value={recommenderEmail}
                onChange={(e) => setRecommenderEmail(e.target.value)}
                placeholder="john.doe@university.edu"
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter className="mt-6 gap-2">
            <Button variant="outline" onClick={() => setShowRecommenderDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRecommenderSubmit}
              disabled={!recommenderName || !recommenderEmail}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}

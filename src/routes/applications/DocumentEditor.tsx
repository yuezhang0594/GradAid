import { useEffect } from "react";
import { SaveIcon, ArrowLeftIcon, MessageSquareIcon, HistoryIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useDocumentEditor } from "@/hooks/useDocumentEditor";
import { formatDocumentType, formatLastEdited } from "@/lib/formatDocument";
import { useGenerateStatementOfPurpose, useGenerateLetterOfRecommendation } from "@/hooks/useLLM";

export default function DocumentEditor() {
  const {
    state,
    setState,
    document,
    documentId,
    handleSave,
    handleBack,
    handleRecommenderSubmit
  } = useDocumentEditor();

  // LLM generation hooks
  const generateSOP = useGenerateStatementOfPurpose(document?.applicationId);
  const generateLOR = documentId ? useGenerateLetterOfRecommendation(documentId) : undefined;

  // Load initial document content
  useEffect(() => {
    if (document?.content) {
      setState(prev => ({ ...prev, content: document.content || "" }));
    }
  }, [document, setState]);

  // Load recommender info if it exists
  useEffect(() => {
    if (document?.type === "lor") {
      setState(prev => ({
        ...prev,
        recommenderName: document.recommenderName || "",
        recommenderEmail: document.recommenderEmail || ""
      }));
    }
  }, [document, setState]);

  // Show recommender dialog if needed
  useEffect(() => {
    if (document?.type === "lor" && (!document.recommenderName || !document.recommenderEmail)) {
      setState(prev => ({ ...prev, showRecommenderDialog: true }));
    }
  }, [document, setState]);

  if (!documentId) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <p>No document selected</p>
      </div>
    );
  }

  return (
    <PageWrapper
      title={formatDocumentType(document?.type ?? "Document")}
      description={
        <div className="flex flex-col items-center text-center">
          <p className="text-sm text-muted-foreground">
            Last edited: {formatLastEdited(document?.lastEdited)}
          </p>
        </div>
      }
    >
      <div className="space-y-6 mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              className="gap-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {document?.type === "lor" && (
              <Button
                variant="outline"
                onClick={() => setState(prev => ({ ...prev, showRecommenderDialog: true }))}
                className="gap-2"
              >
                <MessageSquareIcon className="h-4 w-4" />
                {document.recommenderName ? `Edit Recommender Info` : "Add Recommender Info"}
              </Button>
            )}
            {/* <Button
              variant="outline"
              className="gap-2"
            >
              <HistoryIcon className="h-4 w-4" />
              Version History
            </Button> */}
            <Button
              variant="outline"
              className="gap-2 transition-all duration-200 hover:bg-muted"
              disabled={state.isSaving || state.isGenerating}
              onClick={async () => {
                setState(prev => ({ ...prev, isGenerating: true }));
                try {
                  if (document?.type === "sop") {
                    await generateSOP();
                  } else if (document?.type === "lor" && generateLOR) {
                    await generateLOR(document.applicationId);
                  }
                } finally {
                  setState(prev => ({ ...prev, isGenerating: false }));
                }
              }}
            >
              {state.isGenerating && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {state.isGenerating ? "Generating..." : "Generate Document"}
            </Button>
            <Button
              variant="default"
              onClick={handleSave}
              disabled={state.isSaving || !state.content}
              className="gap-2"
            >
              <SaveIcon className="h-4 w-4" />
              {state.isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        <Card className="w-full">
          <CardContent className="p-0">
            <Textarea
              value={state.content}
              onChange={(e) => setState(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Start writing..."
              className="min-h-[550px] font-mono border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
            />
          </CardContent>
        </Card>

        <Dialog
          open={state.showRecommenderDialog}
          onOpenChange={(open) => setState(prev => ({ ...prev, showRecommenderDialog: open }))}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {document?.recommenderName ? 'Edit Recommender' : 'Add Recommender'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Please provide the recommender's information. They will receive an email with instructions.
              </p>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="recommenderName" className="text-sm font-medium">Name</Label>
                <Input
                  id="recommenderName"
                  value={state.recommenderName}
                  onChange={(e) => setState(prev => ({ ...prev, recommenderName: e.target.value }))}
                  placeholder="e.g., Dr. Jane Smith"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">Full name of your recommender</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="recommenderEmail" className="text-sm font-medium">Email</Label>
                <Input
                  id="recommenderEmail"
                  type="email"
                  value={state.recommenderEmail}
                  onChange={(e) => setState(prev => ({ ...prev, recommenderEmail: e.target.value }))}
                  placeholder="e.g., jane.smith@university.edu"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">Professional email address</p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setState(prev => ({ ...prev, showRecommenderDialog: false }))}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRecommenderSubmit}
                  disabled={state.isSaving || !state.recommenderName || !state.recommenderEmail}
                  className="flex-1"
                >
                  {state.isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageWrapper>
  );
}

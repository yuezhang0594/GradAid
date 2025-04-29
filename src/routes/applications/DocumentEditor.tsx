import { useEffect } from "react";
import {
  SaveIcon,
  ArrowLeftIcon,
  MessageSquareIcon,
  Loader2,
} from "lucide-react";
import {
  Button,
  Textarea,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Card,
  CardContent,
  PageWrapper,
} from "@/components/ui";
import { useDocumentEditor } from "@/hooks/useDocumentEditor";
import { formatDocumentType, formatLastEdited } from "@/lib/formatDocument";
import { AI_CREDITS_FOR_LOR, AI_CREDITS_FOR_SOP } from "#/validators";

export default function DocumentEditor() {
  const {
    state,
    setState,
    document,
    documentId,
    universityName,
    programDegree,
    programName,
    handleSave,
    handleBack,
    handleRecommenderSubmit,
    handleGenerateDocument,
    performDocumentGeneration,
  } = useDocumentEditor();

  // Load initial document content
  useEffect(() => {
    if (document?.content) {
      setState((prev) => ({ ...prev, content: document.content || "" }));
    }
  }, [document, setState]);

  // Load recommender info if it exists
  useEffect(() => {
    if (document?.type === "lor") {
      setState((prev) => ({
        ...prev,
        recommenderName: document.recommenderName || "",
        recommenderEmail: document.recommenderEmail || "",
      }));
    }
  }, [document, setState]);

  // Show recommender dialog if needed
  useEffect(() => {
    if (
      document?.type === "lor" &&
      (!document.recommenderName || !document.recommenderEmail)
    ) {
      setState((prev) => ({
        ...prev,
        showRecommenderDialog: true,
        showConfirmationNext: true,
      }));
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
        <>
          {universityName && (programName || programDegree)
            ? `${universityName} - ${programDegree} in ${programName}`
            : "Application Document"}
        </>
      }
    >
      <div className="space-y-4 sm:space-y-6 mx-auto max-w-4xl px-2 sm:px-0">
        <div className="flex items-center justify-between sm:flex-row flex-col gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handleBack}
              className="gap-2 w-full sm:w-auto"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </Button>
          </div>
          <div className="flex items-center gap-2 sm:flex-row flex-col w-full sm:w-auto">
            {document?.type === "lor" && (
              <Button
                variant="outline"
                onClick={() =>
                  setState((prev) => ({ ...prev, showRecommenderDialog: true }))
                }
                className="gap-2 w-full sm:w-auto"
              >
                <MessageSquareIcon className="h-4 w-4" />
                <span className="truncate">
                  {document.recommenderName
                    ? `Edit Recommender Info`
                    : "Add Recommender Info"}
                </span>
              </Button>
            )}
            <Button
              variant="outline"
              className="gap-2 transition-all duration-200 hover:bg-muted w-full sm:w-auto"
              disabled={state.isSaving || state.isGenerating}
              onClick={handleGenerateDocument}
            >
              {state.isGenerating && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <span className="truncate">
                {state.isGenerating ? "Generating..." : "Generate Document"}
              </span>
            </Button>
            <Button
              variant="default"
              onClick={handleSave}
              disabled={state.isSaving || !state.content}
              className="gap-2 w-full sm:w-auto"
            >
              <SaveIcon className="h-4 w-4" />
              <span className="truncate">
                {state.isSaving ? "Saving..." : "Save"}
              </span>
            </Button>
          </div>
        </div>

        <Card className="w-full">
          <CardContent className="p-0">
            <Textarea
              value={state.content}
              onChange={(e) =>
                setState((prev) => ({ ...prev, content: e.target.value }))
              }
              placeholder="Start writing..."
              className="min-h-[350px] sm:min-h-[350px] md:min-h-[400px] lg:min-h-[450px] font-mono border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-vertical"
            />
          </CardContent>
        </Card>

        {/* Last edited information */}
        <div className="flex justify-end text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
          <p>Last edited: {formatLastEdited(document?.lastEdited)}</p>
        </div>

        <Dialog
          open={state.showRecommenderDialog}
          onOpenChange={(open) =>
            setState((prev) => ({ ...prev, showRecommenderDialog: open }))
          }
        >
          <DialogContent className="sm:max-w-[425px] max-w-[90vw]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {document?.recommenderName
                  ? "Edit Recommender"
                  : "Add Recommender"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Please provide the recommender's information.
              </p>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label
                  htmlFor="recommenderName"
                  className="text-sm font-medium"
                >
                  Name
                </Label>
                <Input
                  id="recommenderName"
                  value={state.recommenderName}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      recommenderName: e.target.value,
                    }))
                  }
                  placeholder="e.g., Dr. James Bond"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Full name of your recommender
                </p>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="recommenderEmail"
                  className="text-sm font-medium"
                >
                  Email
                </Label>
                <Input
                  id="recommenderEmail"
                  type="email"
                  value={state.recommenderEmail}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      recommenderEmail: e.target.value,
                    }))
                  }
                  placeholder="e.g., james.bond@bu.edu"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Professional email address
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      showRecommenderDialog: false,
                    }))
                  }
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRecommenderSubmit}
                  disabled={
                    state.isSaving ||
                    !state.recommenderName ||
                    !state.recommenderEmail
                  }
                  className="flex-1"
                >
                  {state.isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Generate confirmation dialog */}
        <AlertDialog
          open={state.showConfirmationDialog}
          onOpenChange={(open) =>
            setState((prev) => ({ ...prev, showConfirmationDialog: open }))
          }
        >
          <AlertDialogContent className="sm:max-w-[425px] max-w-[90vw]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-semibold">
                Generate {formatDocumentType(document?.type ?? "Document")}
              </AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription className="space-y-2">
              <p>
                This will use{" "}
                <strong>
                  {document?.type === "sop"
                    ? AI_CREDITS_FOR_SOP
                    : AI_CREDITS_FOR_LOR}
                </strong>{" "}
                AI credits to generate a{" "}
                {document?.type === "sop"
                  ? "Statement of Purpose"
                  : "Letter of Recommendation"}{" "}
                based on your profile and application details.
              </p>
              <p className="text-red-500">
                Any existing content will be overwritten.
              </p>
            </AlertDialogDescription>
            <p className="text-sm font-medium">
              Do you want to proceed with generation?
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    showConfirmationDialog: false,
                  }))
                }
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={performDocumentGeneration}
                disabled={state.isGenerating}
                className="flex-1"
              >
                {state.isGenerating ? "Generating..." : "Generate"}
              </Button>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        {/* Generating Message */}
        <AlertDialog
          open={state.showGeneratingDialog}
          onOpenChange={(open) =>
            setState((prev) => ({ ...prev, showGeneratingDialog: open }))
          }
        >
          <AlertDialogContent className="sm:max-w-[425px] max-w-[90vw]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-semibold">
                Generating {formatDocumentType(document?.type ?? "Document")}
              </AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription>
              The AI is hard at work crafting a custom{" "}
              {formatDocumentType(document?.type ?? "Document")} for you. It may
              take up to a minute to finish.
            </AlertDialogDescription>
            <p className="text-sm text-medium">
              You may continue to work on other tasks while you wait, but please
              do not close the GradAid webpage until the task is complete.
            </p>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    showGeneratingDialog: false,
                  }))
                }
              >
                Confirm
              </Button>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageWrapper>
  );
}

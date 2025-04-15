import { useCallback, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAtomValue, useSetAtom } from "jotai";
import { documentEditorAtom } from "../store/document";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "@/components/ui/toast";
import { DocumentState } from "@/routes/applications/types";

export function useDocumentEditor() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const setEditorState = useSetAtom(documentEditorAtom);
  const editorState = useAtomValue(documentEditorAtom);
  
  // Document state
  const [state, setState] = useState<DocumentState>({
    content: "",
    recommenderName: "",
    recommenderEmail: "",
    showRecommenderDialog: false,
    isSaving: false
  });

  // Get document ID from URL
  const documentId = searchParams.get("documentId") as Id<"applicationDocuments"> | null;
  const demoMode = location.state?.demoMode ?? false;

  // Get document data
  const document = documentId ? useQuery(api.applications.queries.getDocumentById, {
    applicationDocumentId: documentId,
    demoMode
  }) : null;

  // Mutations
  const saveDocument = useMutation(api.applications.mutations.saveDocumentDraft);
  const updateRecommender = useMutation(api.applications.mutations.updateRecommender);

  const handleSave = useCallback(async () => {
    if (!documentId) {
      console.error("Missing required state for saving");
      return;
    }
    setState(prev => ({ ...prev, isSaving: true }));
    try {
      await saveDocument({
        applicationDocumentId: documentId,
        content: state.content,
        demoMode
      });
      toast({
        title: "Document saved successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error("Error saving document:", error);
      toast({
        title: "Error saving document",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setState(prev => ({ ...prev, isSaving: false }));
    }
  }, [documentId, state.content, demoMode, saveDocument]);

  const handleBack = useCallback(() => {
    // Clear document editor state
    setEditorState({
      applicationDocumentId: null,
      demoMode: editorState.demoMode
    });
    
    // Navigate back to the return path if available, otherwise to applications
    const returnPath = location.state?.returnPath || '/applications';
    navigate(returnPath, {
      state: {
        applicationId: location.state?.applicationId,
        universityName: location.state?.universityName,
        demoMode: location.state?.demoMode
      }
    });
  }, [navigate, setEditorState, editorState.demoMode, location.state]);

  const handleRecommenderSubmit = useCallback(async () => {
    if (!documentId) return;

    setState(prev => ({ ...prev, isSaving: true }));
    try {
      await updateRecommender({
        documentId,
        recommenderName: state.recommenderName,
        recommenderEmail: state.recommenderEmail,
        demoMode
      });

      toast({
        title: "Recommender info saved!",
        description: "An email will be sent to the recommender.",
        variant: "default",
      });
      setState(prev => ({ ...prev, showRecommenderDialog: false }));
    } catch (error) {
      console.error("Error updating recommender:", error);
      toast({
        title: "Error saving recommender info",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setState(prev => ({ ...prev, isSaving: false }));
    }
  }, [documentId, state.recommenderName, state.recommenderEmail, demoMode, updateRecommender]);

  return {
    state,
    setState,
    document,
    documentId,
    demoMode,
    handleSave,
    handleBack,
    handleRecommenderSubmit
  };
}

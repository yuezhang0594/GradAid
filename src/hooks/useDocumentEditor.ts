import { useCallback, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useSetAtom } from "jotai";
import { documentEditorAtom } from "../store/document";
import { useMutation, useQuery } from "convex/react";
import { api } from "#/_generated/api";
import { Id } from "#/_generated/dataModel";
import { toast } from "sonner";
import { DocumentState } from "@/routes/applications/types";

export function useDocumentEditor() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const setEditorState = useSetAtom(documentEditorAtom);
  // const editorState = useAtomValue(documentEditorAtom);

  // Document state
  const [state, setState] = useState<DocumentState>({
    content: "",
    recommenderName: "",
    recommenderEmail: "",
    showRecommenderDialog: false,
    isSaving: false,
    isGenerating: false
  });

  // Get document ID from URL
  const documentId = searchParams.get("documentId") as Id<"applicationDocuments"> | null;

  // Get document data
  const document = documentId ? useQuery(api.documents.queries.getDocumentById, {
    applicationDocumentId: documentId,
  }) : null;

  // Mutations
  const saveDocument = useMutation(api.documents.mutations.saveDocumentDraft);
  const updateRecommender = useMutation(api.documents.mutations.updateRecommender);
  const updateDocStatus = useMutation(api.documents.mutations.updateDocumentStatus);

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
      });
      
      // Update document status to draft
      await updateDocStatus({
        documentId: documentId,
        status: "draft",
      });
      
      toast.success("Document saved successfully!");
    } catch (error) {
      console.error("Error saving document:", error);
      toast.error("Error saving document", {
        description: "Please try again"
      });
    } finally {
      setState(prev => ({ ...prev, isSaving: false }));
    }
  }, [documentId, state.content, saveDocument, updateDocStatus]);

  const handleBack = useCallback(() => {
    // Clear document editor state
    setEditorState({
      applicationDocumentId: null,
    });

    // Navigate back to the return path if available, otherwise to applications
    const returnPath = location.state?.returnPath || '/applications';
    navigate(returnPath, {
      state: {
        applicationId: location.state?.applicationId,
        universityName: location.state?.universityName,
      }
    });
  }, [navigate, setEditorState, location.state]);

  const handleRecommenderSubmit = useCallback(async () => {
    if (!documentId) return;

    setState(prev => ({ ...prev, isSaving: true }));
    try {
      await updateRecommender({
        documentId,
        recommenderName: state.recommenderName,
        recommenderEmail: state.recommenderEmail
      });

      toast.success("Recommender info saved!", {
        description: "An email will be sent to the recommender."
      });
      setState(prev => ({ ...prev, showRecommenderDialog: false }));
    } catch (error) {
      console.error("Error updating recommender:", error);
      toast.error("Error saving recommender info", {
        description: "Please try again"
      });
    } finally {
      setState(prev => ({ ...prev, isSaving: false }));
    }
  }, [documentId, state.recommenderName, state.recommenderEmail, updateRecommender]);

  return {
    state,
    setState,
    document,
    documentId,
    handleSave,
    handleBack,
    handleRecommenderSubmit
  };
}

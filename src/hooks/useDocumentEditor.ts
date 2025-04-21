import { useCallback, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useSetAtom } from "jotai";
import { documentEditorAtom } from "../store/document";
import { useMutation, useQuery } from "convex/react";
import { api } from "#/_generated/api";
import { Id } from "#/_generated/dataModel";
import { toast } from "sonner";
import { DocumentState } from "@/routes/applications/types";
import { useGenerateStatementOfPurpose, useGenerateLetterOfRecommendation } from "./useLLM";

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
    showConfirmationDialog: false,
    showConfirmationNext: false,
    isSaving: false,
    isGenerating: false,
  });

  // Get document ID from URL
  const documentId = searchParams.get("documentId") as Id<"applicationDocuments"> | null;

  // Get document data
  const document = documentId ? useQuery(api.documents.queries.getDocumentById, {
    applicationDocumentId: documentId,
  }) : null;

  // Debug location state
  console.log("Location state:", location.state);
  
  // Get application ID from navigation state
  const applicationId = (location.state?.applicationId as Id<"applications"> | null) || null;
  console.log("Final application ID:", applicationId);

  // Get university name from location state
  const universityName = location.state?.universityName || '';
  console.log("University name from location state:", universityName);

  // Get application details if we have an applicationId
  const applicationDetails = applicationId ? useQuery(api.applications.queries.getApplicationDetails, {
    applicationId: applicationId,
  }) : null;
  console.log("Application details:", applicationDetails);
  
  // Extract program information
  const programDegree = applicationDetails?.degree || '';
  const programName = applicationDetails?.program || '';

  console.log("applicationId:", applicationId);
  console.log("applicationDetails:", applicationDetails);
  console.log("universityName:", universityName);
  console.log("programDegree:", programDegree);
  console.log("programName:", programName); 

  // Mutations
  const saveDocument = useMutation(api.documents.mutations.saveDocumentDraft);
  const updateRecommender = useMutation(api.documents.mutations.updateRecommender);
  const updateDocStatus = useMutation(api.documents.mutations.updateDocumentStatus);

  // LLM generation hooks
  const generateSOP = useGenerateStatementOfPurpose();
  const generateLOR = documentId
    ? useGenerateLetterOfRecommendation(documentId)
    : undefined;

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
      setState(prev => ({ ...prev, showRecommenderDialog: false, showConfirmationDialog: state.showConfirmationNext }));
    } catch (error) {
      console.error("Error updating recommender:", error);
      toast.error("Error saving recommender info", {
        description: "Please try again"
      });
    } finally {
      setState(prev => ({ ...prev, isSaving: false, showConfirmationNext: false }));
    }
  }, [documentId, state.recommenderName, state.recommenderEmail, updateRecommender]);

  // Handler for document generation
  const handleGenerateDocument = useCallback(async () => {
    if (!document) return;

    // Ensure recommender info is present for LOR
    if (
      document.type === "lor" &&
      (!state.recommenderName || !state.recommenderEmail)
    ) {
      setState((prev) => ({ ...prev, showRecommenderDialog: true, showConfirmationNext: true }));
      return;
    }

    // Show dialog to confirm generation
    setState((prev) => ({ ...prev, showConfirmationDialog: true }));
  }, [document, state.recommenderName, state.recommenderEmail]);

  // Handle actual document generation after confirmation
  const performDocumentGeneration = useCallback(async () => {
    // Prevent duplicate actions
    if (state.isGenerating) return;

    setState((prev) => ({
      ...prev,
      isGenerating: true,
      showConfirmationDialog: false,
    }));

    try {
      let success = false;
      if (document?.type === "sop") {
        success = (await generateSOP(document.applicationId)) !== null;
      } else if (document?.type === "lor" && generateLOR) {
        success = (await generateLOR(document.applicationId)) !== null;
      }

      // If document generation was successful, also save it
      if (success && state.content) {
        // Set saving state
        setState((prev) => ({
          ...prev,
          isSaving: true,
        }));
        try {
          await handleSave();
          // toast.success("Document saved successfully!");
        } catch (error) {
          console.error("Error saving generated document:", error);
        } finally {
          setState((prev) => ({ ...prev, isSaving: false }));
        }
      }
    } finally {
      setState((prev) => ({ ...prev, isGenerating: false }));
    }
  }, [document, state.content, state.isGenerating, handleSave]);


  return {
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
    generateSOP,
    generateLOR,
  };
}

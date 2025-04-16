import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Doc, Id } from "@/../convex/_generated/dataModel";
import { DocumentStatus, DocumentType } from "convex/validators";
import { toast } from "sonner";

interface ApplicationDocumentHookProps {
    documentId?: Id<"applicationDocuments"> | null;
}

type ApplicationDocument = Doc<"applicationDocuments">;
const AI_CREDITS_REQUIRED_FOR_SOP = 5;
const AI_CREDITS_REQUIRED_FOR_LOR = 3;

/**
 * Hook for managing application document state and operations
 */
export function useApplicationDocument({ documentId }: ApplicationDocumentHookProps = {}) {
    const [content, setContent] = useState<string>("");
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    // Fetch document data
    const document = useQuery(
        api.applications.queries.getDocumentById,
        documentId ? { applicationDocumentId: documentId } : "skip"
    );

    // Fetch AI credits remaining
    const aiCreditsRemaining = useQuery(api.aiCredits.queries.getAiCreditsRemaining);
    const aiCreditsRequired = document?.type === "sop" ? AI_CREDITS_REQUIRED_FOR_SOP : AI_CREDITS_REQUIRED_FOR_LOR;
    // Mutations
    const saveDocumentDraft = useMutation(api.applications.mutations.saveDocumentDraft);
    const updateDocumentStatus = useMutation(api.applications.mutations.updateDocumentStatus);

    // TODO: Implement generateDocumentContent in Convex
    const generateDocumentContent = useMutation(api.applications.mutations.generateDocumentContent);

    // Update content when document loads or changes
    useEffect(() => {
        if (document?.content) {
            setContent(document.content);
        }
    }, [document?.content]);

    // Save document content
    const saveDocument = useCallback(async () => {
        if (!documentId) {
            toast.error("Error saving document", {
                description: "Document ID is missing",
            });
            return;
        }

        setIsSaving(true);
        try {
            await saveDocumentDraft({
                applicationDocumentId: documentId,
                content,
            });

            toast.success("Document saved successfully!");
            return true;
        } catch (error) {
            toast.error("Error saving document", {
                description: "Please try again later"
            });
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [content, documentId, saveDocumentDraft]);

    // Update document status
    const updateStatus = useCallback(async (newStatus: DocumentStatus) => {
        if (!documentId) {
            toast.error("Missing document ID");
            return false;
        }

        try {
            await updateDocumentStatus({
                applicationDocumentId: documentId,
                status: newStatus,
            });

            toast.success(`Document marked as ${newStatus.replace(/_/g, ' ')}`);
            return true;
        } catch (error) {
            toast.error("Error updating document status", {
                description: "Please try again later"
            });
            return false;
        }
    }, [documentId, updateDocumentStatus]);

    // Generate new content for the document
    const generateContent = useCallback(async (documentId: Id<"applicationDocuments">) => {
        if (!documentId) {
            console.error("Missing document ID");
            return false;
        }

        if (!aiCreditsRemaining) {
            toast.error("Error fetching AI credits");
            return false;
        }
        if (aiCreditsRemaining < aiCreditsRequired) {
            toast.error("Insufficient AI credits to generate content.");
            return false;
        }

        setIsGenerating(true);
        try {
            // TODO: Implement this mutation in Convex
            const generatedContent = await generateDocumentContent({
                applicationDocumentId: documentId
            });

            if (generatedContent) {
                setContent(generatedContent);
                toast.success("Content generated successfully");
            }

            return true;
        } catch (error) {
            toast.error("Error generating content.", {
                description: "Please try again later."
            });
            return false;
        } finally {
            setIsGenerating(false);
        }
    }, [documentId, generateDocumentContent]);

    // Calculate document completion percentage
    const getCompletionPercentage = useCallback(() => {
        if (!document) return 0;
        return document.status === "complete" ? 100 : document.progress || 0;
    }, [document]);

    // Format document type for display
    const formatDocumentType = useCallback((type: DocumentType | undefined) => {
        if (!type) return "Document";

        const lowerType = type.toLowerCase();
        if (lowerType === "sop") return "Statement of Purpose";
        if (lowerType === "lor") return "Letter of Recommendation";

        return type
            .replace(/[_-]/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }, []);

    return {
        document,
        content,
        setContent,
        saveDocument,
        updateStatus,
        generateContent,
        isSaving,
        isGenerating,
        getCompletionPercentage,
        formatDocumentType,
    };
}

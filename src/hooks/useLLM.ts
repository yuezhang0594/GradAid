import { useCallback } from "react";
import { useQuery, useMutation, useAction, useConvex } from "convex/react";
import { api } from "#/_generated/api";
import { Doc, Id } from "#/_generated/dataModel";
import { AI_CREDITS_FOR_SOP, AI_CREDITS_FOR_LOR } from "#/validators";
import { toast } from "sonner";

type Program = Doc<"programs">;
type University = Doc<"universities">;
type Application = Doc<"applications">;
type userProfile = Doc<"userProfiles">;

// Helper function to transform userProfile data to match LLM service expectations
function transformUserProfileForLLM(userProfile: userProfile, userName: string) {
  if (!userProfile) return {};

  return {
    name: userName || "",
    current_location: userProfile.currentLocation || "",
    country_of_origin: userProfile.countryOfOrigin || "",
    native_language: userProfile.nativeLanguage || "",
    education_level: userProfile.educationLevel || "",
    major: userProfile.major || "",
    current_university: userProfile.university || "",
    gpa: userProfile.gpa?.toString() || "",
    gpa_scale: userProfile.gpaScale?.toString() || "",
    gre_verbal: userProfile.greScores?.verbal?.toString() || "",
    gre_quant: userProfile.greScores?.quantitative?.toString() || "",
    gre_aw: userProfile.greScores?.analyticalWriting?.toString() || "",
    english_test_type: userProfile.englishTest?.type || "",
    english_overall: userProfile.englishTest?.overallScore?.toString() || "",
    research_experience: userProfile.researchExperience || "",
    research_interests_str: userProfile.researchInterests?.join(", ") || "",
    target_degree: userProfile.targetDegree || "",
    intended_field: userProfile.intendedField || "",
    career_objectives: userProfile.careerObjectives || ""
  };
}

export function useGenerateStatementOfPurpose(applicationId?: Id<"applications">) {
  console.log("[useGenerateStatementOfPurpose] called with", { applicationId });
  const aiCreditsRemaining = useQuery(api.aiCredits.queries.getAiCreditsRemaining, {});
    const applicationDetails = useQuery(
      api.applications.queries.getApplicationDetails,
      applicationId ? { applicationId } : "skip"
    );
    const userProfile = useQuery(api.userProfiles.queries.getProfile, {});
    const generateSOP = useAction(api.services.llm.generateSOP);
    const saveDocumentDraft = useMutation(api.documents.mutations.saveDocumentDraft);
    const userName = useQuery(api.userProfiles.queries.getUserName, {});

    return useCallback(
      async () => {
        try {
          const details = applicationDetails;
          console.log("[useGenerateStatementOfPurpose] applicationDetails:", details);
          console.log("[useGenerateStatementOfPurpose] userProfile:", userProfile);

          if (!details || !userProfile) {
            toast.error("Application not found", {
              description: "Could not find the application for SOP generation."
            });
            return null;
          }
          // Use university and program directly from applicationDetails
          const university = details.university;
          const department = details.department;
          const program = details.program;
          console.log("[useGenerateStatementOfPurpose] university:", university);
          console.log("[useGenerateStatementOfPurpose] program:", program);
          if (!university || !program) {
            toast.error("Missing Data", {
              description: "University or program information is missing for this application."
            });
            return null;
          }
          const data = {
            profile: transformUserProfileForLLM(userProfile, userName || ""),
            program: {
              university,
              name: details.program,
              degree: details.degree,
              department
            }
          };
          console.log("[useGenerateStatementOfPurpose] data to generateSOP:", data);
          if (!aiCreditsRemaining || aiCreditsRemaining < AI_CREDITS_FOR_SOP) {
            toast.error("Insufficient AI Credits", {
              description: `You have ${aiCreditsRemaining} AI credits left. It takes ${AI_CREDITS_FOR_SOP} credits to generate a Statement of Purpose.`
            });
            return null;
          }
          const sop = await generateSOP(data);
          console.log("[useGenerateStatementOfPurpose] SOP output:", sop);
          if (sop) {
            // Find the SOP document in details.documents
            const sopDoc = Array.isArray(details.documents)
              ? details.documents.find((doc) => doc.type === "sop")
              : undefined;
            if (sopDoc && sopDoc._id) {
              await saveDocumentDraft({
                applicationDocumentId: sopDoc._id,
                content: sop,
              });
            } else {
              console.warn("[useGenerateStatementOfPurpose] No SOP document found to store SOP content.");
            }
            toast.success("Success", {
              description: "Statement of Purpose generated successfully!"
            });
          }
          return sop;
        } catch (error) {
          console.error('[useGenerateStatementOfPurpose] Error generating SOP:', error);
          toast.error("Error", {
            description: "Failed to generate Statement of Purpose. Please try again."
          });
          return null;
        }
      },
      [applicationDetails, userProfile, generateSOP, saveDocumentDraft, userName, aiCreditsRemaining]
    );
}

export function useGenerateLetterOfRecommendation(documentId: Id<"applicationDocuments">) {
  const aiCreditsRemaining = useQuery(api.aiCredits.queries.getAiCreditsRemaining, {});
  const documentInfo = useQuery(api.documents.queries.getDocumentById, { applicationDocumentId: documentId });
  const userProfile = useQuery(api.userProfiles.queries.getProfile, {});
  const generateLOR = useAction(api.services.llm.generateLOR);
  const userName = useQuery(api.userProfiles.queries.getUserName, {});
  const convex = useConvex();

  return useCallback(
    async (applicationId: Id<"applications">) => {
      try {
        if (!documentInfo || !userProfile) {
          toast.error("Missing Data", {
            description: "Could not fetch required document data. Please try again."
          });
          return null;
        }

        // Fetch application details directly from the API
        const applicationDetails = await convex.query(api.applications.queries.getApplicationDetails, {
          applicationId
        });

        if (!applicationDetails) {
          toast.error("Application Not Found", {
            description: "Could not find the application details needed for LOR generation."
          });
          return null;
        }

        // Fetch recommender info only when needed
        const recommender = await convex.query(api.documents.queries.getRecommender, { documentId });
        if (!recommender) {
          toast.error("Missing Recommender", {
            description: "Please assign a recommender before generating a Letter of Recommendation."
          });
          return null;
        }

        // Validate that recommender has required properties
        if (!recommender.name || !recommender.email) {
          toast.error("Incomplete Recommender Info", {
            description: "Recommender must have both name and email. Please update the recommender information."
          });
          return null;
        }

        const data = {
          profile: transformUserProfileForLLM(userProfile, userName || ""),
          university: {
            name: applicationDetails.university
          },
          program: {
            name: applicationDetails.program,
            degree: applicationDetails.degree,
            department: applicationDetails.department
          },
          recommender: {
            name: recommender.name,
            email: recommender.email
          }
        };

        console.log("[useGenerateLetterOfRecommendation] data to generateLOR:", data);

        // Check if AI credits are sufficient
        if (!aiCreditsRemaining || aiCreditsRemaining < AI_CREDITS_FOR_LOR) {
          toast.error("Insufficient AI Credits", {
            description: `You have ${aiCreditsRemaining} AI credits left. It takes ${AI_CREDITS_FOR_LOR} credits to generate a Letter of Recommendation.`
          });
          return null;
        }

        // Generate LOR using Convex action
        const lor = await generateLOR(data);

        if (lor) {
          // Save the generated LOR to the document
          if (documentInfo._id) {
            await convex.mutation(api.documents.mutations.saveDocumentDraft, {
              applicationDocumentId: documentInfo._id,
              content: lor,
            });

            // Update document status to draft
            await convex.mutation(api.documents.mutations.updateDocumentStatus, {
              documentId: documentInfo._id,
              status: "draft",
            });
          }

          toast.success("Success", {
            description: "Letter of Recommendation generated successfully!"
          });
        }

        return lor;
      } catch (error) {
        console.error('Error generating LOR:', error);
        toast.error("Error", {
          description: "Failed to generate Letter of Recommendation. Please try again."
        });
        return null;
      }
    },
    [userProfile, generateLOR, convex, documentId, documentInfo]
  );
}

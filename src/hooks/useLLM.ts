import { useCallback } from "react";
import { useQuery, useMutation, useAction, useConvex } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "../components/ui/toast";

interface Program {
  _id: Id<"programs">;
  name: string;
  degree: string;
  department: string;
}

interface University {
  _id: Id<"universities">;
  name: string;
  department: string;
}

interface Application {
  _id: Id<"applications">;
  universityId: Id<"universities">;
  programId: Id<"programs">;
  university: University;
  program: Program;
}

// Helper function to transform userProfile data to match LLM service expectations
function transformUserProfileForLLM(userProfile: any) {
  if (!userProfile) return {};
  
  return {
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
  const applicationDetails = useQuery(
    api.applications.queries.getApplicationDetails,
    applicationId ? { applicationId } : "skip"
  );
  const userProfile = useQuery(api.userProfiles.queries.getProfile, {});
  const generateSOP = useAction(api.services.llm.generateSOP);
  const saveDocumentDraft = useMutation(api.documents.mutations.saveDocumentDraft);

  return useCallback(
    async () => {
      try {
        const details = applicationDetails;
        console.log("[useGenerateStatementOfPurpose] applicationDetails:", details);
        console.log("[useGenerateStatementOfPurpose] userProfile:", userProfile);
        if (!details || !userProfile) {
          toast({
            title: "Application not found",
            description: "Could not find the application for SOP generation.",
            variant: "destructive"
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
          toast({
            title: "Missing Data",
            description: "University or program information is missing for this application.",
            variant: "destructive"
          });
          return null;
        }
        const data = {
          profile: transformUserProfileForLLM(userProfile),
          program: {
            university,
            name: details.program,
            degree: details.degree,
            department
          }
        };
        console.log("[useGenerateStatementOfPurpose] data to generateSOP:", data);
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
          toast({
            title: "Success",
            description: "Statement of Purpose generated successfully!",
            variant: "default"
          });
        }
        return sop;
      } catch (error) {
        console.error('[useGenerateStatementOfPurpose] Error generating SOP:', error);
        toast({
          title: "Error",
          description: "Failed to generate Statement of Purpose. Please try again.",
          variant: "destructive"
        });
        return null;
      }
    },
    [applicationDetails, userProfile, generateSOP, saveDocumentDraft]
  );
}

export function useGenerateLetterOfRecommendation(documentId: Id<"applicationDocuments">) {
  const documentInfo = useQuery(api.documents.queries.getDocumentById, { applicationDocumentId: documentId });
  const userProfile = useQuery(api.userProfiles.queries.getProfile, {});
  const generateLOR = useAction(api.services.llm.generateLOR);
  const convex = useConvex();

  return useCallback(
    async (applicationId: Id<"applications">) => {
      try {
        if (!documentInfo || !userProfile) {
          toast({
            title: "Missing Data",
            description: "Could not fetch required document data. Please try again.",
            variant: "destructive"
          });
          return null;
        }

        // Fetch application details directly from the API
        const applicationDetails = await convex.query(api.applications.queries.getApplicationDetails, { 
          applicationId 
        });
        
        if (!applicationDetails) {
          toast({
            title: "Application Not Found",
            description: "Could not find the application details needed for LOR generation.",
            variant: "destructive"
          });
          return null;
        }

        // Fetch recommender info only when needed
        const recommender = await convex.query(api.programs.search.getRecommender, { documentId });
        if (!recommender) {
          toast({
            title: "Missing Recommender",
            description: "Please assign a recommender before generating a Letter of Recommendation.",
            variant: "destructive"
          });
          return null;
        }

        const data = {
          profile: transformUserProfileForLLM(userProfile),
          university: {
            name: applicationDetails.university
          },
          program: {
            name: applicationDetails.program,
            degree: applicationDetails.degree,
            department: applicationDetails.department
          },
          recommender
        };
        
        console.log("[useGenerateLetterOfRecommendation] data to generateLOR:", data);
        
        // Generate LOR using Convex action
        const lor = await generateLOR(data);

        if (lor) {
          // Save the generated LOR to the document
          if (documentInfo._id) {
            await convex.mutation(api.documents.mutations.saveDocumentDraft, {
              applicationDocumentId: documentInfo._id,
              content: lor,
            });
          }
          
          toast({
            title: "Success",
            description: "Letter of Recommendation generated successfully!",
            variant: "default"
          });
        }

        return lor;
      } catch (error) {
        console.error('Error generating LOR:', error);
        toast({
          title: "Error",
          description: "Failed to generate Letter of Recommendation. Please try again.",
          variant: "destructive"
        });
        return null;
      }
    },
    [userProfile, generateLOR, convex, documentId, documentInfo]
  );
}

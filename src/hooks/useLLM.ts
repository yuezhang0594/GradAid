import { useCallback } from "react";
import { useQuery, useAction } from "convex/react";
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

export function useGenerateStatementOfPurpose(demoMode = false) {
  const applications = useQuery(api.dashboard.queries.getApplications, { demoMode });
  const userProfile = useQuery(api.users.current);
  const generateSOP = useAction(api.services.llm.generateSOP);

  return useCallback(
    async (applicationId: Id<"applications">) => {
      try {
        if (!applications || !userProfile) {
          throw new Error("Could not fetch required data");
        }

        const applicationData = applications.find(app => app._id === applicationId) as Application | undefined;
        if (!applicationData) {
          throw new Error("Application not found");
        }

        const data = {
          profile: userProfile,
          university: {
            name: applicationData.university.name,
            department: applicationData.university.department
          },
          program: {
            name: applicationData.program.name,
            degree: applicationData.program.degree,
            department: applicationData.program.department
          }
        };

        // Generate SOP using Convex action
        const sop = await generateSOP(data);

        if (sop) {
          toast({
            title: "Success",
            description: "Statement of Purpose generated successfully!",
            variant: "default"
          });
        }

        return sop;
      } catch (error) {
        console.error('Error generating SOP:', error);
        toast({
          title: "Error",
          description: "Failed to generate Statement of Purpose. Please try again.",
          variant: "destructive"
        });
        return null;
      }
    },
    [applications, userProfile, generateSOP]
  );
}

export function useGenerateLetterOfRecommendation(demoMode = false, documentId: Id<"applicationDocuments">) {
  const applications = useQuery(api.dashboard.queries.getApplications, { demoMode });
  const userProfile = useQuery(api.users.current);
  const recommender = useQuery(api.programs.search.getRecommender, { documentId });
  const generateLOR = useAction(api.services.llm.generateLOR);

  return useCallback(
    async (applicationId: Id<"applications">) => {
      try {
        if (!applications || !userProfile || !recommender) {
          throw new Error("Could not fetch required data");
        }

        const applicationData = applications.find(app => app._id === applicationId) as Application | undefined;
        if (!applicationData) {
          throw new Error("Application not found");
        }

        const data = {
          profile: userProfile,
          university: {
            name: applicationData.university.name,
            department: applicationData.university.department
          },
          program: {
            name: applicationData.program.name,
            degree: applicationData.program.degree,
            department: applicationData.program.department
          },
          recommender
        };

        // Generate LOR using Convex action
        const lor = await generateLOR(data);

        if (lor) {
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
    [applications, userProfile, recommender, generateLOR]
  );
}

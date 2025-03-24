import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "./../../../convex/_generated/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonalInfoStep } from "../onboarding/steps/personal-info";
import { EducationStep } from "../onboarding/steps/education";
import { TestScoresStep } from "../onboarding/steps/test-scores";
import { CareerGoalsStep } from "../onboarding/steps/career-goals";
import { Card } from "@/components/ui/card";

const STEPS = ["personal-info", "education", "test-scores", "career-goals"] as const;
type Step = (typeof STEPS)[number];

// Types matching Convex schema
interface PersonalInfo {
  countryOfOrigin: string;
  dateOfBirth: string;
  currentLocation: string;
  nativeLanguage: string;
}

interface Education {
  educationLevel: string;
  major: string;
  university: string;
  gpa: number;
  gpaScale: number;
  graduationDate: string;
  researchExperience?: string;
}

interface TestScores {
  greScores?: {
    verbal: number;
    quantitative: number;
    analyticalWriting: number;
    testDate: string;
  };
  englishTest?: {
    type: "TOEFL" | "IELTS";
    overallScore: number;
    sectionScores: Record<string, number>;
    testDate: string;
  };
}

interface CareerGoals {
  targetDegree: string;
  intendedField: string;
  researchInterests: string[];
  careerObjectives: string;
  targetLocations: string[];
  expectedStartDate: string;
  budgetRange?: string;
}

interface UserProfile {
  personalInfo: PersonalInfo;
  education: Education;
  testScores: TestScores;
  careerGoals: CareerGoals;
}

interface StepData {
  "personal-info": PersonalInfo;
  education: Education;
  "test-scores": TestScores;
  "career-goals": CareerGoals;
}

export function ProfileForm() {
  const [activeTab, setActiveTab] = useState<Step>("personal-info");

  // Skip profile query if no user is logged in
  const profile = useQuery(api.userProfiles.queries.getProfile, {});
  const savePersonalInfoMutation = useMutation(api.userProfiles.mutations.savePersonalInfo);
  const saveEducationMutation = useMutation(api.userProfiles.mutations.saveEducation);
  const saveTestScoresMutation = useMutation(api.userProfiles.mutations.saveTestScores);
  const saveCareerGoalsMutation = useMutation(api.userProfiles.mutations.saveCareerGoals);

  // Update active tab when profile changes
  useEffect(() => {
    if (profile) {
      // Determine which tab to show based on profile data
      if (!profile.countryOfOrigin || !profile.dateOfBirth || !profile.currentLocation || !profile.nativeLanguage) {
        setActiveTab("personal-info");
      } else if (!profile.educationLevel || !profile.major || !profile.university || !profile.gpa || !profile.graduationDate) {
        setActiveTab("education");
      } else if (!profile.targetDegree || !profile.intendedField || !profile.researchInterests || !profile.careerObjectives) {
        setActiveTab("career-goals");
      }
    }
  }, [profile]);

  const handleStepComplete = async <T extends keyof StepData>(step: T, data: StepData[T]): Promise<void> => {
    try {
      switch (step) {
        case "personal-info":
          await savePersonalInfoMutation(data as PersonalInfo);
          break;
        case "education":
          await saveEducationMutation(data as Education);
          break;
        case "test-scores":
          await saveTestScoresMutation(data as TestScores);
          break;
        case "career-goals":
          await saveCareerGoalsMutation(data as CareerGoals);
          break;
      }
      // Show success message
      console.log("Profile section updated successfully");
    } catch (error) {
      console.error("Error saving step data:", error);
      // You might want to show an error toast here
    }
  };

  // Transform Convex profile data to our UserProfile structure
  const data: UserProfile = {
    personalInfo: {
      countryOfOrigin: profile?.countryOfOrigin ?? "",
      dateOfBirth: profile?.dateOfBirth ?? "",
      currentLocation: profile?.currentLocation ?? "",
      nativeLanguage: profile?.nativeLanguage ?? ""
    },
    education: {
      educationLevel: profile?.educationLevel ?? "",
      major: profile?.major ?? "",
      university: profile?.university ?? "",
      gpa: profile?.gpa ?? 0,
      gpaScale: profile?.gpaScale ?? 4.0,
      graduationDate: profile?.graduationDate ?? "",
      researchExperience: profile?.researchExperience
    },
    testScores: {
      greScores: profile?.greScores ?? undefined,
      englishTest: profile?.englishTest ?? undefined
    },
    careerGoals: {
      targetDegree: profile?.targetDegree ?? "",
      intendedField: profile?.intendedField ?? "",
      researchInterests: profile?.researchInterests ?? [],
      careerObjectives: profile?.careerObjectives ?? "",
      targetLocations: profile?.targetLocations ?? [],
      expectedStartDate: profile?.expectedStartDate ?? "",
      budgetRange: profile?.budgetRange
    }
  };

  // Show loading state while profile is being fetched
  if (profile === undefined) {
    return (
      <Card className="w-full">
        <div className="p-6 text-center">Loading profile...</div>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Step)} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal-info">
            Personal Info
          </TabsTrigger>
          <TabsTrigger value="education">
            Education
          </TabsTrigger>
          <TabsTrigger value="test-scores">
            Test Scores
          </TabsTrigger>
          <TabsTrigger value="career-goals">
            Career Goals
          </TabsTrigger>
        </TabsList>

        <div className="p-6">
          <TabsContent value="personal-info">
            <PersonalInfoStep
              onComplete={(data) => handleStepComplete("personal-info", data)}
              initialData={data.personalInfo}
            />
          </TabsContent>

          <TabsContent value="education">
            <EducationStep
              onComplete={(data) => handleStepComplete("education", data)}
              initialData={data.education}
            />
          </TabsContent>

          <TabsContent value="test-scores">
            <TestScoresStep
              onComplete={(data) => handleStepComplete("test-scores", data)}
              initialData={data.testScores}
            />
          </TabsContent>

          <TabsContent value="career-goals">
            <CareerGoalsStep
              onComplete={(data) => handleStepComplete("career-goals", data)}
              initialData={data.careerGoals}
            />
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
}

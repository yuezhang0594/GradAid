import { useState, useEffect } from "react";
// import { useQuery } from "convex/react";
// import { api } from "@/convex/_generated/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonalInfoStep } from "../onboarding/steps/personal-info";
import { EducationStep } from "../onboarding/steps/education";
import { TestScoresStep } from "../onboarding/steps/test-scores";
import { CareerGoalsStep } from "../onboarding/steps/career-goals";
import { Card } from "@/components/ui/card";

const STEPS = ["personal", "education", "tests", "career"] as const;
type Step = (typeof STEPS)[number];

interface ProfileFormProps {
  userId?: string;
}

// Mock data for testing each step
const mockPersonalInfo = {
  countryOfOrigin: "United States",
  dateOfBirth: "1995-01-01",
  currentLocation: "Boston, MA",
  nativeLanguage: "English"
};

const mockEducation = {
  educationLevel: "Bachelor's",
  major: "Computer Science",
  university: "Sample University",
  gpa: 3.8,
  gpaScale: 4.0,
  graduationDate: "2024-05",
  researchExperience: "Worked on ML projects"
};

const mockTestScores = {
  greScores: {
    verbal: 160,
    quantitative: 165,
    analyticalWriting: 5.0,
    testDate: "2024-01-15"
  },
  englishTest: {
    type: "TOEFL" as const,
    overallScore: 105,
    sectionScores: {
      reading: 28,
      listening: 27,
      speaking: 25,
      writing: 25
    },
    testDate: "2024-01-20"
  }
};

const mockCareerGoals = {
  targetDegree: "PhD",
  intendedField: "Computer Science",
  researchInterests: ["Machine Learning", "Natural Language Processing"],
  careerObjectives: "Research Scientist in AI",
  targetLocations: ["United States", "Canada"],
  expectedStartDate: "2024-09",
  budgetRange: "$30,000 - $40,000"
};

export function ProfileForm({ userId }: ProfileFormProps) {
  const [activeTab, setActiveTab] = useState<Step>("personal");

  // const profile = useQuery(api.userProfiles.getProfile, { 
  //   userId: userId ?? "" 
  // });

  const handleStepComplete = () => {
    // In profile form, we don't automatically advance to next step
    // Just stay on the current tab and show success message
  };

  if (!userId) {
    return null;
  }

  return (
    <Card className="w-full">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Step)} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">
            Personal Info
          </TabsTrigger>
          <TabsTrigger value="education">
            Education
          </TabsTrigger>
          <TabsTrigger value="tests">
            Test Scores
          </TabsTrigger>
          <TabsTrigger value="career">
            Career Goals
          </TabsTrigger>
        </TabsList>

        <div className="p-6">
          <TabsContent value="personal">
            <PersonalInfoStep
              onComplete={handleStepComplete}
              userId={userId}
              initialData={mockPersonalInfo}
            />
          </TabsContent>

          <TabsContent value="education">
            <EducationStep
              onComplete={handleStepComplete}
              userId={userId}
              initialData={mockEducation}
            />
          </TabsContent>

          <TabsContent value="tests">
            <TestScoresStep
              onComplete={handleStepComplete}
              userId={userId}
              initialData={mockTestScores}
            />
          </TabsContent>

          <TabsContent value="career">
            <CareerGoalsStep
              onComplete={handleStepComplete}
              userId={userId}
              initialData={mockCareerGoals}
            />
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
}

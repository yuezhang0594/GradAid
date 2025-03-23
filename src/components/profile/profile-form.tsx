import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "./../../../convex/_generated/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonalInfoStep } from "../onboarding/steps/personal-info";
import { EducationStep } from "../onboarding/steps/education";
import { TestScoresStep } from "../onboarding/steps/test-scores";
import { CareerGoalsStep } from "../onboarding/steps/career-goals";
import { Card } from "@/components/ui/card";

const STEPS = ["personal", "education", "tests", "career"] as const;
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

export function ProfileForm() {
  const [activeTab, setActiveTab] = useState<Step>("personal");

  // Skip profile query if no user is logged in
  const profile = useQuery(api.userProfiles.queries.getProfile, {});

  // Use mock data if profile is not found
  const mockData: UserProfile = {
    personalInfo: {
      countryOfOrigin: "United States",
      dateOfBirth: "1995-01-01",
      currentLocation: "Boston, MA",
      nativeLanguage: "English"
    },
    education: {
      educationLevel: "Bachelor's",
      major: "Computer Science",
      university: "Sample University",
      gpa: 3.8,
      gpaScale: 4.0,
      graduationDate: "2024-05",
      researchExperience: "Worked on ML projects"
    },
    testScores: {
      greScores: {
        verbal: 160,
        quantitative: 165,
        analyticalWriting: 5.0,
        testDate: "2024-01-15"
      },
      englishTest: {
        type: "TOEFL",
        overallScore: 105,
        sectionScores: {
          reading: 28,
          listening: 27,
          speaking: 25,
          writing: 25
        },
        testDate: "2024-01-20"
      }
    },
    careerGoals: {
      targetDegree: "PhD",
      intendedField: "Computer Science",
      researchInterests: ["Machine Learning", "Natural Language Processing"],
      careerObjectives: "Research Scientist in AI",
      targetLocations: ["United States", "Canada"],
      expectedStartDate: "2024-09",
      budgetRange: "$30,000 - $40,000"
    }
  };

  const handleStepComplete = () => {
    // In profile form, we don't automatically advance to next step
    // Just stay on the current tab and show success message
  };

  // Transform Convex profile data to our UserProfile structure
  const data: UserProfile = profile ? {
    personalInfo: {
      countryOfOrigin: profile.countryOfOrigin,
      dateOfBirth: profile.dateOfBirth,
      currentLocation: profile.currentLocation,
      nativeLanguage: profile.nativeLanguage
    },
    education: {
      educationLevel: profile.educationLevel,
      major: profile.major,
      university: profile.university,
      gpa: profile.gpa,
      gpaScale: profile.gpaScale,
      graduationDate: profile.graduationDate,
      researchExperience: profile.researchExperience
    },
    testScores: {
      greScores: profile.greScores,
      englishTest: profile.englishTest
    },
    careerGoals: {
      targetDegree: profile.targetDegree,
      intendedField: profile.intendedField,
      researchInterests: profile.researchInterests,
      careerObjectives: profile.careerObjectives,
      targetLocations: profile.targetLocations,
      expectedStartDate: profile.expectedStartDate,
      budgetRange: profile.budgetRange
    }
  } : mockData;

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
              initialData={data.personalInfo}
            />
          </TabsContent>

          <TabsContent value="education">
            <EducationStep
              onComplete={handleStepComplete}
              initialData={data.education}
            />
          </TabsContent>

          <TabsContent value="tests">
            <TestScoresStep
              onComplete={handleStepComplete}
              initialData={data.testScores}
            />
          </TabsContent>

          <TabsContent value="career">
            <CareerGoalsStep
              onComplete={handleStepComplete}
              initialData={data.careerGoals}
            />
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
}

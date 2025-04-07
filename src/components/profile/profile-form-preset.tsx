import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Id } from "convex/_generated/dataModel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonalInfoStep } from "../onboarding/steps/personal-info";
import { EducationStep } from "../onboarding/steps/education";
import { TestScoresStep } from "../onboarding/steps/test-scores";
import { CareerGoalsStep } from "../onboarding/steps/career-goals";
import { Card } from "@/components/ui/card";

const STEPS = ["personal", "education", "tests", "career"] as const;
type Step = (typeof STEPS)[number];

interface ProfileFormProps {
  userId?: Id<"users">;
}

// Mock data matching verified frontend demo data
const mockPersonalInfo = {
  countryOfOrigin: "United States",
  dateOfBirth: "1995-01-01",
  currentLocation: "Boston, MA",
  nativeLanguage: "English"
};

const mockEducation = {
  educationLevel: "Bachelor's",
  major: "Computer Science",
  university: "Stanford University", // Updated to match first application
  gpa: 3.8,
  gpaScale: 4.0,
  graduationDate: "2024-05",
  researchExperience: "Worked on ML projects",
  documents: {
    sop: { status: "complete" },
    cv: { status: "complete" },
    transcripts: { status: "pending" },
    lors: { 
      received: 3, 
      total: 3,
      recommenders: [
        { name: "Prof. Johnson", status: "received" },
        { name: "Dr. Smith", status: "received" },
        { name: "Dr. Wilson", status: "received" }
      ]
    }
  }
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
  targetDegree: "MS",
  intendedField: "Computer Science",
  researchInterests: ["Machine Learning", "Natural Language Processing"],
  careerObjectives: "Research and Development in AI",
  targetLocations: ["United States"],
  expectedStartDate: "2025-09",
  budgetRange: "$30,000 - $40,000",
  applications: [
    {
      university: "Stanford University",
      program: "MS Computer Science",
      deadline: "2025-05-15",
      priority: "High",
      status: "Submitted",
      documents: {
        sop: "complete",
        lors: {
          status: "complete",
          count: "3/3",
          recommenders: [
            { name: "Prof. Johnson", status: "received" },
            { name: "Dr. Smith", status: "received" },
            { name: "Dr. Wilson", status: "received" }
          ]
        },
        cv: "complete",
        transcripts: "pending"
      }
    },
    {
      university: "MIT",
      program: "MS Artificial Intelligence",
      deadline: "2025-06-01",
      priority: "Medium",
      status: "Submitted",
      documents: {
        sop: "in progress",
        researchStatement: "pending",
        lors: "3/3"
      }
    },
    {
      university: "UC Berkeley",
      program: "MS Computer Science",
      deadline: "2025-06-15",
      priority: "Medium",
      status: "In Progress",
      documents: {
        sop: "in progress",
        researchStatement: "pending",
        lors: "0/3",
        cv: "in progress"
      }
    },
    {
      university: "Carnegie Mellon University",
      program: "MS Software Engineering",
      deadline: "2025-07-01",
      priority: "Medium",
      status: "In Progress",
      documents: {
        sop: "pending",
        transcripts: "pending",
        lors: "0/3",
        cv: "in progress"
      },
      notes: "Application window opens April 1st"
    },
    {
      university: "Georgia Tech",
      program: "MS Computer Science",
      deadline: "2025-07-15",
      priority: "Low",
      status: "In Progress",
      documents: {
        sop: "pending",
        researchStatement: "pending",
        lors: "0/3",
        cv: "in progress"
      },
      notes: "Rolling admissions"
    }
  ],
  documents: {
    sop: { status: "in review", progress: 75 },
    researchStatement: { status: "draft", progress: 45 },
    cv: { status: "complete", progress: 100 },
    lors: {
      stanford: {
        received: 3,
        total: 3,
        recommenders: [
          { name: "Prof. Johnson", status: "received" },
          { name: "Dr. Smith", status: "received" },
          { name: "Dr. Wilson", status: "received" }
        ]
      }
    }
  },
  activity: {
    last7Days: 12,
    types: ["document edits", "application updates", "LOR requests"]
  }
};

export function ProfileForm({ userId }: ProfileFormProps) {
  const [activeTab, setActiveTab] = useState<Step>("personal");
  const { user } = useUser();
  
  // If userId is provided (mock mode), use it, otherwise require a logged-in user
  if (!userId && !user) {
    return null;
  }

  const handleStepComplete = () => {
    // In profile form, we don't automatically advance to next step
    // Just stay on the current tab and show success message
  };

  // Always use mock data for now
  const data = {
    personalInfo: mockPersonalInfo,
    education: mockEducation,
    testScores: mockTestScores,
    careerGoals: mockCareerGoals
  };

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

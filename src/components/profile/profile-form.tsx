import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import * as Steps from "../onboarding/steps";
import { Card } from "@/components/ui/card";
import { useProfile } from "@/hooks/useProfile";
import type * as ProfileType from "./validators";

const STEPS = ["personal-info", "education", "test-scores", "career-goals"] as const;
type Step = (typeof STEPS)[number];

interface StepData {
  "personal-info": ProfileType.PersonalInfo;
  "education": ProfileType.Education;
  "test-scores": ProfileType.TestScores;
  "career-goals": ProfileType.CareerGoals;
}

export function ProfileForm() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Step>("personal-info");
  const [progress, setProgress] = useState(0);
  
  // Use the profile hook instead of direct Convex queries
  const { 
    profile, 
    savePersonalInfo, 
    saveEducation, 
    saveTestScores, 
    saveCareerGoals, 
    currentStep 
  } = useProfile();

  // Handler for tab changes that ensures type safety
  const handleTabChange = (value: string) => {
    if (STEPS.includes(value as Step)) {
      setActiveTab(value as Step);
    }
  };

  // Update active tab when profile changes
  useEffect(() => {
    if (profile && currentStep) {
      // Only update if currentStep is a valid step
      if (STEPS.includes(currentStep as Step)) {
        setActiveTab(currentStep as Step);
      }
       
      // Update progress based on current step
      switch (currentStep) {
        case "personal-info":
          setProgress(0);
          break;
        case "education":
          setProgress(25);
          break;
        case "test-scores":
          setProgress(50);
          break;
        case "career-goals":
          setProgress(75);
          break;
        case "complete":
          setProgress(100);
          break;
      }
    }
  }, [profile, currentStep]);

  const moveToNextStep = (currentStep: Step) => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex < STEPS.length - 1) {
      const nextStep = STEPS[currentIndex + 1];
      setActiveTab(nextStep);
      setProgress((currentIndex + 1) * 25);
    }
  };

  const handleStepComplete = async <T extends keyof StepData>(step: T, data: StepData[T]): Promise<void> => {
    try {
      let result;
      switch (step) {
        case "personal-info":
          result = await savePersonalInfo(data as ProfileType.PersonalInfo);
          moveToNextStep(step);
          break;
        case "education":
          result = await saveEducation(data as ProfileType.Education);
          moveToNextStep(step);
          break;
        case "test-scores":
          result = await saveTestScores(data as ProfileType.TestScores);
          moveToNextStep(step);
          break;
        case "career-goals":
          result = await saveCareerGoals(data as ProfileType.CareerGoals);
          navigate("/dashboard");
          break;
      }
      console.log("Profile section updated successfully");
    } catch (error) {
      console.error("Error saving step data:", error);
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
    <div className="space-y-2">
      {progress < 100 && (
        <Progress value={progress} className="w-full" />
      )}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="test-scores">Test Scores</TabsTrigger>
          <TabsTrigger value="career-goals">Career Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="personal-info">
          <Steps.PersonalInfoStep
            onComplete={(data) => handleStepComplete("personal-info", data)}
            initialData={profile.personalInfo}
          />
        </TabsContent>

        <TabsContent value="education">
          <Steps.EducationStep
            onComplete={(data) => handleStepComplete("education", data)}
            initialData={profile.education}
          />
        </TabsContent>

        <TabsContent value="test-scores">
          <Steps.TestScoresStep
            onComplete={(data) => handleStepComplete("test-scores", data)}
            initialData={profile.testScores}
          />
        </TabsContent>

        <TabsContent value="career-goals">
          <Steps.CareerGoalsStep
            onComplete={(data) => handleStepComplete("career-goals", data)}
            initialData={profile.careerGoals}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

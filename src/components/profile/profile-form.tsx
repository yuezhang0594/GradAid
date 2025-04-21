import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import * as Steps from "../onboarding/steps";
import { Card } from "@/components/ui/card";
import { useProfile } from "@/hooks/useProfile";
import type * as ProfileType from "./validators";

interface StepData {
  "personal-info": ProfileType.PersonalInfo;
  "education": ProfileType.Education;
  "test-scores": ProfileType.TestScores;
  "career-goals": ProfileType.CareerGoals;
}

export function ProfileForm() {
  const navigate = useNavigate();
  type TabValue = "personal-info" | "education" | "test-scores" | "career-goals";
  const [activeTab, setActiveTab] = useState<TabValue>("personal-info");
  const [progress, setProgress] = useState(0);
  
  // Use the profile hook instead of direct Convex queries
  const { 
    profile, 
    savePersonalInfo,
    saveEducation,
    saveTestScores,
    saveCareerGoals
  } = useProfile();

  useEffect(() => {
    if (profile) {
      const total = Object.keys(profile).length;
      const completed = Object.values(profile).filter(Boolean).length;
      setProgress((completed / total) * 100);
    }
  }, [profile]);

  // Handler for tab changes that ensures type safety
  const handleTabChange = (value: string) => {
    setActiveTab(value as TabValue);
  };

  const handleBack = () => {
    const steps: TabValue[] = ["personal-info", "education", "test-scores", "career-goals"];
    const currentIndex = steps.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(steps[currentIndex - 1]);
    }
  };

  const handleStepComplete = async <T extends keyof StepData>(step: T, data: StepData[T]): Promise<void> => {
    try {
      let response: { currentStep: string };
      
      // Save data based on step
      switch (step) {
        case "personal-info":
          response = await savePersonalInfo(data as ProfileType.PersonalInfo);
          setActiveTab(response.currentStep as TabValue);
          break;
        case "education":
          response = await saveEducation(data as ProfileType.Education);
          setActiveTab(response.currentStep as TabValue);
          break;
        case "test-scores":
          response = await saveTestScores(data as ProfileType.TestScores);
          setActiveTab(response.currentStep as TabValue);
          break;
        case "career-goals":
          response = await saveCareerGoals(data as ProfileType.CareerGoals);
          if (response.currentStep === "complete") {
            navigate("/dashboard");
          } else {
            setActiveTab(response.currentStep as TabValue);
          }
          break;
        default:
          return;
      }
    } catch (error) {
      console.error("Error saving step data:", error);
      // You might want to show an error toast here
    }
  };

  // Show loading state while profile is being fetched
  if (!profile) {
    return (
      <Card className="w-full">
        <div className="p-6 text-center">Loading profile...</div>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-2">
      {progress < 100 && (
        <Progress value={progress} className="w-full" />
      )}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4 text-xs sm:text-sm">
          <TabsTrigger value="personal-info">
            <span className="hidden sm:inline">Personal Info</span>
            <span className="sm:hidden">Personal</span>
          </TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="test-scores">
            <span className="hidden sm:inline">Test Scores</span>
            <span className="sm:hidden">Tests</span>
          </TabsTrigger>
          <TabsTrigger value="career-goals">
            <span className="hidden sm:inline">Career Goals</span>
            <span className="sm:hidden">Career</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal-info">
          <Steps.PersonalInfoStep
            onComplete={(data: ProfileType.PersonalInfo) => handleStepComplete("personal-info", data)}
            initialData={profile?.personalInfo}
            onBack={handleBack}
          />
        </TabsContent>
        
        <TabsContent value="education">
          <Steps.EducationStep
            onComplete={(data: ProfileType.Education) => handleStepComplete("education", data)}
            initialData={profile?.education}
            onBack={handleBack}
          />
        </TabsContent>
        
        <TabsContent value="test-scores">
          <Steps.TestScoresStep
            onComplete={(data: ProfileType.TestScores) => handleStepComplete("test-scores", data)}
            initialData={profile?.testScores}
            onBack={handleBack}
          />
        </TabsContent>
        
        <TabsContent value="career-goals">
          <Steps.CareerGoalsStep
            onComplete={(data: ProfileType.CareerGoals) => handleStepComplete("career-goals", data)}
            initialData={profile?.careerGoals}
            onBack={handleBack}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

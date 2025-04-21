import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { PersonalInfoStep } from "./steps/personal-info";
import { EducationStep } from "./steps/education";
import { TestScoresStep } from "./steps/test-scores";
import { CareerGoalsStep } from "./steps/career-goals";
import { useProfile } from "@/hooks/useProfile";
import type * as ProfileType from "../profile/validators";

const STEPS = ["personal-info", "education", "test-scores", "career-goals", "complete"] as const;
type Step = (typeof STEPS)[number];

type StepData = {
  "personal-info": ProfileType.PersonalInfo;
  "education": ProfileType.Education;
  "test-scores": ProfileType.TestScores;
  "career-goals": ProfileType.CareerGoals;
};

export function OnboardingForm() {
  const navigate = useNavigate();
  const { 
    profile,
    savePersonalInfo,
    saveEducation,
    saveTestScores,
    saveCareerGoals,
    currentStep
  } = useProfile();

  const [progress, setProgress] = useState(() => {
    // Calculate initial progress based on currentStep
    const stepIndex = STEPS.indexOf(currentStep as Step);
    return ((stepIndex + 1) * 20);
  });

  useEffect(() => {
    setActiveStep(currentStep as Step);
    const stepIndex = STEPS.indexOf(currentStep as Step);
    setProgress((stepIndex + 1) * 20);
  }, [currentStep]);

  const [activeStep, setActiveStep] = useState<Step>(currentStep as Step);

  const handleBack = () => {
    const currentIndex = STEPS.indexOf(activeStep);
    if (currentIndex > 0) {
      setActiveStep(STEPS[currentIndex - 1]);
    }
  };

  const handleStepComplete = async <T extends keyof StepData>(step: T, data: StepData[T]): Promise<void> => {
    try {
      let response: { currentStep: string };
      
      // Save data based on step
      switch (step) {
        case "personal-info":
          response = await savePersonalInfo(data as ProfileType.PersonalInfo);
          setActiveStep(response.currentStep as Step);
          break;
        case "education":
          response = await saveEducation(data as ProfileType.Education);
          setActiveStep(response.currentStep as Step);
          break;
        case "test-scores":
          response = await saveTestScores(data as ProfileType.TestScores);
          setActiveStep(response.currentStep as Step);
          break;
        case "career-goals":
          response = await saveCareerGoals(data as ProfileType.CareerGoals);
          if (response.currentStep === "complete") {
            navigate("/dashboard");
          } else {
            setActiveStep(response.currentStep as Step);
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Progress value={progress} className="w-full" />
      
      <Tabs value={activeStep} className="w-full">
        <TabsList className="grid w-full grid-cols-4 text-xs sm:text-sm">
          <TabsTrigger value="personal-info" disabled={activeStep !== "personal-info"}>
            <span className="hidden sm:inline">Personal Info</span>
            <span className="sm:hidden">Personal</span>
          </TabsTrigger>
          <TabsTrigger value="education" disabled={activeStep !== "education"}>
            Education
          </TabsTrigger>
          <TabsTrigger value="test-scores" disabled={activeStep !== "test-scores"}>
            <span className="hidden sm:inline">Test Scores</span>
            <span className="sm:hidden">Tests</span>
          </TabsTrigger>
          <TabsTrigger value="career-goals" disabled={activeStep !== "career-goals"}>
            <span className="hidden sm:inline">Career Goals</span>
            <span className="sm:hidden">Career</span>
          </TabsTrigger>
          {/* <TabsTrigger value="complete" disabled={activeStep !== "complete"}>
            <span className="hidden sm:inline">Complete</span>
            <span className="sm:hidden">Done</span>
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="personal-info">
          <PersonalInfoStep
            onComplete={(data: ProfileType.PersonalInfo) => handleStepComplete("personal-info", data)}
            initialData={profile?.personalInfo}
            onBack={handleBack}
          />
        </TabsContent>

        <TabsContent value="education">
          <EducationStep
            onComplete={(data: ProfileType.Education) => handleStepComplete("education", data)}
            initialData={profile?.education}
            onBack={handleBack}
          />
        </TabsContent>

        <TabsContent value="test-scores">
          <TestScoresStep
            onComplete={(data: ProfileType.TestScores) => handleStepComplete("test-scores", data)}
            initialData={profile?.testScores}
            onBack={handleBack}
          />
        </TabsContent>

        <TabsContent value="career-goals">
          <CareerGoalsStep
            onComplete={(data: ProfileType.CareerGoals) => handleStepComplete("career-goals", data)}
            initialData={profile?.careerGoals}
            onBack={handleBack}
          />
        </TabsContent>

        <TabsContent value="complete">
          Complete
        </TabsContent>
      </Tabs>
    </div>
  );
}

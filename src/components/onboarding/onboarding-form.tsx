import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PersonalInfoStep } from "./steps/personal-info";
import { EducationStep } from "./steps/education";
import { TestScoresStep } from "./steps/test-scores";
import { CareerGoalsStep } from "./steps/career-goals";
import { Progress } from "@/components/ui/progress";

const STEPS = ["personal", "education", "tests", "career"] as const;
type Step = (typeof STEPS)[number];

interface OnboardingFormProps {
  userId?: string;
}

export function OnboardingForm({ userId }: OnboardingFormProps) {
  const [currentStep, setCurrentStep] = useState<Step>("personal");
  const [progress, setProgress] = useState(25);
  const navigate = useNavigate();

  const handleStepComplete = (step: Step) => {
    const currentIndex = STEPS.indexOf(step);
    if (currentIndex < STEPS.length - 1) {
      const nextStep = STEPS[currentIndex + 1];
      setCurrentStep(nextStep);
      setProgress((currentIndex + 2) * 25);
    } else {
      // All steps completed
      navigate("/dashboard");
    }
  };

  return (
    <div className="space-y-6">
      <Progress value={progress} className="w-full" />
      
      <Tabs value={currentStep} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="tests">Test Scores</TabsTrigger>
          <TabsTrigger value="career">Career Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <PersonalInfoStep
            onComplete={() => handleStepComplete("personal")}
            userId={userId}
          />
        </TabsContent>

        <TabsContent value="education">
          <EducationStep
            onComplete={() => handleStepComplete("education")}
            userId={userId}
          />
        </TabsContent>

        <TabsContent value="tests">
          <TestScoresStep
            onComplete={() => handleStepComplete("tests")}
            userId={userId}
          />
        </TabsContent>

        <TabsContent value="career">
          <CareerGoalsStep
            onComplete={() => handleStepComplete("career")}
            userId={userId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

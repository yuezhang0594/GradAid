import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";

export default function OnboardingPage() {

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to GradAid</CardTitle>
        </CardHeader>
        <CardContent>
          <OnboardingForm  />
        </CardContent>
      </Card>
    </div>
  );
}

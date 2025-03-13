import { useUser } from "@clerk/clerk-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";

export default function OnboardingPage() {
  const { user } = useUser();

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to GradAid</CardTitle>
        </CardHeader>
        <CardContent>
          <OnboardingForm userId={user?.id} />
        </CardContent>
      </Card>
    </div>
  );
}

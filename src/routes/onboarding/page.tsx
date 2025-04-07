import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { PageWrapper } from "@/components/ui/page-wrapper";

export default function OnboardingPage() {
  return (
    <PageWrapper title="Welcome to GradAid">
      <OnboardingForm />
    </PageWrapper>
  );
}

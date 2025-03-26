import { ProfileForm } from "@/components/profile/profile-form";
import { PageWrapper } from "@/components/ui/page-wrapper";

export default function ProfilePage() {
  return (
    <PageWrapper 
      title="Personal Profile"
      description="Update your personal information and academic history"
    >
      <ProfileForm />
    </PageWrapper>
  );
}

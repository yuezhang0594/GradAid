import { useAuthActions } from "@convex-dev/auth/react";
import { GoogleLogo } from "@/assets/GoogleLogo";
import { Button } from "@/components/ui/button";

export function SignInWithGoogle({ redirectURL = "/" }: { redirectURL: string }) {
  const { signIn } = useAuthActions();
  return (
    <Button
      className="flex-1"
      variant="outline"
      type="button"
      onClick={() => void signIn("google", { redirectTo: redirectURL })}
    >
      <GoogleLogo className="mr-2 h-4 w-4" /> Google
    </Button>
  );
}

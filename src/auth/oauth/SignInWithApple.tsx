import { useAuthActions } from "@convex-dev/auth/react";
import { AppleLogo } from "@/assets/AppleLogo";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function SignInWithApple({redirectURL = "/"}: {redirectURL?: string}) {
  const { signIn } = useAuthActions();
  return (
    <Button
      className="flex-1"
      variant="outline"
      type="button"
      onClick={() => 
        toast.error("Sign in with Apple is currently unavailable.")
        // void signIn("apple", { redirectTo: redirectURL })
        }
    >
      <AppleLogo className="mr-2 h-4 w-4" /> Apple
    </Button>
  );
}

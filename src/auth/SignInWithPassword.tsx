import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export function SignInWithPassword({
  provider,
  handleSent,
  handlePasswordReset,
  handleFlow,
  customSignUp,
  passwordRequirements,
  currentStep = "signIn",
}: {
  provider?: string;
  handleSent?: (email: string) => void;
  handlePasswordReset?: () => void;
  handleFlow?: () => void;
  customSignUp?: React.ReactNode;
  passwordRequirements?: string;
  currentStep: "signIn" | "signUp" | { email: string } | "forgot";
}) {
  const { signIn } = useAuthActions();
  const [submitting, setSubmitting] = useState(false);
  return (
    <form
      className="flex flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitting(true);
        const formData = new FormData(event.currentTarget);
        signIn(provider ?? "password", formData)
          .then(() => {
            handleSent?.(formData.get("email") as string);
          })
          .catch((error) => {
            toast.error(
              error.message?.includes("Invalid password")
                ? "Password must be at least 8 characters long."
                : error.message?.includes("already exists")
                  ? `Account ${formData.get("email")} already exists.`
                  : currentStep === "signIn"
                    ? "Could not sign in, did you mean to sign up?"
                    : currentStep === "signUp"
                      ? "Could not sign up, did you mean to sign in?"
                      : "An error occurred, please try again."
            );
            setSubmitting(false);
          });
      }}
    >
      <label htmlFor="email">Email</label>
      <Input name="email" id="email" className="mb-4" autoComplete="email" />
      <div className="flex items-center justify-between">
        <label htmlFor="password">Password</label>
        {handlePasswordReset && currentStep === "signIn" ? (
          <Button
            className="p-0 h-auto"
            type="button"
            variant="link"
            onClick={handlePasswordReset}
          >
            Forgot your password?
          </Button>
        ) : null}
      </div>
      <Input
        type="password"
        name="password"
        id="password"
        autoComplete={currentStep === "signIn" ? "current-password" : "new-password"}
      />
      {
        currentStep === "signUp" && passwordRequirements !== null && (
          <span className="text-gray-500 font-thin text-sm">
            {passwordRequirements}
          </span>
        )
      }
      {currentStep === "signUp" && customSignUp}
      <input name="flow" value={currentStep === "signIn" ? "signIn" : "signUp"} type="hidden" />
      <Button type="submit" disabled={submitting} className="mt-4">
        {currentStep === "signIn"
          ? "Sign in"
          : currentStep === "signUp"
            ? "Sign up"
            : "Continue"
        }
      </Button>
      <div className="mt-4 text-center text-sm">
        {currentStep === "signIn"
          ? "Don't have an account?"
          : currentStep === "signUp"
            ? "Already have an account?"
            : "An error occurred, please try again."
        }{" "}
        <a
          href="#"
          className="underline underline-offset-4"
          onClick={handleFlow}
        >
          {currentStep === "signIn"
            ? "Sign up"
            : currentStep === "signUp"
              ? "Sign in"
              : ""}
        </a>
      </div>
    </form >
  );
}

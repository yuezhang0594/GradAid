import { useAuthActions } from "@convex-dev/auth/react";
import { CodeInput } from "@/auth/CodeInput";
import { ResetPasswordWithEmailCode } from "@/auth/ResetPasswordWithEmailCode";
import { SignInMethodDivider } from "@/auth/SignInMethodDivider";
import { SignInWithOAuth } from "@/auth/SignInWithOAuth";
import { SignInWithPassword } from "@/auth/SignInWithPassword";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

/**
 * Users choose between OAuth providers or email and password combo
 * with required email verification and optional password reset via OTP.
 */
export function SignInFormPasswordAndVerifyViaCode() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"signIn" | "signUp" | { email: string } | "forgot">(
    "signIn",
  );
  const [submitting, setSubmitting] = useState(false);
  return (
    <div className="max-w-[384px] mx-auto">
      <Card>
        {step === "signIn" ? (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Sign in</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-left w-full">
              <SignInWithOAuth />
              <SignInMethodDivider />
              <SignInWithPassword
                handleSent={(email) => setStep({ email })}
                handlePasswordReset={() => setStep("forgot")}
                handleFlow={() => setStep("signUp")}
                provider="password-code"
                currentStep={step}
              />
            </CardContent>
          </>
        ) : step === "signUp" ? (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Create an account</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-left w-full">
              <SignInWithPassword
                handleSent={(email) => setStep({ email })}
                handlePasswordReset={() => setStep("forgot")}
                handleFlow={() => setStep("signIn")}
                provider="password-code"
                currentStep={step}
              />
            </CardContent>
          </>
        ) : step === "forgot" ? (
          <CardContent className="flex flex-col gap-4 text-left w-full">
            <ResetPasswordWithEmailCode
              provider="password-code"
              handleCancel={() => setStep("signIn")}
            />
          </CardContent>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Check your email</CardTitle>
              <CardDescription>
                Enter the 8-digit code we sent to your email address.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="flex flex-col"
                onSubmit={(event) => {
                  event.preventDefault();
                  setSubmitting(true);
                  const formData = new FormData(event.currentTarget);
                  signIn("password-code", formData).catch((error) => {
                    console.error(error);
                    toast.error("Code could not be verified, try again");
                    setSubmitting(false);
                  });
                }}
              >
                <label htmlFor="email">Code</label>
                <CodeInput />
                <input name="email" value={step.email} type="hidden" />
                <input name="flow" value="email-verification" type="hidden" />
                <div className="flex flex-col gap-2 mt-4">
                  <Button type="submit" disabled={submitting}>
                    Continue
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setStep("signIn")}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </>
        )}
      </Card>
      {step === "signUp" && (
        <div className="pt-4 text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
          By clicking Sign Up, you agree to our <a href="/tos">Terms</a>{" "}
          and <a href="/privacy">Privacy Policy</a>.
        </div>
      )}
      <Toaster position="bottom-center" richColors={true} theme="light" />
    </div>
  );
}

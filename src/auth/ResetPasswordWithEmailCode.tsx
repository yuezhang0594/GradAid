import { useAuthActions } from "@convex-dev/auth/react";
import { CodeInput } from "@/auth/CodeInput";
import { SignInWithEmailCode } from "@/auth/SignInWithEmailCode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ResetPasswordWithEmailCode({
  handleCancel,
  provider,
}: {
  handleCancel: () => void;
  provider: string;
}) {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"forgot" | { email: string }>("forgot");
  const [submitting, setSubmitting] = useState(false);
  return step === "forgot" ? (
    <>
      <CardHeader>
        <CardTitle>Send password reset code</CardTitle>
      </CardHeader>
      <CardContent>
        <SignInWithEmailCode
          handleCodeSent={(email) => setStep({ email })}
          provider={provider}
        >
          <input name="flow" type="hidden" value="reset" />
        </SignInWithEmailCode>
      </CardContent>
      <CardFooter>
        <Button type="button" variant="link" onClick={handleCancel}>
          Cancel
        </Button>
      </CardFooter>
    </>
  ) : (
    <>
      <CardHeader>
        <CardTitle>Check your email</CardTitle>
        <CardDescription>
          Enter the 8-digit code we sent to your email address and choose a new
          password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitting(true);
            const formData = new FormData(event.currentTarget);
            signIn(provider, formData).catch((error) => {
              console.error(error);
              toast.error("Code could not be verified or new password is too short, try again",
                { description: "Password must be at least 8 characters long." }
              );
              setSubmitting(false);
            });
          }}
        >
          <label htmlFor="email">Code</label>
          <CodeInput />
          <label htmlFor="newPassword">New Password</label>
          <Input
            type="password"
            name="newPassword"
            id="newPassword"
            className="mb-4"
            autoComplete="new-password"
          />
          <input type="hidden" name="flow" value="reset-verification" />
          <input type="hidden" name="email" value={step.email} />
          <Button type="submit" disabled={submitting}>
            Continue
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="button" variant="link" onClick={() => setStep("forgot")}>
          Cancel
        </Button>
      </CardFooter>
    </>
  );
}

import { SignInWithApple } from "@/auth/oauth/SignInWithApple";
import { SignInWithGitHub } from "@/auth/oauth/SignInWithGitHub";
import { SignInWithGoogle } from "@/auth/oauth/SignInWithGoogle";

export function SignInWithOAuth() {
  const redirectURL = "/dashboard";
  return (
    <div className="flex flex-col min-[460px]:flex-row w-full gap-2 items-stretch">
      <SignInWithGitHub redirectURL={redirectURL} />
      <SignInWithGoogle redirectURL={redirectURL} />
      <SignInWithApple redirectURL={redirectURL} />
    </div>
  );
}

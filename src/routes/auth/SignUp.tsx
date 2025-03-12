import { SignUp } from "@clerk/clerk-react";

export default function SignUpPage({ redirectUrl = "/onboarding"}: { redirectUrl: string }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-purple-50/30">
                <SignUp
                    signInUrl="/signin"
                    forceRedirectUrl={redirectUrl}
                />
        </div>
    );
}

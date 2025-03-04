import { SignUp } from "@clerk/clerk-react";

export default function SignUpPage({ redirectUrl = "/onboarding"}: { redirectUrl: string }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-purple-50/30">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
                <SignUp
                    signInUrl="/signin"
                    signInForceRedirectUrl="/dashboard"
                    forceRedirectUrl={redirectUrl}
                />
            </div>
        </div>
    );
}

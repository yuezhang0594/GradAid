import { SignIn } from "@clerk/clerk-react";

export default function SignInPage({ redirectUrl = "/dashboard"}: { redirectUrl: string }) {

    return (
        <div className="flex min-h-screen items-center justify-center bg-purple-50/30">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
                <SignIn
                    withSignUp={true}
                    forceRedirectUrl={redirectUrl}
                />
            </div>
        </div>
    );
}
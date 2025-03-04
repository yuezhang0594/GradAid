import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useClerk, SignInButton } from "@clerk/clerk-react";

export default function SignOutPage() {
    const { signOut } = useClerk();
    const [isSigningOut, setIsSigningOut] = useState(true);

    useEffect(() => {
        const performSignOut = async () => {
            await signOut();
            setIsSigningOut(false);
        };
        
        void performSignOut();
    }, [signOut]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-purple-50/30">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md text-center">
                {isSigningOut ? (
                    <>
                        <p className="text-lg font-medium">Signing you out...</p>
                        <div className="mt-4 flex justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-purple-500"></div>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="text-xl font-bold text-purple-700 mb-4">You've been signed out</h2>
                        <p className="text-gray-600 mb-6">Thank you for using GradAid!</p>
                        <div className="flex justify-center gap-4">
                            <Link 
                                to="/" 
                                className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                Return to Home
                            </Link>
                            <SignInButton mode="modal">
                                <button className="px-6 py-2 bg-white border border-purple-600 text-purple-600 font-medium rounded-lg hover:bg-purple-50 transition-colors">
                                    Log In Again
                                </button>
                            </SignInButton>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Loader2 } from "lucide-react";

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
        <div className="flex min-h-screen items-center justify-center bg-black-50/30">
            <Card className="w-full max-w-xs">
                {isSigningOut ? (
                    <CardContent className="pt-6 text-center">
                        <p className="text-lg font-medium mb-4">Signing you out...</p>
                        <div className="flex justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-black-600" />
                        </div>
                    </CardContent>
                ) : (
                    <>
                        <CardHeader className="text-center">
                            <CardTitle className="text-xl text-black-700">You've been signed out</CardTitle>
                            <CardDescription>Thank you for using GradAid!</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-3">
                                <Button className="w-full" asChild>
                                    <Link to="/">Return to Home</Link>
                                </Button>
                                <Button className="w-full" variant="outline" asChild>
                                    <Link to="/signin">Log In Again</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </>
                )}
            </Card>
        </div>
    );
}

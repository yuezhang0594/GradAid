import { AuthLoading, Authenticated, Unauthenticated } from 'convex/react'
import SignInPage from '@/routes/auth/SignIn';
import { useLocation } from 'react-router-dom'
import { Skeleton } from "@/components/ui/skeleton"
import { useState, useEffect } from 'react'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const redirectUrl = `${window.location.origin}${location.pathname}${location.search}`;
    const [showLoading, setShowLoading] = useState(false);

    // Only show loading after a brief delay to avoid flash
    useEffect(() => {
        const timer = setTimeout(() => setShowLoading(true), 500);
        return () => clearTimeout(timer);
    }, []);
    
    return (
        <>
            <AuthLoading>
                {showLoading && (
                    <div className="flex min-h-screen items-center justify-center bg-background">
                        <div className="space-y-4 w-[600px]">
                            <Skeleton className="h-12 w-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-[90%]" />
                                <Skeleton className="h-4 w-[80%]" />
                            </div>
                        </div>
                    </div>
                )}
            </AuthLoading>
            <Unauthenticated>
                <SignInPage redirectUrl={redirectUrl} />
            </Unauthenticated>
            <Authenticated>
                {children}
            </Authenticated>
        </>
    )
}
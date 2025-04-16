import { AuthLoading, Authenticated, Unauthenticated } from 'convex/react'
import AuthenticatedRoute from '@/routes/AuthenticatedRoute'
import SignInPage from '@/routes/auth/SignIn';
import { useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { LoaderIcon } from 'lucide-react'
import { LOADING_INDICATOR_DELAY } from 'convex/validators';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const redirectUrl = `${window.location.origin}${location.pathname}${location.search}`;
    const [showLoading, setShowLoading] = useState(false);

    // Only show loading after a brief delay to avoid flash
    useEffect(() => {
        const timer = setTimeout(() => setShowLoading(true), LOADING_INDICATOR_DELAY);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <AuthLoading>
                {showLoading && (
                    <div className="fixed inset-0 flex flex-col items-center justify-center">
                        <LoaderIcon className="animate-spin h-10 w-10 text-primary" />
                        <p className="mt-4 text-primary font-medium">Verifying your credentials...</p>
                    </div>
                )}
            </AuthLoading>
            <Unauthenticated>
                <SignInPage redirectUrl={redirectUrl} />
            </Unauthenticated>
            <Authenticated>
                <AuthenticatedRoute>
                    {children}
                </AuthenticatedRoute>
            </Authenticated>
        </>
    )
}
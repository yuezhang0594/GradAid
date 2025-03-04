import { AuthLoading, Authenticated, Unauthenticated } from 'convex/react'
import SignInPage from '@/app/routes/auth/SignIn';
import { useLocation } from 'react-router-dom'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const redirectUrl = `${window.location.origin}${location.pathname}${location.search}`;
    
    return (
        <>
            <AuthLoading >
                <div className="flex min-h-screen items-center justify-center bg-purple-50/30">
                    <div className="text-black-600">Loading...</div>
                </div>
            </ AuthLoading >
            <Unauthenticated>
                <SignInPage redirectUrl={redirectUrl} />
            </Unauthenticated>
            <Authenticated>
                {children}
            </Authenticated>
        </>)
}
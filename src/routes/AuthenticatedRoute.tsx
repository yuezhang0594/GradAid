import { useNavigate, useLocation } from 'react-router-dom'
import { useProfile } from '@/hooks/useProfile'
import { LoaderIcon } from 'lucide-react'
import { useEffect } from 'react'

interface AuthenticatedRouteProps {
    children: React.ReactNode
    requireCompleteProfile?: boolean
    redirectIncomplete?: string
    redirectComplete?: string
}

export default function AuthenticatedRoute({
    children,
    requireCompleteProfile = true,
    redirectIncomplete = '/onboarding',
    redirectComplete = '/dashboard'
}: AuthenticatedRouteProps) {
    const { isComplete } = useProfile()
    const location = useLocation()
    const navigate = useNavigate()
    
    console.log(isComplete)
    const isOnboardingRoute = location.pathname.startsWith('/onboarding')
    console.log(isOnboardingRoute)

    useEffect(() => {
        // Handle redirects when profile data is loaded
        if (isComplete !== null) {
            if (requireCompleteProfile && !isComplete && !isOnboardingRoute) {
                // Redirect incomplete profiles to onboarding
                navigate(redirectIncomplete, { replace: true })
            } else if (isOnboardingRoute && isComplete) {
                // Redirect completed profiles away from onboarding
                navigate(redirectComplete, { replace: true })
            }
        }
    }, [isComplete, isOnboardingRoute, requireCompleteProfile, redirectIncomplete, navigate])

    if (isComplete === null) {
        // Show loading indicator while profile data is being fetched
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center">
                <LoaderIcon className="animate-spin h-10 w-10 text-primary" />
                <p className="mt-4 text-primary font-medium">Verifying your credentials...</p>
            </div>
        )
    }

    // Regular content for authenticated users who don't need redirection
    return <>{children}</>
}

import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { cn } from "@/app/lib/utils"
import { SignInButton } from "@clerk/clerk-react"
import { Link } from "react-router-dom"

export function LandingPage({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div className={cn("flex flex-col items-center", className)} {...props}>
            {/* Hero Section */}
            <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
                <div className="container px-4 md:px-6 flex flex-col items-center text-center gap-4">
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">GradAid</h1>
                    <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
                        Your complete solution for graduate school application management and success
                    </p>
                    <div className="space-x-4 mt-8">
                        <SignInButton forceRedirectUrl={"/dashboard"}>
                            <Button>Get Started</Button>
                        </SignInButton>
                    </div>
                </div>
            </section>
            {/* Features Section */}
            <section className="w-full py-12 md:py-24 lg:py-32">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Features</h2>
                        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                            Everything you need to succeed in your graduate school journey
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard
                            title="Application Tracking"
                            description="Keep track of all your applications in one place with deadline reminders and status updates"
                        />
                        <FeatureCard
                            title="Document Management"
                            description="Store and organize recommendation letters, personal statements, and transcripts"
                        />
                        <FeatureCard
                            title="School Research"
                            description="Compare programs, requirements, and acceptance rates to find your perfect fit"
                        />
                        <FeatureCard
                            title="Essay Assistance"
                            description="Get guidance on personal statements and research proposals"
                        />
                        <FeatureCard
                            title="Timeline Planning"
                            description="Create a customized timeline for your application process"
                        />
                        <FeatureCard
                            title="Community Support"
                            description="Connect with other applicants and get advice from successful students"
                        />
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
                <div className="container px-4 md:px-6 flex flex-col items-center text-center gap-4">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Begin?</h2>
                    <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
                        Start your graduate school journey with GradAid today
                    </p>
                    <Button asChild>
                        <Link to="/login">Get Started Now</Link>
                    </Button>
                </div>
            </section>
        </div>
    )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription>{description}</CardDescription>
            </CardContent>
        </Card>
    )
}

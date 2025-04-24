import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { SignInButton } from "@clerk/clerk-react"
import { GradAidLogo } from "@/assets/GradAidLogo"

export function LandingPage({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div className={cn("flex flex-col items-center", className)} {...props}>
            {/* Hero Section */}
            <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                    <GradAidLogo className="w-[60%] max-w-[600px] h-auto" />
                </div>
                <div className="px-4 md:px-6 flex flex-col items-center text-center gap-4 relative z-10 w-full">
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">GradAid</h1>
                    <p className="mx-auto max-w-auto text-lg text-muted-foreground md:text-xl">
                    AI-powered assistance for crafting compelling graduate school application documents
                    </p>
                    <div className="space-x-4 mt-8">
                    <SignInButton>
                        <Button>Get Started</Button>
                    </SignInButton>
                    </div>
                </div>
            </section>
            {/* Features Section */}
            <section className="w-full py-12 md:py-24 lg:py-32 px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12 w-full">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Features</h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                    Everything you need to succeed in your graduate school application journey
                </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl mx-auto">
                <FeatureCard
                    title="AI-Powered Document Generation"
                    description="Generate personalized Statements of Purpose (SOPs) and Letters of Recommendation (LORs) tailored to your background and target programs."
                />
                <FeatureCard
                    title="Customized Application Materials"
                    description="Reflect your unique experiences and skills with AI assistance, ensuring your application stands out."
                />
                <FeatureCard
                    title="University Program Research"
                    description="Search and compare graduate programs, requirements, and deadlines to find the best fit for your goals."
                />
                <FeatureCard
                    title="Application Tracking"
                    description="Manage multiple applications, track deadlines, and monitor your progress all in one place."
                />
                <FeatureCard
                    title="Secure Document Management"
                    description="Organize and securely store all your application documents with ease."
                />
                <FeatureCard
                    title="User Authentication & Security"
                    description="Your personal information and documents are protected with secure authentication and data encryption."
                />
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="w-full py-12 md:py-24 lg:py-32 bg-muted relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                    <GradAidLogo className="w-[60%] max-w-[600px] h-auto rotate-180" />
                </div>
                <div className="px-4 md:px-6 flex flex-col items-center text-center gap-4 relative z-10 w-full">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Begin?</h2>
                    <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
                    Let GradAid help you craft the perfect application. Start your journey today.
                    </p>
                    <SignInButton>
                        <Button>Get Started Now</Button>
                    </SignInButton>
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

import { GradAidLogo } from "@/assets/GradAidLogo"
import { SignInFormPasswordAndVerifyViaCode } from "@/auth/SignInFormPasswordAndVerifyViaCode"

export default function LoginPage() {
    return (
        <div className="flex min-h-svh flex-`col items-center justify-center gap-6 bg-muted p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <a href="/" className="flex items-center gap-2 self-center font-medium text-lg">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-secondary text-primary-foreground">
                        <GradAidLogo />
                    </div>
                    GradAid
                </a>
                <SignInFormPasswordAndVerifyViaCode />
            </div>
        </div>
    )
}

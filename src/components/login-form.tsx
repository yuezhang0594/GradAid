import { cn } from "@/lib/utils";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label
} from "@/components/ui"
import { Link } from "react-router-dom"
import { useAuthActions } from "@convex-dev/auth/react";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { GitHubLogo } from "@/assets/GitHubLogo";
import { GoogleLogo } from "@/assets/GoogleLogo";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signIn } = useAuthActions();
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    // <div
    //   className={cn(
    //     // This CSS creates a full-height container with:
    //     // min-h-screen: Makes the container at least as tall as the viewport
    //     // bg-gradient-to-br: Creates a gradient from top-left to bottom-right
    //     // from-primary-50 to-primary-100: Gradient goes from a very light primary color to a slightly darker shade
    //     // flex: Makes this a flex container
    //     // items-center: Centers child elements vertically
    //     // justify-center: Centers child elements horizontally
    //     // p-4: Adds padding of 1rem (16px) on all sides
    //     "min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4",
    //     className
    //   )}
    //   {...props}
    // >
    <div
      className={cn("flex items-center justify-center p-4", className)}
      {...props}
    >
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className={cn("text-2xl font-bold tracking-tight")}>
              Welcome back!
            </CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <div className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      onChange={() => setShowPassword(!showPassword)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember-me" />
                    <Label htmlFor="remember-me">Remember me</Label>
                  </div>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Button type="submit" className="w-full">
                  Login
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      void signIn("google", { redirectTo: "/dashboard" })
                    }
                  >
                    <GoogleLogo />
                    Login with Google
                  </Button>
                  <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => signIn("github", { redirectTo: "/dashboard" })}>
                    <GitHubLogo />
                    Login with GitHub
                  </Button>
                </div>
              </div>
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link to="/signup" className="underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

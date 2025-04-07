import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  SparklesIcon,
  BarChart3,
  Clock,
  CreditCard,
  PlusCircle,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { format } from "date-fns";
import { PageWrapper } from "@/components/ui/page-wrapper";

export default function CreditsPage() {
  const credits = useQuery(api.aiCredits.queries.getAiCredits);
  const usageByType = useQuery(api.aiCredits.queries.getAiCreditUsage);

  // Show loading state while data is being fetched
  if (!credits || !usageByType) {
    return <PageWrapper title="AI Credits">Loading credits...</PageWrapper>;
  }

  return (
    <PageWrapper
      title="AI Credits"
      description={
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-muted-foreground">Monitor your AI credit usage and see detailed statistics</p>
          </div>
          <div className="flex items-center justify-end mb-8">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Purchase Credits
        </Button>
      </div>
        </div>
      }
    >
      

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Credits</CardTitle>
            <SparklesIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{credits.totalCredits - credits.usedCredits}</div>
            <p className="text-xs text-muted-foreground">
              of {credits.totalCredits} total credits
            </p>
            <Progress
              value={((credits.totalCredits - credits.usedCredits) / credits.totalCredits) * 100}
              className="mt-3"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{credits.usedCredits}</div>
            <p className="text-xs text-muted-foreground">
              {((credits.usedCredits / credits.totalCredits) * 100).toFixed(0)}% of total credits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Refill</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{format(new Date(credits.resetDate), 'MMMM d, yyyy')}</div>
            <p className="text-xs text-muted-foreground">
              Monthly credit refresh
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Pro Plan</div>
            <p className="text-xs text-muted-foreground">
              {credits.totalCredits} credits/month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Usage by Type</CardTitle>
            <CardDescription>
              Breakdown of credit usage by activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {usageByType.map((usage, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center">
                      <Badge variant="secondary" className="mr-2">
                        {usage.used} credits
                      </Badge>
                      {usage.type}
                    </span>
                    <span>{usage.percentage}%</span>
                  </div>
                  <Progress value={usage.percentage} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}

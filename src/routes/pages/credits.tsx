import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Progress,
  EmptyState,
  PageWrapper
} from "@/components/ui";
import {
  SparklesIcon,
  BarChart3,
  Clock,
  CreditCard,
  MonitorXIcon,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "#/_generated/api";
import { format } from "date-fns";
import { AiCreditUsageType } from "#/validators";

export default function CreditsPage() {
  const credits = useQuery(api.aiCredits.queries.getAiCredits);
  const remaining = useQuery(api.aiCredits.queries.getAiCreditsRemaining);
  const usageByType = useQuery(api.aiCredits.queries.getAiCreditUsage);

  // Show loading state while data is being fetched
  if (
    credits === undefined ||
    usageByType === undefined ||
    remaining === undefined
  ) {
    return <PageWrapper title="AI Credits">Loading credits...</PageWrapper>;
  }

  // Convert AiCreditUsageType to a more user-friendly format
  const usageTypes: { [key in AiCreditUsageType]: string } = {
    lor_request: "Generate Letter of Recommendation",
    lor_update: "Update Letter of Recommendation",
    sop_request: "Generate Statement of Purpose",
    sop_update: "Update Statement of Purpose",
    ai_usage: "Other",
    ai_credits_reset: "AI Credits Reset",
  };

  return (
    <PageWrapper
      title="AI Credits"
      description="Monitor your AI credit usage and see detailed statistics"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Credits
            </CardTitle>
            <SparklesIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{remaining}</div>
            <p className="text-xs text-muted-foreground">
              of {credits.totalCredits} total credits
            </p>
            <Progress
              value={(remaining / credits.totalCredits) * 100}
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
              {((credits.usedCredits / credits.totalCredits) * 100).toFixed(0)}%
              of total credits
            </p>
            <Progress
              value={(credits.usedCredits / credits.totalCredits) * 100}
              className="mt-3"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Refill</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {format(new Date(credits.resetDate), "MMMM d, yyyy")}
            </div>
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
            <div className="text-2xl font-bold">Basic Plan</div>
            <p className="text-xs text-muted-foreground">
              {credits.totalCredits} credits/month
            </p>
          </CardContent>
        </Card>
      </div>
      {usageByType.length === 0 ? (
        <EmptyState
          icon={MonitorXIcon}
          title="No AI Credit Usage Found"
          description="You haven't used any AI credits yet.
            Get started by opening a document and generating personalized content."
          className="mt-8 max-w-auto"
          actionHref="/documents"
          actionLabel="Open Documents"
        />
      ) : (
        <div className="grid gap-4 mt-8">
          <Card>
            <CardHeader className="text-start">
              <CardTitle>Usage by Type</CardTitle>
              <CardDescription>
                Breakdown of AI credit usage by activity
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
                        {usageTypes[usage.type]}
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
      )}
    </PageWrapper>
  );
}

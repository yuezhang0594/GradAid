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
  ClipboardXIcon,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { format } from "date-fns";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { EmptyState } from "@/components/ui/empty-state";

export default function CreditsPage() {
  const credits = useQuery(api.aiCredits.queries.getAiCredits);
  const usageByType = useQuery(api.aiCredits.queries.getAiCreditUsage);

  return (
    <PageWrapper 
      title="AI Credits" 
      description="Monitor your AI credit usage and see detailed statistics"
    >
      {!credits ? (
        "Loading credits..."
      ) : !usageByType || usageByType.length === 0 ? (
        <EmptyState
          icon={ClipboardXIcon}
          title="No Usage Data"
          description="You haven't used any AI credits yet.                
            Usage statistics will appear here once you start using AI-powered features."
          actionLabel="Go to Applications"
          actionHref="/applications"
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Credits</CardTitle>
                <SparklesIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{credits.totalCredits - credits.usedCredits}</div>
                <p className="text-xs text-muted-foreground">{credits.totalCredits} credits/month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{credits.usedCredits}</div>
                <p className="text-xs text-muted-foreground">Used this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Next Refill</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{credits.resetDate ? format(new Date(credits.resetDate), "MMMM d, yyyy") : "-"}</div>
                <p className="text-xs text-muted-foreground">
                  {credits.totalCredits} credits/month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 mt-8">
            <Card>
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
        </>
      )}
    </PageWrapper>
  );
}
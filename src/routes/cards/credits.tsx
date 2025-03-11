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

export default function CreditsPage() {
  const creditStats = {
    total: 500,
    used: 250,
    remaining: 250,
    nextRefill: "April 1, 2024",
  };

  const usageByType = [
    {
      type: "Document Review",
      used: 100,
      percentage: 40,
    },
    {
      type: "Essay Feedback",
      used: 75,
      percentage: 30,
    },
    {
      type: "Research Help",
      used: 50,
      percentage: 20,
    },
    {
      type: "Other",
      used: 25,
      percentage: 10,
    },
  ];

  return (
    <main className="flex-1 flex-col space-y-8 p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Credits</h2>
          <p className="text-muted-foreground">
            Monitor and manage your AI credit usage
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Purchase Credits
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Available Credits
            </CardTitle>
            <SparklesIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creditStats.remaining}</div>
            <p className="text-xs text-muted-foreground">
              of {creditStats.total} total credits
            </p>
            <Progress
              value={(creditStats.remaining / creditStats.total) * 100}
              className="mt-3"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Credits Used
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creditStats.used}</div>
            <p className="text-xs text-muted-foreground">
              {((creditStats.used / creditStats.total) * 100).toFixed(0)}% of total credits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Next Refill
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creditStats.nextRefill}</div>
            <p className="text-xs text-muted-foreground">
              Monthly credit refresh
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Subscription
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Pro Plan</div>
            <p className="text-xs text-muted-foreground">
              500 credits/month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
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
    </main>
  );
}

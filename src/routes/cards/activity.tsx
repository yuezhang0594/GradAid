import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  FileText,
  MessageSquare,
  SparklesIcon,
  Clock,
  Filter,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { formatDistanceToNow } from "date-fns";

// Helper function to get icon based on activity type
function getActivityIcon(type: string) {
  switch (type) {
    case "document_edit":
      return <FileText className="h-4 w-4" />;
    case "ai_usage":
      return <SparklesIcon className="h-4 w-4" />;
    case "lor_request":
    case "lor_update":
      return <MessageSquare className="h-4 w-4" />;
    case "application_update":
      return <Clock className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
}

export default function ActivityPage() {
  const recentActivities = useQuery(api.userActivity.queries.getRecentActivity, {});
  const activityStats = useQuery(api.userActivity.queries.getActivityStats, {});

  // Show loading state while data is being fetched
  if (!recentActivities || !activityStats) {
    return (
      <main className="flex-1 flex-col space-y-8 p-8">
        <div>Loading activity...</div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex-col space-y-8 p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Recent Activity</h2>
          <p className="text-muted-foreground">
            Track your recent actions and progress
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activityStats.today}
            </div>
            <p className="text-xs text-muted-foreground">activities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activityStats.thisWeek}
            </div>
            <p className="text-xs text-muted-foreground">activities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activityStats.thisMonth}
            </div>
            <p className="text-xs text-muted-foreground">activities</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Feed</CardTitle>
          <CardDescription>Your recent actions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {recentActivities.map((activity) => (
              <div
                key={activity._id}
                className="flex items-start space-x-4 border-b pb-8 last:border-0 last:pb-0"
              >
                <div className="rounded-full bg-secondary p-2">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">
                      {activity.type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    <Badge variant="secondary">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {activity.description}
                  </p>
                  <div className="flex gap-2 mt-2">
                    {activity.metadata.applicationId && (
                      <Badge variant="outline">Application Update</Badge>
                    )}
                    {activity.metadata.documentId && (
                      <Badge variant="outline">Document Update</Badge>
                    )}
                    {activity.metadata.lorId && (
                      <Badge variant="outline">LOR Update</Badge>
                    )}
                    {activity.metadata.creditsUsed && (
                      <Badge variant="outline">
                        {activity.metadata.creditsUsed} credits used
                      </Badge>
                    )}
                    {activity.metadata.oldStatus && activity.metadata.newStatus && (
                      <Badge variant="outline">
                        Status: {activity.metadata.oldStatus} → {activity.metadata.newStatus}
                      </Badge>
                    )}
                    {activity.metadata.oldProgress !== undefined && activity.metadata.newProgress !== undefined && (
                      <Badge variant="outline">
                        Progress: {activity.metadata.oldProgress}% → {activity.metadata.newProgress}%
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

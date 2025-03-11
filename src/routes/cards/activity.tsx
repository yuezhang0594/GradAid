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

export default function ActivityPage() {
  const activityData = {
    recentActivities: [
      {
        id: 1,
        type: "document_edit",
        title: "Statement of Purpose Updated",
        description: "Made changes to Stanford MS CS Statement of Purpose",
        timestamp: "2 hours ago",
        metadata: {
          university: "Stanford University",
          program: "MS Computer Science",
          wordCount: 850,
        },
        icon: <FileText className="h-4 w-4" />,
      },
      {
        id: 2,
        type: "ai_feedback",
        title: "AI Review Completed",
        description: "Received feedback on Research Statement draft",
        timestamp: "4 hours ago",
        metadata: {
          university: "MIT",
          program: "PhD Computer Science",
          suggestions: 3,
        },
        icon: <SparklesIcon className="h-4 w-4" />,
      },
      {
        id: 3,
        type: "chat",
        title: "Chat Session",
        description: "Discussed application strategy with AI assistant",
        timestamp: "1 day ago",
        metadata: {
          duration: "15 minutes",
          topics: ["Research Focus", "Program Selection"],
        },
        icon: <MessageSquare className="h-4 w-4" />,
      },
      {
        id: 4,
        type: "deadline",
        title: "Deadline Approaching",
        description: "Stanford MS CS application due in 5 days",
        timestamp: "2 days ago",
        metadata: {
          dueDate: "2024-03-15",
          completed: "8/10 requirements",
        },
        icon: <Clock className="h-4 w-4" />,
      },
    ],
    activityStats: {
      today: 5,
      thisWeek: 12,
      thisMonth: 45,
    },
  };

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
              {activityData.activityStats.today}
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
              {activityData.activityStats.thisWeek}
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
              {activityData.activityStats.thisMonth}
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
            {activityData.recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-4 border-b pb-8 last:border-0 last:pb-0"
              >
                <div className="rounded-full bg-secondary p-2">
                  {activity.icon}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">
                      {activity.title}
                    </p>
                    <Badge variant="secondary">{activity.timestamp}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {activity.description}
                  </p>
                  <div className="flex gap-2 mt-2">
                    {activity.metadata.university && (
                      <Badge variant="outline">
                        {activity.metadata.university}
                      </Badge>
                    )}
                    {activity.metadata.program && (
                      <Badge variant="outline">{activity.metadata.program}</Badge>
                    )}
                    {activity.metadata.suggestions && (
                      <Badge variant="outline">
                        {activity.metadata.suggestions} suggestions
                      </Badge>
                    )}
                    {activity.metadata.wordCount && (
                      <Badge variant="outline">
                        {activity.metadata.wordCount} words
                      </Badge>
                    )}
                    {activity.metadata.duration && (
                      <Badge variant="outline">
                        {activity.metadata.duration}
                      </Badge>
                    )}
                    {activity.metadata.completed && (
                      <Badge variant="outline">
                        {activity.metadata.completed}
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

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
  SparklesIcon,
  Clock,
  Filter,
  ChevronsUpDown,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "#/_generated/api";
import { formatDistanceToNow } from "date-fns";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Helper function to get icon based on activity type
function getActivityIcon(type: string) {
  switch (type) {
    case "document_edit":
      return <FileText className="h-4 w-4" />;
    case "ai_usage":
      return <SparklesIcon className="h-4 w-4" />;
    case "application_update":
      return <Clock className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
}

export default function ActivityPage() {
  const recentActivities = useQuery(api.userActivity.queries.getRecentActivity, {});
  const activityStats = useQuery(api.userActivity.queries.getActivityStats, {});

  // State for activity filters
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  // Available activity types for filtering
  const activityTypes = [
    { value: "document_edit", label: "Document Edit" },
    { value: "document_status_update", label: "Document Status Update" },
    { value: "application_update", label: "Application Update" },
    { value: "ai_usage", label: "AI Usage" },
    { value: "feedback_submission", label: "Feedback Submission" },
  ];

  // Toggle filter selection
  const toggleFilter = (value: string) => {
    setSelectedFilters((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedFilters([]);
  };

  // Filter activities based on selected filters
  const filteredActivities = recentActivities ? (
    selectedFilters.length > 0
      ? recentActivities.filter((activity) => selectedFilters.includes(activity.type))
      : recentActivities
  ) : [];

  // Show loading state while data is being fetched
  if (!recentActivities || !activityStats) {
    return <PageWrapper title="Recent Activity">Loading activity...</PageWrapper>;
  }

  return (
    <PageWrapper
      title="Recent Activity"
      description={
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-muted-foreground">Track your recent actions and progress</p>
          </div>
          <div className="flex items-center justify-end gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-1">
                  <Filter className="h-4 w-4 mr-1" />
                  {selectedFilters.length > 0 ? `Filtered (${selectedFilters.length})` : "Filter"}
                  <ChevronsUpDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by Activity Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {activityTypes.map((type) => (
                  <DropdownMenuCheckboxItem
                    key={type.value}
                    checked={selectedFilters.includes(type.value)}
                    onCheckedChange={() => toggleFilter(type.value)}
                  >
                    {type.label}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <div className="p-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={clearFilters}
                    disabled={selectedFilters.length === 0}
                  >
                    Clear Filters
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      }
    >
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

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Activity Feed</CardTitle>
          <CardDescription>
            {selectedFilters.length > 0
              ? `Showing ${filteredActivities.length} filtered activities`
              : "Your recent actions and updates"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No activities match your filter criteria
            </div>
          ) : (
            <div className="space-y-8">
              {filteredActivities.map((activity) => (
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
                        {activity.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
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
                      {activity.metadata.oldProgress !== undefined &&
                        activity.metadata.newProgress !== undefined && (
                          <Badge variant="outline">
                            Progress: {activity.metadata.oldProgress}% → {activity.metadata.newProgress}%
                          </Badge>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

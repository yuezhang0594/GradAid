import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, AlertCircle, ClipboardXIcon } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "#/_generated/api";
import { format } from "date-fns";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "@/components/ui/empty-state";

export default function TimelinePage() {
  const timeline = useQuery(api.applications.timeline.getTimeline);
  const navigate = useNavigate();

  if (!timeline) {
    return <PageWrapper title="Application Timeline">Loading timeline...</PageWrapper>;
  }

  return (
    <PageWrapper
      title="Application Timeline"
      description="Track your application deadlines and requirements"
    >
      {timeline.length === 0 ? (
      <EmptyState
          icon={ClipboardXIcon}
          title="No Applications Found"
          description="You haven't started any applications yet.
            You can start a new application on the 'Apply' or 'Saved Programs' pages."
          actionLabel="Start New Application"
          actionHref="/apply"
        />
      ) : (
        <div className="space-y-4">
          {timeline.map((item, index) => (
            <Card
              key={index}
              className="group hover:shadow-md transition-all cursor-pointer hover:border-primary/50 relative"
            onClick={() => navigate(`/applications/${encodeURIComponent(item.university)}`, {
              state: { applicationId: item._id }
            })}
          >
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-lg">
                    {format(new Date(item.deadline), "MMM d, yyyy")}
                  </CardTitle>
                  {item.priority === "high" && (
                    <Badge variant="destructive" className="ml-2">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Urgent
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  {item.university} - {item.program}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {item.applicationDocuments.map((req, idx) => (
                    <Badge
                      key={idx}
                      variant={
                        req.status === "complete"
                          ? "default"
                          : req.status === "draft"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {req.type}
                    </Badge>
                  ))}
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    {Math.ceil((new Date(item.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
                  </span>
                  <span>
                    {
                      item.applicationDocuments.filter((doc) => doc.status === "complete").length
                    }
                    /{item.applicationDocuments.length} requirements complete
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )}
    </PageWrapper>
  );
}

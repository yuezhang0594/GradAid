import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ExternalLink, TargetIcon, ChevronUpIcon, ChevronDownIcon } from "lucide-react";
import { Id } from "#/_generated/dataModel";

interface TimelineEvent {
  date: string;
  university: string;
  program: string;
  priority: "high" | "medium" | "low";
  requirements: Array<{
    type: string;
    status: "completed" | "in_progress" | "pending";
  }>;
  notes: string;
}

interface Application {
  id: Id<"applications">;
  university: string;
  program: string;
  degree: string;
}

interface ApplicationTimelineProps {
  applications: Application[];
  timelineEvents: TimelineEvent[];
  initialTimelinesToShow?: number;
}

export function ApplicationTimeline({ 
  applications, 
  timelineEvents,
  initialTimelinesToShow = 4 
}: ApplicationTimelineProps) {
  const navigate = useNavigate();
  const [showAllTimelines, setShowAllTimelines] = useState(false);

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Application Timeline
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/timeline")}
          className="hover:bg-primary/10"
        >
          <span>View all</span>
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </h2>
      {timelineEvents.length === 0 ? (
        <Card className="text-center py-16">
          <CardTitle>
            No timeline events found.
          </CardTitle>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {timelineEvents
              .slice(0, showAllTimelines ? timelineEvents.length : initialTimelinesToShow)
              .map((event, index) => (
              <Card 
                key={index}
                className="cursor-pointer hover:shadow-md transition-all"
                onClick={() => {
                  // Find the application that matches this event
                  const matchingApp = applications.find(
                    (app) => 
                      app.university === event.university && 
                      app.program === event.program.split(" in ")[1]
                  );
                  
                  navigate(
                    `/applications/${event.university.replace(/\s+/g, " ")}`,
                    {
                      state: {
                        applicationId: matchingApp?.id || "",
                        universityName: event.university
                      }
                    }
                  );
                }}
              >
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-md font-medium flex items-center justify-center">
                    {event.university} <TargetIcon className="h-4 w-4 ml-2 text-muted-foreground"/>
                  </CardTitle>
                  <CardDescription className="text-xs text-center">
                    {event.program}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  <div className="flex items-start gap-4">
                    {/* Left column - Date and Priority */}
                    <div className="min-w-[100px] text-sm text-center">
                      <div className="font-medium space-y-0.5">
                        <p className="text-xs text-muted-foreground">Deadline</p>
                        <p className="text-xs">{new Date(event.date).toLocaleDateString()}</p>
                      </div>
                      <Badge
                        variant={event.priority === "high" ? "destructive" : "secondary"}
                        className="mt-2"
                      >
                        {event.priority}
                      </Badge>
                    </div>
                    
                    {/* Right column - Requirements */}
                    <div className="flex-1">
                      {/* Requirements badges */}
                      <div className="flex gap-2 flex-wrap justify-center">
                        {event.requirements.map((requirement, idx) => (
                          <Badge
                            key={idx}
                            variant={
                              requirement.status === "completed"
                                ? "default"
                                : "secondary"
                            }
                            className="flex items-center"
                          >
                            {requirement.type}
                          </Badge>
                        ))}
                      </div>
                      
                      {/* Notes and deadline info */}
                      <div className="mt-3 space-y-1 text-center">
                        {event.notes && (
                          <p className="text-xs text-muted-foreground">
                            {event.notes}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.date) > new Date() 
                            ? `Due in ${Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days`
                            : `Deadline passed`}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Show More Button for Timeline */}
          {timelineEvents.length > initialTimelinesToShow && (
            <div className="mt-6 flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => setShowAllTimelines(!showAllTimelines)}
                className="text-sm"
              >
                {showAllTimelines ? (
                  <>
                    <ChevronUpIcon className="h-4 w-4 mr-2" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDownIcon className="h-4 w-4 mr-2" />
                    Show More ({timelineEvents.length - initialTimelinesToShow} more)
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

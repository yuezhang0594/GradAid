import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Calendar, ChevronRight, ExternalLink, BellIcon, TargetIcon, FileTextIcon, ClockIcon, Activity, ChevronUpIcon, ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate, useLocation } from "react-router-dom";
import { ClickableCard } from "@/components/dashboard/clickablecard";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useQuery } from "convex/react";
import { api } from "#/_generated/api";
import { Id } from "#/_generated/dataModel";
import { useState } from "react";

// Helper function to format status text
function formatStatus(status: string): string {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { applicationStats, documentStats, applicationTimeline } = useDashboardData();
  const applications = useQuery(api.applications.queries.getApplications) ?? [];

  const icons = {
    "Active Applications": <FileTextIcon className="h-4 w-4 text-muted-foreground" />,
    "Next Deadline": <ClockIcon className="h-4 w-4 text-muted-foreground" />,
    "Recent Activity": <Activity className="h-4 w-4 text-muted-foreground" />,
  };

  const handleDocumentClick = (doc: any) => {
    navigate(`/documents/${encodeURIComponent(doc.university)}/${doc.type.toLowerCase()}?documentId=${doc.documentId}`, {
      state: {
        applicationId: doc.applicationId,
        universityName: doc.university,
        returnPath: location.pathname
      }
    });
  };

  const [showAllDocuments, setShowAllDocuments] = useState(false);
  const [showAllTimelines, setShowAllTimelines] = useState(false);
  
  // Number of document cards to show initially
  const initialDocumentsToShow = 4;
  // Number of timeline items to show initially
  const initialTimelinesToShow = 5;

  return (
    <main className="flex-1 flex-col overflow-auto p-4 sm:p-6 lg:p-8">
      {/* Application Progress Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {applicationStats.map((stat, index) => (
          <ClickableCard key={index} action={stat.action}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {icons[stat.title as keyof typeof icons]}
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-xl font-bold mb-2">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </ClickableCard>
        ))}
      </div>

      {/* Document Progress Section */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <FileTextIcon className="h-5 w-5 mr-2" />
            Application Documents
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/documents")}
            className="hover:bg-primary/10"
          >
            <span>View all</span>
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </h2>
        {documentStats.length === 0 && (
          <Card className="text-center py-16">
            <CardContent className="pt-10">
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                No documents found
              </h3>
              <p className="text-muted-foreground">
                You have no documents to review. Please check back later.
              </p>
            </CardContent>
          </Card>
        )}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {documentStats
            .slice(0, showAllDocuments ? documentStats.length : initialDocumentsToShow)
            .map((document, index) => (
            <ClickableCard
              key={index}
              action={{
                ...document.action,
                href: document.action.href,
                onClick: () => handleDocumentClick(document)
              }}
            >
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm">{document.title}</CardTitle>
                </div>
                <CardDescription className="flex flex-col space-y-1 text-left">
                  <span className="truncate max-w-[200px] text-xs text-muted-foreground text-left">{document.university}</span>
                  <span className="truncate max-w-[200px] text-xs text-muted-foreground text-left">{document.program}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center">
                      <Badge
                        variant={
                          document.status === "Complete" ? "default" : "secondary"
                        }
                      >
                        {formatStatus(document.status)}
                      </Badge>
                    </span>
                    <span>{document.progress}%</span>
                  </div>
                  <Progress value={document.progress} className="h-2" />
                </div>
              </CardContent>
            </ClickableCard>
          ))}
        </div>
        
        {/* Show More Button */}
        {documentStats.length > initialDocumentsToShow && (
          <div className="mt-4 flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => setShowAllDocuments(!showAllDocuments)}
              className="text-sm"
            >
              {showAllDocuments ? (
                <>
                  <ChevronUpIcon className="h-4 w-4 mr-2" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDownIcon className="h-4 w-4 mr-2" />
                  Show More ({documentStats.length - initialDocumentsToShow} more)
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Application Timeline */}
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
              <CardDescription>
                Track your application deadlines and requirements
              </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {applicationTimeline
                .slice(0, showAllTimelines ? applicationTimeline.length : initialTimelinesToShow)
                .map((event, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => {
                    // Find the application that matches this event
                    const matchingApp = applications.find(
                      (app: { university: string; program: string; id: Id<"applications"> }) => 
                        app.university === event.university && app.program === event.program.split(" in ")[1]
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
                  <div className="min-w-[100px] text-sm">
                    <div className="font-medium">
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <Badge
                      variant={event.priority === "high" ? "destructive" : "secondary"}
                      className="mt-1"
                    >
                      {event.priority}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium flex items-center justify-center">
                      {event.university}
                      <TargetIcon className="h-4 w-4 ml-2 text-muted-foreground" />
                    </h4>
                    <p className="text-sm text-muted-foreground hidden md:block">{event.program}</p>
                    <div className="mt-2 flex gap-2 flex-wrap hidden md:flex">
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
                    {event.notes && (
                      <p className="mt-2 text-xs text-muted-foreground flex items-center">
                        <BellIcon className="h-3 w-3 mr-1" />
                        {event.notes}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
            
            {/* Show More Button for Timeline */}
            {applicationTimeline.length > initialTimelinesToShow && (
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
                      Show More ({applicationTimeline.length - initialTimelinesToShow} more)
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
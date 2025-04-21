import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Calendar, ChevronRight, SparklesIcon,ExternalLink, TargetIcon, FileTextIcon, ClockIcon, Activity, ChevronUpIcon, ChevronDownIcon } from "lucide-react";
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
    "AI Credits Used": <SparklesIcon className="h-4 w-4 text-muted-foreground" />,
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
  const initialTimelinesToShow = 4;

  return (
    <main className="flex-1 flex-col overflow-auto p-4 sm:p-6 lg:p-8">
      {/* Application Progress Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
            <CardTitle>
              You haven't started any applications yet.
            </CardTitle>
            <CardDescription>
              You can start a new application on the 'Apply' or 'Saved Programs' pages.
            </CardDescription>
            <CardContent>
              <Button
                onClick={() => navigate("/saved")}
              >
                Start New Application
              </Button>
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
        {applicationTimeline.length === 0 ? (
          <Card className="text-center py-16">
            <CardTitle>
              No timeline events found.
            </CardTitle>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {applicationTimeline
                .slice(0, showAllTimelines ? applicationTimeline.length : initialTimelinesToShow)
                .map((event, index) => (
                <Card 
                  key={index}
                  className="cursor-pointer hover:shadow-md transition-all"
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
          </>
        )}
      </div>
    </main>
  );
}
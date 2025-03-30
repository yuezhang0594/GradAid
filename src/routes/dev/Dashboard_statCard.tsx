import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Calendar, ChevronRight, ExternalLink, BellIcon, TargetIcon, FileTextIcon, SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { ClickableCard } from "@/components/dashboard/clickablecard";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Dashboard() {
  const navigate = useNavigate();
  const [demoMode, setDemoMode] = useState(true);
  const { applicationStats, documentStats, applicationTimeline } = useDashboardData(demoMode);

  return (
    <main className="flex-1 flex-col overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-end mb-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="demo-mode"
            checked={demoMode}
            onCheckedChange={setDemoMode}
          />
          <Label htmlFor="demo-mode">Demo Mode</Label>
        </div>
      </div>

      {/* Application Progress Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {applicationStats.map((stat, index) => (
          <ClickableCard key={index} action={stat.action}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </ClickableCard>
        ))}
      </div>

      {/* Document Progress Section */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <FileTextIcon className="h-5 w-5 mr-2" />
          Application Documents
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {documentStats.map((document, index) => (
            <ClickableCard key={index} action={document.action}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm">{document.title}</CardTitle>
                  {document.aiSuggestions && (
                    <Badge variant="secondary" className="ml-2">
                      <SparklesIcon className="h-3 w-3 mr-1" />
                      {document.aiSuggestions} suggestions
                    </Badge>
                  )}
                </div>
                <CardDescription className="flex items-center">
                  {document.university}
                  {document.lastEdited && (
                    <span className="text-xs text-muted-foreground ml-2">
                      · Edited {document.lastEdited}
                    </span>
                  )}
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
                        {document.status}
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
      </div>

      {/* Application Timeline */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Application Timeline
        </h2>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
              <CardDescription>
                Track your application deadlines and requirements
              </CardDescription>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/timeline")}
              className="hover:bg-primary/10"
            >
              <span>View all</span>
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {applicationTimeline.map((event, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() =>
                    navigate(
                      `/applications/${event.university
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`
                    )
                  }
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
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
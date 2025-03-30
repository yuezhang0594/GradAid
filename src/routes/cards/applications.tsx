import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PageWrapper } from "@/components/ui/page-wrapper";

// Define the application type
type Application = {
  id: Id<"applications">;
  university: string;
  program: string;
  degree: string;
  status: "draft" | "in_progress" | "submitted" | "accepted" | "rejected";
  priority: "high" | "medium" | "low";
  deadline: string;
  documentsComplete: number;
  totalDocuments: number;
  progress: number;
};

// Helper function to format status text
function formatStatus(status: string) {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function ApplicationsPage() {
  const navigate = useNavigate();
  const [demoMode, setDemoMode] = useState(true);
  const applications = useQuery(api.applications.queries.getApplications, { demoMode }) ?? [];

  return (
    <PageWrapper
      title="Applications"
      description={
        <div className="space-y-4">
          <div className="space-y-1">
            {/* <p className="text-muted-foreground">Track and manage your graduate school applications.</p> */}
            <p className="text-muted-foreground">View deadlines, requirements, and progress for each university.</p>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="demo-mode"
              checked={demoMode}
              onCheckedChange={setDemoMode}
            />
            <Label htmlFor="demo-mode">Demo Mode</Label>
          </div>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {applications.map((app: Application) => (
          <Card 
            className="cursor-pointer flex flex-col h-[200px] p-4" 
            onClick={() => navigate(`/applications/${app.university}`)}
          >
            <CardHeader className="flex flex-col items-center justify-center space-y-1 p-0 pb-6">
              <CardTitle className="text-sm font-medium truncate max-w-full">{app.university}</CardTitle>
              <p className="text-xs text-muted-foreground truncate max-w-[180px]" title={`${app.degree} in ${app.program}`}>
                {app.degree} in {app.program}
              </p>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 p-0">
              <div className="w-full space-y-3 mt-auto">
                <div className="flex items-center justify-between text-xs w-full">
                  <span className={`min-w-[80px] text-left ${app.status === "submitted" ? "text-green-600" : "text-orange-600"}`}>
                    {formatStatus(app.status)}
                  </span>
                  <span className={`min-w-[80px] text-right ${app.priority === "high" ? "text-red-600" : "text-blue-600"}`}>
                    {formatStatus(app.priority)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground w-full">
                  <span className="min-w-[80px] text-left">Due {new Date(app.deadline).toLocaleDateString()}</span>
                  <span className="min-w-[80px] text-right">{app.documentsComplete}/{app.totalDocuments} docs</span>
                </div>
                <div className="w-full bg-secondary h-1.5 rounded-full">
                  <div 
                    className="bg-primary h-1.5 rounded-full" 
                    style={{ width: `${app.progress}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageWrapper>
  );
}

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function ApplicationsPage() {
  const navigate = useNavigate();
  const [demoMode, setDemoMode] = useState(true);
  const applications = useQuery(api.applications.queries.getApplications, { demoMode }) ?? [];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Applications</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="demo-mode"
              checked={demoMode}
              onCheckedChange={setDemoMode}
            />
            <Label htmlFor="demo-mode">Demo Mode</Label>
          </div>
          <Button onClick={() => navigate("/applications/new")}>Add Application</Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {applications.map((app) => (
          <Card 
            key={app.id} 
            className="cursor-pointer" 
            onClick={() => navigate(`/applications/${app.id}`)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{app.university}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{app.program}</p>
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className={`capitalize ${app.status === "submitted" ? "text-green-600" : "text-orange-600"}`}>
                    {app.status}
                  </span>
                  <span className={`capitalize ${app.priority === "high" ? "text-red-600" : "text-blue-600"}`}>
                    {app.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                  <span>Due {new Date(app.deadline).toLocaleDateString()}</span>
                  <span>{app.documentsComplete}/{app.totalDocuments} docs</span>
                </div>
                <div className="w-full bg-secondary h-1.5 rounded-full mt-2">
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
    </div>
  );
}

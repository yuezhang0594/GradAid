import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function ApplicationsPage() {
  const navigate = useNavigate();

  const applications = [
    {
      id: "stanford",
      university: "Stanford University",
      program: "MS Computer Science",
      status: "In Progress",
      priority: "high",
      deadline: "2025-05-15",
      documentsComplete: 8,
      totalDocuments: 12,
      progress: 65,
    },
    {
      id: "mit",
      university: "MIT",
      program: "MS Artificial Intelligence",
      status: "In Progress",
      priority: "medium",
      deadline: "2025-06-01",
      documentsComplete: 6,
      totalDocuments: 10,
      progress: 45,
    },
    {
      id: "berkeley",
      university: "UC Berkeley",
      program: "MS Data Science",
      status: "Submitted",
      priority: "high",
      deadline: "2025-05-30",
      documentsComplete: 10,
      totalDocuments: 10,
      progress: 100,
    },
    {
      id: "cmu",
      university: "CMU",
      program: "MS Software Engineering",
      status: "In Progress",
      priority: "medium",
      deadline: "2025-06-15",
      documentsComplete: 4,
      totalDocuments: 8,
      progress: 35,
    },
    {
      id: "gatech",
      university: "Georgia Tech",
      program: "MS Computer Science",
      status: "In Progress",
      priority: "medium",
      deadline: "2025-06-30",
      documentsComplete: 3,
      totalDocuments: 9,
      progress: 25,
    }
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Applications</h2>
        <div className="flex items-center space-x-2">
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
              <p className="text-xs text-muted-foreground">{new Date(app.deadline).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

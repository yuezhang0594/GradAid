import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Document {
  id: string;
  type: string;
  status: "draft" | "in_review" | "completed";
  progress: number;
  lastEdited: string;
  aiSuggestions: number;
  dueDate: string;
}

interface Requirement {
  id: string;
  name: string;
  status: "pending" | "in_progress" | "completed";
  dueDate: string;
  notes?: string;
}

interface Communication {
  id: string;
  type: "email" | "lor" | "notification";
  title: string;
  date: string;
  status: string;
  content: string;
}

export default function ApplicationDetail() {
  const { universityId } = useParams();

  // Mock data for demonstration
  const application = {
    university: "Stanford University",
    program: "MS Computer Science",
    status: "In Progress",
    priority: "high",
    deadline: "2025-05-15",
    documents: [
      {
        id: "1",
        type: "Statement of Purpose",
        status: "in_review",
        progress: 75,
        lastEdited: "2025-03-08",
        aiSuggestions: 3,
        dueDate: "2025-04-15",
      },
      {
        id: "2",
        type: "Research Statement",
        status: "draft",
        progress: 45,
        lastEdited: "2025-03-07",
        aiSuggestions: 2,
        dueDate: "2025-04-15",
      },
    ] as Document[],
    requirements: [
      {
        id: "1",
        name: "Official Transcripts",
        status: "pending",
        dueDate: "2025-04-15",
        notes: "Need to get certified translation",
      },
      {
        id: "2",
        name: "GRE Scores",
        status: "completed",
        dueDate: "2025-04-15",
      },
    ] as Requirement[],
    communications: [
      {
        id: "1",
        type: "lor",
        title: "LOR Request - Prof. Johnson",
        date: "2025-03-05",
        status: "pending",
        content: "Waiting for response",
      },
      {
        id: "2",
        type: "email",
        title: "Application Received",
        date: "2025-03-01",
        status: "completed",
        content: "Your application has been received",
      },
    ] as Communication[],
    notes: [
      {
        id: "1",
        date: "2025-03-08",
        content: "Need to emphasize research experience in SOP",
      },
      {
        id: "2",
        date: "2025-03-07",
        content: "Follow up with Prof. Johnson about LOR next week",
      },
    ],
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{application.university}</h2>
        <div className="flex items-center space-x-2">
          <Button>Edit Application</Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>University Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p>University ID: {universityId}</p>
            <p>Program: {application.program}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Status: {application.status}</p>
            <p>Priority: {application.priority}</p>
            <p>Deadline: {new Date(application.deadline).toLocaleDateString()}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

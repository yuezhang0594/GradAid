import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BellIcon,
  PencilIcon,
  SparklesIcon,
  TrashIcon,
  ExternalLinkIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ChatBot } from "@/components/chatbot";

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
  const navigate = useNavigate();

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
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 flex-col overflow-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold">{application.university}</h1>
              <p className="text-lg text-muted-foreground">{application.program}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" size="sm">
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          {/* Status Overview */}
          <Card className="mb-6">
            <CardContent className="grid grid-cols-4 gap-4 p-6">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className="mt-1" variant={application.status === "In Progress" ? "default" : "secondary"}>
                  {application.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Priority</p>
                <Badge className="mt-1" variant={application.priority === "high" ? "destructive" : "secondary"}>
                  {application.priority}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deadline</p>
                <p className="font-medium">{new Date(application.deadline).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Days Remaining</p>
                <p className="font-medium">
                  {Math.ceil((new Date(application.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Tabs */}
          <Tabs defaultValue="documents" className="space-y-4">
            <TabsList>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="communications">Communications</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            {/* Documents Tab */}
            <TabsContent value="documents">
              <div className="grid gap-4">
                {application.documents.map((doc) => (
                  <Card 
                    key={doc.id} 
                    className="cursor-pointer hover:shadow-md transition-all"
                    onClick={() => navigate(`/applications/${universityId}/documents/${doc.id}`)}
                  >
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <div>
                        <CardTitle className="text-lg">{doc.type}</CardTitle>
                        <CardDescription>Last edited {doc.lastEdited}</CardDescription>
                      </div>
                      <Badge variant={doc.status === "completed" ? "default" : "secondary"}>
                        {doc.status}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progress</span>
                            <span>{doc.progress}%</span>
                          </div>
                          <Progress value={doc.progress} />
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <SparklesIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {doc.aiSuggestions} AI suggestions
                            </span>
                          </div>
                          <Button variant="outline" size="sm">
                            <PencilIcon className="h-4 w-4 mr-2" />
                            Edit Document
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Requirements Tab */}
            <TabsContent value="requirements">
              <div className="grid gap-4">
                {application.requirements.map((req) => (
                  <Card key={req.id}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-lg">{req.name}</CardTitle>
                      <Badge variant={req.status === "completed" ? "default" : "secondary"}>
                        {req.status}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                          Due: {new Date(req.dueDate).toLocaleDateString()}
                        </div>
                        {req.notes && (
                          <p className="text-sm text-muted-foreground">
                            <BellIcon className="h-4 w-4 inline mr-2" />
                            {req.notes}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Communications Tab */}
            <TabsContent value="communications">
              <div className="grid gap-4">
                {application.communications.map((comm) => (
                  <Card key={comm.id}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <div>
                        <CardTitle className="text-lg">{comm.title}</CardTitle>
                        <CardDescription>{new Date(comm.date).toLocaleDateString()}</CardDescription>
                      </div>
                      <Badge variant={comm.status === "completed" ? "default" : "secondary"}>
                        {comm.status}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{comm.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Application Notes</CardTitle>
                    <Button variant="outline" size="sm">
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {application.notes.map((note) => (
                      <div key={note.id} className="flex gap-4 p-4 rounded-lg bg-muted/50">
                        <div className="text-sm text-muted-foreground">
                          {new Date(note.date).toLocaleDateString()}
                        </div>
                        <p className="text-sm">{note.content}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Chatbot */}
          <div className="mt-6">
            <ChatBot />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

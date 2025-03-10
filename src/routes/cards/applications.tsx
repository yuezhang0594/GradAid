import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  PlusCircle, 
  Clock, 
  FileText, 
  ChevronRight,
  CalendarIcon,
  CheckCircleIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ChatBot } from "@/components/chatbot";

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
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 flex-col overflow-auto p-4 sm:p-6 lg:p-8">
          {/* Header with Stats */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">My Applications</h1>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Application
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{applications.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Submitted</CardTitle>
                  <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {applications.filter(app => app.status === "Submitted").length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {applications.filter(app => app.status === "In Progress").length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Next Deadline</CardTitle>
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Date(Math.min(...applications.map(app => new Date(app.deadline).getTime()))).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Applications List */}
            <div className="grid gap-4">
              {applications.map((app) => (
                <Card 
                  key={app.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/applications/${app.id}`)}
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle>{app.university}</CardTitle>
                      <p className="text-sm text-muted-foreground">{app.program}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge 
                        variant={app.status === "Submitted" ? "default" : "secondary"}
                      >
                        {app.status}
                      </Badge>
                      <Badge 
                        variant={app.priority === "high" ? "destructive" : "secondary"}
                      >
                        {app.priority}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span>{app.progress}%</span>
                        </div>
                        <Progress value={app.progress} className="h-2" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Deadline</p>
                          <p className="font-medium">
                            {new Date(app.deadline).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Documents
                          </p>
                          <p className="font-medium">
                            {app.documentsComplete}/{app.totalDocuments}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Chatbot */}
          <div className="mt-6">
            <ChatBot />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

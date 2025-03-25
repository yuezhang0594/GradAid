import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronRight, AlertCircle } from "lucide-react";

export default function TimelinePage() {
  const timeline = [
    {
      date: "2025-05-15",
      university: "Stanford University",
      program: "MS Computer Science",
      requirements: [
        { type: "SOP", status: "completed" },
        { type: "Transcripts", status: "pending" },
        { type: "LORs", status: "in_progress" },
      ],
      priority: "high",
    },
    {
      date: "2025-06-01",
      university: "MIT",
      program: "PhD Computer Science",
      requirements: [
        { type: "SOP", status: "in_progress" },
        { type: "Research Statement", status: "pending" },
        { type: "LORs", status: "not_started" },
      ],
      priority: "medium",
    },
    // Add more timeline items as needed
  ];

  return (
    <main className="flex-1 flex-col space-y-8 p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Application Timeline</h1>
          <p className="text-muted-foreground">
            Track your application deadlines and requirements
          </p>
        </div>
        {/* <Button>
          <CalendarIcon className="mr-2 h-4 w-4" />
          Add Deadline
        </Button> */}
      </div>

      <div className="space-y-4">
        {timeline.map((item, index) => (
          <Card key={index} className="group hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-lg">
                    {new Date(item.date).toLocaleDateString()}
                  </CardTitle>
                  {item.priority === "high" && (
                    <Badge variant="destructive" className="ml-2">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Urgent
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  {item.university} - {item.program}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {item.requirements.map((req, idx) => (
                    <Badge
                      key={idx}
                      variant={
                        req.status === "completed"
                          ? "default"
                          : req.status === "in_progress"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {req.type}
                    </Badge>
                  ))}
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    {Math.floor(Math.random() * 30) + 1} days remaining
                  </span>
                  <span>
                    {
                      item.requirements.filter((r) => r.status === "completed")
                        .length
                    }
                    /{item.requirements.length} requirements complete
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}

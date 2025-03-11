import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  SparklesIcon,
  SaveIcon,
  HistoryIcon,
  ArrowLeftIcon,
  MessageSquareIcon,
  CheckCircleIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useCallback } from "react";

interface AIFeedback {
  id: string;
  type: "suggestion" | "correction" | "improvement";
  content: string;
  section: string;
  status: "pending" | "accepted" | "rejected";
}

interface DocumentVersion {
  id: string;
  date: string;
  changes: string;
}

export default function DocumentEditor() {
  const { universityId, documentId } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(`Dear Graduate Admissions Committee,

I am writing to express my strong interest in the Master of Science program in Computer Science at Stanford University. With my background in software engineering and my passion for artificial intelligence research, I believe I would be an excellent fit for your program.

During my undergraduate studies at UNAM, I developed a strong foundation in computer science fundamentals...`);

  const [isSaving, setIsSaving] = useState(false);

  // Mock data - in real app, fetch from backend
  const document = {
    type: "Statement of Purpose",
    university: "Stanford University",
    program: "MS Computer Science",
    lastEdited: "2025-03-09",
    wordCount: 850,
    targetWordCount: 1000,
    status: "in_progress",
    aiFeedback: [
      {
        id: "1",
        type: "suggestion",
        content: "Consider adding more specific details about your research experience",
        section: "Research Background",
        status: "pending",
      },
      {
        id: "2",
        type: "improvement",
        content: "Strengthen the connection between your past work and future goals",
        section: "Career Goals",
        status: "accepted",
      },
      {
        id: "3",
        type: "correction",
        content: "Fix grammar in the third paragraph",
        section: "Introduction",
        status: "rejected",
      },
    ] as AIFeedback[],
    versions: [
      {
        id: "1",
        date: "2025-03-09",
        changes: "Added research experience section",
      },
      {
        id: "2",
        date: "2025-03-08",
        changes: "Initial draft",
      },
    ] as DocumentVersion[],
  };

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // In real app, save to backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Show success message
    } catch (error) {
      // Show error message
    } finally {
      setIsSaving(false);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    // In real app, submit document for review
  }, []);

  return (

        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/applications/${universityId}`)}
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Application
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{document.type}</h1>
                <p className="text-muted-foreground">
                  {document.university} - {document.program}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Last edited: {document.lastEdited}
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
              >
                <SaveIcon className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Draft"}
              </Button>
              <Button size="sm" onClick={handleSubmit}>
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Submit
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Editor */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Editor</CardTitle>
                      <CardDescription>
                        {document.wordCount} / {document.targetWordCount} words
                      </CardDescription>
                    </div>
                    <Badge variant={document.status === "completed" ? "default" : "secondary"}>
                      {document.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[600px] font-mono resize-none"
                    placeholder="Start writing your document..."
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* AI Feedback */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SparklesIcon className="h-4 w-4" />
                    AI Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4">
                      {document.aiFeedback.map((feedback) => (
                        <div
                          key={feedback.id}
                          className="p-3 rounded-lg bg-muted/50 space-y-2"
                        >
                          <div className="flex justify-between items-center">
                            <Badge variant="outline" className="text-xs">
                              {feedback.section}
                            </Badge>
                            <Badge
                              variant={
                                feedback.status === "accepted"
                                  ? "default"
                                  : feedback.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {feedback.status}
                            </Badge>
                          </div>
                          <p className="text-sm">{feedback.content}</p>
                          {feedback.status === "pending" && (
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="w-full">
                                Reject
                              </Button>
                              <Button size="sm" className="w-full">
                                Accept
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    <MessageSquareIcon className="h-4 w-4 mr-2" />
                    Get More Feedback
                  </Button>
                </CardContent>
              </Card>

              {/* Version History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HistoryIcon className="h-4 w-4" />
                    Version History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px] pr-4">
                    <div className="space-y-4">
                      {document.versions.map((version) => (
                        <div
                          key={version.id}
                          className="flex justify-between items-center p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {new Date(version.date).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {version.changes}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
 
  );
}

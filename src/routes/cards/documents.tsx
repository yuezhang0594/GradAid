import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { PageWrapper } from "@/components/ui/page-wrapper";

export default function DocumentsPage() {
  const navigate = useNavigate();
  
  const universities = [
    {
      name: "Stanford University",
      program: "MS Computer Science",
      documents: [
        {
          type: "SOP",
          status: "In Review",
          progress: 75,
        },
        {
          type: "LOR",
          status: "Complete",
          progress: 100,
          count: "3/3"
        },
        {
          type: "Resume",
          status: "Complete",
          progress: 100,
        }
      ]
    },
    {
      name: "MIT",
      program: "PhD Computer Science",
      documents: [
        {
          type: "SOP",
          status: "Draft",
          progress: 45,
        },
        {
          type: "Research Statement",
          status: "Draft",
          progress: 30,
        },
        {
          type: "LOR",
          status: "In Progress",
          progress: 33,
          count: "1/3"
        }
      ]
    },
    {
      name: "UC Berkeley",
      program: "MS Data Science",
      documents: [
        {
          type: "SOP",
          status: "In Review",
          progress: 90,
        },
        {
          type: "Resume",
          status: "Complete",
          progress: 100,
        },
        {
          type: "LOR",
          status: "In Progress",
          progress: 66,
          count: "2/3"
        }
      ]
    }
  ];

  const handleDocumentClick = (university: string, docType: string) => {
    const universityId = university.toLowerCase().replace(/\s+/g, "-");
    navigate(`/applications/${universityId}/documents/${docType.toLowerCase()}`);
  };

  return (
    <PageWrapper
      title="Documents by University"
      description="View and manage application documents for each university"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {universities.map((uni) => (
          <Card key={uni.name} className="group">
            <CardHeader>
              <CardTitle className="text-lg">{uni.name}</CardTitle>
              <CardDescription>{uni.program}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {uni.documents.map((doc, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-2"
                      onClick={() => handleDocumentClick(uni.name, doc.type)}
                    >
                      <Badge 
                        variant={
                          doc.status === "Complete" ? "default" :
                          doc.status === "In Review" ? "secondary" : "outline"
                        }
                        className={cn(
                          "cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors",
                          doc.status === "Complete" && "hover:bg-primary/90",
                          doc.status === "In Review" && "hover:bg-primary/90",
                          doc.status === "Draft" && "hover:bg-primary"
                        )}
                      >
                        {doc.type}
                      </Badge>
                      {doc.count && (
                        <span className="text-xs text-muted-foreground">
                          ({doc.count})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Overall Progress</span>
                    <span>{Math.round(uni.documents.reduce((acc, doc) => acc + doc.progress, 0) / uni.documents.length)}%</span>
                  </div>
                  <Progress 
                    value={uni.documents.reduce((acc, doc) => acc + doc.progress, 0) / uni.documents.length} 
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

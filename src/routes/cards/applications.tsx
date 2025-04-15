import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { CardWrapper } from "@/components/ui/card-wrapper";

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
  const applications = useQuery(api.applications.queries.getApplications) ?? [];

  return (
    <PageWrapper
      title="Applications"
      description="View deadlines, requirements, and progress for each university."
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {applications.map((app: Application) => (
          <CardWrapper
            key={app.id}
            title={app.university}
            description={`${app.degree} in ${app.program}`}
            onClick={() => navigate(`/applications/${encodeURIComponent(app.university)}`, {
              state: {
                applicationId: app.id,
              }
            })}
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between text-sm w-full">
                <span className={`text-left ${app.status === "submitted" ? "text-green-600" : "text-orange-600"}`}>
                  {formatStatus(app.status)}
                </span>
                <span className={`text-right ${app.priority === "high" ? "text-red-600" : "text-blue-600"}`}>
                  {formatStatus(app.priority)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground w-full">
                <span className="text-left">Due {new Date(app.deadline).toLocaleDateString()}</span>
                <span className="text-right">{app.documentsComplete}/{app.totalDocuments} docs</span>
              </div>
              {/* <div className="w-full bg-secondary h-1.5 rounded-full">
                <div 
                  className="bg-primary h-1.5 rounded-full" 
                  style={{ width: `${app.progress}%` }}
                />
              </div> */}
            </div>
          </CardWrapper>
        ))}
      </div>
    </PageWrapper>
  );
}

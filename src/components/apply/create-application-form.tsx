import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id, Doc } from "../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CreateApplicationFormProps {
  programId: Id<"programs">;
}

type Program = Doc<"programs">;

type University = Doc<"universities">;

const CreateApplicationForm = ({ programId }: CreateApplicationFormProps) => {
    // Fetch program details using the programId
    const programs = useQuery(api.programs.search.getProgramsByIds, { programIds: [programId] });
    const program: Program | null = programs?.length ? programs[0] : null;
    
    // Always call hooks at the top level, not conditionally
    const universityQuery = useQuery(
      api.programs.search.getUniversity,
      program ? { universityId: program.universityId } : "skip"
    );
    const university: University | null = universityQuery ?? null;
    
    if (!program) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>
                        <Skeleton className="h-8 w-48" />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-24 w-full" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>
                    Create Application
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <h3 className="font-medium">Program Information (Test Component)</h3>
                        <p className="mt-2">Program ID: {programId}</p>
                        <p>Program Name: {program.name}</p>
                        {university && (
                            <p>University: {university.name}</p>
                        )}
                    </div>
                    <div className="text-muted-foreground text-sm italic">
                        This is a placeholder component for testing purposes.
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default CreateApplicationForm;

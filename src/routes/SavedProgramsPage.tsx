import { useMemo, useState } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { BookmarkX, ExternalLink, Calendar, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import formatDate from "@/lib/formatDate";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@/components/ui/page-wrapper";

export default function SavedProgramsPage() {
  const { toggleFavorite, savedProgramsWithUniversity, favoritesLoading } =
    useFavorites();
  const [sortOption, setSortOption] = useState("savedAt");
  const navigate = useNavigate();

  // Sort programs
  const sortedPrograms = useMemo(() => {
    return (savedProgramsWithUniversity || []).sort((a, b) => {
      if (sortOption === "savedAt") {
        return (
          new Date(b._creationTime).getTime() -
          new Date(a._creationTime).getTime()
        );
      } else if (sortOption === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortOption === "deadline") {
        const aDeadline = a.deadlines.fall
          ? new Date(a.deadlines.fall).getTime()
          : Infinity;
        const bDeadline = b.deadlines.fall
          ? new Date(b.deadlines.fall).getTime()
          : Infinity;
        return aDeadline - bDeadline;
      }
      return 0;
    });
  }, [savedProgramsWithUniversity, sortOption]);

  if (favoritesLoading) {
    return (
      <PageWrapper title="Saved Programs">
        <div className="flex justify-center py-12">
          <div className="space-y-4 w-full">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Saved Programs"
      description="Manage and compare your saved graduate programs"
    >
      {/* Results */}
      <div className="space-y-4 max-w-3xl mx-auto">
        {sortedPrograms.length === 0 ? (
          <EmptyState
            icon={BookmarkX}
            title="No saved programs"
            description="You haven't saved any programs yet.
                        Browse programs and click the heart icon to save them for later."
            actionLabel="Search Programs"
            actionHref="/search"
          />
        ) : (
          <>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-muted-foreground">
                Showing {sortedPrograms.length} saved{" "}
                {sortedPrograms.length === 1 ? "program" : "programs"}
              </p>
            </div>

            {sortedPrograms.map((program) => (
              <Card key={program._id} className="overflow-hidden pb-0 pt-2">
                <div className="text-left px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-md">
                      {program.degree} in {program.name}
                    </CardTitle>
                    {/* TODO: add modal confirmation before deleting favorite */}
                    <Button
                      onClick={() => toggleFavorite(program._id)}
                      variant="ghost"
                      size="icon"
                      className="text-red-500 h-8 w-8"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <CardDescription className="text-sm">
                    <strong>{program.university?.name}</strong> •{" "}
                    {program.university?.location.city},{" "}
                    {program.university?.location.state}
                    <br />
                    {program.department}
                  </CardDescription>
                </div>
                <CardContent className="text-left px-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Deadline</h4>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                        <span>Fall: {formatDate(program.deadlines.fall)}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">Requirements</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {program.requirements.gre ? (
                          <Badge
                            variant="outline"
                            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          >
                            GRE Required
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-800 hover:bg-green-100"
                          >
                            GRE Waiver
                          </Badge>
                        )}
                        {program.requirements.toefl ? (
                          <Badge
                            variant="outline"
                            className="bg-blue-100 text-blue-800 hover:bg-blue-100"
                          >
                            TOEFL Required
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-800 hover:bg-green-100"
                          >
                            TOEFL Waiver
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-1">Minimum GPA</h4>
                      <Badge
                        variant="outline"
                        className="bg-purple-100 text-purple-800 hover:bg-purple-100"
                      >
                        GPA: {program.requirements.minimumGPA}+
                      </Badge>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="border-t px-4 py-2">
                  <div className="flex flex-col sm:flex-row justify-between w-full gap-2">
                    <Button variant="link" asChild className="text-sm p-0 px-0">
                      <a
                        href={program.university?.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center"
                      >
                        University Website{" "}
                        <ExternalLink className="ml-1 h-4 w-4" />
                      </a>
                    </Button>
                    {/* TODO: route to application page, prefill program details */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigate(`/apply?programId=${program._id}&create`)
                      }
                      className="w-full sm:w-auto"
                    >
                      Start Application
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </>
        )}
        {sortedPrograms.length > 0 && (
          <div className="flex justify-center pt-4">
            <Button
              onClick={() => navigate("/search")}
              className="w-full sm:w-auto"
            >
              Search for More Programs
            </Button>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

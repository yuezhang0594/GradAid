import { useMemo, useState } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { BookmarkX, ExternalLink, Calendar, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import formatDate from "@/lib/formatDate";

export default function SavedProgramsPage() {
    const { toggleFavorite, getFavoriteProgramsWithUniversity, isFavorite, favoritesLoading, } = useFavorites();
    const [sortOption, setSortOption] = useState("savedAt");
    const savedPrograms = getFavoriteProgramsWithUniversity();

    // Sort programs
    const sortedPrograms = useMemo(() => {
        return savedPrograms.sort((a, b) => {
            if (sortOption === "savedAt") {
                return new Date(b._creationTime).getTime() - new Date(a._creationTime).getTime();
            } else if (sortOption === "name") {
                return a.name.localeCompare(b.name);
            } else if (sortOption === "deadline") {
                const aDeadline = a.deadlines.fall ? new Date(a.deadlines.fall).getTime() : Infinity;
                const bDeadline = b.deadlines.fall ? new Date(b.deadlines.fall).getTime() : Infinity;
                return aDeadline - bDeadline;
            }
            return 0;
        });
    }, [savedPrograms, sortOption]);


    if (favoritesLoading) {
        return (
            <div className="flex justify-center py-12">
                <div className="space-y-4 w-full">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-[300px] w-full" />
                    <Skeleton className="h-[300px] w-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Saved Programs</h1>
                <p className="text-muted-foreground">
                    Manage and compare your saved graduate programs
                </p>
            </div>

            {/* Results */}
            <div className="space-y-4">
                {sortedPrograms.length === 0 ? (
                    <EmptyState
                        icon={BookmarkX}
                        title="No saved programs"
                        description="You haven't saved any programs yet. Browse programs and click the heart icon to save them for later."
                        actionLabel="Search Programs"
                        actionHref="/search"
                    />
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-sm text-muted-foreground">
                                Showing {sortedPrograms.length} saved {sortedPrograms.length === 1 ? "program" : "programs"}
                            </p>
                        </div>

                        {sortedPrograms.map((program) => (
                            <Card key={program._id} className="overflow-hidden">
                                <div className="border-b px-6 py-4 flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg mb-1">{program.degree} in {program.name}</CardTitle>
                                        <CardDescription className="text-sm">
                                            {program.university?.name} • {program.university?.location.city}, {program.university?.location.state}
                                            {program.university?.ranking && (
                                                <span className="ml-2">
                                                    <Badge variant="secondary" className="ml-1">
                                                        Rank #{program.university.ranking}
                                                    </Badge>
                                                </span>
                                            )}
                                        </CardDescription>
                                        <p className="text-sm text-muted-foreground mt-1">{program.department}</p>
                                    </div>
                                    <Button
                                        onClick={() => toggleFavorite(program._id)}
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 h-8 w-8"
                                    >
                                        <X
                                            className="h-5 w-5"
                                        />
                                    </Button>
                                </div>

                                <CardContent className="px-6 py-4">
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
                                                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                                        GRE Required
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                                                        GRE Waiver
                                                    </Badge>
                                                )}
                                                {program.requirements.toefl && (
                                                    <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                                        TOEFL Required
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium mb-1">Minimum GPA</h4>
                                            <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                                                GPA: {program.requirements.minimumGPA}+
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter className="border-t px-6 py-3 bg-slate-50">
                                    <div className="flex justify-between w-full">
                                        <Button
                                            variant="link"
                                            asChild
                                            className="text-sm p-0"
                                        >
                                            <a
                                                href={program.university?.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center"
                                            >
                                                University Website <ExternalLink className="ml-1 h-4 w-4" />
                                            </a>
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.location.href = `/search?university=${program.university?._id}`}
                                        >
                                            Apply Now
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}

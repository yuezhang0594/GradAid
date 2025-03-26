import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useApply } from "@/hooks/useApply";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { BookmarkPlus, ExternalLink, Calendar } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { Badge } from "@/components/ui/badge";
import formatDate from "@/lib/formatDate";

const ProgramApplyPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // const { savedPrograms, isLoading } = useApply();
    const { savedProgramsWithUniversity, favoritesLoading } = useFavorites();
    const savedPrograms = savedProgramsWithUniversity
    console.table(savedPrograms)
    // Parse program ID from URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const programIdFromUrl = queryParams.get("programId");

    const [selectedProgram, setSelectedProgram] = useState(programIdFromUrl || "");

    // Update URL when selected program changes
    useEffect(() => {
        if (selectedProgram) {
            navigate(`?programId=${selectedProgram}`, { replace: true });
        } else {
            navigate("", { replace: true });
        }
    }, [selectedProgram, navigate]);

    const handleProgramChange = (value: string) => {
        setSelectedProgram(value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Starting application for program: ${selectedProgram}`);
        // Here you would normally proceed to the next step
    };

    // Find the selected program details
    const selectedProgramDetails = savedPrograms?.find(p => p._id === selectedProgram);

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <h1 className="text-3xl font-bold mb-6">Apply to a Graduate Program</h1>
            {favoritesLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
            ) : !savedPrograms?.length ? (
                <EmptyState
                    icon={BookmarkPlus}
                    title="No Saved Programs"
                    description="You need to save some graduate programs before applying. Please search and save programs first."
                    actionLabel="Search Programs"
                    actionHref="/search"
                />
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Program Selection</CardTitle>
                        <CardDescription>Choose the graduate program you want to apply to</CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="program">Select a Program</Label>

                                <Select
                                    value={selectedProgram}
                                    onValueChange={handleProgramChange}
                                >
                                    <SelectTrigger id="program" className="w-full">
                                        <SelectValue placeholder="-- Select a Program --" />
                                    </SelectTrigger>
                                    <SelectContent 
                                        position="popper" 
                                        className="max-h-[300px] overflow-y-auto w-[var(--radix-select-trigger-width)]"
                                        side="bottom"
                                        sideOffset={4}
                                    >
                                        {savedPrograms.map((program) => (
                                            <SelectItem key={program._id} value={program._id}>
                                                {program.degree} in {program.name} at {program.university.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedProgram && selectedProgramDetails && (
                                <Card className="overflow-hidden pb-0 pt-2">
                                    <div className="text-left px-4">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-md">{selectedProgramDetails.degree} in {selectedProgramDetails.name}</CardTitle>
                                        </div>
                                        <CardDescription className="text-sm">
                                            <strong>{selectedProgramDetails.university?.name}</strong>  •  {selectedProgramDetails.university?.location.city}, {selectedProgramDetails.university?.location.state}
                                            <br />
                                            {selectedProgramDetails.department}
                                        </CardDescription>
                                    </div>
                                    <CardContent className="text-left px-4">
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                                            <div>
                                                <h4 className="text-sm font-medium mb-1">Deadline</h4>
                                                <div className="flex items-center text-sm">
                                                    <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                                    <span>Fall: {formatDate(selectedProgramDetails.deadlines.fall)}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium mb-1">Requirements</h4>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {selectedProgramDetails.requirements.gre ? (
                                                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                                            GRE Required
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                                                            GRE Waiver
                                                        </Badge>
                                                    )}
                                                    {selectedProgramDetails.requirements.toefl ? (
                                                        <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                                            TOEFL Required
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                                                            TOEFL Waiver
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium mb-1">Minimum GPA</h4>
                                                <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                                                    GPA: {selectedProgramDetails.requirements.minimumGPA}+
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="border-t px-4 py-2">
                                        <div className="flex flex-col sm:flex-row justify-between w-full gap-2">
                                            <Button
                                                variant="link"
                                                asChild
                                                className="text-sm p-0 px-0"
                                            >
                                                <a
                                                    href={selectedProgramDetails.university?.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center"
                                                >
                                                    University Website <ExternalLink className="ml-1 h-4 w-4" />
                                                </a>
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={!selectedProgram || favoritesLoading}
                                                className="w-full sm:w-auto"
                                            >
                                                Start Application
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </Card>
                            )}
                        </CardContent>
                    </form>
                </Card>
            )}
        </div>
    );
};

export default ProgramApplyPage;

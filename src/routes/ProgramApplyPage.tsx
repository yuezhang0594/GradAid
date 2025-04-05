import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { BookmarkPlus, Search } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import ApplyProgramSelector from "@/components/apply/apply-program-selector";
import CreateApplicationForm from "@/components/apply/create-application-form";
import { Id } from "convex/_generated/dataModel";

const ProgramApplyPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { savedProgramsWithUniversity, favoritesLoading } = useFavorites();
    const savedPrograms = savedProgramsWithUniversity;
    
    // Parse query parameters from URL
    const queryParams = new URLSearchParams(location.search);
    const programIdFromUrl = queryParams.get("programId") || "";
    // Add a new parameter to check if we should show the create application form
    const showCreateForm = queryParams.get("create") !== null && programIdFromUrl;

    const handleSubmit = (programId: string) => {
        // Navigate to the same page but with create=true parameter
        navigate(`/apply?programId=${programId}&create`);
    };

    return (
        <PageWrapper
            title={"New Application"}
            description={showCreateForm 
                ? "Complete your application details" 
                : "Choose the graduate program you want to apply to"
            }
        >
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
            ) : showCreateForm ? (
                <CreateApplicationForm programId={programIdFromUrl as Id<"programs">} />
            ) : (
                <ApplyProgramSelector 
                    savedPrograms={savedPrograms}
                    initialProgramId={programIdFromUrl}
                    onSubmit={handleSubmit}
                />
            )}
            {!showCreateForm && (savedPrograms?.length || 0) > 0 && (
                <Alert className="mt-4 max-w-3xl mx-auto">
                    <AlertDescription className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span>Don't see the program you want to apply for? <br className="block md:hidden"/>Save the program first.</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/search')}
                            className="shrink-0"
                        >
                            <Search className="h-4 w-4 mr-2" />
                            Search Programs
                        </Button>
                    </AlertDescription>
                </Alert>
            )}
        </PageWrapper>
    );
};

export default ProgramApplyPage;

import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Calendar } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import formatDate from "@/lib/formatDate";

// Form schema for validation
const formSchema = z.object({
  programId: z.string().min(1, "Please select a program"),
});

type FormValues = z.infer<typeof formSchema>;

interface Program {
  _id: string;
  name: string;
  degree: string;
  department: string;
  deadlines: {
    fall?: string | undefined;
    spring?: string | undefined;
  };
  requirements: {
    gre?: boolean | undefined;
    toefl?: boolean | undefined;
    recommendationLetters?: number;
    minimumGPA?: number | undefined;
  };
  university: {
    name: string;
    location: {
      city: string;
      state: string;
    };
    website: string;
  };
}

interface ApplyProgramSelectorProps {
  savedPrograms: Program[];
  initialProgramId?: string;
  onSubmit: (programId: string) => void;
}

const ApplyProgramSelector = ({
  savedPrograms,
  initialProgramId = "",
  onSubmit,
}: ApplyProgramSelectorProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize form with the defaultValues
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      programId: initialProgramId,
    },
  });

  // Update URL when selected program changes
  useEffect(() => {
    // Get current programId value
    const programId = form.watch("programId");
    
    // Only update URL if we're still on the apply page and not being redirected
    if (location.pathname === "/apply") {
      const updatedUrl = programId 
        ? `/apply?programId=${programId}`
        : "/apply";
          
      // Only navigate if the URL actually needs to change
      if (location.search !== (programId ? `?programId=${programId}` : "")) {
        navigate(updatedUrl, { replace: true });
      }
    }
  }, [form.watch("programId"), location.pathname, location.search, navigate]);

  const handleSubmit = (data: FormValues) => {
    onSubmit(data.programId);
  };

  // Find the selected program details
  const selectedProgramDetails = savedPrograms?.find(p => p._id === form.watch("programId"));

  return (
    <div className="max-w-3xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FormField
            control={form.control}
            name="programId"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
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
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch("programId") && selectedProgramDetails && (
            <Card className="overflow-hidden pb-0 pt-2 mt-4">
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
                    disabled={!form.watch("programId")}
                    className="w-full sm:w-auto"
                  >
                    Start Application
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}
        </form>
      </Form>
    </div>
  );
};

export default ApplyProgramSelector;

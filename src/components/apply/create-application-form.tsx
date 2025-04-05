import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Id } from "../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useApply } from "@/hooks/useApply";
import { useNavigate } from "react-router-dom";

interface CreateApplicationFormProps {
  programId: Id<"programs">;
}

// Define form schema using Zod for validation
const formSchema = z.object({
  deadline: z.string({
    required_error: "Please select an application deadline",
  }),
  priority: z.string({
    required_error: "Please select a priority level",
  }),
  notes: z.string().optional(),
  requirements: z.array(z.string()).nonempty({
    message: "You must acknowledge at least one requirement",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const CreateApplicationForm = ({ programId }: CreateApplicationFormProps) => {
    const navigate = useNavigate();
    const { program, university, isLoading, createApplication, isCreating } = useApply(programId);
    
    // Initialize form with react-hook-form and zod resolver
    const form = useForm<FormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        deadline: "",
        priority: "medium",
        notes: "",
        requirements: [],
      },
    });

    // Sample requirements that would eventually come from the program data
    const sampleRequirements = [
      { id: "sop", label: "Statement of Purpose" },
      { id: "lor", label: "Letters of Recommendation" },
      { id: "transcript", label: "Official Transcripts" },
      { id: "resume", label: "Resume/CV" },
      { id: "gre", label: "GRE Scores" },
      { id: "toefl", label: "TOEFL/IELTS Scores" },
    ];

    const onSubmit = async (data: FormValues) => {
      if (!program || !university) return;
      
      // Convert requirements to the format expected by the API
      const formattedRequirements = data.requirements.map(reqId => {
        const req = sampleRequirements.find(r => r.id === reqId);
        return {
          type: req?.label || reqId,
          status: "not_started" as const
        };
      });
      
      const applicationId = await createApplication({
        universityId: program.universityId,
        programId: program._id,
        deadline: data.deadline,
        priority: data.priority as "high" | "medium" | "low",
        notes: data.notes,
        requirements: formattedRequirements
      });
      
      if (applicationId) {
        // Navigate to the application detail page after successful creation
        navigate(`/applications/${applicationId}`);
      }
    };

    if (isLoading || !program) {
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
                <CardTitle>Create Application</CardTitle>
                <CardDescription>
                    {university?.name} - {program.degree} in {program.name}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Deadline Selection */}
                            <FormField
                                control={form.control}
                                name="deadline"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Application Deadline</FormLabel>
                                        <Select 
                                            onValueChange={field.onChange} 
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a deadline" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="fall">Fall 2025 (Dec 15, 2024)</SelectItem>
                                                <SelectItem value="winter">Winter 2026 (Sep 15, 2025)</SelectItem>
                                                <SelectItem value="spring">Spring 2026 (Jan 15, 2026)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Choose the application deadline you're targeting
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Priority Selection */}
                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Priority</FormLabel>
                                        <Select 
                                            onValueChange={field.onChange} 
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="high">High Priority</SelectItem>
                                                <SelectItem value="medium">Medium Priority</SelectItem>
                                                <SelectItem value="low">Low Priority</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Set the importance of this application
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Notes Textarea */}
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea 
                                            placeholder="Add any personal notes about this application..." 
                                            className="resize-none min-h-[120px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Include any specific details or reminders for this application
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Requirements Checkboxes */}
                        <FormField
                            control={form.control}
                            name="requirements"
                            render={() => (
                                <FormItem>
                                    <div className="mb-4">
                                        <FormLabel>Program Requirements</FormLabel>
                                        <FormDescription>
                                            Confirm the documents you'll need to prepare for this application
                                        </FormDescription>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {sampleRequirements.map((requirement) => (
                                            <FormField
                                                key={requirement.id}
                                                control={form.control}
                                                name="requirements"
                                                render={({ field }) => {
                                                    return (
                                                        <FormItem
                                                            key={requirement.id}
                                                            className="flex flex-row items-start space-x-3 space-y-0"
                                                        >
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value?.includes(requirement.id)}
                                                                    onCheckedChange={(checked) => {
                                                                        return checked
                                                                            ? field.onChange([...field.value, requirement.id])
                                                                            : field.onChange(
                                                                                field.value?.filter(
                                                                                    (value) => value !== requirement.id
                                                                                )
                                                                            );
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="font-normal cursor-pointer">
                                                                {requirement.label}
                                                            </FormLabel>
                                                        </FormItem>
                                                    );
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <FormMessage className="mt-2" />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6">
                <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
                <Button 
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isCreating}
                >
                  {isCreating ? "Creating..." : "Create Application"}
                </Button>
            </CardFooter>
        </Card>
    );
};

export default CreateApplicationForm;

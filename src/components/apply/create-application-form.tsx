import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Id } from "#/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { useApply } from "@/hooks/useApply";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import formatDate from "@/lib/formatDate";
import { DocumentStatus, DocumentType, ApplicationPriority, APPLICATION_NOTES_MAX_CHARS } from "#/validators";
import { toast } from 'sonner';
import { sanitizeInput } from "@/lib/inputValidation";

interface CreateApplicationFormProps {
    programId: Id<"programs">;
}

// Define form schema using Zod for validation
const formSchema = z.object({
    deadline: z.string({
        required_error: "Please select an application deadline",
    }).min(1, "Please select an application deadline"),
    customDeadline: z.string().optional(),
    priority: z.string({
        required_error: "Please select a priority level",
    }),
    notes: z.string()
        .max(APPLICATION_NOTES_MAX_CHARS, { message: `Notes are too long (maximum ${APPLICATION_NOTES_MAX_CHARS} characters)` })
        .optional()
        .transform(val => {
            // Sanitize and trim input, transform empty strings to undefined
            if (!val) return undefined;
            // Remove potential HTML/script tags and trim whitespace
            return sanitizeInput(val) || undefined;
        }),
    documents: z.array(z.string()).nonempty({
        message: "You must select at least one document to generate",
    }),
    lorCount: z.number().min(1, "You need at least 1 letter of recommendation").max(5, "Maximum 5 letters allowed").optional(),
}).refine(
    (data) => {
        // If deadline is set to custom, customDeadline must be filled
        return data.deadline !== OTHER_DEADLINE_VALUE || (data.customDeadline && data.customDeadline.length > 0);
    },
    {
        message: "Custom deadline date is required",
        path: ["customDeadline"],
    }
).refine(
    (data) => {
        // If customDeadline is provided, ensure it's a future date
        if (data.deadline === OTHER_DEADLINE_VALUE && data.customDeadline) {
            const selectedDate = new Date(data.customDeadline);
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            return selectedDate >= tomorrow;
        }
        return true;
    },
    {
        message: "Deadline must be at least one day in the future",
        path: ["customDeadline"],
    }
);

type FormValues = z.infer<typeof formSchema>;

const OTHER_DEADLINE_VALUE = "custom";
const LOR_ID = "lor" as DocumentType;
const SOP_ID = "sop" as DocumentType;

const CreateApplicationForm = ({ programId }: CreateApplicationFormProps) => {
    const navigate = useNavigate();
    const { program, university, isLoading, createApplication, isCreating } = useApply(programId);
    const [isCustomDeadline, setIsCustomDeadline] = useState(false);
    const [needsLorCount, setNeedsLorCount] = useState(false);

    // Initialize form with react-hook-form and zod resolver
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            deadline: "",
            customDeadline: "",
            priority: "medium",
            notes: "",
            documents: [],
            lorCount: 3,
        },
    });

    // Watch the deadline field to determine if we should show the custom date picker
    const selectedDeadline = form.watch("deadline");
    // Watch the documents field to determine if we should show LOR count input
    const selectedDocuments = form.watch("documents");

    useEffect(() => {
        setIsCustomDeadline(selectedDeadline === OTHER_DEADLINE_VALUE);
        setNeedsLorCount(selectedDocuments.includes(LOR_ID));
    }, [selectedDeadline, selectedDocuments]);

    // Document generation options
    const documentOptions = [
        { id: SOP_ID, label: "Statement of Purpose (SOP)" },
        { id: LOR_ID, label: "Letters of Recommendation (LOR)" },
    ];

    // Get tomorrow's date for min attribute on date input
    const getTomorrowFormatted = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    };

    const onSubmit = async (data: FormValues) => {
        try {
            if (!program || !university) return;

            // Convert documents to the format expected by the API
            const formattedRequirements = [];

            // Process each document type selected by the user
            for (const docId of data.documents) {
                if (docId === LOR_ID && needsLorCount && data.lorCount) {
                    // Create multiple LOR documents based on lorCount
                    for (let i = 1; i <= data.lorCount; i++) {
                        formattedRequirements.push({
                            type: docId as DocumentType,
                            status: "not_started" as DocumentStatus
                        });
                    }
                } else {
                    // Add a single document for other types (like SOP)
                    formattedRequirements.push({
                        type: docId as DocumentType,
                        status: "not_started" as DocumentStatus
                    });
                }
            }

            // Get the correct date value in YYYY-MM-DD format
            let deadlineValue: string;

            if (data.deadline === OTHER_DEADLINE_VALUE) {
                // Custom deadline is already in YYYY-MM-DD format from the date input
                deadlineValue = data.customDeadline!;
            } else {
                // Get the actual date from the program's deadlines object for the selected term
                const selectedDate = program.deadlines?.[data.deadline as keyof typeof program.deadlines];

                if (selectedDate) {
                    const date = new Date(formatDate(selectedDate))
                    deadlineValue = date.toISOString().split('T')[0];
                } else {
                    deadlineValue = "";
                }
            }

            // Sanitize notes input
            if (data.notes) {
                data.notes = sanitizeInput(data.notes);
            }


            const applicationId = await createApplication({
                universityId: program.universityId,
                programId: program._id,
                deadline: deadlineValue,
                priority: data.priority as ApplicationPriority,
                notes: data.notes,
                applicationDocuments: formattedRequirements
            });

            if (applicationId) {
                toast.success("Application created successfully!");
                // Navigate to the application detail page after successful creation
                navigate(`/applications/${university.name}`, {
                    state: {
                        applicationId,
                        universityName: university.name,
                    }
                });
            }
        } catch (error) {
            toast.error("Failed to create application. Please check your form inputs.");
            console.error("Application creation error:", error);
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
        <Card className="max-w-3xl mx-auto text-left">
            <CardHeader className="border-b pb-4">
                <CardTitle className="text-l font-bold">
                    {university?.name} - {program.degree} in {program.name}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Deadline Selection */}
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="deadline"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Application Deadline</FormLabel>
                                            <FormDescription>
                                                Choose the deadline you're targeting
                                            </FormDescription>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                required
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a deadline" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {program.deadlines ? (
                                                        Object.entries(program.deadlines)
                                                            .filter(([_, date]) => date !== null)
                                                            .map(([term, date]) => {
                                                                // Format date using the formatDate utility
                                                                const formattedDate = formatDate(date);

                                                                // Capitalize first letter of term
                                                                const formattedTerm = term.charAt(0).toUpperCase() + term.slice(1);

                                                                return (
                                                                    <SelectItem key={term} value={term}>
                                                                        {formattedTerm} ({formattedDate})
                                                                    </SelectItem>
                                                                );
                                                            })
                                                    ) : (
                                                        <SelectItem value="none" disabled>
                                                            No deadlines available
                                                        </SelectItem>
                                                    )}
                                                    <SelectItem value={OTHER_DEADLINE_VALUE}>Other (Custom deadline)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Custom Deadline Input (shows only when "Other" is selected) */}
                                {isCustomDeadline && (
                                    <FormField
                                        control={form.control}
                                        name="customDeadline"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Custom Deadline Date <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="date"
                                                        {...field}
                                                        required={isCustomDeadline}
                                                        min={getTomorrowFormatted()}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>

                            {/* Priority Selection */}
                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Priority</FormLabel>
                                        <FormDescription>
                                            Set the importance of this application
                                        </FormDescription>
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
                                        <div className="flex justify-between items-center">
                                    <FormDescription>
                                            Include any specific details or reminders for this application
                                    </FormDescription>
                                            <span className={`text-xs ${(field.value?.length || 0) > APPLICATION_NOTES_MAX_CHARS ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                                                {field.value?.length || 0}/{APPLICATION_NOTES_MAX_CHARS}
                                            </span>
                                        </div>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Add any personal notes about this application..."
                                            className="resize-none min-h-[120px]"
                                            maxLength={APPLICATION_NOTES_MAX_CHARS + 50} // Allow a little over the limit for better UX
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Document Generation Options */}
                        <FormField
                            control={form.control}
                            name="documents"
                            render={() => (
                                <FormItem>
                                    <div className="mb-4">
                                        <FormLabel>Select the documents to generate with AI</FormLabel>
                                        <FormDescription>
                                            Choose which application documents you want GradAid to generate for you
                                        </FormDescription>
                                    </div>
                                    <div className="space-y-3">
                                        {documentOptions.map((document) => (
                                            <FormField
                                                key={document.id}
                                                control={form.control}
                                                name="documents"
                                                render={({ field }) => {
                                                    return (
                                                        <FormItem
                                                            key={document.id}
                                                            className="flex flex-row items-start space-x-3 space-y-0"
                                                        >
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value?.includes(document.id)}
                                                                    onCheckedChange={(checked) => {
                                                                        return checked
                                                                            ? field.onChange([...field.value, document.id])
                                                                            : field.onChange(
                                                                                field.value?.filter(
                                                                                    (value) => value !== document.id
                                                                                )
                                                                            );
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="font-normal cursor-pointer">
                                                                {document.label}
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

                        {/* LOR Count input (only shown when LOR is selected) */}
                        {needsLorCount && (
                            <FormField
                                control={form.control}
                                name="lorCount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Number of recommendation letters</FormLabel>
                                        <div className="flex items-center gap-4">
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    max={5}
                                                    className="w-16"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                                    value={field.value}
                                                />
                                            </FormControl>
                                            <FormDescription className="mt-0">
                                                How many LORs do you need for this application?
                                            </FormDescription>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
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

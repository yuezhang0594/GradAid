import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useProgram } from "@/hooks/useProgram";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger
} from "@/components/ui/dialog";

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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useProgramSearch } from "@/hooks/useProgramSearch";

// Define form schema using Zod for validation
const formSchema = z.object({
    universityId: z.string({
        required_error: "Please select a university",
    }),
    name: z.string().min(2, "Program name must be at least 2 characters"),
    degree: z.string({
        required_error: "Please select a degree type",
    }),
    customDegree: z.string().min(1, "Custom degree must be provided").optional(),
    department: z.string().min(2, "Department name must be at least 2 characters"),
    website: z.string().url("Please enter a valid URL").optional(),
    // Requirements
    minimumGPA: z.coerce.number().min(0).max(4.0).optional(),
    gre: z.boolean().default(false),
    toefl: z.boolean().default(false),
    recommendationLetters: z.coerce.number().min(0).max(10).optional(),
    // Deadlines
    fallDeadline: z.string().optional(),
    springDeadline: z.string().optional(),
})
.refine(data => {
    // If degree is "Other", both customDegree must be provided
    return data.degree !== "Other" || (
        data.degree === "Other" && 
        data.customDegree && 
        data.customDegree.length > 0
    );
}, {
    message: "Degree is required when 'Other' is selected",
    path: ["customDegree"]
});

type FormValues = z.infer<typeof formSchema>;

// Field definitions for form modularity
type FieldDefinition = {
    name: keyof FormValues;
    label: string;
    description?: string;
    renderField: (field: any) => React.ReactNode;
};

interface AddProgramFormProps {
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const AddProgramForm = ({ trigger, open: controlledOpen, onOpenChange }: AddProgramFormProps) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const { universityOptions, isLoadingUniversities, isSubmitting, createProgram } = useProgram();
    const { uniqueDegreeTypes } = useProgramSearch();

    // Determine if we're in controlled or uncontrolled mode
    const isControlled = controlledOpen !== undefined && onOpenChange !== undefined;
    const isOpen = isControlled ? controlledOpen : uncontrolledOpen;
    const setIsOpen = isControlled ? onOpenChange : setUncontrolledOpen;

    // Initialize form with react-hook-form and zod resolver
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            universityId: "",
            name: "",
            degree: "",
            department: "",
            website: "",
            minimumGPA: undefined,
            gre: false,
            toefl: false,
            recommendationLetters: undefined,
            fallDeadline: "",
            springDeadline: "",
        },
    });

    // Define modular field components
    const universityField: FieldDefinition = {
        name: "universityId",
        label: "University",
        description: "Select the university for this program",
        renderField: (field) => (
            universityOptions.length > 0 ? (
                <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoadingUniversities}
                >
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a university" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {universityOptions.map(option => (
                            <SelectItem
                                key={option.value}
                                value={option.value}
                            >
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ) : (
                <FormDescription>
                    {isLoadingUniversities ? "Loading universities..." : "No universities available"}
                </FormDescription>
            )
        )
    };

    const programNameField: FieldDefinition = {
        name: "name",
        label: "Program Name",
        description: "Enter the area of study, not including MS, PhD, etc.",
        renderField: (field) => (
            <FormControl>
                <Input placeholder="e.g. Computer Science" {...field} />
            </FormControl>
        )
    };

    const degreeField: FieldDefinition = {
        name: "degree",
        label: "Degree Type",
        renderField: (field) => (
            <Select
                onValueChange={field.onChange}
                value={field.value}
            >
                <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select degree type" />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    {uniqueDegreeTypes.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                    <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
            </Select>
        )
    };

    const customDegreeField: FieldDefinition = {
        name: "customDegree",
        label: "Custom Degree",
        description: "Enter the title of the degree. MS, PhD, etc.",
        renderField: (field) => (
            <FormControl>
                <Input placeholder="e.g. MSE, MEng, MCS" {...field} />
            </FormControl>
        )
    };

    const departmentField: FieldDefinition = {
        name: "department",
        label: "Department",
        renderField: (field) => (
            <FormControl>
                <Input placeholder="e.g. School of Engineering" {...field} />
            </FormControl>
        )
    };

    const websiteField: FieldDefinition = {
        name: "website",
        label: "Program Website",
        renderField: (field) => (
            <FormControl>
                <Input placeholder="https://program-website.edu" {...field} />
            </FormControl>
        )
    };

    const minimumGPAField: FieldDefinition = {
        name: "minimumGPA",
        label: "Minimum GPA",
        renderField: (field) => (
            <FormControl>
                <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="4.0"
                    placeholder="e.g. 3.0"
                    {...field}
                    value={field.value === undefined ? "" : field.value}
                    onChange={(e) => {
                        const value = e.target.value === "" ? undefined : parseFloat(e.target.value);
                        field.onChange(value);
                    }}
                />
            </FormControl>
        )
    };

    const recommendationLettersField: FieldDefinition = {
        name: "recommendationLetters",
        label: "Recommendation Letters",
        renderField: (field) => (
            <FormControl>
                <Input
                    type="number"
                    min="0"
                    max="10"
                    placeholder="e.g. 3"
                    {...field}
                    value={field.value === undefined ? "" : field.value}
                    onChange={(e) => {
                        const value = e.target.value === "" ? undefined : parseInt(e.target.value);
                        field.onChange(value);
                    }}
                />
            </FormControl>
        )
    };

    const greField: FieldDefinition = {
        name: "gre",
        label: "GRE Required",
        description: "Does this program require GRE scores?",
        renderField: (field) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                    <FormLabel>GRE Required</FormLabel>
                    <FormDescription>
                        Does this program require GRE scores?
                    </FormDescription>
                </div>
                <FormControl>
                    <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                    />
                </FormControl>
            </FormItem>
        )
    };

    const toeflField: FieldDefinition = {
        name: "toefl",
        label: "TOEFL Required",
        description: "Does this program require TOEFL scores?",
        renderField: (field) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                    <FormLabel>TOEFL Required</FormLabel>
                    <FormDescription>
                        Does this program require TOEFL scores?
                    </FormDescription>
                </div>
                <FormControl>
                    <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                    />
                </FormControl>
            </FormItem>
        )
    };

    const fallDeadlineField: FieldDefinition = {
        name: "fallDeadline",
        label: "Fall Deadline",
        renderField: (field) => (
            <FormControl>
                <Input type="date" {...field} />
            </FormControl>
        )
    };

    const springDeadlineField: FieldDefinition = {
        name: "springDeadline",
        label: "Spring Deadline",
        renderField: (field) => (
            <FormControl>
                <Input type="date" {...field} />
            </FormControl>
        )
    };

    // Helper function to render form fields
    const renderFormField = (fieldDef: FieldDefinition) => (
        <FormField
            key={fieldDef.name}
            control={form.control}
            name={fieldDef.name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{fieldDef.label}</FormLabel>
                    {fieldDef.description && <FormDescription>{fieldDef.description}</FormDescription>}
                    {fieldDef.renderField(field)}
                    <FormMessage />
                </FormItem>
            )}
        />
    );

    // Special case for switch fields that have their own FormItem rendering
    const renderSwitchField = (fieldDef: FieldDefinition) => (
        <FormField
            key={fieldDef.name}
            control={form.control}
            name={fieldDef.name}
            render={({ field }) => <>{fieldDef.renderField(field)}</>}
        />
    );

    const onSubmit = async (data: FormValues) => {
        try {
            let degreeValue = data.degree;
            
            // If "Other" is selected, combine code and name in a structured format
            if (data.degree === "Other" && data.customDegree) {
                // Store as an object to preserve both values separately
                degreeValue = JSON.stringify({
                    code: data.customDegree
                });
            }
            
            const programId = await createProgram({
                universityId: data.universityId as any, // Type assertion to match Id<"universities">
                name: data.name,
                degree: degreeValue,
                department: data.department,
                requirements: {
                    minimumGPA: data.minimumGPA,
                    gre: data.gre,
                    toefl: data.toefl,
                    recommendationLetters: data.recommendationLetters
                },
                deadlines: {
                    fall: data.fallDeadline || null,
                    spring: data.springDeadline || null
                },
                website: data.website
            });

            toast.success("Program created", {
                description: "Your program has been successfully added to our database."
            });

            // Close dialog
            setIsOpen(false);

            // Reset form
            form.reset();

            return programId;
        } catch (error) {
            console.error("Error creating program:", error);

            toast.error("Error", {
                description: "There was a problem creating your program. Please try again."
            });

            throw error;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="p-0">
                <DialogHeader className="px-6 pt-6 text-left border-b pb-4">
                    <DialogTitle>Add New Program</DialogTitle>
                    <DialogDescription>
                        Add a new program to the database by filling out the details below
                    </DialogDescription>
                </DialogHeader>

                <div className="px-6 py-4 overflow-y-auto max-h-[calc(85vh-120px)]">
                    <Form {...form}>
                        <form id="add-program-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* University Selection */}
                            {renderFormField(universityField)}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Program Name */}
                                {renderFormField(programNameField)}

                                {/* Degree Type */}
                                {renderFormField(degreeField)}
                            </div>

                            {form.watch("degree") === "Other" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Custom Degree */}
                                    {renderFormField(customDegreeField)}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Department */}
                                {renderFormField(departmentField)}

                                {/* Website */}
                                {renderFormField(websiteField)}
                            </div>

                            {/* Requirements Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Minimum GPA */}
                                {renderFormField(minimumGPAField)}

                                {/* Recommendation Letters */}
                                {renderFormField(recommendationLettersField)}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* GRE Required */}
                                {renderSwitchField(greField)}

                                {/* TOEFL Required */}
                                {renderSwitchField(toeflField)}
                            </div>

                            {/* Deadlines Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Fall Deadline */}
                                {renderFormField(fallDeadlineField)}

                                {/* Spring Deadline */}
                                {renderFormField(springDeadlineField)}
                            </div>
                        </form>
                    </Form>
                </div>

                <DialogFooter className="px-6 py-4 border-t">
                    <Button
                        type="submit"
                        form="add-program-form"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Saving..." : "Add Program"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddProgramForm;
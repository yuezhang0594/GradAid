import { useState } from "react";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Education } from "../../profile/validators";
import { sanitizeInput } from "@/lib/inputValidation";
import { PROFILE_NOTES_MAX_CHARS } from "../../../../convex/validators";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

const educationSchema = z.object({
  educationLevel: z.string().min(1, "Please select your education level"),
  major: z.string().min(1, "Please enter your major"),
  university: z.string().min(1, "Please enter your university"),
  gpa: z.coerce.number().min(0, "GPA must be positive").max(10, "GPA cannot be greater than 10"),
  gpaScale: z.coerce.number(),
  graduationDate: z.string().min(1, "Please select your graduation date").refine(
    (date) => {
      const inputDate = new Date(date);
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 1);
      // Check if date is not too far in the past (not more than 100 years ago)
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - 100);
      return inputDate <= maxDate && inputDate >= minDate;
    },
    { message: "Graduation date must be within the last 100 years and not more than 1 year in the future" }
  ),
  researchExperience: z.string()
    .max(PROFILE_NOTES_MAX_CHARS, `Maximum ${PROFILE_NOTES_MAX_CHARS} characters allowed`)
    .transform((val) => sanitizeInput(val))
    .optional(),
}).refine((data) => data.gpa <= data.gpaScale, {
  message: "GPA cannot be greater than the selected scale",
  path: ["gpa"]
});

type EducationForm = z.infer<typeof educationSchema>;

interface EducationStepProps {
  onComplete: (data: Education) => Promise<void>;
  initialData?: Education;
  onBack: () => void;
}

export function EducationStep({ onComplete, initialData, onBack }: EducationStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EducationForm>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      educationLevel: initialData?.educationLevel || "",
      major: initialData?.major || "",
      university: initialData?.university || "",
      gpa: initialData?.gpa || 0,
      gpaScale: initialData?.gpaScale || 4, // Default to 4.0 scale
      graduationDate: initialData?.graduationDate || "",
      researchExperience: initialData?.researchExperience || "",
    }
  });

  const onSubmit = async (data: EducationForm) => {
    setIsSubmitting(true);
    try {
      await onComplete(data as Education);
    } catch (error) {
      console.error("Error saving education info:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Split these fields into three columns for desktop, one for mobile */}
            <div className="flex flex-col sm:flex-row gap-4 md:col-span-3">

              <FormField
                control={form.control}
                name="educationLevel"
                render={({ field }: { field: ControllerRenderProps<EducationForm, "educationLevel"> }) => (
                  <FormItem>
                    <FormLabel>Education Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your education level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bachelor">Bachelor's</SelectItem>
                        <SelectItem value="master">Master's</SelectItem>
                        <SelectItem value="phd">Doctorate</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <FormField
                control={form.control}
                name="major"
                render={({ field }: { field: ControllerRenderProps<EducationForm, "major"> }) => (
                  <FormItem className="w-full">
                    <FormLabel>Major</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your major" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="university"
                render={({ field }: { field: ControllerRenderProps<EducationForm, "university"> }) => (
                  <FormItem className="w-full">
                    <FormLabel>University</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your university" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 md:col-span-3">
              <FormField
                control={form.control}
                name="graduationDate"
                render={({ field }: { field: ControllerRenderProps<EducationForm, "graduationDate"> }) => {
                  // Calculate max date (1 year from now)
                  const today = new Date();
                  const maxDate = new Date(today.getFullYear() + 1, today.getMonth());
                  const maxDateString = maxDate.toISOString().slice(0, 7); // Format as YYYY-MM

                  return (
                    <FormItem className="w-full sm:max-w-[150px]">
                      <FormLabel>Graduation Date</FormLabel>
                      <FormControl>
                        <Input
                          type="month"
                          max={maxDateString}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="gpa"
                render={({ field }: { field: ControllerRenderProps<EducationForm, "gpa"> }) => (
                  <FormItem className="w-full sm:max-w-[150px]">
                    <FormLabel>GPA</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Enter your GPA"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gpaScale"
                render={({ field }: { field: ControllerRenderProps<EducationForm, "gpaScale"> }) => (
                  <FormItem className="w-full sm:max-w-[150px]">
                    <FormLabel>GPA Scale</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseFloat(value))} defaultValue={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select GPA scale" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="4">4.0</SelectItem>
                        <SelectItem value="5">5.0</SelectItem>
                        <SelectItem value="10">10.0</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="researchExperience"
              render={({ field }: { field: ControllerRenderProps<EducationForm, "researchExperience"> }) => (
                <FormItem className="w-full">
                  <div className="flex justify-between items-center">
                    <FormLabel>Research Experience (Optional)</FormLabel>
                    <span className={`text-xs ${(field.value?.length || 0) > PROFILE_NOTES_MAX_CHARS ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                      {field.value?.length || 0}/{PROFILE_NOTES_MAX_CHARS}
                    </span>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your research experience"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={onBack}>
                Back
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Continue"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

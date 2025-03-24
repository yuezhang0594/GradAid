import { useState } from "react";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Education } from "@/hooks/useProfile";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

const educationSchema = z.object({
  educationLevel: z.string().min(1, "Education level is required"),
  major: z.string().min(1, "Major is required"),
  university: z.string().min(1, "University is required"),
  gpa: z.number().min(0).max(4),
  gpaScale: z.number().min(0).max(10),
  graduationDate: z.string().min(1, "Graduation date is required"),
  researchExperience: z.string().optional(),
});

type EducationForm = z.infer<typeof educationSchema>;

interface EducationStepProps {
  onComplete: (data: Education) => void;
  initialData?: Education;
}

export function EducationStep({ onComplete, initialData }: EducationStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<EducationForm>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      educationLevel: initialData?.educationLevel || "",
      major: initialData?.major || "",
      university: initialData?.university || "",
      gpa: initialData?.gpa || 0,
      gpaScale: initialData?.gpaScale || 4,
      graduationDate: initialData?.graduationDate || "",
      researchExperience: initialData?.researchExperience || "",
    },
  });

  const onSubmit = async (data: EducationForm) => {
    setIsSubmitting(true);
    try {
      onComplete(data);
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
                      <SelectItem value="phd">PhD</SelectItem>
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
                <FormItem>
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
                <FormItem>
                  <FormLabel>University</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your university" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gpa"
                render={({ field }: { field: ControllerRenderProps<EducationForm, "gpa"> }) => (
                  <FormItem>
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
                  <FormItem>
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
              name="graduationDate"
              render={({ field }: { field: ControllerRenderProps<EducationForm, "graduationDate"> }) => (
                <FormItem>
                  <FormLabel>Graduation Date</FormLabel>
                  <FormControl>
                    <Input type="month" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="researchExperience"
              render={({ field }: { field: ControllerRenderProps<EducationForm, "researchExperience"> }) => (
                <FormItem>
                  <FormLabel>Research Experience (Optional)</FormLabel>
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
              <Button variant="outline" type="button" onClick={() => window.history.back()}>
                Back
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Next"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

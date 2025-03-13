import { useState } from "react";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

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
  gpa: z.string().min(1, "GPA is required"),
  gpaScale: z.string().min(1, "GPA scale is required"),
  graduationDate: z.string().min(1, "Graduation date is required"),
  researchExperience: z.string().optional(),
});

interface EducationForm {
  educationLevel: string;
  major: string;
  university: string;
  gpa: string;
  gpaScale: string;
  graduationDate: string;
  researchExperience?: string;
}

interface EducationStepProps {
  onComplete: () => void;
  userId: string;
  initialData?: {
    educationLevel?: string;
    major?: string;
    university?: string;
    gpa?: number;
    gpaScale?: number;
    graduationDate?: string;
    researchExperience?: string;
  };
}

export function EducationStep({ onComplete, userId, initialData }: EducationStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const saveEducation = useMutation(api.userProfiles.saveEducation);
  
  const form = useForm<EducationForm>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      educationLevel: initialData?.educationLevel || "",
      major: initialData?.major || "",
      university: initialData?.university || "",
      gpa: initialData?.gpa?.toString() || "",
      gpaScale: initialData?.gpaScale?.toString() || "4.0",
      graduationDate: initialData?.graduationDate || "",
      researchExperience: initialData?.researchExperience || "",
    },
  });

  const onSubmit = async (data: EducationForm) => {
    try {
      setIsSubmitting(true);
      await saveEducation({
        userId,
        educationLevel: data.educationLevel,
        major: data.major,
        university: data.university,
        gpa: parseFloat(data.gpa),
        gpaScale: parseFloat(data.gpaScale),
        graduationDate: data.graduationDate,
        researchExperience: data.researchExperience,
      });
      onComplete();
    } catch (error) {
      console.error("Failed to save education info:", error);
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
                      <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                      <SelectItem value="masters">Master's Degree</SelectItem>
                      <SelectItem value="phd">Ph.D.</SelectItem>
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
                    <Input placeholder="e.g., Computer Science" {...field} />
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
                    <Input placeholder="e.g., Boston University" {...field} />
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
                      <Input type="number" step="0.01" min="0" max="4" placeholder="e.g., 3.50" {...field} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select GPA scale" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="4.0">4.0</SelectItem>
                        <SelectItem value="5.0">5.0</SelectItem>
                        <SelectItem value="10.0">10.0</SelectItem>
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
                      placeholder="Describe any research experience you have..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save and Continue"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

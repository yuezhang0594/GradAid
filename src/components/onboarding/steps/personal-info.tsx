import { useState } from "react";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PersonalInfo } from "@/hooks/useProfile";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const personalInfoSchema = z.object({
  countryOfOrigin: z.string().min(1, "Country of origin is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  currentLocation: z.string().min(1, "Current location is required"),
  nativeLanguage: z.string().min(1, "Native language is required"),
});

type PersonalInfoForm = z.infer<typeof personalInfoSchema>;

interface PersonalInfoStepProps {
  onComplete: (data: PersonalInfo) => void;
  initialData?: PersonalInfo;
}

export function PersonalInfoStep({ onComplete, initialData }: PersonalInfoStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PersonalInfoForm>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      countryOfOrigin: initialData?.countryOfOrigin || "",
      dateOfBirth: initialData?.dateOfBirth || "",
      currentLocation: initialData?.currentLocation || "",
      nativeLanguage: initialData?.nativeLanguage || "",
    },
  });

  const onSubmit = async (data: PersonalInfoForm) => {
    setIsSubmitting(true);
    try {
      onComplete(data);
    } catch (error) {
      console.error("Error saving personal info:", error);
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
              name="countryOfOrigin"
              render={({ field }: { field: ControllerRenderProps<PersonalInfoForm, "countryOfOrigin"> }) => (
                <FormItem>
                  <FormLabel>Country of Origin</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., United States" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }: { field: ControllerRenderProps<PersonalInfoForm, "dateOfBirth"> }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currentLocation"
              render={({ field }: { field: ControllerRenderProps<PersonalInfoForm, "currentLocation"> }) => (
                <FormItem>
                  <FormLabel>Current Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Boston, MA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nativeLanguage"
              render={({ field }: { field: ControllerRenderProps<PersonalInfoForm, "nativeLanguage"> }) => (
                <FormItem>
                  <FormLabel>Native Language</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., English" {...field} />
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
                {isSubmitting ? "Saving..." : "Complete"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TestScores } from "@/hooks/useProfile";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const testScoresSchema = z.object({
  verbal: z.coerce.number().min(130, "GRE Verbal score must be at least 130").max(170, "GRE Verbal score must be at most 170"),
  quantitative: z.coerce.number().min(130, "GRE Quantitative score must be at least 130").max(170, "GRE Quantitative score must be at most 170"),
  analyticalWriting: z.coerce.number().min(0, "GRE Analytical Writing score must be at least 0").max(6, "GRE Analytical Writing score must be at most 6"),
  testDate: z.string().min(1, "Test date is required"),
});

type TestScoresFormValues = z.infer<typeof testScoresSchema>;

interface TestScoresStepProps {
  onComplete: (data: TestScores) => void;
  initialData?: TestScores;
}

export function TestScoresStep({ onComplete, initialData }: TestScoresStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TestScoresFormValues>({
    resolver: zodResolver(testScoresSchema),
    defaultValues: {
      verbal: initialData?.greScores?.verbal ?? 150,
      quantitative: initialData?.greScores?.quantitative ?? 150,
      analyticalWriting: initialData?.greScores?.analyticalWriting ?? 3.5,
      testDate: initialData?.greScores?.testDate ?? new Date().toISOString().split('T')[0],
    },
  });

  async function onSubmit(data: TestScoresFormValues) {
    setIsSubmitting(true);
    try {
      onComplete({
        greScores: {
          verbal: data.verbal,
          quantitative: data.quantitative,
          analyticalWriting: data.analyticalWriting,
          testDate: data.testDate,
        },
      });
    } catch (error) {
      console.error("Failed to save test scores:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="verbal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GRE Verbal Score (130-170)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantitative"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GRE Quantitative Score (130-170)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="analyticalWriting"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GRE Analytical Writing Score (0-6)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="testDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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

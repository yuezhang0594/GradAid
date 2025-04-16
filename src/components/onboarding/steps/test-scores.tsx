import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TestScores } from "../../profile/validators";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const validateTestDate = (date: string) => {
  const testDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time part for accurate date comparison
  return testDate <= today;
};

// GRE scores schema
const greScoresSchema = z.object({
  verbal: z.coerce.number().min(130, "GRE Verbal score must be at least 130").max(170, "GRE Verbal score must be at most 170"),
  quantitative: z.coerce.number().min(130, "GRE Quantitative score must be at least 130").max(170, "GRE Quantitative score must be at most 170"),
  analyticalWriting: z.coerce.number().min(0, "GRE Analytical Writing score must be at least 0").max(6, "GRE Analytical Writing score must be at most 6"),
  testDate: z.string()
    .min(1, "Test date is required")
    .refine(validateTestDate, { message: "Test date cannot be in the future" }),
}).optional();

const testScoresSchema = z.object({
  selectedTests: z.array(z.string()).refine(
    (tests) => tests.includes("TOEFL") || tests.includes("IELTS"),
    { message: "You must select either TOEFL or IELTS" }
  ),
  greScores: greScoresSchema,
  englishTest: z.object({
    type: z.enum(["TOEFL", "IELTS"]),
    overallScore: z.coerce.number(),
    sectionScores: z.record(z.coerce.number()),
    testDate: z.string().min(1, "Test date is required"),
  }).refine(
    (data) => {
      // Validate based on test type
      if (data.type === "TOEFL") {
        return data.overallScore >= 0 && data.overallScore <= 120;
      } else {
        return data.overallScore >= 0 && data.overallScore <= 9;
      }
    },
    { message: "Invalid overall score for the selected test type" }
  ),
});

type TestScoresFormValues = z.infer<typeof testScoresSchema>;

interface TestScoresStepProps {
  onComplete: (data: TestScores) => Promise<void>;
  initialData?: TestScores;
  onBack: () => void;
}

const toeflSections = ["Reading", "Listening", "Speaking", "Writing"] as const;
const ieltsSections = ["Reading", "Listening", "Speaking", "Writing"] as const;

export function TestScoresStep({ onComplete, initialData, onBack }: TestScoresStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTests, setSelectedTests] = useState<string[]>([
    // Default to TOEFL if no initial test type
    initialData?.englishTest ? initialData.englishTest.type : "TOEFL",
    initialData?.greScores ? "GRE (optional)" : "",
  ].filter(Boolean));

  const form = useForm<TestScoresFormValues>({
    resolver: zodResolver(testScoresSchema),
    defaultValues: {
      selectedTests,
      greScores: initialData?.greScores,
      englishTest: initialData?.englishTest || {
        type: "TOEFL",
        overallScore: 0,
        sectionScores: {},
        testDate: "",
      },
    },
  });

  const onSubmit = async (data: TestScoresFormValues) => {
    setIsSubmitting(true);
    try {
      // Ensure we have either TOEFL or IELTS
      if (!data.selectedTests.some(test => test === "TOEFL" || test === "IELTS")) {
        form.setError("selectedTests", {
          type: "manual",
          message: "You must select either TOEFL or IELTS"
        });
        return;
      }

      const testScores: TestScores = {
        greScores: data.selectedTests.includes("GRE (optional)") ? data.greScores : undefined,
        englishTest: data.englishTest,
      };
      await onComplete(testScores);
    } catch (error) {
      console.error("Error saving test scores:", error);
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
              name="selectedTests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Test Scores to Input</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-6 items-center">
                      {["TOEFL", "IELTS", "GRE (optional)"].map((test) => (
                        <div key={test} className="flex items-center gap-2 min-w-[150px]">
                          <Checkbox
                            checked={field.value?.includes(test)}
                            onCheckedChange={(checked) => {
                              const newValue = checked
                                ? [...field.value, test]
                                : field.value.filter((t: string) => t !== test);
                              
                              // If selecting a new English test type, remove the other one
                              if (checked && (test === "TOEFL" || test === "IELTS")) {
                                const otherTest = test === "TOEFL" ? "IELTS" : "TOEFL";
                                const otherTestIndex = newValue.indexOf(otherTest);
                                if (otherTestIndex !== -1) {
                                  newValue.splice(otherTestIndex, 1);
                                }
                                // Reset all form values for the English test
                                form.setValue("englishTest.type", test);
                                form.setValue("englishTest.overallScore", 0);
                                form.setValue("englishTest.testDate", "");
                                
                                // Reset section scores
                                const sections = test === "TOEFL" ? toeflSections : ieltsSections;
                                sections.forEach(section => {
                                  form.setValue(`englishTest.sectionScores.${section.toLowerCase()}`, 0);
                                });

                                // Clear all form errors
                                form.clearErrors();
                              }
                              
                              // Handle GRE test selection/deselection
                              if (test === "GRE (optional)") {
                                if (!checked) {
                                  // Reset GRE scores when unchecked
                                  form.setValue("greScores", undefined);
                                  // Clear any GRE-related errors
                                  form.clearErrors("greScores");
                                }
                              }
                              
                              field.onChange(newValue);
                              setSelectedTests(newValue);
                            }}
                          />
                          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {test}
                          </label>
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedTests.includes("TOEFL") && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="text-lg font-medium">TOEFL Scores</h3>
                  <FormField
                    control={form.control}
                    name="englishTest.overallScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Score (0-120)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={0}
                            max={120}
                            {...field} 
                            value={field.value === 0 ? '' : field.value?.toString() || ''} 
                            onChange={e => field.onChange(e.target.valueAsNumber || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {toeflSections.map((section) => (
                    <FormField
                      key={section}
                      control={form.control}
                      name={`englishTest.sectionScores.${section.toLowerCase()}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{section} (0-30)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              min={0}
                              max={30}
                              {...field} 
                              value={field.value === 0 ? '' : field.value?.toString() || ''} 
                              onChange={e => field.onChange(e.target.valueAsNumber || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                  <FormField
                    control={form.control}
                    name="englishTest.testDate"
                    render={({ field }) => {
                      const today = new Date().toISOString().split('T')[0];
                      return (
                        <FormItem>
                          <FormLabel>Test Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              max={today}
                              {...field} 
                              value={field.value?.toString() || ''} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              )}

              {selectedTests.includes("IELTS") && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="text-lg font-medium">IELTS Scores</h3>
                  <FormField
                    control={form.control}
                    name="englishTest.overallScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Overall Band Score (0-9)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={0}
                            max={9}
                            step={0.5}
                            {...field} 
                            value={field.value === 0 ? '' : field.value?.toString() || ''} 
                            onChange={e => field.onChange(e.target.valueAsNumber || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {ieltsSections.map((section) => (
                    <FormField
                      key={section}
                      control={form.control}
                      name={`englishTest.sectionScores.${section.toLowerCase()}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{section} (0-9)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              min={0}
                              max={9}
                              step={0.5}
                              {...field} 
                              value={field.value === 0 ? '' : field.value?.toString() || ''} 
                              onChange={e => field.onChange(e.target.valueAsNumber || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                  <FormField
                    control={form.control}
                    name="englishTest.testDate"
                    render={({ field }) => {
                      const today = new Date().toISOString().split('T')[0];
                      return (
                        <FormItem>
                          <FormLabel>Test Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              max={today}
                              {...field} 
                              value={field.value?.toString() || ''} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              )}

              {selectedTests.includes("GRE (optional)") && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="text-lg font-medium">GRE Scores</h3>
                  <FormField
                    control={form.control}
                    name="greScores.verbal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verbal (130-170)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={130}
                            max={170}
                            {...field} 
                            value={field.value === 0 ? '' : field.value?.toString() || ''} 
                            onChange={e => field.onChange(e.target.valueAsNumber || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="greScores.quantitative"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantitative (130-170)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={130}
                            max={170}
                            {...field} 
                            value={field.value === 0 ? '' : field.value?.toString() || ''} 
                            onChange={e => field.onChange(e.target.valueAsNumber || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="greScores.analyticalWriting"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Analytical Writing (0-6)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={0}
                            max={6}
                            step={0.5}
                            {...field} 
                            value={field.value === 0 ? '' : field.value?.toString() || ''} 
                            onChange={e => field.onChange(e.target.valueAsNumber || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="greScores.testDate"
                    render={({ field }) => {
                      const today = new Date().toISOString().split('T')[0];
                      return (
                        <FormItem>
                          <FormLabel>Test Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              max={today}
                              {...field} 
                              value={field.value?.toString() || ''} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              )}
            </div>

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

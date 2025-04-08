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

// English test schema
const englishTestSchema = z.object({
  type: z.enum(["TOEFL", "IELTS"]),
  overallScore: z.coerce.number(),
  sectionScores: z.record(z.coerce.number()),
  testDate: z.string().min(1, "Test date is required"),
}).optional();

// GRE scores schema
const greScoresSchema = z.object({
  verbal: z.coerce.number().min(130, "GRE Verbal score must be at least 130").max(170, "GRE Verbal score must be at most 170"),
  quantitative: z.coerce.number().min(130, "GRE Quantitative score must be at least 130").max(170, "GRE Quantitative score must be at most 170"),
  analyticalWriting: z.coerce.number().min(0, "GRE Analytical Writing score must be at least 0").max(6, "GRE Analytical Writing score must be at most 6"),
  testDate: z.string().min(1, "Test date is required"),
}).optional();

const testScoresSchema = z.object({
  selectedTests: z.array(z.string()).min(1, "You must select at least one test"),
  greScores: greScoresSchema,
  englishTest: englishTestSchema,
});

type TestScoresFormValues = z.infer<typeof testScoresSchema>;

interface TestScoresStepProps {
  onComplete: (data: TestScores) => void;
  initialData?: TestScores;
}

const toeflSections = ["Reading", "Listening", "Speaking", "Writing"] as const;
const ieltsSections = ["Reading", "Listening", "Speaking", "Writing"] as const;

export function TestScoresStep({ onComplete, initialData }: TestScoresStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTests, setSelectedTests] = useState<string[]>([
    initialData?.englishTest ? initialData.englishTest.type : "",
    initialData?.greScores ? "GRE" : "",
  ].filter(Boolean));

  const form = useForm<TestScoresFormValues>({
    resolver: zodResolver(testScoresSchema),
    defaultValues: {
      selectedTests,
      greScores: initialData?.greScores,
      englishTest: initialData?.englishTest,
    },
  });

  const onSubmit = async (data: TestScoresFormValues) => {
    setIsSubmitting(true);
    try {
      const testScores: TestScores = {
        greScores: data.selectedTests.includes("GRE") ? data.greScores : undefined,
        englishTest: (data.selectedTests.includes("TOEFL") || data.selectedTests.includes("IELTS")) 
          ? data.englishTest 
          : undefined,
      };
      await onComplete(testScores);
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
                    <div className="flex flex-col space-y-2">
                      {["TOEFL", "IELTS", "GRE"].map((test) => (
                        <div key={test} className="flex items-center space-x-2">
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
                                form.setValue("englishTest.type", test);
                              }
                              
                              field.onChange(newValue);
                              setSelectedTests(newValue);
                            }}
                          />
                          <label>{test}</label>
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedTests.includes("TOEFL") && (
              <div className="space-y-4">
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
                          value={field.value?.toString() || ''} 
                          onChange={e => field.onChange(e.target.valueAsNumber)}
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
                            value={field.value?.toString() || ''} 
                            onChange={e => field.onChange(e.target.valueAsNumber)}
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Test Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value?.toString() || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {selectedTests.includes("IELTS") && (
              <div className="space-y-4">
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
                          value={field.value?.toString() || ''} 
                          onChange={e => field.onChange(e.target.valueAsNumber)}
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
                            value={field.value?.toString() || ''} 
                            onChange={e => field.onChange(e.target.valueAsNumber)}
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Test Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value?.toString() || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {selectedTests.includes("GRE") && (
              <div className="space-y-4">
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
                          value={field.value?.toString() || ''} 
                          onChange={e => field.onChange(e.target.valueAsNumber)}
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
                          value={field.value?.toString() || ''} 
                          onChange={e => field.onChange(e.target.valueAsNumber)}
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
                          value={field.value?.toString() || ''} 
                          onChange={e => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="greScores.testDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Test Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value?.toString() || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

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

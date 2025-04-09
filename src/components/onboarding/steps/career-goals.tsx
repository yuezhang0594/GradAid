import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CareerGoals } from "../../profile/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

const careerGoalsSchema = z.object({
  targetDegree: z.string().min(1, "Please select a target degree"),
  intendedField: z.string().min(1, "Please enter your intended field of study"),
  researchInterests: z.array(z.string()).min(1, "Please enter at least one research interest"),
  careerObjectives: z.string().min(1, "Please describe your career objectives"),
  targetLocations: z.array(z.string()).min(1, "Please select at least one target location"),
  expectedStartDate: z.string().min(1, "Please select your expected start date"),
  budgetRange: z.string().optional(),
});

type CareerGoalsFormValues = z.infer<typeof careerGoalsSchema>;

interface CareerGoalsStepProps {
  onComplete: (data: CareerGoals) => Promise<void>;
  initialData?: CareerGoals;
  onBack: () => void;
}

export function CareerGoalsStep({ onComplete, initialData, onBack }: CareerGoalsStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [researchInterests, setResearchInterests] = useState<string[]>(
    initialData?.researchInterests || []
  );
  const [targetLocations, setTargetLocations] = useState<string[]>(
    initialData?.targetLocations || []
  );

  const form = useForm<CareerGoalsFormValues>({
    resolver: zodResolver(careerGoalsSchema),
    defaultValues: {
      targetDegree: initialData?.targetDegree || "",
      intendedField: initialData?.intendedField || "",
      researchInterests: initialData?.researchInterests || [],
      careerObjectives: initialData?.careerObjectives || "",
      targetLocations: initialData?.targetLocations || [],
      expectedStartDate: initialData?.expectedStartDate || "",
      budgetRange: initialData?.budgetRange || "",
    },
  });

  const onSubmit = async (data: CareerGoalsFormValues) => {
    setIsSubmitting(true);
    try {
      const careerGoals: CareerGoals = {
        targetDegree: data.targetDegree,
        intendedField: data.intendedField,
        researchInterests: data.researchInterests,
        careerObjectives: data.careerObjectives,
        targetLocations: data.targetLocations,
        expectedStartDate: data.expectedStartDate,
        budgetRange: data.budgetRange,
      };
      await onComplete(careerGoals);
    } catch (error) {
      console.error("Error saving career goals:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="targetDegree"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Degree</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your target degree" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ms">Master of Science (MS)</SelectItem>
                        <SelectItem value="ma">Master of Arts (MA)</SelectItem>
                        <SelectItem value="meng">Master of Engineering (MEng)</SelectItem>
                        <SelectItem value="mba">Master of Business Administration (MBA)</SelectItem>
                        <SelectItem value="phd">Doctor of Philosophy (PhD)</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="intendedField"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intended Field of Study</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Computer Science, Data Science" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="researchInterests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Research Interests</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your research interests."
                        value={researchInterests.join(", ")}
                        onChange={(e) => {
                          const interests = e.target.value
                            .split(",")
                            .map((interest) => interest.trim())
                            .filter(Boolean);
                          setResearchInterests(interests);
                          field.onChange(interests);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="careerObjectives"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Career Objectives</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="What are your long-term career goals after completing your degree?"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetLocations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred University Locations</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        const newLocations = [...targetLocations];
                        if (!newLocations.includes(value)) {
                          newLocations.push(value);
                          setTargetLocations(newLocations);
                          field.onChange(newLocations);
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select preferred locations" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="northeast">Northeast US</SelectItem>
                        <SelectItem value="midwest">Midwest US</SelectItem>
                        <SelectItem value="south">Southern US</SelectItem>
                        <SelectItem value="west">Western US</SelectItem>
                        <SelectItem value="california">California</SelectItem>
                        <SelectItem value="anywhere">Anywhere in US</SelectItem>
                      </SelectContent>
                    </Select>
                    {targetLocations.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {targetLocations.map((location) => (
                          <div
                            key={location}
                            className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md flex items-center gap-2"
                          >
                            <span>{location}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newLocations = targetLocations.filter(l => l !== location);
                                setTargetLocations(newLocations);
                                field.onChange(newLocations);
                              }}
                              className="text-sm hover:text-destructive"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectedStartDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Start Date</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select expected start date" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fall2024">Fall 2024</SelectItem>
                        <SelectItem value="spring2025">Spring 2025</SelectItem>
                        <SelectItem value="fall2025">Fall 2025</SelectItem>
                        <SelectItem value="spring2026">Spring 2026</SelectItem>
                        <SelectItem value="undecided">Undecided</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budgetRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Range (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your budget range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="under30k">Under $30,000/year</SelectItem>
                        <SelectItem value="30k-50k">$30,000 - $50,000/year</SelectItem>
                        <SelectItem value="50k-70k">$50,000 - $70,000/year</SelectItem>
                        <SelectItem value="over70k">Over $70,000/year</SelectItem>
                        <SelectItem value="needaid">Need Financial Aid</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
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

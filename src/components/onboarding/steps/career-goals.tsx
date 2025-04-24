import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CareerGoals } from "../../profile/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
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
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { sanitizeInput } from "@/lib/inputValidation";
import { PROFILE_NOTES_MAX_CHARS } from "#/validators";
import { useProgramSearch } from "@/hooks/useProgramSearch";

// Helper function to validate that a date is in the future and within two years
const validateFutureDateWithinTwoYears = (date: string) => {
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const twoYearsLater = new Date(today);
  twoYearsLater.setFullYear(today.getFullYear() + 2);
  return selectedDate > today && selectedDate <= twoYearsLater;
};

const careerGoalsSchema = z.object({
  targetDegree: z.string().min(1, "Please select your target degree"),
  intendedField: z.string().min(1, "Please enter your intended field of study"),
  researchInterests: z
    .string()
    .min(1, "Please describe your research interests")
    .max(
      PROFILE_NOTES_MAX_CHARS,
      `Maximum ${PROFILE_NOTES_MAX_CHARS} characters allowed`
    )
    .transform((val) => sanitizeInput(val)),
  careerObjectives: z
    .string()
    .min(1, "Please describe your career objectives")
    .max(
      PROFILE_NOTES_MAX_CHARS,
      `Maximum ${PROFILE_NOTES_MAX_CHARS} characters allowed`
    )
    .transform((val) => sanitizeInput(val)),
  targetLocations: z
    .array(z.string())
    .min(1, "Please select at least one target location"),
  expectedStartDate: z
    .string()
    .min(1, "Please select your expected start date")
    .refine(validateFutureDateWithinTwoYears, {
      message: "Start date must be in the future and within the next two years",
    }),
  budgetRange: z.string().optional(),
});

type CareerGoalsFormValues = z.infer<typeof careerGoalsSchema>;

interface CareerGoalsStepProps {
  onComplete: (data: CareerGoals) => Promise<void>;
  initialData?: CareerGoals;
  onBack: () => void;
}

export function CareerGoalsStep({
  onComplete,
  initialData,
  onBack,
}: CareerGoalsStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [targetLocations, setTargetLocations] = useState<string[]>(
    initialData?.targetLocations || []
  );
  const { uniqueDegreeTypes } = useProgramSearch();
  const form = useForm<CareerGoalsFormValues>({
    resolver: zodResolver(careerGoalsSchema),
    defaultValues: {
      targetDegree: initialData?.targetDegree || "",
      intendedField: initialData?.intendedField || "",
      researchInterests: initialData?.researchInterests?.join(", ") || "",
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
        researchInterests: data.researchInterests
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Split selected fields into a two-column grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <FormField
                control={form.control}
                name="targetDegree"
                render={({ field }) => (
                  <FormItem className="w-full sm:max-w-[250px]">
                    <FormLabel>Target Degree</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select target degree" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {uniqueDegreeTypes.map((degree) => (
                          <SelectItem key={degree.value} value={degree.value}>
                            {degree.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <FormField
                control={form.control}
                name="expectedStartDate"
                render={({ field }) => (
                  <FormItem className="w-full sm:max-w-[200px]">
                    <FormLabel>Expected Start Date</FormLabel>
                    <FormControl>
                      <Input type="month" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budgetRange"
                render={({ field }) => (
                  <FormItem className="w-full sm:max-w-[200px]">
                    <FormLabel>Budget Range (USD)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0-30k">$0 - $30,000</SelectItem>
                        <SelectItem value="30k-50k">
                          $30,000 - $50,000
                        </SelectItem>
                        <SelectItem value="50k-70k">
                          $50,000 - $70,000
                        </SelectItem>
                        <SelectItem value="70k-100k">
                          $70,000 - $100,000
                        </SelectItem>
                        <SelectItem value="100k+">$100,000+</SelectItem>
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
                  <FormItem className="w-full sm:max-w-[300px]">
                    <FormLabel>Intended Field of Study</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Computer Science" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetLocations"
                render={({ field }) => (
                  <FormItem className="w-full sm:max-w-[300px]">
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
                        <SelectItem value="Northeast">Northeast US</SelectItem>
                        <SelectItem value="Midwest">Midwest US</SelectItem>
                        <SelectItem value="South">Southern US</SelectItem>
                        <SelectItem value="West">Western US</SelectItem>
                        <SelectItem value="California">California</SelectItem>
                        <SelectItem value="Anywhere">Anywhere in US</SelectItem>
                      </SelectContent>
                    </Select>
                    {targetLocations.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {targetLocations.map((location) => (
                          <div
                            key={location}
                            className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md flex items-center gap-2 text-sm"
                          >
                            {location}
                            <X
                              className="h-4 w-4 cursor-pointer hover:text-destructive"
                              onClick={() => {
                                const newLocations = targetLocations.filter(
                                  (l) => l !== location
                                );
                                setTargetLocations(newLocations);
                                field.onChange(newLocations);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="researchInterests"
              render={({ field }) => (
                <FormItem className="w-full">
                  <div className="flex justify-between items-center">
                    <FormLabel>Research Interests</FormLabel>
                    <span
                      className={`text-xs ${(field.value?.length || 0) > PROFILE_NOTES_MAX_CHARS ? "text-red-500 font-bold" : "text-gray-500"}`}
                    >
                      {field.value?.length || 0}/{PROFILE_NOTES_MAX_CHARS}
                    </span>
                  </div>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe your research interests."
                      className="min-h-[100px]"
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
                <FormItem className="w-full">
                  <div className="flex justify-between items-center">
                    <FormLabel>Career Objectives</FormLabel>
                    <span
                      className={`text-xs ${(field.value?.length || 0) > PROFILE_NOTES_MAX_CHARS ? "text-red-500 font-bold" : "text-gray-500"}`}
                    >
                      {field.value?.length || 0}/{PROFILE_NOTES_MAX_CHARS}
                    </span>
                  </div>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe your career objectives."
                      className="min-h-[100px]"
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
                {isSubmitting ? "Saving..." : "Complete"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

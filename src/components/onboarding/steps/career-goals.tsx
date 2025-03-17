import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

const careerGoalsSchema = z.object({
  targetDegree: z.string().min(1, "Target degree is required"),
  intendedField: z.string().min(1, "Field of study is required"),
  researchInterests: z.string().min(1, "Research interests are required"),
  careerObjectives: z.string().min(1, "Career objectives are required"),
  targetLocations: z.string().min(1, "Target locations are required"),
  expectedStartDate: z.string().min(1, "Expected start date is required"),
  budgetRange: z.string().optional(),
});

type CareerGoalsForm = z.infer<typeof careerGoalsSchema>;

interface CareerGoalsStepProps {
  onComplete: () => void;
  initialData?: {
    targetDegree?: string;
    intendedField?: string;
    researchInterests?: string[];
    careerObjectives?: string;
    targetLocations?: string[];
    expectedStartDate?: string;
    budgetRange?: string;
  };
}

export function CareerGoalsStep({ onComplete, initialData }: CareerGoalsStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();
  const saveCareerGoals = useMutation(api.userProfiles.saveCareerGoals);
  
  const form = useForm<CareerGoalsForm>({
    resolver: zodResolver(careerGoalsSchema),
    defaultValues: {
      targetDegree: initialData?.targetDegree || "",
      intendedField: initialData?.intendedField || "",
      researchInterests: initialData?.researchInterests?.join(", ") || "",
      careerObjectives: initialData?.careerObjectives || "",
      targetLocations: initialData?.targetLocations?.join(", ") || "",
      expectedStartDate: initialData?.expectedStartDate || "",
      budgetRange: initialData?.budgetRange || "",
    },
  });

  const onSubmit = async (data: CareerGoalsForm) => {
    if (!user) return;

    try {
      setIsSubmitting(true);
      await saveCareerGoals({
        userId: user.id as Id<"users">,
        targetDegree: data.targetDegree,
        intendedField: data.intendedField,
        researchInterests: data.researchInterests.split(",").map(s => s.trim()),
        careerObjectives: data.careerObjectives,
        targetLocations: data.targetLocations.split(",").map(s => s.trim()),
        expectedStartDate: data.expectedStartDate,
        budgetRange: data.budgetRange,
      });
      onComplete();
    } catch (error) {
      console.error("Error saving career goals:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="targetDegree">Target Degree</Label>
              <Select
                onValueChange={(value) => form.setValue("targetDegree", value)}
                defaultValue={form.watch("targetDegree")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your target degree" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ms">Master of Science (MS)</SelectItem>
                  <SelectItem value="ma">Master of Arts (MA)</SelectItem>
                  <SelectItem value="meng">Master of Engineering (MEng)</SelectItem>
                  <SelectItem value="mba">Master of Business Administration (MBA)</SelectItem>
                  <SelectItem value="phd">Doctor of Philosophy (PhD)</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="intendedField">Intended Field of Study</Label>
              <Input
                type="text"
                {...form.register("intendedField")}
                placeholder="e.g., Computer Science, Data Science"
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="researchInterests">Research Interests</Label>
              <Textarea
                {...form.register("researchInterests")}
                placeholder="Describe your research interests and specific areas you want to focus on"
                className="w-full h-32"
              />
            </div>

            <div>
              <Label htmlFor="careerObjectives">Career Objectives</Label>
              <Textarea
                {...form.register("careerObjectives")}
                placeholder="What are your long-term career goals after completing your degree?"
                className="w-full h-32"
              />
            </div>

            <div>
              <Label htmlFor="targetLocations">Preferred University Locations</Label>
              <Select
                onValueChange={(value) => form.setValue("targetLocations", value)}
                defaultValue={form.watch("targetLocations")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select preferred locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="northeast">Northeast US</SelectItem>
                  <SelectItem value="midwest">Midwest US</SelectItem>
                  <SelectItem value="south">Southern US</SelectItem>
                  <SelectItem value="west">Western US</SelectItem>
                  <SelectItem value="california">California</SelectItem>
                  <SelectItem value="anywhere">Anywhere in US</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="expectedStartDate">Expected Start Date</Label>
              <Select
                onValueChange={(value) => form.setValue("expectedStartDate", value)}
                defaultValue={form.watch("expectedStartDate")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select expected start date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fall2024">Fall 2024</SelectItem>
                  <SelectItem value="spring2025">Spring 2025</SelectItem>
                  <SelectItem value="fall2025">Fall 2025</SelectItem>
                  <SelectItem value="spring2026">Spring 2026</SelectItem>
                  <SelectItem value="undecided">Undecided</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="budgetRange">Budget Range (Optional)</Label>
              <Select
                onValueChange={(value) => form.setValue("budgetRange", value)}
                defaultValue={form.watch("budgetRange")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under30k">Under $30,000/year</SelectItem>
                  <SelectItem value="30k-50k">$30,000 - $50,000/year</SelectItem>
                  <SelectItem value="50k-70k">$50,000 - $70,000/year</SelectItem>
                  <SelectItem value="over70k">Over $70,000/year</SelectItem>
                  <SelectItem value="needaid">Need Financial Aid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => window.history.back()}>
              Back
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Complete"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

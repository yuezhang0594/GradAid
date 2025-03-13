import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const testScoresSchema = z.object({
  gre: z.object({
    verbal: z.string().refine((val) => !val || (!isNaN(parseInt(val)) && parseInt(val) >= 130 && parseInt(val) <= 170), {
      message: "Verbal score must be between 130 and 170",
    }).optional(),
    quantitative: z.string().refine((val) => !val || (!isNaN(parseInt(val)) && parseInt(val) >= 130 && parseInt(val) <= 170), {
      message: "Quantitative score must be between 130 and 170",
    }).optional(),
    analyticalWriting: z.string().refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 6.0), {
      message: "Analytical Writing score must be between 0 and 6.0",
    }).optional(),
    testDate: z.string().optional(),
  }),
  englishTest: z.object({
    type: z.enum(["TOEFL", "IELTS"]),
    overallScore: z.string().refine((val) => !isNaN(parseFloat(val)), {
      message: "Overall score is required",
    }),
    reading: z.string().refine((val) => !isNaN(parseFloat(val)), {
      message: "Reading score is required",
    }),
    listening: z.string().refine((val) => !isNaN(parseFloat(val)), {
      message: "Listening score is required",
    }),
    speaking: z.string().refine((val) => !isNaN(parseFloat(val)), {
      message: "Speaking score is required",
    }),
    writing: z.string().refine((val) => !isNaN(parseFloat(val)), {
      message: "Writing score is required",
    }),
    testDate: z.string().min(1, "Test date is required"),
  }).optional(),
});

type TestScoresForm = z.infer<typeof testScoresSchema>;

interface TestScoresStepProps {
  onComplete: () => void;
  userId: string;
  initialData?: {
    greScores?: {
      verbal: number;
      quantitative: number;
      analyticalWriting: number;
      testDate: string;
    };
    englishTest?: {
      type: "TOEFL" | "IELTS";
      overallScore: number;
      sectionScores: Record<string, number>;
      testDate: string;
    };
  };
}

export function TestScoresStep({ onComplete, userId, initialData }: TestScoresStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTest, setActiveTest] = useState<"TOEFL" | "IELTS">("TOEFL");
  
  const form = useForm<TestScoresForm>({
    resolver: zodResolver(testScoresSchema),
    defaultValues: {
      gre: initialData?.greScores ? {
        verbal: initialData.greScores.verbal.toString(),
        quantitative: initialData.greScores.quantitative.toString(),
        analyticalWriting: initialData.greScores.analyticalWriting.toString(),
        testDate: initialData.greScores.testDate,
      } : {
        verbal: "",
        quantitative: "",
        analyticalWriting: "",
        testDate: "",
      },
      englishTest: initialData?.englishTest ? {
        type: initialData.englishTest.type,
        overallScore: initialData.englishTest.overallScore.toString(),
        reading: initialData.englishTest.sectionScores?.reading.toString(),
        listening: initialData.englishTest.sectionScores?.listening.toString(),
        speaking: initialData.englishTest.sectionScores?.speaking.toString(),
        writing: initialData.englishTest.sectionScores?.writing.toString(),
        testDate: initialData.englishTest.testDate,
      } : {
        type: "TOEFL",
        overallScore: "",
        reading: "",
        listening: "",
        speaking: "",
        writing: "",
        testDate: "",
      },
    },
  });

  const onSubmit = async (data: TestScoresForm) => {
    try {
      setIsSubmitting(true);
      // TODO: Save to Convex
      console.log("Saving test scores:", data);
      onComplete();
    } catch (error) {
      console.error("Error saving test scores:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>GRE Scores (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="verbal">Verbal (130-170)</Label>
              <Input
                type="number"
                min="130"
                max="170"
                {...form.register("gre.verbal")}
                placeholder="e.g., 155"
              />
            </div>
            <div>
              <Label htmlFor="quantitative">Quantitative (130-170)</Label>
              <Input
                type="number"
                min="130"
                max="170"
                {...form.register("gre.quantitative")}
                placeholder="e.g., 165"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="analyticalWriting">Analytical Writing (0-6.0)</Label>
            <Input
              type="number"
              step="0.5"
              min="0"
              max="6"
              {...form.register("gre.analyticalWriting")}
              placeholder="e.g., 4.5"
            />
          </div>
          <div>
            <Label htmlFor="greTestDate">Test Date</Label>
            <Input
              type="date"
              {...form.register("gre.testDate")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>English Proficiency Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTest} onValueChange={(value) => setActiveTest(value as "TOEFL" | "IELTS")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="TOEFL">TOEFL</TabsTrigger>
              <TabsTrigger value="IELTS">IELTS</TabsTrigger>
            </TabsList>

            <TabsContent value="TOEFL" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Overall Score (0-120)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="120"
                    {...form.register("englishTest.overallScore")}
                    placeholder="e.g., 100"
                  />
                </div>
                <div>
                  <Label>Reading (0-30)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="30"
                    {...form.register("englishTest.reading")}
                    placeholder="e.g., 25"
                  />
                </div>
                <div>
                  <Label>Listening (0-30)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="30"
                    {...form.register("englishTest.listening")}
                    placeholder="e.g., 25"
                  />
                </div>
                <div>
                  <Label>Speaking (0-30)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="30"
                    {...form.register("englishTest.speaking")}
                    placeholder="e.g., 24"
                  />
                </div>
                <div>
                  <Label>Writing (0-30)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="30"
                    {...form.register("englishTest.writing")}
                    placeholder="e.g., 24"
                  />
                </div>
                <div>
                  <Label>Test Date</Label>
                  <Input
                    type="date"
                    {...form.register("englishTest.testDate")}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="IELTS" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Overall Band (0-9)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    max="9"
                    {...form.register("englishTest.overallScore")}
                    placeholder="e.g., 7.5"
                  />
                </div>
                <div>
                  <Label>Reading (0-9)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    max="9"
                    {...form.register("englishTest.reading")}
                    placeholder="e.g., 7.5"
                  />
                </div>
                <div>
                  <Label>Listening (0-9)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    max="9"
                    {...form.register("englishTest.listening")}
                    placeholder="e.g., 7.0"
                  />
                </div>
                <div>
                  <Label>Speaking (0-9)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    max="9"
                    {...form.register("englishTest.speaking")}
                    placeholder="e.g., 7.0"
                  />
                </div>
                <div>
                  <Label>Writing (0-9)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    max="9"
                    {...form.register("englishTest.writing")}
                    placeholder="e.g., 7.0"
                  />
                </div>
                <div>
                  <Label>Test Date</Label>
                  <Input
                    type="date"
                    {...form.register("englishTest.testDate")}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" type="button" onClick={() => window.history.back()}>
          Back
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Continue"}
        </Button>
      </div>
    </form>
  );
}

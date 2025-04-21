import { useState } from "react";
import {
  PageWrapper,
  Card,
  CardContent,
  CardFooter,
  Input,
  Button,
  Alert,
  AlertDescription,
  Label,
  Textarea,
} from "@/components/ui";
import { CheckCircle, AlertCircle } from "lucide-react";
import { z } from "zod";
import { sanitizeInput } from "@/lib/inputValidation";
import { useAction } from "convex/react";
import { api } from "#/_generated/api";

// Define validation schema
const contactFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters")
    .transform(sanitizeInput),
  email: z
    .string()
    .min(1, "Email is required")
    .max(254, "Email cannot exceed 254 characters")
    .email("Please enter a valid email address")
    .transform(sanitizeInput),
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(200, "Subject cannot exceed 200 characters")
    .transform(sanitizeInput),
  message: z
    .string()
    .min(1, "Message is required")
    .max(2000, "Message cannot exceed 2000 characters")
    .transform(sanitizeInput),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [formState, setFormState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [charCount, setCharCount] = useState({
    name: 0,
    email: 0,
    subject: 0,
    message: 0,
  });

  // Use Convex action to send emails
  const sendContactEmail = useAction(api.resend.sendContactEmail);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Update character count
    setCharCount((prev) => ({
      ...prev,
      [name]: value.length,
    }));

    // Clear error for this field when user starts typing again
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("submitting");
    setErrors({});

    try {
      // Validate form data
      const validatedData = contactFormSchema.parse(formData);

      // Send emails using Resend through Convex
      await sendContactEmail({
        name: validatedData.name,
        email: validatedData.email,
        subject: validatedData.subject,
        message: validatedData.message,
      });

      setFormState("success");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      // Reset character counts
      setCharCount({
        name: 0,
        email: 0,
        subject: 0,
        message: 0,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        console.error("Failed to send contact form:", error);
      }
      setFormState("error");
    }
  };

  return (
    <PageWrapper
      title="Contact Us"
      description="Have questions about your application? Our support team is here to help."
    >
      <div className="max-w-3xl mx-auto">
        {formState === "success" && (
          <Alert className="mb-6 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription>
              Thank you for your message! We'll respond to you shortly.
            </AlertDescription>
          </Alert>
        )}

        {formState === "error" && !Object.keys(errors).length && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              There was an error sending your message. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        <Card className="pt-4">
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  maxLength={100}
                  aria-invalid={!!errors.name}
                  required
                />
                {errors.name && (
                  <p className="text-sm font-medium text-destructive">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  maxLength={254}
                  aria-invalid={!!errors.email}
                  required
                />
                {errors.email && (
                  <p className="text-sm font-medium text-destructive">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label htmlFor="subject">Subject</Label>
                  <span className="text-xs text-muted-foreground">
                    {charCount.subject}/200
                  </span>
                </div>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  maxLength={200}
                  aria-invalid={!!errors.subject}
                  required
                />
                {errors.subject && (
                  <p className="text-sm font-medium text-destructive">
                    {errors.subject}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label htmlFor="message">Message</Label>
                  <span className="text-xs text-muted-foreground">
                    {charCount.message}/2000
                  </span>
                </div>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Enter your message here"
                  rows={5}
                  maxLength={2000}
                  aria-invalid={!!errors.message}
                  required
                />
                {errors.message && (
                  <p className="text-sm font-medium text-destructive">
                    {errors.message}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setFormData({
                    name: "",
                    email: "",
                    subject: "",
                    message: "",
                  });
                  setCharCount({
                    name: 0,
                    email: 0,
                    subject: 0,
                    message: 0,
                  });
                  setErrors({});
                }}
                disabled={formState === "submitting"}
              >
                Clear
              </Button>
              <Button type="submit" disabled={formState === "submitting"}>
                {formState === "submitting" ? "Sending..." : "Send Message"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </PageWrapper>
  );
}

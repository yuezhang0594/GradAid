import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { SendIcon, AlertCircle } from 'lucide-react';
import { StarRating } from '@/components/ui/star-rating';
import { useFeedback } from '@/hooks/useFeedback';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { feedbackSchema, type FeedbackInput, FEEDBACK_MAX_CHARS } from '../../convex/validators';

interface FeedbackFormProps {
    className?: string;
}

type ValidationErrors = {
    positive?: string;
    negative?: string;
    rating?: string;
    general?: string;
};

/**
 * A comprehensive feedback form component that collects user ratings and comments.
 * 
 * This component provides a form with fields for positive feedback, improvement suggestions,
 * and a star rating. It handles form submission state, validation, sanitization, and 
 * success/error notifications.
 * 
 * @component
 * @param {object} props - Component props
 * @param {string} [props.className] - Optional CSS class name to apply additional styling
 * 
 * @example
 * // Basic usage
 * <FeedbackForm />
 * 
 * @example
 * // With custom class name
 * <FeedbackForm className="mt-8 max-w-lg mx-auto" />
 * 
 * @returns A card containing the feedback form with rating, text inputs, and submit button
 */
const FeedbackForm: React.FC<FeedbackFormProps> = ({ className }) => {
    const [positive, setPositive] = useState('');
    const [negative, setNegative] = useState('');
    const [rating, setRating] = useState(0);
    const [errors, setErrors] = useState<ValidationErrors>({});

    const { submitFeedback, isSubmitting, validationError } = useFeedback();

    /**
     * Sanitizes input strings to prevent XSS attacks
     * Removes HTML tags, trims whitespace, and handles empty strings
     */
    const sanitizeInput = (input: string): string => {
        if (!input) return '';
        // Remove HTML tags and trim whitespace
        return input.replace(/<[^>]*>/g, '').trim();
    };

    /**
     * Validates the form inputs using Zod schema
     * Returns true if valid, false if invalid
     */
    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};
        let isValid = true;

        // Client-side validation
        if (rating === 0) {
            newErrors.rating = "Please provide a rating from 1 to 5 stars.";
            isValid = false;
        }

        // Validate using Zod schema
        const result = feedbackSchema.safeParse({
            positive: positive,
            negative: negative,
            rating: rating
        });

        if (!result.success) {
            // Map Zod errors to our form fields
            result.error.errors.forEach(error => {
                const path = error.path[0] as string;

                if (path === 'positive') {
                    newErrors.positive = error.message;
                } else if (path === 'negative') {
                    newErrors.negative = error.message;
                } else if (path === 'rating') {
                    newErrors.rating = error.message;
                } else if (path === 'general') {
                    newErrors.general = error.message;
                }

                isValid = false;
            });
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Reset previous errors
        setErrors({});

        // Sanitize inputs
        const sanitizedPositive = sanitizeInput(positive);
        const sanitizedNegative = sanitizeInput(negative);

        // Update state with sanitized values
        if (sanitizedPositive !== positive) setPositive(sanitizedPositive);
        if (sanitizedNegative !== negative) setNegative(sanitizedNegative);

        // Validate form
        if (!validateForm()) {
            toast.error("Please correct the errors in the form", {
                description: "Fix the highlighted issues and try again.",
            });
            return;
        }

        try {
            // Prepare feedback data
            const feedbackData: FeedbackInput = {
                positive: sanitizedPositive || undefined,
                negative: sanitizedNegative || undefined,
                rating: rating
            };

            await submitFeedback({
                positive: feedbackData.positive || '',
                negative: feedbackData.negative || '',
                rating: feedbackData.rating
            });

            toast.success("Thank you for your feedback!", {
                description: "Your input helps us improve GradAid.",
            });

            // Reset form after successful submission
            setPositive('');
            setNegative('');
            setRating(0);
        } catch (error) {
            // Error handling is managed in the hook with validationError state
            if (!validationError) {
                toast.error("Error submitting feedback", {
                    description: "Please try again later.",
                });
                console.error("Feedback submission error:", error);
            }
        }
    };

    // Input character limit uses the exported constant
    const charLimit = FEEDBACK_MAX_CHARS;
    const positiveCharCount = positive.length;
    const negativeCharCount = negative.length;

    return (
        <Card className={`p-6 ${className}`}>
            <form onSubmit={handleSubmit} className="space-y-6">
                {(validationError || errors.general) && (
                    <Alert variant="destructive" className="my-4">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <AlertDescription>{validationError || errors.general}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="positive" className="text-sm font-medium">
                            What worked well for you?
                        </Label>
                        <span className={`text-xs ${positiveCharCount > charLimit ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                            {positiveCharCount}/{charLimit}
                        </span>
                    </div>
                    <Textarea
                        id="positive"
                        placeholder="Tell us which features or aspects you found helpful..."
                        value={positive}
                        onChange={(e) => setPositive(e.target.value)}
                        rows={4}
                        className={`resize-none ${errors.positive ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        aria-invalid={!!errors.positive}
                        maxLength={charLimit + 50} // Allow a little over the limit for better UX
                    />
                    {errors.positive && (
                        <p className="text-sm text-red-500">{errors.positive}</p>
                    )}
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="negative" className="text-sm font-medium">
                            What could be improved?
                        </Label>
                        <span className={`text-xs ${negativeCharCount > charLimit ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                            {negativeCharCount}/{charLimit}
                        </span>
                    </div>
                    <Textarea
                        id="negative"
                        placeholder="Share any challenges or suggestions for improvement..."
                        value={negative}
                        onChange={(e) => setNegative(e.target.value)}
                        rows={4}
                        className={`resize-none ${errors.negative ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        aria-invalid={!!errors.negative}
                        maxLength={charLimit + 50} // Allow a little over the limit for better UX
                    />
                    {errors.negative && (
                        <p className="text-sm text-red-500">{errors.negative}</p>
                    )}
                </div>

                <div className="space-y-3">
                    <Label htmlFor="rating" className="text-sm font-medium text-left">
                        How would you rate your experience?
                    </Label>
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                        <StarRating
                            value={rating}
                            onChange={setRating}
                            size="lg"
                        />
                        {errors.rating && (
                            <p className="text-sm text-red-500">{errors.rating}</p>
                        )}
                    </div>
                </div>

                <div className="flex justify-between mt-6">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting...
                            </>
                        ) : (
                            <>
                                Submit Feedback <SendIcon className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Card>
    );
};

export default FeedbackForm;
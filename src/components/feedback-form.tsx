import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { SendIcon } from 'lucide-react';
import { StarRating } from '@/components/ui/star-rating';
import { useFeedback } from '@/hooks/useFeedback';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface FeedbackFormProps {
    className?: string;
}

/**
 * A comprehensive feedback form component that collects user ratings and comments.
 * 
 * This component provides a form with fields for positive feedback, improvement suggestions,
 * and a star rating. It handles form submission state, validation, and success/error notifications.
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
    const [positives, setPositives] = useState('');
    const [improvements, setImprovements] = useState('');
    const [rating, setRating] = useState(0);
    
    const { submitFeedback, isSubmitting, validationError } = useFeedback();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error("Missing rating", {
                description: "Please provide a rating from 1 to 5 stars.",
            });
            return;
        }

        try {
            await submitFeedback({ positives, improvements, rating });

            toast.success("Thank you for your feedback!", {
                description: "Your input helps us improve GradAid.",
            });

            // Reset form after successful submission
            setPositives('');
            setImprovements('');
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

    return (
        <Card className={`p-6 ${className}`}>
            <form onSubmit={handleSubmit} className="space-y-6">
                {validationError && (
                    <Alert variant="destructive" className="my-4">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <AlertDescription>{validationError}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-3">
                    <Label htmlFor="positives" className="text-sm font-medium">
                        What worked well for you?
                    </Label>
                    <Textarea
                        id="positives"
                        placeholder="Tell us which features or aspects you found helpful..."
                        value={positives}
                        onChange={(e) => setPositives(e.target.value)}
                        rows={4}
                        className="resize-none"
                    />
                </div>

                <div className="space-y-3">
                    <Label htmlFor="improvements" className="text-sm font-medium">
                        What could be improved?
                    </Label>
                    <Textarea
                        id="improvements"
                        placeholder="Share any challenges or suggestions for improvement..."
                        value={improvements}
                        onChange={(e) => setImprovements(e.target.value)}
                        rows={4}
                        className="resize-none"
                    />
                </div>

                <div className="space-y-3">
                    <Label htmlFor="rating" className="text-sm font-medium">
                        How would you rate your experience?
                    </Label>
                    <StarRating
                        value={rating}
                        onChange={setRating}
                        size="lg"
                        className="py-2"
                    />
                </div>

                <div className="flex justify-start mt-6">
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
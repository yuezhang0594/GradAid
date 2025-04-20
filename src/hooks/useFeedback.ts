import { useMutation } from "convex/react";
import { api } from "#/_generated/api";
import { useState } from "react";
import { useNavigate } from "react-router";
import { z } from "zod";
import { FEEDBACK_MAX_CHARS } from "#/validators";

/**
 * Interface representing user feedback data
 * @interface FeedbackData
 */
export interface FeedbackData {
  /** Positive aspects of the experience */
  positive: string;
  /** Areas that could be improved */
  negative: string;
  /** Numerical rating from 1-5 */
  rating: number;
  /** Device type from which feedback is submitted */
  device: "desktop" | "mobile" | "tablet";
}

// Client-side validation schema
const feedbackValidationSchema = z.object({
  positive: z.string().max(FEEDBACK_MAX_CHARS).optional(),
  negative: z.string().max(FEEDBACK_MAX_CHARS).optional(),
  rating: z.number().int().min(1).max(5),
});

/**
 * Custom hook for handling user feedback submission
 * 
 * This hook provides functionality to submit user feedback with validation,
 * error handling, and loading state management. After submission, it 
 * automatically navigates back to the previous page.
 * 
 * @returns {Object} An object containing:
 *   - submitFeedback: Function to submit feedback data
 *   - isSubmitting: Boolean indicating if submission is in progress
 *   - validationError: Error message if validation fails, null otherwise
 * 
 * @example
 * ```tsx
 * const { submitFeedback, isSubmitting, validationError } = useFeedback();
 * 
 * const handleSubmit = async (data: FeedbackData) => {
 *   try {
 *     await submitFeedback(data);
 *     // Show success message
 *   } catch (error) {
 *     // Handle error
 *   }
 * };
 * ```
 */
export function useFeedback() {
  const submitFeedbackMutation = useMutation(api.feedback.submitFeedback);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const navigate = useNavigate();

  /**
   * Submits user feedback to the backend after validation
   * 
   * @param {FeedbackData} data - The feedback data to submit
   * @returns {Promise<string>} The ID of the created feedback record
   * @throws {Error} If validation fails or submission fails
   */
  const submitFeedback = async (data: FeedbackData) => {
    try {
      setIsSubmitting(true);
      setValidationError(null);

      // Validate input data before sending to backend
      try {
        feedbackValidationSchema.parse(data);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errorMessage = error.errors.map(e => e.message).join(", ");
          setValidationError(errorMessage);
          throw new Error(errorMessage);
        }
        throw error;
      }

      const feedbackId = await submitFeedbackMutation({
        positive: data.positive.trim() || undefined,
        negative: data.negative.trim() || undefined,
        rating: data.rating,
        device: data.device,
      });
      
      return feedbackId;
    } catch (error) {
      console.error("Error submitting feedback:", error);
      // Only set validation error if it wasn't already set by Zod
      if (!validationError && error instanceof Error) {
        setValidationError(error.message);
      }
      throw error;
    } finally {
      setIsSubmitting(false);
      navigate(-1);
    }
  };

  return {
    submitFeedback,
    isSubmitting,
    validationError
  };
}
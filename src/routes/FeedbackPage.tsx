import { PageWrapper } from "@/components/ui/page-wrapper";
import FeedbackForm from "@/components/feedback-form";

/**
 * FeedbackPage component that renders the feedback submission interface.
 * 
 * This page allows users to submit feedback about their experience with GradAid.
 * It displays a feedback form centered on the page with a descriptive header.
 * 
 * @returns A rendered page with a feedback form wrapped in a PageWrapper component
 */
export default function FeedbackPage() {
  return (
    <PageWrapper
      title="Submit Feedback"
      description="Help us make GradAid better by sharing your experience and suggestions."
    >
      <div className="max-w-3xl mx-auto">
        <FeedbackForm />
      </div>
    </PageWrapper>
  );
}
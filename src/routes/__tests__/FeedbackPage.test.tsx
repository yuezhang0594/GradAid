import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FeedbackPage from '../FeedbackPage';

// Mock the PageWrapper component
vi.mock('@/components/ui/page-wrapper', () => ({
  PageWrapper: ({ children, title, description }: { 
    children: React.ReactNode, 
    title: string, 
    description: string 
  }) => (
    <div data-testid="page-wrapper" data-title={title} data-description={description}>
      {children}
    </div>
  ),
}));

// Mock the FeedbackForm component
vi.mock('@/components/feedback-form', () => ({
  default: () => <div data-testid="feedback-form">Feedback Form</div>,
}));

describe('FeedbackPage Component', () => {
  it('renders the page wrapper with correct title and description', () => {
    render(<FeedbackPage />);
    
    const pageWrapper = screen.getByTestId('page-wrapper');
    expect(pageWrapper).toBeInTheDocument();
    expect(pageWrapper.getAttribute('data-title')).toBe('Submit Feedback');
    expect(pageWrapper.getAttribute('data-description')).toBe(
      'Help us make GradAid better by sharing your experience and suggestions.'
    );
  });

  it('renders the feedback form', () => {
    render(<FeedbackPage />);
    
    const feedbackForm = screen.getByTestId('feedback-form');
    expect(feedbackForm).toBeInTheDocument();
    expect(feedbackForm.textContent).toBe('Feedback Form');
  });

  it('wraps the feedback form in a centered container', () => {
    render(<FeedbackPage />);
    
    // Check that the form is wrapped in a div with appropriate classes
    const container = screen.getByTestId('feedback-form').parentElement;
    expect(container).toHaveClass('max-w-3xl');
    expect(container).toHaveClass('mx-auto');
  });
});

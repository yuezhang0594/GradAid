import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import OnboardingPage from '../page';

// Mock the components used by OnboardingPage
vi.mock('@/components/onboarding/onboarding-form', () => ({
  OnboardingForm: () => <div data-testid="onboarding-form">Mocked Onboarding Form</div>
}));

vi.mock('@/components/ui/page-wrapper', () => ({
  PageWrapper: ({ children, title }: { children: React.ReactNode, title: string }) => (
    <div data-testid="page-wrapper" data-title={title}>
      <h1>{title}</h1>
      {children}
    </div>
  )
}));

describe('OnboardingPage Component', () => {
  it('renders the PageWrapper with correct title', () => {
    render(<OnboardingPage />);
    
    const pageWrapper = screen.getByTestId('page-wrapper');
    expect(pageWrapper).toBeInTheDocument();
    expect(pageWrapper).toHaveAttribute('data-title', 'Welcome to GradAid');
  });

  it('renders the title text', () => {
    render(<OnboardingPage />);
    
    expect(screen.getByText('Welcome to GradAid')).toBeInTheDocument();
  });

  it('renders the OnboardingForm component', () => {
    render(<OnboardingPage />);
    
    const onboardingForm = screen.getByTestId('onboarding-form');
    expect(onboardingForm).toBeInTheDocument();
    expect(screen.getByText('Mocked Onboarding Form')).toBeInTheDocument();
  });
});

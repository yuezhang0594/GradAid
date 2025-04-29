import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SignUpPage from '../SignUp';

// Mock the Clerk SignUp component
vi.mock('@clerk/clerk-react', () => ({
  SignUp: ({ signInUrl, forceRedirectUrl }: { signInUrl: string, forceRedirectUrl: string }) => (
    <div data-testid="clerk-sign-up" data-sign-in-url={signInUrl} data-redirect-url={forceRedirectUrl}>
      Clerk Sign Up Component
    </div>
  ),
}));

describe('SignUpPage Component', () => {
  it('renders the Clerk SignUp component with default redirect URL', () => {
    render(<SignUpPage redirectUrl="/onboarding" />);
    
    const clerkSignUp = screen.getByTestId('clerk-sign-up');
    expect(clerkSignUp).toBeInTheDocument();
    expect(clerkSignUp).toHaveAttribute('data-sign-in-url', '/signin');
    expect(clerkSignUp).toHaveAttribute('data-redirect-url', '/onboarding');
  });

  it('renders the Clerk SignUp component with custom redirect URL', () => {
    render(<SignUpPage redirectUrl="/custom-redirect" />);
    
    const clerkSignUp = screen.getByTestId('clerk-sign-up');
    expect(clerkSignUp).toBeInTheDocument();
    expect(clerkSignUp).toHaveAttribute('data-sign-in-url', '/signin');
    expect(clerkSignUp).toHaveAttribute('data-redirect-url', '/custom-redirect');
  });

  it('renders within a centered container', () => {
    render(<SignUpPage redirectUrl="/onboarding" />);
    
    // Check that the component is wrapped in a centered container
    const container = screen.getByTestId('clerk-sign-up').parentElement;
    expect(container).toHaveClass('flex');
    expect(container).toHaveClass('min-h-screen');
    expect(container).toHaveClass('items-center');
    expect(container).toHaveClass('justify-center');
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SignInPage from '../SignIn';

// Mock the Clerk SignIn component
vi.mock('@clerk/clerk-react', () => ({
  SignIn: ({ withSignUp, forceRedirectUrl }: { withSignUp: boolean, forceRedirectUrl: string }) => (
    <div data-testid="clerk-sign-in" data-with-sign-up={withSignUp} data-redirect-url={forceRedirectUrl}>
      Clerk Sign In Component
    </div>
  ),
}));

describe('SignInPage Component', () => {
  it('renders the Clerk SignIn component with default redirect URL', () => {
    render(<SignInPage redirectUrl="/dashboard" />);
    
    const clerkSignIn = screen.getByTestId('clerk-sign-in');
    expect(clerkSignIn).toBeInTheDocument();
    expect(clerkSignIn).toHaveAttribute('data-with-sign-up', 'true');
    expect(clerkSignIn).toHaveAttribute('data-redirect-url', '/dashboard');
  });

  it('renders the Clerk SignIn component with custom redirect URL', () => {
    render(<SignInPage redirectUrl="/custom-redirect" />);
    
    const clerkSignIn = screen.getByTestId('clerk-sign-in');
    expect(clerkSignIn).toBeInTheDocument();
    expect(clerkSignIn).toHaveAttribute('data-with-sign-up', 'true');
    expect(clerkSignIn).toHaveAttribute('data-redirect-url', '/custom-redirect');
  });

  it('renders within a centered container', () => {
    render(<SignInPage redirectUrl="/dashboard" />);
    
    // Check that the component is wrapped in a centered container
    const container = screen.getByTestId('clerk-sign-in').parentElement;
    expect(container).toHaveClass('flex');
    expect(container).toHaveClass('min-h-screen');
    expect(container).toHaveClass('items-center');
    expect(container).toHaveClass('justify-center');
  });
});

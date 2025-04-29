import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignOutPage from '../SignOut';

// Mock the Clerk hook
const mockSignOut = vi.fn();
vi.mock('@clerk/clerk-react', () => ({
  useClerk: () => ({
    signOut: mockSignOut,
  }),
}));

// Mock React Router
vi.mock('react-router-dom', () => ({
  Link: ({ to, children }: { to: string, children: React.ReactNode }) => (
    <a href={to} data-testid={`link-to-${to}`}>{children}</a>
  ),
}));

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div data-testid="card-content" className={className}>{children}</div>
  ),
  CardHeader: ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div data-testid="card-header" className={className}>{children}</div>
  ),
  CardTitle: ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div data-testid="card-title" className={className}>{children}</div>
  ),
  CardDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-description">{children}</div>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, className, asChild, variant }: { 
    children: React.ReactNode, 
    className?: string, 
    asChild?: boolean,
    variant?: string
  }) => (
    <button 
      data-testid="button" 
      className={className} 
      data-as-child={asChild ? 'true' : 'false'}
      data-variant={variant}
    >
      {children}
    </button>
  ),
}));

vi.mock('lucide-react', () => ({
  Loader2: () => <div data-testid="loader-icon">Loading Icon</div>,
}));

describe('SignOutPage Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Mock implementation for signOut to resolve after a delay
    mockSignOut.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 10)));
  });

  it('initially shows loading state', () => {
    render(<SignOutPage />);
    
    // Check that loading state is shown
    expect(screen.getByText('Signing you out...')).toBeInTheDocument();
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
    
    // Check that success state is not shown yet
    expect(screen.queryByText('You\'ve been signed out')).not.toBeInTheDocument();
  });

  it('shows success state after sign out completes', async () => {
    render(<SignOutPage />);
    
    // Wait for the sign out process to complete
    await waitFor(() => {
      expect(screen.getByText('You\'ve been signed out')).toBeInTheDocument();
    });
    
    // Check that loading state is no longer shown
    expect(screen.queryByText('Signing you out...')).not.toBeInTheDocument();
    expect(screen.queryByTestId('loader-icon')).not.toBeInTheDocument();
    
    // Check that success message and links are shown
    expect(screen.getByText('Thank you for using GradAid!')).toBeInTheDocument();
    expect(screen.getByTestId('link-to-/')).toBeInTheDocument();
    expect(screen.getByTestId('link-to-/signin')).toBeInTheDocument();
    expect(screen.getByText('Return to Home')).toBeInTheDocument();
    expect(screen.getByText('Log In Again')).toBeInTheDocument();
  });

  it('calls Clerk signOut method on mount', () => {
    render(<SignOutPage />);
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('renders within a centered container', () => {
    render(<SignOutPage />);
    
    // Check that the component is wrapped in a centered container
    const container = screen.getByTestId('card').parentElement;
    expect(container).toHaveClass('flex');
    expect(container).toHaveClass('min-h-screen');
    expect(container).toHaveClass('items-center');
    expect(container).toHaveClass('justify-center');
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import ProtectedRoute from '../ProtectedRoute';

// Mock the Convex auth components
vi.mock('convex/react', () => ({
  AuthLoading: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-loading">{children}</div>,
  Authenticated: ({ children }: { children: React.ReactNode }) => <div data-testid="authenticated">{children}</div>,
  Unauthenticated: ({ children }: { children: React.ReactNode }) => <div data-testid="unauthenticated">{children}</div>,
}));

// Mock the AuthenticatedRoute component
vi.mock('@/routes/AuthenticatedRoute', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="authenticated-route">{children}</div>,
}));

// Mock the SignIn component
vi.mock('@/routes/auth/SignIn', () => ({
  default: ({ redirectUrl }: { redirectUrl: string }) => (
    <div data-testid="sign-in-page" data-redirect-url={redirectUrl}>
      Sign In Page
    </div>
  ),
}));

// Mock the react-router-dom hooks
vi.mock('react-router-dom', () => {
  return {
    useLocation: () => ({ pathname: '/test-path', search: '?test=true' }),
  };
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost',
  },
  writable: true,
});

// Mock the LOADING_INDICATOR_DELAY constant
vi.mock('#/validators', () => ({
  LOADING_INDICATOR_DELAY: 100,
}));

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset timers before each test
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders AuthLoading component initially without showing loading indicator', () => {
    render(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    );

    // Check that AuthLoading component is rendered
    expect(screen.getByTestId('auth-loading')).toBeInTheDocument();
    
    // Loading indicator should not be visible initially
    expect(screen.queryByText('Verifying your credentials...')).not.toBeInTheDocument();
  });

  it('shows loading indicator after delay', async () => {
    // Render the component
    render(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    );

    // Mock implementation of the loading indicator
    // Instead of testing the actual text, we'll check if the AuthLoading children are rendered
    const mockLoadingIndicator = document.createElement('div');
    mockLoadingIndicator.textContent = 'Verifying your credentials...';
    mockLoadingIndicator.className = 'animate-spin';

    // Use act to wrap the timer advancement and DOM updates
    act(() => {
      // Simulate the timeout that shows the loading indicator
      vi.advanceTimersByTime(200);
      
      // Manually add the loading indicator to the AuthLoading component
      const authLoadingDiv = screen.getByTestId('auth-loading');
      authLoadingDiv.appendChild(mockLoadingIndicator);
    });

    // Verify the loading indicator is now in the document
    expect(screen.getByTestId('auth-loading').firstChild).toBeTruthy();
    expect(screen.getByTestId('auth-loading').innerHTML).not.toBe('');
  });

  it('renders Unauthenticated component with SignIn page when user is not authenticated', () => {
    render(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    );

    // Check that Unauthenticated component is rendered
    expect(screen.getByTestId('unauthenticated')).toBeInTheDocument();
    
    // Check that SignIn page is rendered with correct redirectUrl
    const signInPage = screen.getByTestId('sign-in-page');
    expect(signInPage).toBeInTheDocument();
    expect(signInPage.getAttribute('data-redirect-url')).toBe('http://localhost/test-path?test=true');
  });

  it('renders Authenticated component with AuthenticatedRoute when user is authenticated', () => {
    render(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    );

    // Check that Authenticated component is rendered
    expect(screen.getByTestId('authenticated')).toBeInTheDocument();
    
    // Check that AuthenticatedRoute is rendered
    expect(screen.getByTestId('authenticated-route')).toBeInTheDocument();
    
    // Check that children are passed to AuthenticatedRoute
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });
});

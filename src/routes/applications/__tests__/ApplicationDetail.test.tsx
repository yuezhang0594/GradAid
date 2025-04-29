import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ApplicationDetail from '../ApplicationDetail';

// Mock the Id type for tests
vi.mock("#/_generated/dataModel", () => ({
  Id: {
    fromString: (id: string) => id,
  },
}));

// Mock the Convex API
vi.mock("#/_generated/api", () => ({
  api: {
    documents: {
      mutations: {
        createDocument: vi.fn(),
      },
    },
    applications: {
      mutations: {
        deleteApplication: vi.fn(),
        updateApplicationStatus: vi.fn(),
      },
    },
  },
}));

// Mock the custom hook
vi.mock('@/hooks/useApplicationDetail', () => ({
  useApplicationDetail: () => ({
    application: null,
    applicationStats: [],
    documentStats: [],
    isLoading: false
  }),
}));

// Mock the Convex hooks
vi.mock('convex/react', () => ({
  useMutation: () => vi.fn(),
}));

// Mock React Router
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({
    pathname: '/applications/stanford',
    state: null, // Simulate missing state to test error handling
  }),
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock UI components
vi.mock('@/components/ui/page-wrapper', () => ({
  PageWrapper: ({ title, description, children }: { title: string, description?: string, children: React.ReactNode }) => (
    <div data-testid="page-wrapper" data-title={title} data-description={description || ''}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui', () => ({
  Button: ({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) => (
    <button data-testid="button" onClick={onClick}>{children}</button>
  ),
}));

describe('ApplicationDetail Component', () => {
  it('shows error state when no applicationId is provided', () => {
    // Mock location already returns null state
    render(<ApplicationDetail />);
    
    const pageWrapper = screen.getByTestId('page-wrapper');
    expect(pageWrapper).toHaveAttribute('data-title', 'Error');
    expect(screen.getByText('Missing Application ID')).toBeInTheDocument();
    expect(screen.getByText('No application ID was provided in the navigation state.')).toBeInTheDocument();
    expect(screen.getByText('Go Back')).toBeInTheDocument();
  });
});

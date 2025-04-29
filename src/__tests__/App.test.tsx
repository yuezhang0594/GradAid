import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';
import { MemoryRouter } from 'react-router-dom';

// Mock all the components used in App
vi.mock('@clerk/clerk-react', () => ({
  UserProfile: () => <div data-testid="user-profile">User Profile</div>,
}));

vi.mock('../components/landing-page', () => ({
  LandingPage: () => <div data-testid="landing-page">Landing Page</div>,
}));

vi.mock('@/components/layout/DashboardLayout', () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dashboard-layout">{children}</div>
  ),
}));

vi.mock('sonner', () => ({
  Toaster: () => <div data-testid="toaster">Toaster</div>,
}));

// Mock all route components
vi.mock('../routes/dashboard/Dashboard', () => ({
  default: () => <div data-testid="dashboard">Dashboard</div>,
}));

vi.mock('../routes/legal/tos', () => ({
  default: () => <div data-testid="tos-page">TOS Page</div>,
}));

vi.mock('../routes/legal/privacy', () => ({
  default: () => <div data-testid="privacy-policy">Privacy Policy</div>,
}));

vi.mock('../routes/ProtectedRoute', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-route">{children}</div>
  ),
}));

vi.mock('../routes/auth/SignIn', () => ({
  default: () => <div data-testid="sign-in-page">Sign In Page</div>,
}));

vi.mock('../routes/auth/SignUp', () => ({
  default: () => <div data-testid="sign-up-page">Sign Up Page</div>,
}));

vi.mock('../routes/auth/SignOut', () => ({
  default: () => <div data-testid="sign-out-page">Sign Out Page</div>,
}));

// Mock all other routes individually instead of using a loop
vi.mock('../routes/applications/applications', () => ({
  default: () => <div data-testid="route-applications">Applications</div>,
}));

vi.mock('../routes/pages/documents', () => ({
  default: () => <div data-testid="route-documents">Documents</div>,
}));

vi.mock('../routes/applications/ApplicationDetail', () => ({
  default: () => <div data-testid="route-ApplicationDetail">ApplicationDetail</div>,
}));

vi.mock('../routes/applications/DocumentEditor', () => ({
  default: () => <div data-testid="route-DocumentEditor">DocumentEditor</div>,
}));

vi.mock('../routes/pages/timeline', () => ({
  default: () => <div data-testid="route-timeline">Timeline</div>,
}));

vi.mock('../routes/pages/activity', () => ({
  default: () => <div data-testid="route-activity">Activity</div>,
}));

vi.mock('../routes/ProgramSearchPage', () => ({
  default: () => <div data-testid="route-ProgramSearchPage">ProgramSearchPage</div>,
}));

vi.mock('../routes/onboarding/page', () => ({
  default: () => <div data-testid="route-page">OnboardingPage</div>,
}));

vi.mock('../routes/profile/page', () => ({
  default: () => <div data-testid="route-page">ProfilePage</div>,
}));

vi.mock('../routes/SavedProgramsPage', () => ({
  default: () => <div data-testid="route-SavedProgramsPage">SavedProgramsPage</div>,
}));

vi.mock('../routes/ProgramApplyPage', () => ({
  default: () => <div data-testid="route-ProgramApplyPage">ProgramApplyPage</div>,
}));

vi.mock('../routes/FeedbackPage', () => ({
  default: () => <div data-testid="route-FeedbackPage">FeedbackPage</div>,
}));

vi.mock('../routes/support/FAQPage', () => ({
  default: () => <div data-testid="route-FAQPage">FAQPage</div>,
}));

vi.mock('../routes/support/ContactPage', () => ({
  default: () => <div data-testid="route-ContactPage">ContactPage</div>,
}));

vi.mock('../routes/support/ResendDashboard', () => ({
  default: () => <div data-testid="route-ResendDashboard">ResendDashboard</div>,
}));

vi.mock('../routes/pages/credits', () => ({
  default: () => <div data-testid="route-credits">Credits</div>,
}));

// Wrap the App component with MemoryRouter for testing
const renderWithRouter = (initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <App />
    </MemoryRouter>
  );
};

describe('App Component', () => {
  it('renders the Toaster component', () => {
    renderWithRouter();
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });

  it('renders the landing page on the root route', () => {
    renderWithRouter(['/']);
    expect(screen.getByTestId('landing-page')).toBeInTheDocument();
  });

  it('renders the sign in page on /signin route', () => {
    renderWithRouter(['/signin']);
    expect(screen.getByTestId('sign-in-page')).toBeInTheDocument();
  });

  it('renders the sign up page on /signup route', () => {
    renderWithRouter(['/signup']);
    expect(screen.getByTestId('sign-up-page')).toBeInTheDocument();
  });

  it('renders the sign out page on /signout route', () => {
    renderWithRouter(['/signout']);
    expect(screen.getByTestId('sign-out-page')).toBeInTheDocument();
  });

  it('renders the user profile on /clerk route', () => {
    renderWithRouter(['/clerk']);
    expect(screen.getByTestId('user-profile')).toBeInTheDocument();
  });

  it('renders the TOS page on /tos route', () => {
    renderWithRouter(['/tos']);
    expect(screen.getByTestId('tos-page')).toBeInTheDocument();
  });

  it('renders the privacy policy on /privacy route', () => {
    renderWithRouter(['/privacy']);
    expect(screen.getByTestId('privacy-policy')).toBeInTheDocument();
  });

  it('renders protected routes with the ProtectedRoute component', () => {
    renderWithRouter(['/onboarding']);
    expect(screen.getByTestId('protected-route')).toBeInTheDocument();
  });
});

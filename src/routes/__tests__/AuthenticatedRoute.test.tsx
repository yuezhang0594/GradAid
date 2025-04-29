import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AuthenticatedRoute from '../AuthenticatedRoute';

// Create mock functions for react-router-dom
const mockNavigate = vi.fn();
const mockUseLocation = vi.fn().mockReturnValue({ pathname: '/test' });

// Mock the useProfile hook directly
vi.mock('@/hooks/useProfile', () => ({
  useProfile: vi.fn()
}));

// Import the mocked module
import { useProfile } from '@/hooks/useProfile';

// Mock the react-router-dom hooks
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockUseLocation()
}));

// Mock profile data
const mockProfile = {
  personalInfo: {
    countryOfOrigin: 'United States',
    dateOfBirth: '1990-01-01',
    currentLocation: 'New York, NY',
    nativeLanguage: 'English'
  },
  education: {
    educationLevel: 'Bachelor',
    major: 'Computer Science',
    university: 'Example University',
    gpa: 3.8, 
    gpaScale: 4.0,
    graduationDate: '2022-05-15',
    researchExperience: 'Some research experience'
  },
  testScores: {
    greScores: { 
      verbal: 160, 
      quantitative: 165, 
      analyticalWriting: 5.0,
      testDate: '2022-01-15'
    },
    englishTest: { 
      type: "TOEFL" as const, // Type assertion to fix TypeScript error
      overallScore: 110, 
      sectionScores: {
        reading: 28,
        listening: 27,
        speaking: 26,
        writing: 29
      },
      testDate: '2022-02-15'
    }
  },
  careerGoals: {
    targetDegree: 'MS',
    intendedField: 'Computer Science',
    researchInterests: ['AI', 'Machine Learning'],
    careerObjectives: 'Research Scientist',
    targetLocations: ['USA', 'Canada'],
    expectedStartDate: '2023-09-01',
    budgetRange: '$20,000-$40,000'
  }
};

describe('AuthenticatedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLocation.mockReturnValue({ pathname: '/test' });
  });

  it('renders loading state when profile data is loading', () => {
    // Mock the useProfile hook to return null for isComplete (loading state)
    vi.mocked(useProfile).mockReturnValue({
      isComplete: null,
      currentStep: "personal-info",
      profile: undefined,
      savePersonalInfo: vi.fn(),
      saveEducation: vi.fn(),
      saveTestScores: vi.fn(),
      saveCareerGoals: vi.fn()
    });

    render(
      <AuthenticatedRoute>
        <div data-testid="child-content">Protected Content</div>
      </AuthenticatedRoute>
    );

    // Check that loading indicator is displayed
    expect(screen.getByText('Verifying your credentials...')).toBeInTheDocument();
    
    // Check that child content is not displayed
    expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
  });

  it('renders children when profile is complete and requireCompleteProfile is true', () => {
    // Mock the useProfile hook to return true for isComplete
    vi.mocked(useProfile).mockReturnValue({
      isComplete: true,
      currentStep: "complete",
      profile: mockProfile,
      savePersonalInfo: vi.fn(),
      saveEducation: vi.fn(),
      saveTestScores: vi.fn(),
      saveCareerGoals: vi.fn()
    });

    render(
      <AuthenticatedRoute>
        <div data-testid="child-content">Protected Content</div>
      </AuthenticatedRoute>
    );

    // Check that child content is displayed
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    
    // Check that loading indicator is not displayed
    expect(screen.queryByText('Verifying your credentials...')).not.toBeInTheDocument();
  });

  it('redirects to onboarding when profile is incomplete and requireCompleteProfile is true', () => {
    // Mock the useProfile hook to return false for isComplete
    vi.mocked(useProfile).mockReturnValue({
      isComplete: false,
      currentStep: "personal-info",
      profile: mockProfile,
      savePersonalInfo: vi.fn(),
      saveEducation: vi.fn(),
      saveTestScores: vi.fn(),
      saveCareerGoals: vi.fn()
    });

    // Set the mock location to be on a non-onboarding route
    mockUseLocation.mockReturnValue({ pathname: '/dashboard' });

    render(
      <AuthenticatedRoute>
        <div data-testid="child-content">Protected Content</div>
      </AuthenticatedRoute>
    );

    // Check that navigate was called with the correct arguments
    expect(mockNavigate).toHaveBeenCalledWith('/onboarding', { replace: true });
  });

  it('does not redirect when profile is incomplete but requireCompleteProfile is false', () => {
    // Mock the useProfile hook to return false for isComplete
    vi.mocked(useProfile).mockReturnValue({
      isComplete: false,
      currentStep: "personal-info",
      profile: mockProfile,
      savePersonalInfo: vi.fn(),
      saveEducation: vi.fn(),
      saveTestScores: vi.fn(),
      saveCareerGoals: vi.fn()
    });

    // Set the mock location to be on a non-onboarding route
    mockUseLocation.mockReturnValue({ pathname: '/some-route' });

    render(
      <AuthenticatedRoute requireCompleteProfile={false}>
        <div data-testid="child-content">Protected Content</div>
      </AuthenticatedRoute>
    );

    // Check that navigate was not called
    expect(mockNavigate).not.toHaveBeenCalled();
    
    // Check that child content is displayed
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('redirects to dashboard when on onboarding route but profile is complete', () => {
    // Mock the useProfile hook to return true for isComplete
    vi.mocked(useProfile).mockReturnValue({
      isComplete: true,
      currentStep: "complete",
      profile: mockProfile,
      savePersonalInfo: vi.fn(),
      saveEducation: vi.fn(),
      saveTestScores: vi.fn(),
      saveCareerGoals: vi.fn()
    });

    // Set the mock location to be on the onboarding route
    mockUseLocation.mockReturnValue({ pathname: '/onboarding' });

    render(
      <AuthenticatedRoute>
        <div data-testid="child-content">Protected Content</div>
      </AuthenticatedRoute>
    );

    // Check that navigate was called with the correct arguments
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
  });

  it('uses custom redirect paths when provided', () => {
    // Mock the useProfile hook to return false for isComplete
    vi.mocked(useProfile).mockReturnValue({
      isComplete: false,
      currentStep: "personal-info",
      profile: mockProfile,
      savePersonalInfo: vi.fn(),
      saveEducation: vi.fn(),
      saveTestScores: vi.fn(),
      saveCareerGoals: vi.fn()
    });

    // Set the mock location to be on a non-onboarding route
    mockUseLocation.mockReturnValue({ pathname: '/dashboard' });

    render(
      <AuthenticatedRoute 
        redirectIncomplete="/custom-onboarding" 
        redirectComplete="/custom-dashboard"
      >
        <div data-testid="child-content">Protected Content</div>
      </AuthenticatedRoute>
    );

    // Check that navigate was called with the custom redirect path
    expect(mockNavigate).toHaveBeenCalledWith('/custom-onboarding', { replace: true });
  });
});

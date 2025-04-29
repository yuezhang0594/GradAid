import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock dependencies
vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn()
}));

vi.mock('#/_generated/api', () => ({
  api: {
    programs: {
      queries: {
        getProgramsByIds: 'programs.queries.getProgramsByIds'
      }
    },
    universities: {
      queries: {
        getUniversity: 'universities.queries.getUniversity'
      }
    },
    applications: {
      mutations: {
        createApplication: 'applications.mutations.createApplication',
        updateApplicationStatus: 'applications.mutations.updateApplicationStatus'
      }
    }
  }
}));

// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Import after mocking
import { useApply } from '../useApply';
import { useQuery, useMutation } from 'convex/react';
import { toast } from 'sonner';
import { Id } from '#/_generated/dataModel';
import { DocumentType, DocumentStatus, ApplicationPriority } from '#/validators';

// Define a type for the mocked function
type MockedFunction = ReturnType<typeof vi.fn>;

describe('useApply Hook', () => {
  // Mock data
  const mockProgramId = 'program1' as unknown as Id<"programs">;
  const mockUniversityId = 'university1' as unknown as Id<"universities">;
  const mockApplicationId = 'application1' as unknown as Id<"applications">;
  
  const mockProgram = {
    _id: mockProgramId,
    _creationTime: 1234567890,
    universityId: mockUniversityId,
    name: 'Computer Science',
    degree: 'MS',
    department: 'Computer Science',
    description: 'A great program',
    requirements: ['GRE', 'TOEFL'],
    deadline: '2025-05-15',
    website: 'https://example.com/cs'
  };
  
  const mockUniversity = {
    _id: mockUniversityId,
    _creationTime: 1234567890,
    name: 'Stanford University',
    country: 'United States',
    state: 'California',
    city: 'Stanford',
    ranking: 1,
    website: 'https://stanford.edu'
  };
  
  // Mock mutation functions
  const mockCreateApplication = vi.fn();
  const mockUpdateApplicationStatus = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock useQuery
    (useQuery as MockedFunction).mockImplementation((query) => {
      if (query === 'programs.queries.getProgramsByIds') {
        return [mockProgram];
      } else if (query === 'universities.queries.getUniversity') {
        return mockUniversity;
      }
      return undefined;
    });
    
    // Mock useMutation
    (useMutation as MockedFunction).mockImplementation((mutation) => {
      if (mutation === 'applications.mutations.createApplication') {
        return mockCreateApplication;
      } else if (mutation === 'applications.mutations.updateApplicationStatus') {
        return mockUpdateApplicationStatus;
      }
      return vi.fn();
    });
    
    // Set up successful mutation responses
    mockCreateApplication.mockResolvedValue(mockApplicationId);
    mockUpdateApplicationStatus.mockResolvedValue(mockApplicationId);
  });
  
  it('should initialize with program and university data when programId is provided', () => {
    const { result } = renderHook(() => useApply(mockProgramId));
    
    // Check if program and university data are loaded
    expect(result.current.program).toEqual(mockProgram);
    expect(result.current.university).toEqual(mockUniversity);
    expect(result.current.isCreating).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });
  
  it('should handle null program data', () => {
    // Reset the mock implementation
    (useQuery as MockedFunction).mockReset();
    
    // Create a new mock implementation specifically for this test
    (useQuery as MockedFunction).mockImplementation((query) => {
      if (query === 'programs.queries.getProgramsByIds') {
        return [];
      }
      // For any other query, including university query, return undefined
      return undefined;
    });
    
    const { result } = renderHook(() => useApply(mockProgramId));
    
    // Check if program and university are null
    expect(result.current.program).toBeNull();
    expect(result.current.university).toBeNull();
  });
  
  it('should create an application successfully', async () => {
    const { result } = renderHook(() => useApply(mockProgramId));
    
    const applicationDocuments = [
      { type: 'sop' as DocumentType, status: 'draft' as DocumentStatus },
      { type: 'lor' as DocumentType, status: 'draft' as DocumentStatus }
    ];
    
    // Create application
    let applicationId;
    await act(async () => {
      applicationId = await result.current.createApplication({
        universityId: mockUniversityId,
        programId: mockProgramId,
        deadline: '2025-05-15',
        priority: 'high' as ApplicationPriority,
        notes: 'Test application',
        applicationDocuments
      });
    });
    
    // Check if createApplication was called with correct arguments
    expect(mockCreateApplication).toHaveBeenCalledWith({
      universityId: mockUniversityId,
      programId: mockProgramId,
      deadline: '2025-05-15',
      priority: 'high',
      notes: 'Test application',
      applicationDocuments
    });
    
    // Check if toast.success was called
    expect(toast.success).toHaveBeenCalledWith('Application Created', {
      description: 'Your application has been successfully created.'
    });
    
    // Check if applicationId is returned
    expect(applicationId).toBe(mockApplicationId);
  });
  
  it('should handle errors when creating an application', async () => {
    // Mock createApplication to throw an error
    mockCreateApplication.mockRejectedValueOnce(new Error('Failed to create application'));
    
    const { result } = renderHook(() => useApply(mockProgramId));
    
    // Create application
    let applicationId;
    await act(async () => {
      applicationId = await result.current.createApplication({
        universityId: mockUniversityId,
        programId: mockProgramId,
        deadline: '2025-05-15',
        priority: 'high' as ApplicationPriority,
        notes: 'Test application',
        applicationDocuments: []
      });
    });
    
    // Check if toast.error was called
    expect(toast.error).toHaveBeenCalledWith('Error Creating Application', {
      description: 'Failed to create application'
    });
    
    // Check if applicationId is null
    expect(applicationId).toBeNull();
  });
  
  it('should update application status successfully', async () => {
    const { result } = renderHook(() => useApply(mockProgramId));
    
    // Update application status
    let updatedId;
    await act(async () => {
      updatedId = await result.current.updateApplicationStatus({
        applicationId: mockApplicationId,
        status: 'submitted',
        notes: 'Submitted application',
        submissionDate: '2025-05-10'
      });
    });
    
    // Check if updateApplicationStatus was called with correct arguments
    expect(mockUpdateApplicationStatus).toHaveBeenCalledWith({
      applicationId: mockApplicationId,
      status: 'submitted',
      notes: 'Submitted application',
      submissionDate: '2025-05-10'
    });
    
    // Check if toast.success was called
    expect(toast.success).toHaveBeenCalledWith('Application Updated', {
      description: 'Application status updated to submitted.'
    });
    
    // Check if updatedId is returned
    expect(updatedId).toBe(mockApplicationId);
  });
  
  it('should handle errors when updating application status', async () => {
    // Mock updateApplicationStatus to throw an error
    mockUpdateApplicationStatus.mockRejectedValueOnce(new Error('Failed to update status'));
    
    const { result } = renderHook(() => useApply(mockProgramId));
    
    // Update application status
    let updatedId;
    await act(async () => {
      updatedId = await result.current.updateApplicationStatus({
        applicationId: mockApplicationId,
        status: 'submitted'
      });
    });
    
    // Check if toast.error was called
    expect(toast.error).toHaveBeenCalledWith('Error Updating Application', {
      description: 'Failed to update status'
    });
    
    // Check if updatedId is null
    expect(updatedId).toBeNull();
  });
  
  it('should handle "Uncaught Error" messages when creating an application', async () => {
    // Mock createApplication to throw an error with "Uncaught Error:" prefix
    const errorMessage = 'Uncaught Error: Invalid program ID at createApplication (/path/to/file.js:123:45)';
    mockCreateApplication.mockRejectedValueOnce(new Error(errorMessage));
    
    const { result } = renderHook(() => useApply(mockProgramId));
    
    // Create application
    await act(async () => {
      await result.current.createApplication({
        universityId: mockUniversityId,
        programId: mockProgramId,
        deadline: '2025-05-15',
        priority: 'high' as ApplicationPriority,
        notes: 'Test application',
        applicationDocuments: []
      });
    });
    
    // Check if toast.error was called with the truncated message
    expect(toast.error).toHaveBeenCalledWith('Error Creating Application', {
      description: 'Invalid program ID'
    });
  });
});

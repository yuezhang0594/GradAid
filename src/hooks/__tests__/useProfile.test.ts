import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

// Mock Convex functions
vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn()
}));

vi.mock('#/_generated/api', () => ({
  api: {
    userProfiles: {
      queries: {
        getProfile: 'userProfiles.queries.getProfile',
        checkOnboardingStatus: 'userProfiles.queries.checkOnboardingStatus'
      },
      mutations: {
        savePersonalInfo: 'userProfiles.mutations.savePersonalInfo',
        saveEducation: 'userProfiles.mutations.saveEducation',
        saveTestScores: 'userProfiles.mutations.saveTestScores',
        saveCareerGoals: 'userProfiles.mutations.saveCareerGoals'
      }
    }
  }
}));

// Import after mocking
import { useProfile, OnboardingStatus } from '../useProfile';
import { useQuery, useMutation } from 'convex/react';

// Define a type for the mocked function
type MockedFunction = ReturnType<typeof vi.fn>;

describe('useProfile Hook', () => {
  // Mock data
  const mockProfileData = {
    _id: 'profile1',
    _creationTime: 1234567890,
    countryOfOrigin: 'USA',
    dateOfBirth: '1990-01-01',
    currentLocation: 'New York',
    nativeLanguage: 'English',
    educationLevel: 'Bachelor',
    major: 'Computer Science',
    university: 'Stanford',
    gpa: 3.8,
    gpaScale: 4.0,
    graduationDate: '2022-05-15',
    researchExperience: 'Yes',
    greScores: {
      verbal: 165,
      quantitative: 168,
      analytical: 5.0
    },
    englishTest: {
      type: 'TOEFL',
      overallScore: 110,
      sectionScores: {
        reading: 28,
        listening: 28,
        speaking: 27,
        writing: 27
      },
      testDate: '2022-01-15'
    },
    targetDegree: 'PhD',
    intendedField: 'Artificial Intelligence',
    researchInterests: ['Machine Learning', 'Computer Vision'],
    careerObjectives: 'Research Scientist',
    targetLocations: ['USA', 'Canada'],
    expectedStartDate: '2023-09-01',
    budgetRange: '$50,000 - $70,000'
  };
  
  const mockOnboardingStatus: OnboardingStatus = {
    isComplete: false,
    currentStep: 'education'
  };
  
  // Mock mutation functions
  const mockSavePersonalInfo = vi.fn();
  const mockSaveEducation = vi.fn();
  const mockSaveTestScores = vi.fn();
  const mockSaveCareerGoals = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock useQuery
    (useQuery as MockedFunction).mockImplementation((query) => {
      if (query === 'userProfiles.queries.getProfile') {
        return mockProfileData;
      } else if (query === 'userProfiles.queries.checkOnboardingStatus') {
        return mockOnboardingStatus;
      }
      return undefined;
    });
    
    // Mock useMutation
    (useMutation as MockedFunction).mockImplementation((mutation) => {
      if (mutation === 'userProfiles.mutations.savePersonalInfo') {
        return mockSavePersonalInfo;
      } else if (mutation === 'userProfiles.mutations.saveEducation') {
        return mockSaveEducation;
      } else if (mutation === 'userProfiles.mutations.saveTestScores') {
        return mockSaveTestScores;
      } else if (mutation === 'userProfiles.mutations.saveCareerGoals') {
        return mockSaveCareerGoals;
      }
      return vi.fn();
    });
    
    // Set up successful mutation responses
    mockSavePersonalInfo.mockResolvedValue({ currentStep: 'education' });
    mockSaveEducation.mockResolvedValue({ currentStep: 'test-scores' });
    mockSaveTestScores.mockResolvedValue({ currentStep: 'career-goals' });
    mockSaveCareerGoals.mockResolvedValue({ currentStep: 'complete' });
  });
  
  it('should convert profile data correctly', () => {
    const { result } = renderHook(() => useProfile());
    
    // Check if profile data is converted correctly
    expect(result.current.profile).toEqual({
      personalInfo: {
        countryOfOrigin: 'USA',
        dateOfBirth: '1990-01-01',
        currentLocation: 'New York',
        nativeLanguage: 'English',
      },
      education: {
        educationLevel: 'Bachelor',
        major: 'Computer Science',
        university: 'Stanford',
        gpa: 3.8,
        gpaScale: 4.0,
        graduationDate: '2022-05-15',
        researchExperience: 'Yes',
      },
      testScores: {
        greScores: {
          verbal: 165,
          quantitative: 168,
          analytical: 5.0
        },
        englishTest: {
          type: 'TOEFL',
          overallScore: 110,
          sectionScores: {
            reading: 28,
            listening: 28,
            speaking: 27,
            writing: 27
          },
          testDate: '2022-01-15'
        },
      },
      careerGoals: {
        targetDegree: 'PhD',
        intendedField: 'Artificial Intelligence',
        researchInterests: ['Machine Learning', 'Computer Vision'],
        careerObjectives: 'Research Scientist',
        targetLocations: ['USA', 'Canada'],
        expectedStartDate: '2023-09-01',
        budgetRange: '$50,000 - $70,000'
      },
    });
  });
  
  it('should return onboarding status correctly', () => {
    const { result } = renderHook(() => useProfile());
    
    // Check if onboarding status is returned correctly
    expect(result.current.isComplete).toBe(false);
    expect(result.current.currentStep).toBe('education');
  });
  
  it('should handle undefined profile data', () => {
    // Mock undefined profile data
    (useQuery as MockedFunction).mockImplementationOnce((query) => {
      if (query === 'userProfiles.queries.getProfile') {
        return undefined;
      } else if (query === 'userProfiles.queries.checkOnboardingStatus') {
        return mockOnboardingStatus;
      }
      return undefined;
    });
    
    const { result } = renderHook(() => useProfile());
    
    // Check if profile is undefined when data is undefined
    expect(result.current.profile).toBeUndefined();
  });
  
  it('should handle null profile data', () => {
    // Mock null profile data
    (useQuery as MockedFunction).mockImplementationOnce((query) => {
      if (query === 'userProfiles.queries.getProfile') {
        return null;
      } else if (query === 'userProfiles.queries.checkOnboardingStatus') {
        return mockOnboardingStatus;
      }
      return undefined;
    });
    
    const { result } = renderHook(() => useProfile());
    
    // Check if profile is undefined when data is null
    expect(result.current.profile).toBeUndefined();
  });
  
  it('should handle undefined onboarding status', () => {
    // Reset mocks to ensure clean state
    vi.clearAllMocks();
    
    // Set up mock implementation specifically for this test
    const mockQueryImplementation = vi.fn((query) => {
      if (query === 'userProfiles.queries.getProfile') {
        return mockProfileData;
      }
      // Return undefined for checkOnboardingStatus
      return undefined;
    });
    
    // Apply the mock implementation
    (useQuery as MockedFunction).mockImplementation(mockQueryImplementation);
    
    const { result } = renderHook(() => useProfile());
    
    // Check if default values are used when onboarding status is undefined
    expect(result.current.isComplete).toBeNull();
    expect(result.current.currentStep).toBe('personal-info');
  });
  
  it('should save personal info correctly', async () => {
    const { result } = renderHook(() => useProfile());
    
    // Personal info data to save
    const personalInfo = {
      countryOfOrigin: 'Canada',
      dateOfBirth: '1992-05-15',
      currentLocation: 'Toronto',
      nativeLanguage: 'English'
    };
    
    // Save personal info
    const response = await result.current.savePersonalInfo(personalInfo);
    
    // Check if mutation was called with correct data
    expect(mockSavePersonalInfo).toHaveBeenCalledWith({
      ...personalInfo
    });
    
    // Check if response is correct
    expect(response).toEqual({ currentStep: 'education' });
  });
  
  it('should save education correctly', async () => {
    const { result } = renderHook(() => useProfile());
    
    // Education data to save
    const education = {
      educationLevel: 'Master',
      major: 'Data Science',
      university: 'MIT',
      gpa: 3.9,
      gpaScale: 4.0,
      graduationDate: '2023-05-15',
      researchExperience: 'Yes'
    };
    
    // Save education
    const response = await result.current.saveEducation(education);
    
    // Check if mutation was called with correct data
    expect(mockSaveEducation).toHaveBeenCalledWith({
      ...education
    });
    
    // Check if response is correct
    expect(response).toEqual({ currentStep: 'test-scores' });
  });
  
  it('should save test scores correctly', async () => {
    const { result } = renderHook(() => useProfile());
    
    // Test scores data to save
    const testScores = {
      greScores: {
        verbal: 160,
        quantitative: 170,
        analyticalWriting: 4.5,
        testDate: '2023-01-15'
      },
      englishTest: {
        type: 'IELTS',
        overallScore: 8.0,
        sectionScores: {
          reading: 8.0,
          listening: 8.5,
          speaking: 7.5,
          writing: 7.5
        },
        testDate: '2023-02-20'
      }
    } as any; // Use type assertion to bypass type checking for tests
    
    // Save test scores
    const response = await result.current.saveTestScores(testScores);
    
    // Check if mutation was called with correct data
    expect(mockSaveTestScores).toHaveBeenCalledWith({
      ...testScores
    });
    
    // Check if response is correct
    expect(response).toEqual({ currentStep: 'career-goals' });
  });
  
  it('should save career goals correctly', async () => {
    const { result } = renderHook(() => useProfile());
    
    // Career goals data to save
    const careerGoals = {
      targetDegree: 'MS',
      intendedField: 'Machine Learning',
      researchInterests: ['Deep Learning', 'NLP'],
      careerObjectives: 'ML Engineer',
      targetLocations: ['USA', 'UK'],
      expectedStartDate: '2024-09-01',
      budgetRange: '$30,000 - $50,000'
    };
    
    // Save career goals
    const response = await result.current.saveCareerGoals(careerGoals);
    
    // Check if mutation was called with correct data
    expect(mockSaveCareerGoals).toHaveBeenCalledWith({
      ...careerGoals
    });
    
    // Check if response is correct
    expect(response).toEqual({ currentStep: 'complete' });
  });
});

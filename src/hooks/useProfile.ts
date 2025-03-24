import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

// Define profile section types
export interface PersonalInfo {
  countryOfOrigin: string;
  dateOfBirth: string;
  currentLocation: string;
  nativeLanguage: string;
}

export interface Education {
  educationLevel: string;
  major: string;
  university: string;
  gpa: number;
  gpaScale: number;
  graduationDate: string;
  researchExperience?: string;
}

export interface TestScores {
  greScores?: {
    verbal: number;
    quantitative: number;
    analyticalWriting: number;
    testDate: string;
  };
  englishTest?: {
    type: "TOEFL" | "IELTS";
    overallScore: number;
    sectionScores: Record<string, number>;
    testDate: string;
  };
}

export interface CareerGoals {
  targetDegree: string;
  intendedField: string;
  researchInterests: string[];
  careerObjectives: string;
  targetLocations: string[];
  expectedStartDate: string;
  budgetRange?: string;
}

export interface Profile {
  personalInfo: PersonalInfo;
  education: Education;
  testScores: TestScores;
  careerGoals: CareerGoals;
}

// Define onboarding status type
export interface OnboardingStatus {
  isComplete: boolean;
  currentStep: "personal-info" | "education" | "test-scores" | "career-goals" | "complete";
}

export function useProfile() {
  // Get profile data
  const profile = useQuery(api.userProfiles.queries.getProfile) as Profile | undefined;

  // Get onboarding status
  const onboardingStatus = useQuery(api.userProfiles.queries.checkOnboardingStatus) as OnboardingStatus | undefined;

  // Mutations for each section
  const savePersonalInfo = useMutation(api.userProfiles.mutations.savePersonalInfo);
  const saveEducation = useMutation(api.userProfiles.mutations.saveEducation);
  const saveTestScores = useMutation(api.userProfiles.mutations.saveTestScores);
  const saveCareerGoals = useMutation(api.userProfiles.mutations.saveCareerGoals);

  // Save functions for each section
  const savePersonalInfoSection = async (data: PersonalInfo): Promise<{ currentStep: string }> => {
    return await savePersonalInfo({
      ...data,
    });
  };

  const saveEducationSection = async (data: Education): Promise<{ currentStep: string }> => {
    return await saveEducation({
      ...data,
    });
  };

  const saveTestScoresSection = async (data: TestScores): Promise<{ currentStep: string }> => {
    return await saveTestScores({
      ...data,
    });
  };

  const saveCareerGoalsSection = async (data: CareerGoals): Promise<{ currentStep: string }> => {
    return await saveCareerGoals({
      ...data,
    });
  };

  return {
    // Profile data
    profile,
    
    // Save functions
    savePersonalInfo: savePersonalInfoSection,
    saveEducation: saveEducationSection,
    saveTestScores: saveTestScoresSection,
    saveCareerGoals: saveCareerGoalsSection,
    
    // Status
    isComplete: onboardingStatus?.isComplete ?? false,
    currentStep: onboardingStatus?.currentStep ?? "personal-info"
  };
}
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useUser } from '@clerk/clerk-react';
import { Doc, Id } from '../../convex/_generated/dataModel';

// Use Convex's generated type
type UserProfile = Doc<"userProfiles"> & { _id: Id<"userProfiles"> };

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

// Define onboarding status type
export interface OnboardingStatus {
  isComplete: boolean;
  currentStep: "personal-info" | "education" | "career-goals" | "complete";
}

export function useProfile() {
  const { user } = useUser();
  const userId = user?.id as Id<"users"> | undefined;

  // Get profile data
  const profile = useQuery(api.userProfiles.getProfile);

  // Get onboarding status
  const onboardingStatus = useQuery(api.userProfiles.checkOnboardingStatus) as OnboardingStatus | undefined;

  // Mutations for each section
  const savePersonalInfo = useMutation(api.userProfiles.savePersonalInfo);
  const saveEducation = useMutation(api.userProfiles.saveEducation);
  const saveTestScores = useMutation(api.userProfiles.saveTestScores);
  const saveCareerGoals = useMutation(api.userProfiles.saveCareerGoals);

  // Save functions for each section
  const savePersonalInfoSection = async (data: PersonalInfo) => {
    if (!userId) return;
    await savePersonalInfo({
      userId,
      ...data,
    });
  };

  const saveEducationSection = async (data: Education) => {
    if (!userId) return;
    await saveEducation({
      userId,
      ...data,
    });
  };

  const saveTestScoresSection = async (data: TestScores) => {
    if (!userId) return;
    await saveTestScores({
      userId,
      ...data,
    });
  };

  const saveCareerGoalsSection = async (data: CareerGoals) => {
    if (!userId) return;
    await saveCareerGoals({
      userId,
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
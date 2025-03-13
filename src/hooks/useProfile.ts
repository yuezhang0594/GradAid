import { useState, useCallback } from 'react';
import { api } from '../../convex/_generated/api';
import { useQuery, useMutation } from 'convex/react';
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
  budgetRange: string;
}

export function useProfile() {
  const { user } = useUser();
  const userId = user?.id;

  // Get profile data
  const profile = useQuery(api.userProfiles.getProfile, { 
    userId: userId ?? "" 
  });

  // Get onboarding status
  const onboardingStatus = useQuery(api.userProfiles.checkOnboardingStatus, {
    userId: userId ?? ""
  });

  // Mutations for each section
  const savePersonalInfo = useMutation(api.userProfiles.savePersonalInfo);
  const saveEducation = useMutation(api.userProfiles.saveEducation);
  const saveTestScores = useMutation(api.userProfiles.saveTestScores);
  const saveCareerGoals = useMutation(api.userProfiles.saveCareerGoals);

  // Save handlers for each section
  const updatePersonalInfo = useCallback(async (data: PersonalInfo) => {
    if (!userId) return;
    return await savePersonalInfo({ userId, ...data });
  }, [userId, savePersonalInfo]);

  const updateEducation = useCallback(async (data: Education) => {
    if (!userId) return;
    return await saveEducation({ userId, ...data });
  }, [userId, saveEducation]);

  const updateTestScores = useCallback(async (data: TestScores) => {
    if (!userId) return;
    return await saveTestScores({ userId, ...data });
  }, [userId, saveTestScores]);

  const updateCareerGoals = useCallback(async (data: CareerGoals) => {
    if (!userId) return;
    return await saveCareerGoals({ userId, ...data });
  }, [userId, saveCareerGoals]);

  return {
    // Profile data
    profile,
    onboardingStatus,
    isLoading: profile === undefined || onboardingStatus === undefined,
    
    // Update functions
    updatePersonalInfo,
    updateEducation,
    updateTestScores,
    updateCareerGoals,
    
    // Helper getters
    personalInfo: profile as PersonalInfo | undefined,
    education: profile as Education | undefined,
    testScores: profile as TestScores | undefined,
    careerGoals: profile as CareerGoals | undefined,
    
    // Status
    isComplete: onboardingStatus?.isComplete ?? false,
    currentStep: onboardingStatus?.currentStep ?? "personal"
  };
}
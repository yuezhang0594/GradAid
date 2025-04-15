import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Doc } from '../../convex/_generated/dataModel';
import type * as ProfileType from '../components/profile/validators';

// Define onboarding status type
export interface OnboardingStatus {
  isComplete: boolean;
  currentStep: "personal-info" | "education" | "test-scores" | "career-goals" | "complete";
}

// Convert from DB format to frontend format
function convertProfile(profileData: Doc<"userProfiles"> | null | undefined): ProfileType.Profile | undefined {
  if (!profileData) return undefined;
  
  return {
    personalInfo: {
      countryOfOrigin: profileData.countryOfOrigin,
      dateOfBirth: profileData.dateOfBirth,
      currentLocation: profileData.currentLocation,
      nativeLanguage: profileData.nativeLanguage,
    },
    education: {
      educationLevel: profileData.educationLevel,
      major: profileData.major,
      university: profileData.university,
      gpa: profileData.gpa,
      gpaScale: profileData.gpaScale,
      graduationDate: profileData.graduationDate,
      researchExperience: profileData.researchExperience,
    },
    testScores: {
      greScores: profileData.greScores,
      englishTest: profileData.englishTest,
    },
    careerGoals: {
      targetDegree: profileData.targetDegree,
      intendedField: profileData.intendedField,
      researchInterests: profileData.researchInterests,
      careerObjectives: profileData.careerObjectives,
      targetLocations: profileData.targetLocations,
      expectedStartDate: profileData.expectedStartDate,
      budgetRange: profileData.budgetRange,
    },
  };
}

export function useProfile() {
  // Get profile data
  const rawProfile = useQuery(api.userProfiles.queries.getProfile) as Doc<"userProfiles"> | null | undefined;
  // Convert profile to frontend format
  const profile = convertProfile(rawProfile);
  // Get onboarding status
  const onboardingStatus = useQuery(api.userProfiles.queries.checkOnboardingStatus) as OnboardingStatus | undefined;

  // Mutations for each section
  const savePersonalInfo = useMutation(api.userProfiles.mutations.savePersonalInfo);
  const saveEducation = useMutation(api.userProfiles.mutations.saveEducation);
  const saveTestScores = useMutation(api.userProfiles.mutations.saveTestScores);
  const saveCareerGoals = useMutation(api.userProfiles.mutations.saveCareerGoals);

  // Save functions for each section
  const savePersonalInfoSection = async (data: ProfileType.PersonalInfo): Promise<{ currentStep: string }> => {
    return await savePersonalInfo({
      ...data,
    });
  };

  const saveEducationSection = async (data: ProfileType.Education): Promise<{ currentStep: string }> => {
    return await saveEducation({
      ...data,
    });
  };

  const saveTestScoresSection = async (data: ProfileType.TestScores): Promise<{ currentStep: string }> => {
    return await saveTestScores({
      ...data,
    });
  };

  const saveCareerGoalsSection = async (data: ProfileType.CareerGoals): Promise<{ currentStep: string }> => {
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
    isComplete: onboardingStatus?.isComplete ?? null,
    currentStep: onboardingStatus?.currentStep ?? "personal-info"
  };
}
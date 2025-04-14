import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function useProgram() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch universities for dropdown
  const universities = useQuery(api.universities.queries.list) || [];
  const universityOptions = universities.map(university => ({
    label: university.name,
    value: university._id,
  }));
  
  // Mutation to create a new program
  const createProgram = useMutation(api.programs.mutations.create);
  
  // Handle form submission
  const handleCreateProgram = async (data: {
    universityId: Id<"universities">;
    name: string;
    degree: string;
    department: string;
    website?: string;
    requirements: {
      minimumGPA?: number;
      gre?: boolean;
      toefl?: boolean;
      recommendationLetters?: number;
    };
    deadlines: {
      fall?: string | null;
      spring?: string | null;
    };
  }) => {
    setIsSubmitting(true);
    
    try {
      const programId = await createProgram(data);
      return programId;
    } catch (error) {
      console.error("Error creating program:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    universityOptions,
    isLoadingUniversities: universities === undefined,
    isSubmitting,
    createProgram: handleCreateProgram,
  };
}
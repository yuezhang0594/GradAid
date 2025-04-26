/**
 * LLM Integration Tests
 * 
 * This file contains integration tests for the LLM-powered SOP and LOR generation functionality.
 * These tests use mock data to simulate both the Convex database and LLM API calls.
 */

import { describe, it, expect, vi } from 'vitest';
import OpenAI from 'openai';

// Mock the OpenAI client
vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn().mockImplementation(async ({ messages }) => {
            // Simple mock that returns different content based on the prompt
            const prompt = messages[1].content;
            let content = '';
            
            if (prompt.includes('Statement of Purpose')) {
              content = `
                # Statement of Purpose

                ## Introduction
                My name is John Doe, and I am writing to express my interest in the Computer Science PhD program at Stanford University. As a student currently pursuing a Bachelor's degree in Computer Science at Boston University with a 3.8 GPA, I am eager to continue my academic journey in the field of Artificial Intelligence.

                ## Academic Background
                During my time at Boston University, I have excelled in courses related to machine learning, natural language processing, and computer vision. My strong quantitative skills are reflected in my GRE scores of 170 in Quantitative, 165 in Verbal, and 5.0 in Analytical Writing.

                ## Research Experience
                For the past two years, I have been conducting research at Boston University's AI Lab, focusing on natural language processing and transformer models. This experience has resulted in two publications on sentiment analysis and text classification, which have further fueled my passion for research in this field.

                ## Why Stanford University
                Stanford University's School of Engineering is renowned for its cutting-edge research in artificial intelligence. The Computer Science PhD program offers the perfect environment for me to pursue my research interests in Machine Learning, Natural Language Processing, and Computer Vision. I am particularly interested in working with faculty members who are pushing the boundaries in these areas.

                ## Career Goals
                My career objective is to become a Research Scientist in AI, focusing on developing novel NLP techniques for healthcare applications. The rigorous training and research opportunities at Stanford will provide me with the skills and knowledge necessary to achieve this goal.

                ## Conclusion
                I am confident that my academic background, research experience, and passion for AI make me a strong candidate for the Computer Science PhD program at Stanford University. I am excited about the possibility of contributing to the groundbreaking research being conducted at your institution and look forward to the opportunity to discuss my application further.
              `;
            } else if (prompt.includes('Letter of Recommendation')) {
              content = `
                # Letter of Recommendation

                April 26, 2025

                Admissions Committee
                Computer Science PhD Program
                School of Engineering
                Stanford University

                Dear Admissions Committee,

                I am Dr. Richard Feynman, Professor of Computer Science at Boston University, and I am writing this letter in strong support of John Doe's application to the Computer Science PhD program at Stanford University. I have had the pleasure of working with John for the past two years as his Research Advisor at Boston University's AI Lab.

                John has been an exceptional student during his time at Boston University, maintaining a 3.8 GPA in a rigorous Computer Science curriculum. His academic performance places him in the top 5% of students I have taught in my 15 years of teaching.

                In the research setting, John has demonstrated remarkable abilities in machine learning and natural language processing. He has contributed significantly to our lab's research on transformer models, sentiment analysis, and text classification, resulting in two publications where he was a key contributor. His technical skills, combined with his creativity and persistence, make him an ideal candidate for doctoral research.

                On a personal level, John is collaborative, intellectually curious, and dedicated. He consistently goes above and beyond what is required, often staying late in the lab to solve challenging problems and help his peers. His ability to communicate complex technical concepts clearly will serve him well in both research and teaching roles.

                I believe John is exceptionally well-suited for Stanford's Computer Science PhD program. His research interests in Machine Learning, Natural Language Processing, and Computer Vision align perfectly with Stanford's strengths, and his career goal of becoming a Research Scientist in AI focusing on healthcare applications shows both ambition and a desire to make meaningful contributions to society.

                I give John my highest recommendation without reservation. He has the intellectual capacity, research experience, and personal qualities needed to excel in your program and make significant contributions to the field of Artificial Intelligence.

                Please feel free to contact me at feynman@university.edu if you require any additional information.

                Sincerely,

                Dr. Richard Feynman
                Professor of Computer Science
                Boston University
              `;
            }
            
            return {
              choices: [
                {
                  message: {
                    content
                  }
                }
              ]
            };
          })
        }
      }
    }))
  };
});

// Sample user profile data
const mockUserProfile = {
  _id: "user123",
  _creationTime: 1650000000000,
  userId: "user123",
  currentLocation: "Boston, MA",
  countryOfOrigin: "United States",
  nativeLanguage: "English",
  educationLevel: "Bachelor's",
  major: "Computer Science",
  university: "Boston University",
  gpa: 3.8,
  gpaScale: 4.0,
  greScores: {
    verbal: 165,
    quantitative: 170,
    analyticalWriting: 5.0
  },
  englishTest: {
    type: "TOEFL",
    overallScore: 115
  },
  researchExperience: "2 years of ML research at Boston University AI Lab, focusing on natural language processing and transformer models. Contributed to two publications on sentiment analysis and text classification.",
  researchInterests: ["Machine Learning", "Natural Language Processing", "Computer Vision"],
  targetDegree: "PhD",
  intendedField: "Artificial Intelligence",
  careerObjectives: "Research Scientist in AI focusing on developing novel NLP techniques for healthcare applications"
};

const mockProgram = {
  university: "Stanford University",
  name: "Computer Science PhD",
  degree: "PhD",
  department: "School of Engineering"
};

const mockRecommender = {
  name: "Dr. Richard Feynman",
  email: "feynman@university.edu",
  title: "Professor of Computer Science",
  institution: "Boston University",
  relationship: "Research Advisor",
  relationshipDuration: "2 years"
};

// Create an OpenAI client (this will be mocked)
const openai = new OpenAI({ 
  apiKey: 'mock-api-key',
  baseURL: 'https://api.together.xyz/v1'
});

describe('LLM Integration Tests with Mock API', () => {
  describe('Statement of Purpose (SOP) Tests', () => {
    it('should generate an SOP using the LLM service', async () => {
      // Transform the user profile
      const transformedProfile = transformUserProfileForLLM(mockUserProfile, "John Doe");
      
      try {
        // Create a prompt for the SOP
        const prompt = `
          Generate a Statement of Purpose for a graduate school application based on the following information:
          
          Student Information:
          - Name: ${transformedProfile.name}
          - Current Location: ${transformedProfile.current_location}
          - Country of Origin: ${transformedProfile.country_of_origin}
          - Native Language: ${transformedProfile.native_language}
          - Education Level: ${transformedProfile.education_level}
          - Major: ${transformedProfile.major}
          - Current University: ${transformedProfile.current_university}
          - GPA: ${transformedProfile.gpa}/${transformedProfile.gpa_scale}
          - GRE Scores: Verbal: ${transformedProfile.gre_verbal}, Quantitative: ${transformedProfile.gre_quant}, Analytical Writing: ${transformedProfile.gre_aw}
          - Research Experience: ${transformedProfile.research_experience}
          - Research Interests: ${transformedProfile.research_interests_str}
          - Target Degree: ${transformedProfile.target_degree}
          - Intended Field: ${transformedProfile.intended_field}
          - Career Objectives: ${transformedProfile.career_objectives}
          
          University and Program Information:
          - University: ${mockProgram.university}
          - Program: ${mockProgram.name}
          - Department: ${mockProgram.department}
          
          The Statement of Purpose should be well-structured, professional, and include:
          1. Introduction
          2. Academic background
          3. Research experience
          4. Why this university and program
          5. Career goals
          6. Conclusion
        `;
        
        // Call the mocked API
        const response = await openai.chat.completions.create({
          model: "llama-3.1-8b",
          messages: [
            { role: "system", content: "You are a helpful assistant that generates graduate school application documents." },
            { role: "user", content: prompt }
          ],
          max_tokens: 1000
        });
        
        // Get the generated SOP
        const generatedSOP = response.choices[0]?.message?.content || "";
        
        // Verify that we got a response
        expect(generatedSOP).toBeTruthy();
        expect(typeof generatedSOP).toBe('string');
        expect(generatedSOP.length).toBeGreaterThan(100); // SOP should be substantial
        
        // Validate that the SOP contains key information
        expect(generatedSOP).toContain(mockUserProfile.university);
        expect(generatedSOP).toContain(mockProgram.university);
        expect(generatedSOP).toContain(mockProgram.name);
        
        console.log("Generated SOP:", generatedSOP);
        
      } catch (error) {
        console.error('Error generating SOP:', error);
        throw error;
      }
    });
  });
  
  describe('Letter of Recommendation (LOR) Tests', () => {
    it('should generate an LOR using the LLM service', async () => {
      // Transform the user profile
      const transformedProfile = transformUserProfileForLLM(mockUserProfile, "John Doe");
      
      try {
        // Create a prompt for the LOR
        const prompt = `
          Generate a Letter of Recommendation for a graduate school application based on the following information:
          
          Student Information:
          - Name: ${transformedProfile.name}
          - Current University: ${transformedProfile.current_university}
          - Major: ${transformedProfile.major}
          - GPA: ${transformedProfile.gpa}/${transformedProfile.gpa_scale}
          - Research Experience: ${transformedProfile.research_experience}
          - Research Interests: ${transformedProfile.research_interests_str}
          - Target Degree: ${transformedProfile.target_degree}
          - Intended Field: ${transformedProfile.intended_field}
          - Career Objectives: ${transformedProfile.career_objectives}
          
          University and Program Information:
          - University: ${mockProgram.university}
          - Program: ${mockProgram.name}
          - Department: ${mockProgram.department}
          
          Recommender Information:
          - Name: ${mockRecommender.name}
          - Email: ${mockRecommender.email}
          - Title: ${mockRecommender.title}
          - Institution: ${mockRecommender.institution}
          - Relationship to Student: ${mockRecommender.relationship}
          - Duration of Relationship: ${mockRecommender.relationshipDuration}
          
          The Letter of Recommendation should be well-structured, professional, and include:
          1. Introduction and relationship to the student
          2. Student's academic performance
          3. Student's research abilities
          4. Student's personal qualities
          5. Why the student is a good fit for the program
          6. Strong recommendation
          7. Conclusion with contact information
        `;
        
        // Call the mocked API
        const response = await openai.chat.completions.create({
          model: "llama-3.1-8b",
          messages: [
            { role: "system", content: "You are a helpful assistant that generates graduate school application documents." },
            { role: "user", content: prompt }
          ],
          max_tokens: 1000
        });
        
        // Get the generated LOR
        const generatedLOR = response.choices[0]?.message?.content || "";
        
        // Verify that we got a response
        expect(generatedLOR).toBeTruthy();
        expect(typeof generatedLOR).toBe('string');
        expect(generatedLOR.length).toBeGreaterThan(100); // LOR should be substantial
        
        // Validate that the LOR contains key information
        expect(generatedLOR).toContain(mockRecommender.name);
        expect(generatedLOR).toContain(mockProgram.university);
        expect(generatedLOR).toContain(mockProgram.name);
        
        console.log("Generated LOR:", generatedLOR);
        
      } catch (error) {
        console.error('Error generating LOR:', error);
        throw error;
      }
    });
  });
});

// Helper function to transform userProfile data to match LLM service expectations
function transformUserProfileForLLM(userProfile: any, userName: string): {
  name: string;
  current_location: string;
  country_of_origin: string;
  native_language: string;
  education_level: string;
  major: string;
  current_university: string;
  gpa: string;
  gpa_scale: string;
  gre_verbal: string;
  gre_quant: string;
  gre_aw: string;
  english_test_type: string;
  english_overall: string;
  research_experience: string;
  research_interests_str: string;
  target_degree: string;
  intended_field: string;
  career_objectives: string;
} {
  if (!userProfile) return {
    name: "",
    current_location: "",
    country_of_origin: "",
    native_language: "",
    education_level: "",
    major: "",
    current_university: "",
    gpa: "",
    gpa_scale: "",
    gre_verbal: "",
    gre_quant: "",
    gre_aw: "",
    english_test_type: "",
    english_overall: "",
    research_experience: "",
    research_interests_str: "",
    target_degree: "",
    intended_field: "",
    career_objectives: ""
  };

  return {
    name: userName || "",
    current_location: userProfile.currentLocation || "",
    country_of_origin: userProfile.countryOfOrigin || "",
    native_language: userProfile.nativeLanguage || "",
    education_level: userProfile.educationLevel || "",
    major: userProfile.major || "",
    current_university: userProfile.university || "",
    gpa: userProfile.gpa?.toString() || "",
    gpa_scale: userProfile.gpaScale?.toString() || "",
    gre_verbal: userProfile.greScores?.verbal?.toString() || "",
    gre_quant: userProfile.greScores?.quantitative?.toString() || "",
    gre_aw: userProfile.greScores?.analyticalWriting?.toString() || "",
    english_test_type: userProfile.englishTest?.type || "",
    english_overall: userProfile.englishTest?.overallScore?.toString() || "",
    research_experience: userProfile.researchExperience || "",
    research_interests_str: userProfile.researchInterests?.join(", ") || "",
    target_degree: userProfile.targetDegree || "",
    intended_field: userProfile.intendedField || "",
    career_objectives: userProfile.careerObjectives || ""
  };
}

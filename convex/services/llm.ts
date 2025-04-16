import { v } from "convex/values";
import { action } from "../_generated/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // This will be set in Convex environment
});

export const generateSOP = action({
  args: {
    profile: v.any(),
    program: v.object({
      university: v.string(),
      name: v.string(),
      degree: v.string(),
      department: v.string()
    })
  },
  handler: async (ctx, args) => {
    try {
      const { profile, program } = args;
      // Destructure profile fields with fallbacks for missing data
      const {
        current_location = "",
        country_of_origin = "",
        native_language = "",
        education_level = "",
        major = "",
        current_university = "",
        gpa = "",
        gpa_scale = "",
        gre_verbal = "",
        gre_quant = "",
        gre_aw = "",
        english_test_type = "",
        english_overall = "",
        research_experience = "",
        research_interests_str = "",
        target_degree = "",
        intended_field = "",
        career_objectives = ""
      } = profile || {};
      const university_name = program?.university || "";
      const program_name = program?.name || "";
      const program_degree = program?.degree || "";
      const program_department = program?.department || "";

      const prompt = `Create a compelling Statement of Purpose (SOP) between 1000-1500 words for a graduate school application using the following information. The SOP should tell a coherent and engaging story that highlights the applicant's academic achievements, research experience, and career objectives, tailored specifically to the target program.

APPLICANT INFORMATION:
- Current Location: ${current_location}
- Country of Origin: ${country_of_origin}
- Native Language: ${native_language}

EDUCATION:
- Education Level: ${education_level}
- Major/Field of Study: ${major}
- Current University: ${current_university}
- GPA: ${gpa} out of ${gpa_scale}

TEST SCORES:
- GRE Scores: Verbal: ${gre_verbal}, Quantitative: ${gre_quant}, Analytical Writing: ${gre_aw}
- English Proficiency Test: ${english_test_type} Score: ${english_overall}

RESEARCH AND CAREER:
- Research Experience: ${research_experience}
- Research Interests: ${research_interests_str}
- Target Degree: ${target_degree}
- Intended Field of Study: ${intended_field}
- Career Objectives: ${career_objectives}

TARGET PROGRAM:
- University Name: ${university_name}
- Program Name: ${program_name}
- Degree Type: ${program_degree}
- Department: ${program_department}

GUIDELINES FOR SOP STRUCTURE:

1. Introduction (1-2 paragraphs):
   - Begin with a compelling hook related to your academic or research journey
   - Clearly state your purpose for applying to this specific program
   - Briefly mention your background and how it has prepared you for graduate studies

2. Academic Background (2-3 paragraphs):
   - Describe your educational journey, highlighting relevant coursework and achievements
   - Explain how your academic background has prepared you for graduate studies
   - Connect your academic experiences to your research interests

3. Research Experience (2-3 paragraphs):
   - Detail significant research projects, methodologies used, and outcomes
   - Highlight specific skills developed through research
   - Explain how your research experience aligns with the target program

4. Career Goals (1-2 paragraphs):
   - Articulate short-term and long-term career objectives
   - Explain how the target degree and program are essential steps toward these goals
   - Demonstrate a clear understanding of the field and your place within it

5. Program Fit (2-3 paragraphs):
   - Explain why you've chosen this specific university and program
   - Mention specific faculty members, research groups, or resources that attract you
   - Demonstrate how your background and goals align with the program's strengths

6. Conclusion (1 paragraph):
   - Summarize your key qualifications and fit for the program
   - Express enthusiasm for contributing to the program and field
   - End with a confident statement about your readiness for graduate studies

The SOP should be written in the first person, maintain a professional tone while showing personality, and be free of grammatical errors. Focus on creating a narrative that shows intellectual growth, research potential, and a clear vision for your academic and professional future.`;

      console.log("[generateSOP] Prompt:", prompt);

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert academic writing assistant specializing in graduate school applications."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      return response.choices[0]?.message?.content || null;
    } catch (error) {
      console.error("Error generating SOP:", error);
      throw new Error("Failed to generate Statement of Purpose");
    }
  }
});

export const generateLOR = action({
  args: {
    profile: v.any(),
    university: v.object({
      name: v.string(),
      department: v.string()
    }),
    program: v.object({
      name: v.string(),
      degree: v.string(),
      department: v.string()
    }),
    recommender: v.object({
      name: v.string(),
      email: v.string()
    })
  },
  handler: async (ctx, args) => {
    try {
      const { profile, university, program, recommender } = args;
      // Destructure profile fields with fallbacks for missing data
      const {
        current_location = "",
        country_of_origin = "",
        native_language = "",
        major = "",
        current_university = "",
        gpa = "",
        gpa_scale = "",
        research_experience = "",
        research_interests_str = "",
        target_degree = "",
        intended_field = "",
        career_objectives = ""
      } = profile || {};
      const university_name = university?.name || "";
      const program_name = program?.name || "";
      const program_degree = program?.degree || "";
      const program_department = program?.department || "";
      const recommender_name = recommender?.name || "";
      const recommender_email = recommender?.email || "";

      const prompt = `Create a compelling Letter of Recommendation (LOR) between 500-550 words for a graduate school application. The letter should be written from the perspective of ${recommender_name} (${recommender_email}) recommending a student for admission to a graduate program.

RECOMMENDER INFORMATION:
- Name: ${recommender_name}
- Email: ${recommender_email}

STUDENT INFORMATION:
- Current Location: ${current_location}
- Country of Origin: ${country_of_origin}
- Native Language: ${native_language}
- Major/Field of Study: ${major}
- Current University: ${current_university}
- GPA: ${gpa} out of ${gpa_scale}
- Research Experience: ${research_experience}
- Research Interests: ${research_interests_str}

TARGET PROGRAM:
- University Name: ${university_name}
- Program Name: ${program_name}
- Degree Type: ${program_degree} (${target_degree})
- Department: ${program_department}
- Intended Field of Study: ${intended_field}
- Career Objectives: ${career_objectives}

GUIDELINES FOR LOR STRUCTURE:
1. Introduction (1 paragraph):
   - Establish your relationship with the student
   - State how long you've known them and in what capacity
   - Provide a strong statement of recommendation
   - Mention the specific program and university they're applying to

2. Academic Abilities (1-2 paragraphs):
   - Discuss the student's academic performance in relevant courses
   - Highlight their intellectual capabilities, critical thinking, and problem-solving skills
   - Compare them to other students you've taught (e.g., "top 5% of students")
   - Mention specific examples of exceptional academic work

3. Research Experience and Skills (1-2 paragraphs):
   - Describe research projects the student has worked on, especially under your supervision
   - Highlight specific technical skills, methodologies, and tools they've mastered
   - Discuss their ability to work independently and as part of a team
   - Mention any publications, presentations, or significant contributions

4. Personal Qualities (1 paragraph):
   - Discuss character traits relevant to graduate study (e.g., perseverance, curiosity, integrity)
   - Provide specific examples that demonstrate these qualities
   - Mention how they interact with peers, faculty, and in collaborative environments
   - Address their communication skills and professionalism

5. Suitability for Program (1 paragraph):
   - Explain why the student is an excellent fit for this specific program
   - Connect their research interests and career goals to the program's strengths
   - Discuss how their background prepares them for success in this program
   - Mention their potential contributions to the department and field

6. Conclusion (1 paragraph):
   - Provide a strong, unequivocal endorsement of the student
   - Summarize key strengths and potential for success in graduate studies
   - Offer to provide additional information if needed (include your contact information)

The LOR should be written in a professional tone that conveys genuine enthusiasm for the student's abilities and potential. Use specific examples rather than general praise, and avoid exaggeration while still being strongly positive. The letter should sound authentic and personal, as if written by someone who knows the student well.`;

      console.log("[generateLOR] Prompt:", prompt);

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an experienced professor writing letters of recommendation for graduate school applications."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      return response.choices[0]?.message?.content || null;
    } catch (error) {
      console.error("Error generating LOR:", error);
      throw new Error("Failed to generate Letter of Recommendation");
    }
  }
});

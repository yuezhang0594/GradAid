import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import OpenAI from "openai";
import { AI_CREDITS_FOR_LOR, AI_CREDITS_FOR_SOP } from "../validators";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
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
        name = "",
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

      const prompt = `You are tasked with generating a compelling, polished Statement of Purpose (SOP) for a graduate school application, tailored specifically to the applicant’s background and target program. The SOP should be between **1000–1500 words** and written in the **first person**, maintaining a **professional yet engaging tone**. It should tell a **cohesive and insightful story** that showcases the applicant’s intellectual development, academic accomplishments, research experience, and career aspirations.

Please use the following APPLICANT PROFILE to inform the SOP:

APPLICANT INFORMATION
- Name: ${name}
- Current Location: ${current_location}
- Country of Origin: ${country_of_origin}
- Native Language: ${native_language}

EDUCATION
- Education Level: ${education_level}
- Major/Field of Study: ${major}
- Current University: ${current_university}
- GPA: ${gpa} / ${gpa_scale}

STANDARDIZED TESTS
- GRE: Verbal ${gre_verbal}, Quantitative ${gre_quant}, Analytical Writing ${gre_aw}
- English Proficiency: ${english_test_type}, Score: ${english_overall}

RESEARCH AND CAREER
- Research Experience: ${research_experience}
- Research Interests: ${research_interests_str}
- Target Degree: ${target_degree}
- Intended Field of Study: ${intended_field}
- Career Objectives: ${career_objectives}

TARGET PROGRAM
- University: ${university_name}
- Program: ${program_name}
- Degree Type: ${program_degree}
- Department: ${program_department}

---

Follow this STRUCTURE and emphasize **coherence, insight, and relevance** throughout:

1. Introduction (1–2 paragraphs)  
- Begin with an engaging anecdote, observation, or realization that sparked your interest in the field  
- Clearly state your purpose for applying to this particular program  
- Briefly introduce your academic background and motivations for graduate study  

2. Academic Background (2–3 paragraphs)  
- Describe your academic journey and key achievements  
- Highlight relevant coursework, independent projects, or academic awards  
- Explain how your studies have shaped your research interests and prepared you for graduate-level work  

3. Research Experience (2–3 paragraphs)  
- Detail research projects you’ve participated in: your role, methods used, challenges faced, and outcomes  
- Emphasize skills gained: experimental design, data analysis, technical tools, etc.  
- Show how these experiences shaped your research identity and relate to your intended field of study  

4. Career Objectives (1–2 paragraphs)  
- Articulate your short- and long-term career goals  
- Connect these goals to your academic background and research interests  
- Demonstrate how this program will be a critical step in achieving those goals  

5. Program Fit (2–3 paragraphs)  
- Discuss why this university and program are ideal for your goals  
- Mention specific faculty, labs, research initiatives, or institutional values that attract you  
- Highlight how your background and aspirations align with the program’s strengths and mission  

6. Conclusion (1 paragraph)  
- Reinforce your qualifications and commitment to the field  
- Express your enthusiasm for contributing to the academic community  
- Conclude with a confident statement of your readiness for graduate-level work  

---

Tone & Style Guidance:  
- Write in the first person  
- Be confident but not arrogant  
- Avoid clichés—focus on authenticity and depth  
- Use clear, grammatically correct, and well-organized language  
- Showcase personal growth, intellectual curiosity, and readiness for research-intensive graduate training
`;

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
      await ctx.runMutation(api.aiCredits.mutations.useCredits, {
        type: "sop_request",
        credits: AI_CREDITS_FOR_SOP,
        description: `Generated SOP applying to ${program_name} at ${university_name}`
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
      name: v.string()
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
        name = "",
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

      const prompt = `Generate a **Letter of Recommendation (LOR)** for a graduate school application, written from the perspective of **${recommender_name} (${recommender_email})** recommending a student for admission to a graduate program. The letter should be **between 500–550 words**, professional in tone, and rich with specific examples and authentic insights.

---  
**RECOMMENDER INFORMATION**  
- Name: ${recommender_name}  
- Email: ${recommender_email}  

**STUDENT INFORMATION**  
- Name: ${name}  
- Current Location: ${current_location}  
- Country of Origin: ${country_of_origin}  
- Native Language: ${native_language}  
- Major/Field of Study: ${major}  
- Current University: ${current_university}  
- GPA: ${gpa} / ${gpa_scale}  
- Research Experience: ${research_experience}  
- Research Interests: ${research_interests_str}  

**TARGET PROGRAM**  
- University: ${university_name}  
- Program: ${program_name}  
- Degree Type: ${program_degree} (${target_degree})  
- Department: ${program_department}  
- Intended Field of Study: ${intended_field}  
- Career Objectives: ${career_objectives}  

---  
**LOR STRUCTURE & CONTENT GUIDELINES**  

1. **Introduction (1 paragraph)**  
   - Introduce yourself and your professional relationship with the student  
   - State how long you’ve known the student and in what capacity (e.g., instructor, PI, advisor)  
   - Include a strong, clear statement of recommendation  
   - Mention the specific program and university the student is applying to  

2. **Academic Abilities (1–2 paragraphs)**  
   - Highlight the student’s academic strengths and intellectual curiosity  
   - Mention standout coursework, class participation, or project work  
   - If possible, compare them with peers (e.g., “among the top 5% of students I’ve taught”)  
   - Provide concrete examples of problem-solving, critical thinking, or creativity  

3. **Research Experience and Skills (1–2 paragraphs)**  
   - Describe any research work the student has done, especially under your supervision  
   - Emphasize techniques, tools, or methodologies they've learned and applied  
   - Comment on their independence, initiative, and teamwork in research contexts  
   - Mention tangible outputs if applicable (e.g., poster, publication, conference talk)  

4. **Personal Qualities (1 paragraph)**  
   - Discuss traits such as perseverance, integrity, curiosity, leadership, or collaboration  
   - Provide anecdotes that reflect the student’s character in action  
   - Highlight their interpersonal and communication skills, especially in academic/professional settings  

5. **Fit for the Program (1 paragraph)**  
   - Articulate why this student is an ideal candidate for the specific program  
   - Connect their academic preparation and research goals to what the program offers  
   - Comment on their readiness for graduate-level rigor and their potential contributions  

6. **Conclusion (1 paragraph)**  
   - Offer a strong and unequivocal final endorsement  
   - Summarize the student’s major strengths and promise for graduate study  
   - Invite the admissions committee to reach out for more details, and include your contact  

---  
**STYLE & TONE GUIDANCE**  
- Write in a **natural, confident, and professional** voice  
- Prioritize **specific observations** and **genuine praise**, rather than generic statements  
- Avoid exaggeration, but express **enthusiasm and conviction** in your recommendation  
- The letter should read as though it comes from someone who truly knows the student  

`;

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
      await ctx.runMutation(api.aiCredits.mutations.useCredits, {
        type: "lor_request",
        credits: AI_CREDITS_FOR_LOR,
        description: `Generated LOR for ${recommender_name} applying to ${program_name} at ${university_name}`
      });
      return response.choices[0]?.message?.content || null;
    } catch (error) {
      console.error("Error generating LOR:", error);
      throw new Error("Failed to generate Letter of Recommendation");
    }
  }
});

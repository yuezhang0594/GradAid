import { v } from "convex/values";
import { action } from "../_generated/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // This will be set in Convex environment
});

export const generateSOP = action({
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
    })
  },
  handler: async (ctx, args) => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert academic writing assistant specializing in graduate school applications."
          },
          {
            role: "user",
            content: `Generate a Statement of Purpose for a graduate school application with the following details:

University: ${args.university.name}
Department: ${args.university.department}
Program: ${args.program.name} (${args.program.degree})

Student Profile:
${JSON.stringify(args.profile, null, 2)}

Please write a compelling Statement of Purpose that:
1. Demonstrates strong motivation for pursuing graduate studies
2. Highlights relevant academic and research experience
3. Shows alignment with the program's focus areas
4. Explains career goals and how this program will help achieve them
5. Uses a professional yet engaging tone
6. Is well-structured with clear paragraphs
7. Is approximately 1000 words`
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
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an experienced professor writing letters of recommendation for graduate school applications."
          },
          {
            role: "user",
            content: `Generate a Letter of Recommendation for a graduate school application with the following details:

University: ${args.university.name}
Department: ${args.university.department}
Program: ${args.program.name} (${args.program.degree})

Recommender Information:
Name: ${args.recommender.name}
Email: ${args.recommender.email}

Student Profile:
${JSON.stringify(args.profile, null, 2)}

Please write a strong Letter of Recommendation that:
1. Establishes the recommender's credibility and relationship with the student
2. Provides specific examples of the student's achievements and capabilities
3. Evaluates the student's potential for graduate studies
4. Compares the student to their peers
5. Uses a professional and authoritative tone
6. Is well-structured with clear paragraphs
7. Is approximately 750 words`
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

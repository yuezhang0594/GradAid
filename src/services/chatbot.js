export const INTERVIEW_QUESTIONS = [
  "Let’s begin! To start, we'd love to know—what first sparked your interest in your chosen field, and how has that interest evolved over time?",
  "Can you share details about any key academic projects, research, or coursework that you believe highlight your strengths?",
  "What significant challenges or obstacles have you encountered in your academic or personal life, and how did you overcome them?",
  "Could you describe any internships, part-time roles, or volunteer experiences that have contributed to your professional development?",
  "What extracurricular activities or leadership roles have you undertaken, and what skills or lessons have you learned from them?",
  "What are your short-term and long-term academic and career goals, and how does studying abroad fit into these plans?",
  "How do you plan to contribute to the academic and cultural community at the institution you're applying to?",
  "Have you had any cross-cultural experiences or international exposures that have prepared you for studying abroad?",
  "What personal qualities or unique perspectives do you believe set you apart from other candidates?",
  "Who have been your most influential mentors or role models, and in what ways have they shaped your academic and personal journey?",
];

class ChatbotService {
  validateResponse(response) {
    // Simple validation - just check if response is not empty and has some minimum length
    return {
      isValid: response.length >= 20,
      feedback: response.length >= 20 ? "Thank you for your detailed response!" : "Please provide a more detailed response.",
      suggestions: response.length >= 20 ? "" : "Try to explain your answer with specific examples or experiences."
    };
  }
}

export const chatbotService = new ChatbotService();

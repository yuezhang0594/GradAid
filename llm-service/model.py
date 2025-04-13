import os
import json
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class LlamaModel:
    """
    A class to interact with the Llama model via API
    """
    
    def __init__(self):
        """Initialize the LlamaModel with API configuration"""
        # Load API key from environment
        self.api_key = os.getenv("TOGETHER_API_KEY")
        if not self.api_key:
            raise ValueError("TOGETHER_API_KEY environment variable is not set")
            
        # Initialize OpenAI client with Together.ai base URL
        self.client = OpenAI(
            api_key=self.api_key,
            base_url=os.getenv("OPENAI_BASE_URL", "https://api.llmapi.com/")
        )
        
        # Model configuration
        self.model_name = "llama3-8b"
        
    def generate_sop(self, user_data):
        """
        Generate a Statement of Purpose based on user data
        
        Args:
            user_data (dict): User profile and application data
            
        Returns:
            str: Generated Statement of Purpose
        """
        # Extract user data for prompt
        profile = user_data.get("profile", {})
        university = user_data.get("university", {})
        program = user_data.get("program", {})
        
        # Build prompt from template
        prompt = self._build_sop_prompt(profile, university, program)
        
        # Generate the SOP using the LLM
        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": "You are an expert academic advisor specializing in graduate school applications. Your task is to write a compelling Statement of Purpose for a student applying to graduate school."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            # Extract the generated SOP from the response
            sop_content = response.choices[0].message.content
            return sop_content
            
        except Exception as e:
            print(f"Error generating SOP: {str(e)}")
            return None
    
    def generate_lor(self, user_data, recommender_info):
        """
        Generate a Letter of Recommendation based on user data and recommender info
        
        Args:
            user_data (dict): User profile and application data
            recommender_info (dict): Information about the recommender
            
        Returns:
            str: Generated Letter of Recommendation
        """
        # Extract user data for prompt
        profile = user_data.get("profile", {})
        university = user_data.get("university", {})
        program = user_data.get("program", {})
        
        # Build prompt from template
        prompt = self._build_lor_prompt(profile, university, program, recommender_info)
        
        # Generate the LOR using the LLM
        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": "You are an experienced professor writing a detailed and personalized letter of recommendation for a student applying to graduate school."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1500
            )
            
            # Extract the generated LOR from the response
            lor_content = response.choices[0].message.content
            return lor_content
            
        except Exception as e:
            print(f"Error generating LOR: {str(e)}")
            return None
    
    def _build_sop_prompt(self, profile, university, program):
        """
        Build a detailed prompt for SOP generation using data from user profile, university, and program
        """
        # Extract profile information (excluding specified fields)
        name = profile.get("name", "")
        current_location = profile.get("currentLocation", "")
        country_of_origin = profile.get("countryOfOrigin", "")
        native_language = profile.get("nativeLanguage", "")
        
        # Education details
        education_level = profile.get("educationLevel", "")
        major = profile.get("major", "")
        current_university = profile.get("university", "")
        gpa = profile.get("gpa", "")
        gpa_scale = profile.get("gpaScale", "4.0")
        
        # Test scores
        gre_scores = profile.get("greScores", {})
        gre_verbal = gre_scores.get("verbal", "") if gre_scores else ""
        gre_quant = gre_scores.get("quantitative", "") if gre_scores else ""
        gre_aw = gre_scores.get("analyticalWriting", "") if gre_scores else ""
        gre_date = gre_scores.get("testDate", "") if gre_scores else ""
        
        english_test = profile.get("englishTest", {})
        english_test_type = english_test.get("type", "") if english_test else ""
        english_overall = english_test.get("overallScore", "") if english_test else ""
        
        # Research and career information
        research_experience = profile.get("researchExperience", "")
        research_interests = profile.get("researchInterests", [])
        if isinstance(research_interests, list):
            research_interests_str = ', '.join(research_interests) if research_interests else ""
        else:
            research_interests_str = str(research_interests)
            
        target_degree = profile.get("targetDegree", "")
        intended_field = profile.get("intendedField", "")
        career_objectives = profile.get("careerObjectives", "")
        
        # University and program information
        university_name = university.get("name", "")
        program_name = program.get("name", "")
        program_degree = program.get("degree", "")
        program_department = program.get("department", "")
        
        # Build the comprehensive prompt
        prompt = f"""
Create a compelling Statement of Purpose (SOP) between 1000-1500 words for a graduate school application using the following information. The SOP should tell a coherent and engaging story that highlights the applicant's academic achievements, research experience, and career objectives, tailored specifically to the target program.

APPLICANT INFORMATION:
- Current Location: {current_location}
- Country of Origin: {country_of_origin}
- Native Language: {native_language}

EDUCATION:
- Education Level: {education_level}
- Major/Field of Study: {major}
- Current University: {current_university}
- GPA: {gpa} out of {gpa_scale}

TEST SCORES:
- GRE Scores: Verbal: {gre_verbal}, Quantitative: {gre_quant}, Analytical Writing: {gre_aw}
- English Proficiency Test: {english_test_type} Score: {english_overall}

RESEARCH AND CAREER:
- Research Experience: {research_experience}
- Research Interests: {research_interests_str}
- Target Degree: {target_degree}
- Intended Field of Study: {intended_field}
- Career Objectives: {career_objectives}

TARGET PROGRAM:
- University Name: {university_name}
- Program Name: {program_name}
- Degree Type: {program_degree}
- Department: {program_department}

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

The SOP should be written in the first person, maintain a professional tone while showing personality, and be free of grammatical errors. Focus on creating a narrative that shows intellectual growth, research potential, and a clear vision for your academic and professional future.
"""
        
        return prompt
    
    def _build_lor_prompt(self, profile, university, program, recommender_info):
        """
        Build a detailed prompt for LOR generation using recommender information and user profile data
        """
        # Extract recommender information
        recommender_name = recommender_info.get("name", "")
        recommender_email = recommender_info.get("email", "")
        
        # Extract profile information (excluding specified fields)
        student_name = profile.get("name", "")
        current_location = profile.get("currentLocation", "")
        country_of_origin = profile.get("countryOfOrigin", "")
        native_language = profile.get("nativeLanguage", "")
        
        # Education details
        education_level = profile.get("educationLevel", "")
        major = profile.get("major", "")
        current_university = profile.get("university", "")
        gpa = profile.get("gpa", "")
        gpa_scale = profile.get("gpaScale", "4.0")
        
        # Research and career information
        research_experience = profile.get("researchExperience", "")
        research_interests = profile.get("researchInterests", [])
        if isinstance(research_interests, list):
            research_interests_str = ', '.join(research_interests) if research_interests else ""
        else:
            research_interests_str = str(research_interests)
            
        target_degree = profile.get("targetDegree", "")
        intended_field = profile.get("intendedField", "")
        career_objectives = profile.get("careerObjectives", "")
        
        # University and program information
        university_name = university.get("name", "")
        program_name = program.get("name", "")
        program_degree = program.get("degree", "")
        program_department = program.get("department", "")
        
        # Build the comprehensive prompt
        prompt = f"""
Create a compelling Letter of Recommendation (LOR) between 500-550 words for a graduate school application. The letter should be written from the perspective of {recommender_name} ({recommender_email}) recommending a student for admission to a graduate program.

RECOMMENDER INFORMATION:
- Name: {recommender_name}
- Email: {recommender_email}

STUDENT INFORMATION:
- Current Location: {current_location}
- Country of Origin: {country_of_origin}
- Native Language: {native_language}
- Major/Field of Study: {major}
- Current University: {current_university}
- GPA: {gpa} out of {gpa_scale}
- Research Experience: {research_experience}
- Research Interests: {research_interests_str}

TARGET PROGRAM:
- University Name: {university_name}
- Program Name: {program_name}
- Degree Type: {program_degree} ({target_degree})
- Department: {program_department}
- Intended Field of Study: {intended_field}
- Career Objectives: {career_objectives}

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

The LOR should be written in a professional tone that conveys genuine enthusiasm for the student's abilities and potential. Use specific examples rather than general praise, and avoid exaggeration while still being strongly positive. The letter should sound authentic and personal, as if written by someone who knows the student well.
"""
        
        return prompt

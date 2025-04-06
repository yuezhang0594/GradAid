import os
import json
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class LlamaModel:
    """
    A class to interact with the Llama 3.3 model via Together.ai API
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
        
        # Build a detailed prompt
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
        
        # Build a detailed prompt
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
    
    def review_document(self, document_type, content):
        """
        Review an SOP or LOR and provide feedback
        
        Args:
            document_type (str): Type of document ('sop' or 'lor')
            content (str): The document content to review
            
        Returns:
            dict: Feedback and suggestions
        """
        doc_type_name = "Statement of Purpose" if document_type == "sop" else "Letter of Recommendation"
        
        prompt = f"""
        Please review this {doc_type_name} and provide detailed feedback:
        
        {content}
        
        Provide feedback on:
        1. Structure and organization
        2. Content relevance
        3. Clarity and writing style
        4. Areas for improvement
        5. Overall assessment (on a scale of 1-10)
        
        Format your response as a structured assessment with specific suggestions for improvement.
        """
        
        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": f"You are an expert academic advisor reviewing a {doc_type_name} for a graduate school application."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                max_tokens=1000
            )
            
            # Extract the review from the response
            review_content = response.choices[0].message.content
            
            # Parse the review to extract structured feedback
            # This is a simple implementation - could be enhanced with more sophisticated parsing
            feedback = {
                "review": review_content,
                "summary": self._extract_summary(review_content)
            }
            
            return feedback
            
        except Exception as e:
            print(f"Error reviewing document: {str(e)}")
            return None
    
    def _build_sop_prompt(self, profile, university, program):
        """Build a detailed prompt for SOP generation"""
        
        # Extract profile information
        name = profile.get("name", "")
        email = profile.get("email", "")
        country_of_origin = profile.get("countryOfOrigin", "")
        date_of_birth = profile.get("dateOfBirth", "")
        current_location = profile.get("currentLocation", "")
        native_language = profile.get("nativeLanguage", "")
        
        # Education details
        education_level = profile.get("educationLevel", "")
        major = profile.get("major", "")
        current_university = profile.get("university", "")
        gpa = profile.get("gpa", "")
        gpa_scale = profile.get("gpaScale", "4.0")
        graduation_date = profile.get("graduationDate", "")
        courses = profile.get("courses", [])
        degrees = profile.get("education", [])
        degrees_earned = ", ".join([f"{d.get('degree', '')} in {d.get('field', '')}" for d in degrees]) if degrees else ""
        
        # Research experience
        research_experience = profile.get("researchExperience", "")
        research_projects = []
        research_institutions = []
        research_supervisors = []
        research_durations = []
        publications = []
        
        # Extract detailed research experience if available
        research_exp_details = profile.get("researchExperience", [])
        if isinstance(research_exp_details, list):
            for exp in research_exp_details:
                research_projects.append(exp.get("title", ""))
                research_institutions.append(exp.get("institution", ""))
                research_supervisors.append(exp.get("supervisor", ""))
                start = exp.get("startDate", "")
                end = exp.get("endDate", "Present") if exp.get("current", False) else exp.get("endDate", "")
                research_durations.append(f"{start} to {end}")
                
                # Extract publications
                exp_publications = exp.get("publications", [])
                for pub in exp_publications:
                    pub_title = pub.get("title", "")
                    pub_authors = ", ".join(pub.get("authors", []))
                    pub_venue = pub.get("journal", "") or pub.get("conference", "")
                    pub_year = pub.get("year", "")
                    pub_doi = pub.get("doi", "")
                    pub_url = pub.get("url", "")
                    publications.append(f"{pub_title} by {pub_authors}, {pub_venue}, {pub_year}")
        
        # Work experience
        work_experience = profile.get("workExperience", [])
        job_titles = []
        companies = []
        work_locations = []
        work_periods = []
        job_descriptions = []
        work_achievements = []
        
        for work in work_experience:
            job_titles.append(work.get("title", ""))
            companies.append(work.get("company", ""))
            work_locations.append(work.get("location", ""))
            start = work.get("startDate", "")
            end = work.get("endDate", "Present") if work.get("current", False) else work.get("endDate", "")
            work_periods.append(f"{start} to {end}")
            job_descriptions.append(work.get("description", ""))
            achievements = work.get("achievements", [])
            if achievements:
                work_achievements.extend(achievements)
        
        # Test scores
        gre_scores = profile.get("greScores", {})
        gre_verbal = gre_scores.get("verbal", "") if gre_scores else ""
        gre_quant = gre_scores.get("quantitative", "") if gre_scores else ""
        gre_aw = gre_scores.get("analyticalWriting", "") if gre_scores else ""
        gre_date = gre_scores.get("testDate", "") if gre_scores else ""
        
        english_test = profile.get("englishTest", {})
        english_test_type = english_test.get("type", "") if english_test else ""
        english_overall = english_test.get("overallScore", "") if english_test else ""
        english_section_scores = english_test.get("sectionScores", {}) if english_test else {}
        english_test_date = english_test.get("testDate", "") if english_test else ""
        
        # Skills and achievements
        skills = profile.get("skills", [])
        achievements = profile.get("achievements", [])
        
        # Career goals
        career_objectives = profile.get("careerObjectives", "")
        short_term_goals = profile.get("shortTermGoals", "")
        long_term_goals = profile.get("longTermGoals", "")
        
        # Online presence
        website_url = profile.get("websiteUrl", "")
        github_url = profile.get("githubUrl", "")
        linkedin_url = profile.get("linkedInUrl", "")
        
        # Target university and program information
        university_name = university.get("name", "")
        university_location = university.get("location", "")
        
        # Handle university location which could be a string or a dictionary
        if isinstance(university_location, dict):
            university_location_str = f"{university_location.get('city', '')}, {university_location.get('state', '')}, {university_location.get('country', '')}"
        else:
            university_location_str = university_location
            
        university_ranking = university.get("ranking", "")
        university_website = university.get("website", "")
        
        program_name = program.get("name", "")
        program_degree = program.get("degree", "")
        program_department = program.get("department", "")
        program_requirements = program.get("requirements", "")
        program_deadlines = program.get("deadlines", {})
        program_website = program.get("website", "")
        
        # Handle program requirements which could be a string or a dictionary
        if isinstance(program_requirements, dict):
            min_gpa = program_requirements.get('minimumGPA', '')
            gre_required = "Required" if program_requirements.get('gre', False) else "Not Required"
            toefl_required = "Required" if program_requirements.get('toefl', False) else "Not Required"
            recommendation_letters = program_requirements.get('recommendationLetters', '')
        else:
            min_gpa = ""
            gre_required = "Not Specified"
            toefl_required = "Not Specified"
            recommendation_letters = ""
            
        # Handle program deadlines which could be a dictionary or not
        if isinstance(program_deadlines, dict):
            fall_deadline = program_deadlines.get('fall', '')
            spring_deadline = program_deadlines.get('spring', '')
        else:
            fall_deadline = ""
            spring_deadline = ""
        
        # Career and academic goals
        target_degree = profile.get("targetDegree", "")
        intended_field = profile.get("intendedField", "")
        research_interests = profile.get("researchInterests", [])
        career_objectives = profile.get("careerGoals", "")
        target_locations = profile.get("targetLocations", [])
        
        # Handle research interests which could be a list or something else
        if isinstance(research_interests, list):
            research_interests_str = ', '.join(research_interests) if research_interests else ""
        else:
            research_interests_str = str(research_interests)
            
        # Handle target locations which could be a list or something else
        if isinstance(target_locations, list):
            target_locations_str = ', '.join(target_locations) if target_locations else ""
        else:
            target_locations_str = str(target_locations)
        
        expected_start_date = profile.get("expectedStartDate", "")
        budget_range = profile.get("budgetRange", "")
        
        # Build the comprehensive prompt using the template
        prompt = f"""
Compose a personalized and compelling Statement of Purpose (SOP) for a graduate school application using the following information. Ensure the SOP tells a coherent and engaging story that highlights the applicant's academic achievements, research experience, work background, test scores, skills, and career objectives. The narrative should be tailored to the target program and showcase a clear motivation for graduate studies.

--------------------------
Personal Information:
- Name: {name}
- Email: {email}
- Country of Origin: {country_of_origin}
- Date of Birth: {date_of_birth}
- Current Location: {current_location}
- Native Language: {native_language}

Education Details:
- Education Level: {education_level}
- Major/Field of Study: {major}
- Current University/Institution: {current_university}
- GPA: {gpa} on a scale of {gpa_scale}
- Graduation Date: {graduation_date}
- Relevant Coursework: {', '.join(courses) if isinstance(courses, list) else courses}
- Degree(s) Earned: {degrees_earned}

Research Experience:
- Description: {research_experience}
- Projects: {', '.join(research_projects) if research_projects else ""}
- Research Institutions: {', '.join(research_institutions) if research_institutions else ""}
- Research Supervisors: {', '.join(research_supervisors) if research_supervisors else ""}
- Duration: {', '.join(research_durations) if research_durations else ""}
- Publications: {'; '.join(publications) if publications else ""}

Work Experience:
- Job Titles: {', '.join(job_titles) if job_titles else ""}
- Companies/Organizations: {', '.join(companies) if companies else ""}
- Locations: {', '.join(work_locations) if work_locations else ""}
- Employment Periods: {', '.join(work_periods) if work_periods else ""}
- Job Descriptions: {'; '.join(job_descriptions) if job_descriptions else ""}
- Achievements: {', '.join(work_achievements) if work_achievements else ""}

Test Scores:
- GRE Scores: Verbal: {gre_verbal}, Quantitative: {gre_quant}, Analytical Writing: {gre_aw} (Test Date: {gre_date})
- English Proficiency Test ({english_test_type}): Overall Score: {english_overall}
  - Section Scores: {json.dumps(english_section_scores) if english_section_scores else ""} (Test Date: {english_test_date})

Skills and Achievements:
- Technical Skills: {', '.join(skills) if skills else ""}
- Academic Achievements: {', '.join(achievements) if achievements else ""}
- Other Skills: {', '.join(skills) if skills else ""}

Career Goals Statement:
- Short-Term Goals: {short_term_goals}
- Long-Term Goals: {long_term_goals}

Online Presence:
- Website: {website_url}
- GitHub: {github_url}
- LinkedIn: {linkedin_url}

Target Program Information:
University Details:
- University Name: {university_name}
- University Location: {university_location_str}
- University Ranking: {university_ranking}
- University Website: {university_website}

Program Details:
- Program Name: {program_name}
- Degree Type: {program_degree}
- Department: {program_department}
- Requirements:
  - Minimum GPA: {min_gpa}
  - GRE Requirement: {gre_required}
  - TOEFL/IELTS Requirement: {toefl_required}
  - Number of Recommendation Letters: {recommendation_letters}
  - Application Deadlines: Fall: {fall_deadline}, Spring: {spring_deadline}
- Program Website: {program_website}

Career and Academic Goals:
- Target Degree: {target_degree}
- Intended Field of Study: {intended_field}
- Research Interests: {research_interests_str}
- Career Objectives: {career_objectives}
- Target Locations: {target_locations_str}
- Expected Start Date: {expected_start_date}
- Budget Range: {budget_range}
--------------------------

Using the above data, write an SOP that:
1. Opens with an engaging introduction that captures the applicant's passion and sets the stage.
2. Clearly details the academic and research background, emphasizing key achievements.
3. Integrates work experience and test scores to build credibility.
4. Explains the motivation for pursuing graduate studies, linking personal experiences and future career aspirations.
5. Highlights why the applicant is a strong fit for the target program and how it aligns with their academic and career goals.
6. Concludes with a summary that reinforces the applicant's readiness and enthusiasm for the program.

Keep the narrative professional, focused, and personalized, ensuring that each section transitions smoothly into the next while maintaining a clear, persuasive storyline.
        """
        
        return prompt
    
    def _build_lor_prompt(self, profile, university, program, recommender_info):
        """Build a detailed prompt for LOR generation"""
        
        # Extract profile information
        student_name = profile.get("name", "Applicant")
        current_university = profile.get("university", "")
        major = profile.get("major", "")
        research_experience = profile.get("researchExperience", "")
        
        # Extract recommender information
        recommender_name = recommender_info.get("name", "Professor")
        recommender_title = recommender_info.get("title", "Professor")
        recommender_institution = recommender_info.get("institution", current_university)
        relationship = recommender_info.get("relationship", "Professor")
        duration = recommender_info.get("duration", "two years")
        context = recommender_info.get("context", "academic courses and research")
        
        # Extract target information
        university_name = university.get("name", "")
        program_name = program.get("name", "")
        program_department = program.get("department", "")
        
        # Build a comprehensive prompt
        prompt = f"""
Write a detailed and compelling Letter of Recommendation for a graduate school application with the following details:

STUDENT INFORMATION:
- Student Name: {student_name}
- Current University: {current_university}
- Major: {major}
- Research Experience: {research_experience}
        
RECOMMENDER INFORMATION:
- Your Name: {recommender_name}
- Your Title: {recommender_title}
- Your Institution: {recommender_institution}
- Relationship to Student: {relationship}
- Duration of Relationship: {duration}
- Context of Relationship: {context}
        
TARGET PROGRAM:
- University: {university_name}
- Program: {program_name}
- Department: {program_department}
        
The letter should follow this structure:
1. Introduction: Your relationship with the student and a strong statement of recommendation
2. Academic Performance: The student's performance in your classes or research projects
3. Research Abilities: Specific research skills, methodologies, and achievements
4. Personal Qualities: Character traits, work ethic, teamwork, and other relevant qualities
5. Specific Examples: 2-3 concrete examples that demonstrate the student's abilities
6. Comparison: How the student ranks compared to others you've taught/supervised
7. Suitability for Program: Why the student is a good fit for this specific program
8. Conclusion: Reaffirmation of your recommendation and willingness to be contacted
        
Make the letter specific, detailed, and authentic. Include specific anecdotes and examples that highlight the student's strengths and potential for success in graduate school.
        """
        
        return prompt
    
    def _extract_summary(self, review_content):
        """Extract a brief summary from the review content"""
        # This is a simple implementation - could be enhanced with more sophisticated parsing
        lines = review_content.split('\n')
        summary_lines = []
        
        for line in lines:
            if "overall" in line.lower() or "assessment" in line.lower() or "summary" in line.lower():
                summary_lines.append(line)
                
        if not summary_lines and len(lines) > 5:
            # If no obvious summary found, take the last few lines
            summary_lines = lines[-3:]
            
        return "\n".join(summary_lines) if summary_lines else "Review completed. See full feedback for details."

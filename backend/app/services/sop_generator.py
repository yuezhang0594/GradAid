from openai import OpenAI
from ..models import Profile

class SOPGenerator:
    def __init__(self, api_key: str):
        self.client = OpenAI(api_key=api_key)

    def generate_sop(self, profile: Profile) -> str:
        prompt = self._create_prompt(profile)
        
        response = self.client.chat.completions.create(
            model="gpt-4",  # or your preferred model
            messages=[
                {"role": "system", "content": "You are an expert in writing Statement of Purpose for graduate school applications."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1500
        )
        
        return response.choices[0].message.content

    def _create_prompt(self, profile: Profile) -> str:
        return f"""
        Please write a compelling Statement of Purpose for a graduate school application based on the following profile:
        
        Education Level: {profile.education_level}
        Major: {profile.major}
        GPA: {profile.gpa}
        GRE Score: {profile.gre_score}
        TOEFL Score: {profile.toefl_score if profile.toefl_score else 'N/A'}
        IELTS Score: {profile.ielts_score if profile.ielts_score else 'N/A'}
        Country: {profile.country}
        
        Additional Information:
        {profile.profile_description}
        
        Please create a well-structured SOP that:
        1. Highlights academic achievements
        2. Explains motivation for graduate studies
        3. Connects past experiences with future goals
        4. Demonstrates research interests and potential
        5. Shows why the candidate would be a strong graduate student
        """ 
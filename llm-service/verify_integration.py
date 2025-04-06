"""
Verification script to test the integration between Convex and the LLM service.
This script simulates the data flow from Convex to the LLM service.
"""

import json
import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# LLM service URL
LLM_SERVICE_URL = os.getenv("LLM_SERVICE_URL", "http://localhost:8000")

def verify_integration():
    """Test the integration between Convex and the LLM service."""
    print("Verifying integration between Convex and the LLM service...")
    
    # Step 1: Check if the LLM service is running
    try:
        health_response = requests.get(f"{LLM_SERVICE_URL}/health")
        if health_response.status_code == 200:
            print(f"✅ LLM service is running: {health_response.json()}")
        else:
            print(f"❌ LLM service health check failed: {health_response.text}")
            return
    except Exception as e:
        print(f"❌ Could not connect to LLM service: {str(e)}")
        print("   Make sure the Flask server is running on the correct port.")
        return
    
    # Step 2: Create a realistic user profile based on the Convex schema
    print("\nCreating realistic user profile based on Convex schema...")
    
    # This data structure matches what would come from Convex
    user_data = {
        "profile": {
            "_id": "user123",
            "name": "John Smith",
            "email": "john.smith@example.com",
            "educationLevel": "Undergraduate",
            "major": "Computer Science",
            "university": "Boston University",
            "gpa": "3.8",
            "gpaScale": "4.0",
            "graduationDate": "May 2024",
            "courses": [
                "Data Structures and Algorithms",
                "Machine Learning",
                "Artificial Intelligence"
            ],
            "education": [
                {
                    "degree": "Bachelor of Science",
                    "field": "Computer Science",
                    "institution": "Boston University",
                    "startDate": "September 2020",
                    "endDate": "May 2024",
                    "gpa": "3.8"
                }
            ],
            "researchExperience": [
                {
                    "title": "Machine Learning Research",
                    "institution": "Boston University AI Lab",
                    "supervisor": "Dr. Jane Doe",
                    "startDate": "June 2022",
                    "endDate": "Present",
                    "current": True,
                    "description": "Researching natural language processing techniques"
                }
            ],
            "workExperience": [
                {
                    "title": "Software Engineering Intern",
                    "company": "Tech Innovations Inc.",
                    "startDate": "May 2023",
                    "endDate": "August 2023",
                    "description": "Developed web applications using React and Node.js"
                }
            ],
            "skills": [
                "Python", "JavaScript", "React", "Machine Learning"
            ],
            "testScores": {
                "gre": {
                    "verbal": 165,
                    "quantitative": 170,
                    "analytical": 4.5,
                    "date": "January 2023"
                }
            },
            "targetDegree": "Ph.D.",
            "intendedField": "Computer Science",
            "researchInterests": [
                "Machine Learning", "Natural Language Processing"
            ],
            "careerGoals": "Pursue a career in AI research and development",
            "targetLocations": [
                "United States", "Canada"
            ],
            "expectedStartDate": "Fall 2024"
        },
        "university": {
            "_id": "univ123",
            "name": "Stanford University",
            "type": "Private",
            "location": {
                "city": "Stanford",
                "state": "California",
                "country": "United States"
            },
            "ranking": 2,
            "website": "https://www.stanford.edu"
        },
        "program": {
            "_id": "prog123",
            "universityId": "univ123",
            "name": "Computer Science",
            "degree": "Ph.D.",
            "department": "School of Engineering",
            "requirements": {
                "minimumGPA": 3.5,
                "gre": True,
                "toefl": True,
                "recommendationLetters": 3
            },
            "deadlines": {
                "fall": "December 15, 2023",
                "spring": "September 15, 2023"
            },
            "website": "https://cs.stanford.edu/academics/phd"
        }
    }
    
    # Step 3: Test SOP generation
    print("\nTesting SOP generation with realistic Convex data...")
    try:
        sop_response = requests.post(
            f"{LLM_SERVICE_URL}/generate/sop",
            json=user_data
        )
        
        if sop_response.status_code == 200 and sop_response.json().get("success"):
            print("✅ SOP generated successfully!")
            
            # Save the generated SOP to a file
            with open("verification_sop.txt", "w") as f:
                f.write(sop_response.json()["sop"])
            print("   Saved SOP to verification_sop.txt")
            
            # Print a sample of the generated SOP
            print("\nSample of generated SOP (first 300 characters):")
            print(sop_response.json()["sop"][:300] + "...")
        else:
            print(f"❌ Failed to generate SOP: {sop_response.text}")
    except Exception as e:
        print(f"❌ Error generating SOP: {str(e)}")
    
    # Step 4: Test LOR generation
    print("\nTesting LOR generation with realistic Convex data...")
    try:
        # Add recommender info to the user data
        lor_data = {
            **user_data,
            "recommender": {
                "_id": "rec123",
                "name": "Dr. Jane Doe",
                "email": "jane.doe@bu.edu",
                "title": "Associate Professor",
                "institution": "Boston University",
                "department": "Computer Science",
                "relationship": "Research Advisor",
                "relationshipDuration": "2 years"
            }
        }
        
        lor_response = requests.post(
            f"{LLM_SERVICE_URL}/generate/lor",
            json=lor_data
        )
        
        if lor_response.status_code == 200 and lor_response.json().get("success"):
            print("✅ LOR generated successfully!")
            
            # Save the generated LOR to a file
            with open("verification_lor.txt", "w") as f:
                f.write(lor_response.json()["lor"])
            print("   Saved LOR to verification_lor.txt")
            
            # Print a sample of the generated LOR
            print("\nSample of generated LOR (first 300 characters):")
            print(lor_response.json()["lor"][:300] + "...")
        else:
            print(f"❌ Failed to generate LOR: {lor_response.text}")
    except Exception as e:
        print(f"❌ Error generating LOR: {str(e)}")
    
    # Step 5: Verification summary
    print("\n=== Verification Summary ===")
    print("1. LLM Service Health Check: ✅")
    
    if 'sop_response' in locals() and sop_response.status_code == 200:
        print("2. SOP Generation: ✅")
    else:
        print("2. SOP Generation: ❌")
    
    if 'lor_response' in locals() and lor_response.status_code == 200:
        print("3. LOR Generation: ✅")
    else:
        print("3. LOR Generation: ❌")
    
    print("\nIntegration verification completed!")

if __name__ == "__main__":
    verify_integration()

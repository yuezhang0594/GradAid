#!/usr/bin/env python3
"""
Test script for the LLM service.
This script simulates data coming from Convex and tests if the LLM can generate SOPs and LORs.
"""

import os
import json
from model import LlamaModel

def main():
    """Main function to test the LLM service"""
    print("Testing LLM service with simulated Convex data...")
    
    # Initialize the LLM model
    model = LlamaModel()
    print("LlamaModel initialized successfully")
    
    # Sample user data that would come from Convex
    user_data = {
        "profile": {
            "name": "John Smith",
            "email": "john.smith@example.com",
            "university": "Boston University",
            "major": "Computer Science",
            "gpa": 3.8,
            "graduationDate": "May 2024",
            "testScores": {
                "gre": {
                    "verbal": 165,
                    "quantitative": 168,
                    "writing": 5.0
                }
            },
            "researchExperience": [
                {
                    "title": "Machine Learning Research Assistant",
                    "institution": "Boston University AI Lab",
                    "duration": "2 years",
                    "description": "Worked on natural language processing and machine learning projects."
                }
            ],
            "workExperience": [
                {
                    "title": "Software Engineering Intern",
                    "company": "Tech Innovations Inc.",
                    "duration": "3 months",
                    "description": "Developed web applications using React and Node.js."
                }
            ],
            "skills": ["Python", "Machine Learning", "Natural Language Processing", "JavaScript", "React"],
            "careerGoals": "Pursue a career in AI research and development."
        },
        "university": {
            "name": "Stanford University",
            "location": "Stanford, CA",
            "ranking": 2,
            "researchStrengths": ["Artificial Intelligence", "Computer Science", "Engineering"]
        },
        "program": {
            "name": "Computer Science",
            "department": "School of Engineering",
            "degree": "Ph.D.",
            "researchAreas": ["Machine Learning", "Artificial Intelligence", "Natural Language Processing"],
            "requirements": "Strong background in mathematics and computer science."
        }
    }
    
    # Sample recommender data
    recommender_data = {
        "name": "Dr. Jane Doe",
        "title": "Associate Professor",
        "institution": "Boston University",
        "department": "Computer Science",
        "email": "jane.doe@bu.edu",
        "relationship": "Research Advisor",
        "duration": "2 years"
    }
    
    # Generate SOP
    print("\nGenerating SOP...")
    sop = model.generate_sop(user_data)
    
    if sop:
        print("\nSOP generated successfully!")
        print("\nSample of generated SOP (first 300 characters):")
        print(sop[:300] + "...")
        
        # Save the SOP to a file
        with open("sample_sop.txt", "w") as f:
            f.write(sop)
        print("\nSaved complete SOP to sample_sop.txt")
    else:
        print("Failed to generate SOP.")
    
    # Generate LOR
    print("\nGenerating LOR...")
    lor = model.generate_lor(user_data, recommender_data)
    
    if lor:
        print("\nLOR generated successfully!")
        print("\nSample of generated LOR (first 300 characters):")
        print(lor[:300] + "...")
        
        # Save the LOR to a file
        with open("sample_lor.txt", "w") as f:
            f.write(lor)
        print("\nSaved complete LOR to sample_lor.txt")
    else:
        print("Failed to generate LOR.")
    
    print("\nTest completed.")

if __name__ == "__main__":
    main()

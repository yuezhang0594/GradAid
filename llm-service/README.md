# GradAid LLM Microservice

This microservice provides AI-powered document generation for the GradAid application, specifically for creating Statements of Purpose (SOPs) and Letters of Recommendation (LORs) using the Llama 3.3 model.

## Features

- Generate personalized Statements of Purpose based on user profile and target program
- Generate Letters of Recommendation with recommender details
- Review and provide feedback on existing documents
- Simple REST API for integration with the main GradAid application

## Setup

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Set up environment variables:
   - Create a `.env` file with your Together.ai API key:
     ```
     TOGETHER_API_KEY=your_api_key_here
     OPENAI_BASE_URL=https://api.llmapi.com/
     ```

3. Run the service:
   ```
   python app.py
   ```

## API Endpoints

### Health Check
```
GET /health
```

### Generate Statement of Purpose
```
POST /generate/sop
```
Request body:
```json
{
  "profile": {
    "university": "Boston University",
    "major": "Computer Science",
    "gpa": 3.8,
    "graduationDate": "May 2024",
    "researchExperience": "2 years in ML and NLP",
    "greScores": {
      "verbal": 160,
      "quantitative": 168,
      "analyticalWriting": 5.0
    },
    "careerObjectives": "Pursue research in AI and machine learning",
    "researchInterests": ["Natural Language Processing", "Computer Vision"],
    "targetDegree": "PhD"
  },
  "university": {
    "name": "Stanford University",
    "location": {
      "city": "Stanford",
      "state": "CA",
      "country": "USA"
    },
    "ranking": 2
  },
  "program": {
    "name": "Computer Science PhD",
    "department": "School of Engineering",
    "requirements": {
      "minimumGPA": 3.5,
      "gre": true
    }
  }
}
```

### Generate Letter of Recommendation
```
POST /generate/lor
```
Request body:
```json
{
  "profile": {
    "name": "Jane Doe",
    "university": "Boston University",
    "major": "Computer Science",
    "researchExperience": "2 years in ML and NLP"
  },
  "university": {
    "name": "Stanford University"
  },
  "program": {
    "name": "Computer Science PhD",
    "department": "School of Engineering"
  },
  "recommender": {
    "name": "Dr. John Smith",
    "title": "Associate Professor",
    "institution": "Boston University",
    "relationship": "Research Advisor",
    "duration": "two years",
    "context": "research lab and advanced ML course"
  }
}
```

### Review Document
```
POST /review
```
Request body:
```json
{
  "type": "sop",
  "content": "Your document content here..."
}
```

## Client Integration

The `client.js` file provides a JavaScript client for integrating with the LLM service. Import this into your main GradAid application to interact with the microservice.

Example usage:
```javascript
const llmClient = require('./client');

// Generate an SOP
const sopResult = await llmClient.generateSOP({
  profile: userProfile,
  university: targetUniversity,
  program: targetProgram
});

// Save the generated SOP
console.log(sopResult.sop);
```

## Environment Variables

- `TOGETHER_API_KEY`: Your API key for Together.ai
- `OPENAI_BASE_URL`: Base URL for the Together.ai API (default: https://api.llmapi.com/)
- `PORT`: Port for the Flask server (default: 5000)

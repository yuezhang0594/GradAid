from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from model import LlamaModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize the LLM model
llm_model = LlamaModel()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model": "llama3-8b",
        "service": "GradAid LLM Service"
    })

@app.route('/generate/sop', methods=['POST'])
def generate_sop():
    """
    Generate a Statement of Purpose
    
    Expects a JSON payload with:
    - profile: User profile data
    - university: University data
    - program: Program data
    """
    try:
        data = request.json
        
        # Validate request data
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        if not all(k in data for k in ["profile", "university", "program"]):
            return jsonify({"error": "Missing required data fields"}), 400
            
        # Generate SOP
        sop_content = llm_model.generate_sop(data)
        
        if not sop_content:
            return jsonify({"error": "Failed to generate SOP"}), 500
            
        return jsonify({
            "success": True,
            "sop": sop_content
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/generate/lor', methods=['POST'])
def generate_lor():
    """
    Generate a Letter of Recommendation
    
    Expects a JSON payload with:
    - profile: User profile data
    - university: University data
    - program: Program data
    - recommender: Recommender information
    """
    try:
        data = request.json
        
        # Validate request data
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        if not all(k in data for k in ["profile", "university", "program", "recommender"]):
            return jsonify({"error": "Missing required data fields"}), 400
            
        # Generate LOR
        lor_content = llm_model.generate_lor(
            {
                "profile": data["profile"],
                "university": data["university"],
                "program": data["program"]
            },
            data["recommender"]
        )
        
        if not lor_content:
            return jsonify({"error": "Failed to generate LOR"}), 500
            
        return jsonify({
            "success": True,
            "lor": lor_content
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/review', methods=['POST'])
def review_document():
    """
    Review an SOP or LOR
    
    Expects a JSON payload with:
    - type: Document type ('sop' or 'lor')
    - content: Document content to review
    """
    try:
        data = request.json
        
        # Validate request data
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        if not all(k in data for k in ["type", "content"]):
            return jsonify({"error": "Missing required data fields"}), 400
            
        if data["type"] not in ["sop", "lor"]:
            return jsonify({"error": "Invalid document type"}), 400
            
        # Review document
        feedback = llm_model.review_document(data["type"], data["content"])
        
        if not feedback:
            return jsonify({"error": "Failed to review document"}), 500
            
        return jsonify({
            "success": True,
            "feedback": feedback
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Get port from environment variable or use default
    port = int(os.environ.get('PORT', 8000))
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=port, debug=False)

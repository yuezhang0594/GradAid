import kagglehub
import pandas as pd
import os
import json
from flask import Flask, request, jsonify

# Download the dataset
path = kagglehub.dataset_download("thedevastator/national-universities-rankings-explore-quality-t")
print("Path to dataset files:", path)

# Load the university data
csv_path = os.path.join(path, "National Universities Rankings.csv")
university_data = pd.read_csv(csv_path)
print(f"Loaded data for {len(university_data)} universities.")

def get_university_recommendations(gre_score, ielts_score, gpa):
    """
    Get university recommendations based on GRE, IELTS, and GPA
    Returns 10 universities: 5 safe, 3 moderate, and 2 ambitious options
    """
    # Normalize scores to a 0-1 scale
    normalized_gre = gre_score / 340
    normalized_ielts = ielts_score / 9
    normalized_gpa = gpa / 4.0
    
    # Calculate overall score
    overall_score = (normalized_gre + normalized_ielts + normalized_gpa) / 3
    
    # Clean and convert rank to numeric
    df = university_data.copy()
    df['Rank'] = pd.to_numeric(df['Rank'], errors='coerce')
    df = df.dropna(subset=['Rank'])  # Remove rows with NaN ranks
    df = df.sort_values('Rank').reset_index(drop=True)
    
    # Calculate rank thresholds based on overall score
    max_rank = len(df)
    
    # Safe schools (5)
    safe_min_rank = int(max_rank * 0.5 * (1 - overall_score))
    safe_max_rank = int(max_rank * 0.8)
    
    # Moderate schools (3)
    moderate_min_rank = int(max_rank * 0.2 * (1 - overall_score))
    moderate_max_rank = safe_min_rank - 1
    
    # Ambitious schools (2)
    ambitious_min_rank = 1
    ambitious_max_rank = moderate_min_rank - 1
    
    # Select universities in each category
    safe_schools = df[(df['Rank'] >= safe_min_rank) & (df['Rank'] <= safe_max_rank)].head(5)
    moderate_schools = df[(df['Rank'] >= moderate_min_rank) & (df['Rank'] <= moderate_max_rank)].head(3)
    ambitious_schools = df[(df['Rank'] >= ambitious_min_rank) & (df['Rank'] <= ambitious_max_rank)].head(2)
    
    # Format results as a dictionary
    results = {
        'safe': safe_schools[['Name', 'Location', 'Rank']].to_dict('records'),
        'moderate': moderate_schools[['Name', 'Location', 'Rank']].to_dict('records'),
        'ambitious': ambitious_schools[['Name', 'Location', 'Rank']].to_dict('records')
    }
    
    return results

# Create a Flask app to serve as an API endpoint
app = Flask(__name__)

@app.route('/api/university-recommendations', methods=['POST'])
def university_recommendations_api():
    """
    API endpoint to get university recommendations
    
    Expected JSON payload:
    {
        "userId": "user123",
        "userData": {
            "gre_score": 320,
            "ielts_score": 7.5,
            "gpa": 3.7
        }
    }
    
    Or, if the data should be fetched from Convex:
    {
        "userId": "user123"
    }
    """
    try:
        data = request.json
        
        # Check if user data is provided directly
        if 'userData' in data:
            user_data = data['userData']
            gre_score = float(user_data.get('gre_score', 0))
            ielts_score = float(user_data.get('ielts_score', 0))
            gpa = float(user_data.get('gpa', 0))
        
        # Otherwise, fetch from Convex database
        else:
            user_id = data.get('userId')
            if not user_id:
                return jsonify({'error': 'User ID is required'}), 400
                
            # This is a placeholder for fetching data from Convex
            # In a real implementation, you would use the Convex client to fetch the data
            user_data = fetch_user_data_from_convex(user_id)
            
            gre_score = float(user_data.get('gre_score', 0))
            ielts_score = float(user_data.get('ielts_score', 0))
            gpa = float(user_data.get('gpa', 0))
        
        # Get recommendations
        recommendations = get_university_recommendations(gre_score, ielts_score, gpa)
        
        return jsonify({
            'success': True,
            'recommendations': recommendations
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def fetch_user_data_from_convex(user_id):
    """
    Placeholder function to fetch user data from Convex database
    
    In a real implementation, this would use the Convex client to fetch the data
    For now, it returns dummy data
    
    To implement with actual Convex:
    1. Use the retrieve_and_generate.js pattern from your existing code
    2. Or implement a direct Python client if available
    """
    # This is a placeholder - in a real implementation, you would fetch from Convex
    # Based on your existing implementation in other files
    try:
        # Placeholder for fetching from Convex
        # In a real implementation, you might use a Node.js bridge or a Python client
        
        # Example of how this might work with a temporary JSON file approach
        # (similar to your retrieve_and_generate.js pattern):
        # 1. Call a Node.js script to fetch data from Convex and save to a temp file
        # 2. Read the temp file from Python
        
        # For now, return dummy data
        return {
            'gre_score': 320,
            'ielts_score': 7.5,
            'gpa': 3.7
        }
    except Exception as e:
        print(f"Error fetching user data from Convex: {str(e)}")
        # Return default values if fetch fails
        return {
            'gre_score': 300,
            'ielts_score': 7.0,
            'gpa': 3.0
        }

# For testing the API locally
if __name__ == "__main__":
    # Example usage with direct values
    gre_score = 320  # Example GRE score (out of 340)
    ielts_score = 7.5  # Example IELTS score (out of 9)
    gpa = 3.7  # Example GPA (out of 4.0)
    
    # Get and print recommendations
    recommendations = get_university_recommendations(gre_score, ielts_score, gpa)
    
    # Print results
    print("\n=== UNIVERSITY RECOMMENDATIONS ===\n")
    
    print("SAFE OPTIONS (High chance of admission):")
    print("-" * 80)
    for school in recommendations['safe']:
        print(f"{school['Name']} (Rank: {school['Rank']}) - {school['Location']}")
    
    print("\nMODERATE OPTIONS (Moderate chance of admission):")
    print("-" * 80)
    for school in recommendations['moderate']:
        print(f"{school['Name']} (Rank: {school['Rank']}) - {school['Location']}")
    
    print("\nAMBITIOUS OPTIONS (Lower chance of admission):")
    print("-" * 80)
    for school in recommendations['ambitious']:
        print(f"{school['Name']} (Rank: {school['Rank']}) - {school['Location']}")
    
    # Uncomment to run the API server
    # app.run(debug=True, port=5000)

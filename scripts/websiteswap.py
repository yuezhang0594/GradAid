import json
import os

def replace_university_ids():
    # Path to programs.json
    programs_path = os.path.join(os.path.dirname(__file__), "output", "programs.json")

    # Path to universities.json
    universities_path = os.path.join(os.path.dirname(__file__), "output", "universities.json")
    
    # Load the programs data
    try:
        with open(programs_path, 'r') as file:
            programs = json.load(file)
    except Exception as e:
        print(f"Error loading programs.json: {e}")
        return
    
    # Load the universities data
    try:
        with open(universities_path, 'r') as file:
            universities = json.load(file)
    except Exception as e:
        print(f"Error loading universities.json: {e}")
        return
    # Create a mapping of university names to websites
    university_mapping = {}
    for university in universities:
        university_mapping[university["name"]] = university["website"]
    
    # Replace university IDs with names
    for program in programs:
        program["website"] = university_mapping[program["universityId"]]
    
    # Save the updated data back to programs.json
    try:
        with open(programs_path, 'w') as file:
            json.dump(programs, file, indent=2)
    except Exception as e:
        print(f"Error saving updated data: {e}")

if __name__ == "__main__":
    replace_university_ids()

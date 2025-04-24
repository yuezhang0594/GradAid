import csv
import json
import os
import re

def parse_date(date_str):
    """Parse various date formats into ISO format strings"""
    if not date_str or date_str.strip() in ["N/A", "Rolling", "TBD"]:
        return None
    
    date_str = date_str.strip()
    
    # Remove ordinals and normalize
    date_str = re.sub(r'(\d+)(st|nd|rd|th)', r'\1', date_str)
    
    # Month name to number mapping
    month_map = {
        'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 
        'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
        'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12',
        'january': '01', 'february': '02', 'march': '03', 'april': '04',
        'may': '05', 'june': '06', 'july': '07', 'august': '08',
        'september': '09', 'october': '10', 'november': '11', 'december': '12'
    }
    
    # Extract month and day
    match = re.match(r'([a-zA-Z]+)\s+(\d+)', date_str, re.IGNORECASE)
    if match:
        month_name = match.group(1).lower()
        day = match.group(2).zfill(2)  # Pad with leading zero
        
        if month_name in month_map:
            month = month_map[month_name]
            return f"2025-{month}-{day}"  # Using 2025 as placeholder year
    
    return None

def extract_location(university_name):
    """Extract or map location for universities"""
    location = {
        "city": "Unknown",
        "state": "Unknown",
        "country": "United States"
    }
    
    # University location mappings
    university_locations = {
        "Princeton University": {"city": "Princeton", "state": "New Jersey"},
        "Harvard University": {"city": "Cambridge", "state": "Massachusetts"},
        "Massachusetts Institute of Technology": {"city": "Cambridge", "state": "Massachusetts"},
        "Stanford University": {"city": "Stanford", "state": "California"},
        "Yale University": {"city": "New Haven", "state": "Connecticut"},
        "California Institute of Technology": {"city": "Pasadena", "state": "California"},
        "Duke University": {"city": "Durham", "state": "North Carolina"},
        "Johns Hopkins University": {"city": "Baltimore", "state": "Maryland"},
        "Northwestern University": {"city": "Evanston", "state": "Illinois"},
        "University of Pennsylvania": {"city": "Philadelphia", "state": "Pennsylvania"},
        "Cornell University": {"city": "Ithaca", "state": "New York"},
        "University of Chicago": {"city": "Chicago", "state": "Illinois"},
        "Brown University": {"city": "Providence", "state": "Rhode Island"},
        "Columbia University": {"city": "New York", "state": "New York"},
        "Dartmouth College": {"city": "Hanover", "state": "New Hampshire"},
        "UCLA": {"city": "Los Angeles", "state": "California"},
        "University of California, Berkeley": {"city": "Berkeley", "state": "California"},
        "Rice University": {"city": "Houston", "state": "Texas"},
        "University of Notre Dame": {"city": "Notre Dame", "state": "Indiana"},
        "Vanderbilt University": {"city": "Nashville", "state": "Tennessee"},
        "Carnegie Mellon University": {"city": "Pittsburgh", "state": "Pennsylvania"},
        "University of Michigan--Ann Arbor": {"city": "Ann Arbor", "state": "Michigan"},
        "Emory University": {"city": "Atlanta", "state": "Georgia"},
        "Georgetown University": {"city": "Washington", "state": "DC"},
        "University of Virginia": {"city": "Charlottesville", "state": "Virginia"},
        "University of North Carolina--Chapel Hill": {"city": "Chapel Hill", "state": "North Carolina"},
        "University of Southern California": {"city": "Los Angeles", "state": "California"},
        "University of California, San Diego": {"city": "San Diego", "state": "California"},
        "Tufts University": {"city": "Medford", "state": "Massachusetts"},
        "Georgia Institute of Technology": {"city": "Atlanta", "state": "Georgia"},
        "University of California, Davis": {"city": "Davis", "state": "California"},
        "University of California--Irvine": {"city": "Irvine", "state": "California"},
        "University of Illinois Urbana-Champaign": {"city": "Urbana-Champaign", "state": "Illinois"},
        "Boston College": {"city": "Chestnut Hill", "state": "Massachusetts"},
        "Boston University": {"city": "Boston", "state": "Massachusetts"},
        "New York University": {"city": "New York", "state": "New York"},
        "University of Florida": {"city": "Gainesville", "state": "Florida"},
        "The University of Texas--Austin": {"city": "Austin", "state": "Texas"},
        "Ohio State University": {"city": "Columbus", "state": "Ohio"},
        "Rutgers University--New Brunswick": {"city": "New Brunswick", "state": "New Jersey"},
        "University of Maryland, College Park": {"city": "College Park", "state": "Maryland"},
        "University of Wisconsin--Madison": {"city": "Madison", "state": "Wisconsin"}
    }
    
    # First, check if it's in our mapping
    if university_name in university_locations:
        return {
            "city": university_locations[university_name]["city"],
            "state": university_locations[university_name]["state"],
            "country": "United States"
        }
    
    # Try case insensitive match
    for name, loc in university_locations.items():
        if name.lower() == university_name.lower():
            return {
                "city": loc["city"],
                "state": loc["state"],
                "country": "United States"
            }
            
    # Try to extract from name patterns
    if "University of California" in university_name:
        matches = re.findall(r"University of California,?\s+([A-Za-z ]+)", university_name)
        if matches:
            location["state"] = "California"
            location["city"] = matches[0].strip()
            return location
            
    if "--" in university_name:
        matches = re.findall(r"University of ([A-Za-z ]+)--([A-Za-z ]+)", university_name)
        if matches:
            location["state"] = matches[0][0].strip()
            location["city"] = matches[0][1].strip()
            return location
    
    return location

def parse_program_list(program_str):
    """Parse comma-separated list of programs"""
    if not program_str:
        return []
    
    # Remove surrounding quotes and split
    program_str = program_str.strip('"')
    programs = [p.strip() for p in program_str.split(',')]
    
    # Filter empty strings
    return [p for p in programs if p and not p.isspace()]

def convert_tsv_to_json(tsv_file):
    """Convert TSV university data to JSON for database import"""
    universities = []
    programs = []
    
    with open(tsv_file, 'r') as file:
        # Skip file path comment if present
        first_line = file.readline()
        if "filepath:" in first_line:
            file.seek(0)
            next(file)
        else:
            file.seek(0)
        
        reader = csv.DictReader(file, delimiter='\t')
        
        # Print column names to help diagnose issues
        column_names = reader.fieldnames
        print(f"Found columns: {column_names}")
        
        # Define mapping for expected column names that might vary
        column_mapping = {
            "university": "University",
            "phd_programs": "PHD Programs",
            "ms_programs": "MS Programs", 
            "gpa_min": "GPA Min",
            "fall_deadline": "Fall deadline",
            "spring_deadline": "Spring deadline",
            "gre_gmat": "Gre/Gmat required",
            "toefl_ielts": "Toefl/IELTS",
            "lors": ["LOR's", "LORs", "LOR", "Letters of Recommendation", "Recommendation Letters"],
            "website": "Website"
        }
        
        # Find the actual column name for recommendation letters
        lor_column = None
        for possible_name in column_mapping["lors"]:
            if possible_name in column_names:
                lor_column = possible_name
                break
                
        for index, row in enumerate(reader):
            university_name = row[column_mapping["university"]].strip()
            
            # Create university object
            university = {
                "name": university_name,
                "location": extract_location(university_name),
                "website": row[column_mapping["website"]].strip(),
                "ranking": index + 1  # Use row order as ranking
            }
            universities.append(university)
            
            # Parse requirements
            requirements = {}
            
            # GPA
            if column_mapping["gpa_min"] in row and row[column_mapping["gpa_min"]] and row[column_mapping["gpa_min"]].strip() != "N/A":
                try:
                    requirements["minimumGPA"] = float(row[column_mapping["gpa_min"]])
                except ValueError:
                    pass
            
            # GRE/GMAT
            if column_mapping["gre_gmat"] in row:
                gre_value = row[column_mapping["gre_gmat"]].strip().upper() if row[column_mapping["gre_gmat"]] else None
                if gre_value == "YES":
                    requirements["gre"] = True
                elif gre_value == "NO":
                    requirements["gre"] = False
            
            # TOEFL/IELTS
            if column_mapping["toefl_ielts"] in row:
                toefl_value = row[column_mapping["toefl_ielts"]].strip().upper() if row[column_mapping["toefl_ielts"]] else None
                if toefl_value == "YES":
                    requirements["toefl"] = True
                elif toefl_value == "NO":
                    requirements["toefl"] = False
            
            # Letters of recommendation
            if lor_column and lor_column in row and row[lor_column] and row[lor_column].strip() != "N/A":
                try:
                    requirements["recommendationLetters"] = int(row[lor_column])
                except ValueError:
                    pass
            
            # Parse deadlines
            deadlines = {}
            if column_mapping["fall_deadline"] in row:
                fall_date = parse_date(row[column_mapping["fall_deadline"]])
                if fall_date:
                    deadlines["fall"] = fall_date
            
            if column_mapping["spring_deadline"] in row:        
                spring_date = parse_date(row[column_mapping["spring_deadline"]])
                if spring_date:
                    deadlines["spring"] = spring_date
            
            # Add PhD programs
            phd_programs = parse_program_list(row[column_mapping["phd_programs"]])
            for i, program_name in enumerate(phd_programs):
                program = {
                    "universityId": f"univ_{index+1}",  # Placeholder, will be replaced with actual IDs
                    "name": program_name,
                    "degree": "Ph.D.",
                    "department": program_name,
                    "requirements": requirements,
                    "deadlines": deadlines,
                    "website": university["website"]
                }
                programs.append(program)
            
            # Add MS programs
            ms_programs = parse_program_list(row[column_mapping["ms_programs"]])
            for i, program_name in enumerate(ms_programs):
                program = {
                    "universityId": f"univ_{index+1}",  # Placeholder, will be replaced with actual IDs
                    "name": program_name,
                    "degree": "M.S.",
                    "department": program_name,
                    "requirements": requirements,
                    "deadlines": deadlines,
                    "website": university["website"]
                }
                programs.append(program)
    
    return {
        "universities": universities,
        "programs": programs
    }

def main():
    # Input file path
    tsv_file = "/Users/jirissman/Documents/GradAid/scripts/UNI_DATA.tsv"
    
    # Output directory
    output_dir = "/Users/jirissman/Documents/GradAid/scripts/output"
    os.makedirs(output_dir, exist_ok=True)
    
    # Convert data
    data = convert_tsv_to_json(tsv_file)
    
    # Write to JSON files
    with open(os.path.join(output_dir, "universities.json"), 'w') as univ_file:
        json.dump(data["universities"], univ_file, indent=2)
    
    with open(os.path.join(output_dir, "programs.json"), 'w') as prog_file:
        json.dump(data["programs"], prog_file, indent=2)
    
    print(f"Successfully processed {len(data['universities'])} universities")
    print(f"Successfully processed {len(data['programs'])} programs")
    print(f"Data saved to {output_dir}/universities.json and {output_dir}/programs.json")

if __name__ == "__main__":
    main()

import os
import json
import glob

#!/usr/bin/env python3

def stitch_json_files():
    """
    Combine all JSON files in ./notebooks/split_programs into a single programs.json file
    """
    # Define input directory and output file path
    input_dir = "./notebooks/split_programs"
    output_file = "programs.json"
    
    # Ensure input directory exists
    if not os.path.exists(input_dir):
        print(f"Error: Directory {input_dir} does not exist")
        return
    
    # Get all JSON files in the directory
    json_files = glob.glob(os.path.join(input_dir, "*.json"))
    if not json_files:
        print(f"No JSON files found in {input_dir}")
        return
    
    # Combine all programs into a single list
    all_programs = []
    for file_path in json_files:
        try:
            with open(file_path, 'r') as file:
                data = json.load(file)
                # Handle both single objects and lists
                if isinstance(data, list):
                    all_programs.extend(data)
                else:
                    all_programs.append(data)
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
    
    # Write combined data to output file
    with open(output_file, 'w') as out_file:
        json.dump(all_programs, out_file, indent=2)
    
    print(f"Successfully combined {len(json_files)} JSON files into {output_file}")
    print(f"Total programs: {len(all_programs)}")

if __name__ == "__main__":
    stitch_json_files()
import json
import os
import re
from collections import defaultdict

# Define paths
input_file = os.path.join('.', 'notebooks', 'programs.json')
output_dir = os.path.join('.', 'notebooks', 'split_programs')

# Create output directory if it doesn't exist
os.makedirs(output_dir, exist_ok=True)

# Read the input JSON file
try:
    with open(input_file, 'r', encoding='utf-8') as f:
        programs_data = json.load(f)
except FileNotFoundError:
    print(f"Error: Input file not found at {input_file}")
    exit(1)
except json.JSONDecodeError:
    print(f"Error: Could not decode JSON from {input_file}")
    exit(1)

# Group programs by name
programs_by_university = defaultdict(list)
for program in programs_data:
    name = program.get('universityId')
    if name:
        programs_by_university[name].append(program)
    else:
        print(f"Warning: Program missing 'universityId' field: {program}")

# Function to create a safe filename from a URL
def sanitize_filename(url):
    # Remove protocol
    name = re.sub(r'^https?://', '', url)
    # Replace invalid characters with underscores
    name = re.sub(r'[<>:"/\\|?*]+', '_', name)
    # Truncate if too long (optional)
    max_len = 100
    if len(name) > max_len:
        name = name[:max_len]
    return f"{name}.json"

# Write each group to a separate file
for website, programs in programs_by_university.items():
    filename = sanitize_filename(website)
    output_path = os.path.join(output_dir, filename)
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(programs, f, indent=2, ensure_ascii=False)
        print(f"Successfully wrote {len(programs)} programs to {output_path}")
    except IOError as e:
        print(f"Error writing file {output_path}: {e}")

print("\nProcessing complete.")

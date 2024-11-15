import json
import csv
import os

# Print current working directory
print(f"Current working directory: {os.getcwd()}")

# Get absolute path for input and output files
input_path = os.path.abspath('participant_assignments.json')
output_path = os.path.abspath('participant_assignments.csv')

print(f"Reading from: {input_path}")
print(f"Writing to: {output_path}")

# Read the JSON file
with open(input_path, 'r') as f:
    data = json.load(f)

# Write to CSV
with open(output_path, 'w', newline='') as f:
    writer = csv.writer(f)
    # Write header
    writer.writerow(['participant_id', 'party', 'assignment_number'])
    
    # Write data rows
    for party in data:
        assignments = data[party]['assignments']
        for participant_id, assignment_number in assignments.items():
            writer.writerow([participant_id, party, assignment_number])

print(f"CSV file has been created at: {output_path}")
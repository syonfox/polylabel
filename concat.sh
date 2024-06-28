#!/bin/bash

# Check if three arguments are provided
if [ "$#" -ne 3 ]; then
    echo "Usage: $0 <input_file1.js> <input_file2.js> <output_file.js>"
    exit 1
fi

# Input files
input_file1=$1
input_file2=$2

# Output file
output_file=$3

# Create the directory for the output file if it doesn't exist
output_dir=$(dirname "$output_file")
mkdir -p "$output_dir"

# Concatenate input files into the output file
cat "$input_file1" "$input_file2" > "$output_file"

echo "Concatenated file created: $output_file"

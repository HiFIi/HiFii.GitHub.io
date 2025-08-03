#!/bin/bash

# Exit on error
set -e

# Paths to your files
FILES=("index.html" "script.js" "style.css")

echo "Formatting files with Prettier..."

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "Formatting $file..."
        prettier --write "$file"
    else
        echo "Warning: $file not found."
    fi
done

echo "Formatting complete."


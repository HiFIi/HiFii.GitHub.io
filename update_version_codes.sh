#!/bin/bash

INPUT="release.json"
TMP="release_tmp.json"

# --- Function to convert tag to versionCode ---
convert_tag_to_version_code() {
    local tag="$1"
    IFS='._' read -ra PARTS <<< "$tag"

    local major=${PARTS[0]:-0}
    local minor=${PARTS[1]:-0}
    local patch=${PARTS[2]:-0}
    local beta=0
    local test=0

    for part in "${PARTS[@]}"; do
        if [[ $part =~ beta([0-9]+) ]]; then beta=${BASH_REMATCH[1]}; fi
        if [[ $part =~ test([0-9]+) ]]; then test=${BASH_REMATCH[1]}; fi
    done

    echo $((major * 100000000 + minor * 1000000 + patch * 10000 + beta * 100 + test))
}

# --- Start JSON array ---
echo "[" > "$TMP"
first=1

jq -c '.[]' "$INPUT" | while read -r release; do
    tag=$(echo "$release" | jq -r '.tag_name')
    body=$(echo "$release" | jq -r '.body')
    versionCode=$(convert_tag_to_version_code "$tag")

    # Remove existing versionCode line
    cleanBody=$(echo "$body" | sed '/^versionCode:/d')

    # Append versionCode
    updatedBody="${cleanBody}"$'\n\n'"versionCode: ${versionCode}"

    # Use jq to inject updated body
    updatedRelease=$(echo "$release" | jq --arg newBody "$updatedBody" '.body = $newBody')

    # Write JSON with correct commas
    if [ "$first" -eq 0 ]; then
        echo "," >> "$TMP"
    fi
    echo "$updatedRelease" >> "$TMP"
    first=0
done

echo "]" >> "$TMP"

# Replace the original file
mv "$TMP" "$INPUT"
echo "✅ Updated $INPUT with versionCode injected into body."


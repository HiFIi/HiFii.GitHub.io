#!/bin/bash

INPUT="release.json"
TMP="release_tmp.json"

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

# Read number of releases
count=$(jq length "$INPUT")

# Initialize an array to hold updated JSON objects
updated_releases=()

for ((i=0; i<count; i++)); do
    release=$(jq -c ".[$i]" "$INPUT")
    tag=$(echo "$release" | jq -r '.tag_name')
    body=$(echo "$release" | jq -r '.body')

    versionCode=$(convert_tag_to_version_code "$tag")

    # Remove existing versionCode line
    cleanBody=$(echo "$body" | sed '/^versionCode:/d')

    # Append versionCode line
    updatedBody="${cleanBody}"$'\n\n'"versionCode: ${versionCode}"

    # Inject updated body back into JSON
    updatedRelease=$(echo "$release" | jq --arg newBody "$updatedBody" '.body = $newBody')

    updated_releases+=("$updatedRelease")
done

# Output the updated array as valid JSON
printf '%s\n' "${updated_releases[@]}" | jq -s '.' > "$TMP" && mv "$TMP" "$INPUT"

echo "✅ Updated $INPUT with versionCode injected into body."

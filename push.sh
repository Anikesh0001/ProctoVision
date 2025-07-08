#!/bin/bash

# Ask for checkpoint label and custom message
echo "Enter Checkpoint Number (e.g., CP0, CP1, CP2 ... CP8):"
read CP
echo "Enter commit message:"
read MSG

# Stage everything
git add .

# Commit with formatted message
git commit -m "✅ $CP – $MSG"

# Push to main
git push origin main

echo "✅ Code pushed for $CP successfully!"

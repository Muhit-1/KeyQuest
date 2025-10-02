#!/bin/bash

# KeyQuest Secret Cleanup Script
# This script helps remove accidentally committed secrets from git history
# WARNING: This rewrites git history and requires force pushing

set -e

echo "🔒 KeyQuest Secret Cleanup Script"
echo "================================="
echo ""
echo "⚠️  WARNING: This script will rewrite git history!"
echo "   - Coordinate with your team before running"
echo "   - Make sure all team members have pushed their changes"
echo "   - This will require force pushing to remote repositories"
echo ""

# Check if git-filter-repo is available
if ! command -v git-filter-repo &> /dev/null; then
    echo "❌ git-filter-repo is not installed"
    echo "   Install it with: pip install git-filter-repo"
    echo "   Or use the alternative git filter-branch method below"
    echo ""
fi

# Function to remove specific files
remove_file() {
    local file_path="$1"
    echo "🗑️  Removing $file_path from git history..."
    
    if command -v git-filter-repo &> /dev/null; then
        # Preferred method using git-filter-repo
        git filter-repo --path "$file_path" --invert-paths --force
    else
        # Fallback method using git filter-branch
        git filter-branch --force --index-filter \
            "git rm --cached --ignore-unmatch '$file_path'" \
            --prune-empty --tag-name-filter cat -- --all
    fi
}

# Function to remove files by pattern
remove_pattern() {
    local pattern="$1"
    echo "🗑️  Removing files matching pattern: $pattern"
    
    if command -v git-filter-repo &> /dev/null; then
        git filter-repo --path-glob "$pattern" --invert-paths --force
    else
        echo "❌ Pattern removal requires git-filter-repo"
        echo "   Install it with: pip install git-filter-repo"
        return 1
    fi
}

# Check for common secret files in git history
echo "🔍 Checking for secret files in git history..."
secret_files_found=false

# Check for .env files
if git log --name-only --pretty=format: | grep -E '\.env(\.|$)' | grep -v '\.example' | head -5; then
    echo "❌ Found .env files in git history!"
    secret_files_found=true
fi

# Check for common secret file patterns
secret_patterns=(
    "*.key"
    "*.pem"
    "*.p12"
    "*.pfx"
    "*secret*"
    "*password*"
    "config/database.yml"
    ".aws/credentials"
)

for pattern in "${secret_patterns[@]}"; do
    if git log --name-only --pretty=format: | grep -i "$pattern" | head -1 > /dev/null; then
        echo "❌ Found files matching pattern: $pattern"
        secret_files_found=true
    fi
done

if [ "$secret_files_found" = false ]; then
    echo "✅ No obvious secret files found in git history"
    echo "   However, you should still check for hardcoded secrets in code"
    exit 0
fi

echo ""
echo "🚨 Secret files detected in git history!"
echo "   You should clean these up before publishing to GitHub"
echo ""

# Interactive cleanup
read -p "Do you want to proceed with cleanup? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cleanup cancelled"
    exit 1
fi

# Backup current branch
current_branch=$(git branch --show-current)
echo "💾 Creating backup branch: backup-before-cleanup"
git branch backup-before-cleanup

# Common files to remove
files_to_remove=(
    ".env"
    ".env.local"
    ".env.production"
    ".env.development"
    "config/secrets.yml"
    ".aws/credentials"
)

echo ""
echo "🧹 Starting cleanup process..."

for file in "${files_to_remove[@]}"; do
    if git log --name-only --pretty=format: | grep -q "^$file$"; then
        echo "🗑️  Found $file in history, removing..."
        remove_file "$file"
    fi
done

# Remove any remaining .env files
echo "🗑️  Removing any remaining .env files..."
if command -v git-filter-repo &> /dev/null; then
    git filter-repo --path-glob '*.env' --invert-paths --force 2>/dev/null || true
    git filter-repo --path-glob '*.env.*' --invert-paths --force 2>/dev/null || true
fi

echo ""
echo "✅ Cleanup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Verify the cleanup worked:"
echo "   git log --name-only --oneline | grep -E '\\.env'"
echo ""
echo "2. Rotate all compromised secrets:"
echo "   - Generate new API keys"
echo "   - Update environment variables in all deployments"
echo "   - Revoke old credentials"
echo ""
echo "3. Force push to remote (coordinate with team):"
echo "   git push origin --force --all"
echo "   git push origin --force --tags"
echo ""
echo "4. Team members need to re-clone the repository:"
echo "   git clone <repository-url>"
echo ""
echo "⚠️  Remember: All team members will need to re-clone the repository!"

# Cleanup git filter-branch backup refs if they exist
if [ -d ".git/refs/original" ]; then
    echo "🧹 Cleaning up git filter-branch backup refs..."
    rm -rf .git/refs/original/
fi

echo ""
echo "🔒 Secret cleanup completed successfully!"

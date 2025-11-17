#!/bin/bash

# CasePack Local Setup Script
# Run this script on your local machine to set up the repository

echo "🚀 Setting up CasePack repository..."

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install git first."
    exit 1
fi

# Get current directory
REPO_DIR="Court-Case-Packet"

# Check if we're already in the repo
if [ -d ".git" ]; then
    echo "✅ Already in a git repository"
else
    # Clone the repository
    echo "📥 Cloning repository..."
    git clone https://github.com/subodhkc/Court-Case-Packet.git
    cd $REPO_DIR
fi

# Configure git
echo "⚙️  Configuring git..."
git config user.name "Subodh KC"
git config user.email "your-email@example.com"

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. The code files are already in this directory"
echo "2. Copy your .env file: cp .env.example .env"
echo "3. Edit .env and add your API keys"
echo "4. Start the app: docker-compose up -d"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Full feature guide"
echo "   - DEPLOYMENT.md - Deployment instructions"
echo ""

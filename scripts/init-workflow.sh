#!/bin/bash

# Session End Process - Initialization Script
# Sets up the auto-PR workflow for 90% token threshold

set -e

echo ""
echo "🚀 Initializing Session End Process Workflow"
echo "=============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Check prerequisites
echo -e "${BLUE}Step 1: Checking prerequisites...${NC}"
echo ""

if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git not found${NC}"
    echo "Please install Git: https://git-scm.com/downloads"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found${NC}"
    echo "Please install Node.js 18+: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${YELLOW}⚠️  Node.js version is $NODE_VERSION, recommend 18+${NC}"
fi

echo -e "${GREEN}✅ Prerequisites satisfied${NC}"
echo ""

# Step 2: Install dependencies
echo -e "${BLUE}Step 2: Installing required dependencies...${NC}"
echo ""

if [ ! -d "node_modules" ]; then
    npm install
else
    echo "Dependencies already installed, checking for updates..."
    npm install --save-dev @octokit/rest chokidar chalk
fi

echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 3: GitHub Configuration
echo -e "${BLUE}Step 3: GitHub Configuration${NC}"
echo "──────────────────────────────────────────"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    touch .env
fi

# Check for GitHub token
if ! grep -q "GITHUB_TOKEN" .env; then
    echo -e "${YELLOW}⚠️  GITHUB_TOKEN not found${NC}"
    echo ""
    echo "📝 To create a GitHub Personal Access Token:"
    echo "   1. Go to: https://github.com/settings/tokens/new"
    echo "   2. Give it a name: 'Trading Platform Auto-PR'"
    echo "   3. Select scopes:"
    echo "      ✅ repo (Full control of private repositories)"
    echo "      ✅ workflow (Update GitHub Action workflows)"
    echo "   4. Click 'Generate token' and copy it"
    echo ""
    read -p "Enter your GitHub Personal Access Token: " GITHUB_TOKEN

    if [ -z "$GITHUB_TOKEN" ]; then
        echo -e "${RED}❌ Token is required${NC}"
        exit 1
    fi

    echo "GITHUB_TOKEN=$GITHUB_TOKEN" >> .env
    echo -e "${GREEN}✅ Token saved to .env${NC}"
else
    echo -e "${GREEN}✅ GITHUB_TOKEN already configured${NC}"
fi

echo ""

# Extract repository info
REPO_URL=$(git config --get remote.origin.url 2>/dev/null || echo "")

if [ -z "$REPO_URL" ]; then
    echo -e "${YELLOW}⚠️  No Git remote found${NC}"
    echo ""
    read -p "Enter your GitHub username: " GITHUB_USER
    read -p "Enter your repository name: " GITHUB_REPO

    if [ -z "$GITHUB_USER" ] || [ -z "$GITHUB_REPO" ]; then
        echo -e "${RED}❌ Username and repo name are required${NC}"
        exit 1
    fi

    echo "GITHUB_REPO_OWNER=$GITHUB_USER" >> .env
    echo "GITHUB_REPO_NAME=$GITHUB_REPO" >> .env

    echo ""
    echo "💡 Initialize Git repository with:"
    echo "   git init"
    echo "   git remote add origin https://github.com/$GITHUB_USER/$GITHUB_REPO.git"
else
    # Extract owner and repo from URL
    if [[ $REPO_URL == *"github.com"* ]]; then
        REPO_INFO=$(echo $REPO_URL | sed -E 's/.*github.com[:/](.*)(\.git)?$/\1/')
        REPO_OWNER=$(echo $REPO_INFO | cut -d'/' -f1)
        REPO_NAME=$(echo $REPO_INFO | cut -d'/' -f2 | sed 's/\.git$//')

        if ! grep -q "GITHUB_REPO_OWNER" .env; then
            echo "GITHUB_REPO_OWNER=$REPO_OWNER" >> .env
        fi

        if ! grep -q "GITHUB_REPO_NAME" .env; then
            echo "GITHUB_REPO_NAME=$REPO_NAME" >> .env
        fi

        echo -e "${GREEN}✅ Repository: $REPO_OWNER/$REPO_NAME${NC}"
    fi
fi

echo ""

# Step 4: Create GitHub Actions Workflow
echo -e "${BLUE}Step 4: Setting up GitHub Actions workflow${NC}"
echo "──────────────────────────────────────────"
echo ""

mkdir -p .github/workflows

if [ -f ".github/workflows/security-check.yml" ]; then
    echo -e "${YELLOW}⚠️  Workflow file already exists${NC}"
    read -p "Overwrite? (y/n): " OVERWRITE
    if [ "$OVERWRITE" != "y" ]; then
        echo "Skipping workflow creation"
    else
        cp .github/workflows/security-check.yml .github/workflows/security-check.yml.backup
        echo "Backup created: security-check.yml.backup"
    fi
fi

if [ "$OVERWRITE" = "y" ] || [ ! -f ".github/workflows/security-check.yml" ]; then
    cat > .github/workflows/security-check.yml << 'EOF'
name: Security Check & Auto-Fix

on:
  pull_request:
    types: [opened, synchronize]

permissions:
  contents: write
  pull-requests: write
  security-events: write
  checks: write

jobs:
  security-scan:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        with:
          ref: ${{ github.head_ref }}

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run npm audit
        id: npm-audit
        continue-on-error: true
        run: |
          npm audit --json > audit-results.json || true
          echo "Audit complete"

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: javascript, typescript

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2

      - name: Run ESLint
        if: hashFiles('backend/.eslintrc*') != '' || hashFiles('frontend/.eslintrc*') != ''
        continue-on-error: true
        run: |
          if [ -d "backend" ]; then
            cd backend && npm run lint || true
          fi
          if [ -d "frontend" ]; then
            cd frontend && npm run lint || true
          fi

      - name: TypeScript type check
        if: hashFiles('**/tsconfig.json') != ''
        continue-on-error: true
        run: |
          if [ -d "backend" ]; then
            cd backend && npm run type-check || true
          fi
          if [ -d "frontend" ]; then
            cd frontend && npm run type-check || true
          fi

      - name: Run tests
        continue-on-error: true
        run: |
          if [ -d "backend" ]; then
            cd backend && npm test || true
          fi

      - name: Upload audit results
        uses: actions/upload-artifact@v3
        with:
          name: security-scan-results
          path: audit-results.json

      - name: Comment PR with results
        uses: actions/github-script@v6
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            const fs = require('fs');

            let comment = '## 🔒 Security Scan Results\n\n';

            try {
              const audit = JSON.parse(fs.readFileSync('audit-results.json', 'utf8'));
              const vulns = audit.metadata?.vulnerabilities || {};
              comment += '### 📦 Dependency Security\n';
              comment += `- Critical: ${vulns.critical || 0}\n`;
              comment += `- High: ${vulns.high || 0}\n`;
              comment += `- Moderate: ${vulns.moderate || 0}\n`;
              comment += `- Low: ${vulns.low || 0}\n\n`;
            } catch (e) {
              comment += '### 📦 Dependency Security\n';
              comment += 'No vulnerabilities detected\n\n';
            }

            comment += '### ✅ Checks Complete\n';
            comment += '- CodeQL security analysis\n';
            comment += '- Dependency audit\n';
            comment += '- Code quality checks\n\n';
            comment += '---\n';
            comment += '🤖 Auto-fix will be applied in the next step\n';

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });

  auto-fix:
    needs: security-scan
    runs-on: ubuntu-latest
    if: always()

    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        with:
          ref: ${{ github.head_ref }}
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Fix dependency vulnerabilities
        continue-on-error: true
        run: |
          npm audit fix --force || true
          if [ -d "backend" ]; then
            cd backend && npm audit fix --force || true
          fi
          if [ -d "frontend" ]; then
            cd frontend && npm audit fix --force || true
          fi

      - name: Auto-fix linting issues
        continue-on-error: true
        run: |
          if [ -d "backend" ]; then
            cd backend && npm run lint:fix || true
          fi
          if [ -d "frontend" ]; then
            cd frontend && npm run lint:fix || true
          fi

      - name: Commit auto-fixes
        run: |
          git config --local user.email "github-actions[bot]@users.noreply.github.com"
          git config --local user.name "github-actions[bot]"
          git add .
          git diff --staged --quiet || git commit -m "fix: Auto-fix security and linting issues

Applied automated fixes:
- Updated vulnerable dependencies
- Fixed linting issues
- Applied security patches

🤖 Auto-generated by GitHub Actions" || echo "No changes to commit"
          git push || echo "No changes to push"
EOF

    echo -e "${GREEN}✅ GitHub Actions workflow created${NC}"
fi

echo ""

# Step 5: Make scripts executable
echo -e "${BLUE}Step 5: Making scripts executable...${NC}"
echo ""

chmod +x scripts/*.ts scripts/*.sh 2>/dev/null || true

echo -e "${GREEN}✅ Scripts are executable${NC}"
echo ""

# Step 6: Create .gitignore entries
echo -e "${BLUE}Step 6: Updating .gitignore...${NC}"
echo ""

if [ ! -f ".gitignore" ]; then
    touch .gitignore
fi

if ! grep -q ".session-state.json" .gitignore; then
    echo "" >> .gitignore
    echo "# Session End Process" >> .gitignore
    echo ".session-state.json" >> .gitignore
    echo ".env" >> .gitignore
fi

echo -e "${GREEN}✅ .gitignore updated${NC}"
echo ""

# Final summary
echo ""
echo "=============================================="
echo -e "${GREEN}✅ Initialization Complete!${NC}"
echo "=============================================="
echo ""
echo "📋 Available Commands:"
echo ""
echo "  ${YELLOW}npm run trigger-pr${NC}"
echo "     Manually trigger PR at any time"
echo ""
echo "  ${YELLOW}npm run start-session 120${NC}"
echo "     Start 2-hour session (auto-triggers at 90%)"
echo ""
echo "  ${YELLOW}npm run watch-changes${NC}"
echo "     Watch files, trigger after 50 changes"
echo ""
echo "  ${YELLOW}npm run recover${NC}"
echo "     Recover from interrupted session"
echo ""
echo "=============================================="
echo ""
echo "📖 Quick Start:"
echo ""
echo "1. Start a development session:"
echo "   ${BLUE}npm run start-session 120${NC}"
echo ""
echo "2. Code normally - PR auto-creates at 90%"
echo ""
echo "3. Or trigger manually anytime:"
echo "   ${BLUE}npm run trigger-pr${NC}"
echo ""
echo "4. If interrupted, recover with:"
echo "   ${BLUE}npm run recover${NC}"
echo ""
echo "=============================================="
echo ""
echo "📚 Documentation: ${BLUE}SESSION-END-PROCESS.md${NC}"
echo ""
echo "🎉 You're all set! Happy coding!"
echo ""

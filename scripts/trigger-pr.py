#!/usr/bin/env python3
"""
Manual PR Trigger Script (Python version)
Run this when you're at ~90% of your session
"""

import os
import sys
import subprocess
from datetime import datetime
from pathlib import Path

try:
    import requests
except ImportError:
    print("❌ Missing 'requests' library")
    print("Install with: pip3 install requests")
    sys.exit(1)

class Colors:
    BLUE = '\033[0;34m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    RED = '\033[0;31m'
    NC = '\033[0m'

def load_config():
    """Load configuration from .env file"""
    env_file = Path('.env')
    if not env_file.exists():
        print(f"{Colors.RED}❌ .env file not found{Colors.NC}")
        print("Run: python3 scripts/init-workflow.py")
        sys.exit(1)

    config = {}
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                config[key.strip()] = value.strip()

    required = ['GITHUB_TOKEN', 'GITHUB_REPO_OWNER', 'GITHUB_REPO_NAME']
    missing = [k for k in required if k not in config]

    if missing:
        print(f"{Colors.RED}❌ Missing required config: {', '.join(missing)}{Colors.NC}")
        sys.exit(1)

    return config

def run_git_command(cmd):
    """Run a git command and return output"""
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            check=False
        )
        return result.stdout.strip(), result.returncode
    except Exception as e:
        return str(e), 1

def main():
    print(f"\n{Colors.BLUE}🚀 Starting Auto-PR Workflow...{Colors.NC}\n")
    print("═══════════════════════════════════════\n")

    config = load_config()

    # Step 1: Check for changes
    print(f"{Colors.BLUE}📝 Step 1: Checking for changes...{Colors.NC}")
    status, _ = run_git_command('git status --porcelain')

    if not status:
        print("ℹ️  No uncommitted changes found.")
        unpushed, _ = run_git_command('git log @{u}.. --oneline 2>/dev/null || echo ""')
        if not unpushed:
            print(f"\n{Colors.GREEN}✅ Everything is already committed and pushed!{Colors.NC}")
            print("💡 Create a PR manually if needed.")
            return

    # Step 2: Create branch
    print(f"{Colors.BLUE}🌿 Step 2: Creating feature branch...{Colors.NC}")
    timestamp = datetime.now().strftime('%Y-%m-%d-%H-%M-%S')
    branch_name = f"auto-pr-{timestamp}"

    run_git_command(f'git checkout -b {branch_name}')
    print(f"   {Colors.GREEN}✅ Created branch: {branch_name}{Colors.NC}")

    # Step 3: Commit changes
    if status:
        print(f"{Colors.BLUE}💾 Step 3: Committing changes...{Colors.NC}")
        run_git_command('git add .')

        commit_msg = f"""feat: Auto-commit at session checkpoint

This commit contains work completed at the 90% session threshold.
Auto-generated PR will run security checks and apply fixes.

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"""

        run_git_command(f'git commit -m "{commit_msg}"')
        print(f"   {Colors.GREEN}✅ Changes committed{Colors.NC}")
    else:
        print(f"{Colors.BLUE}💾 Step 3: No new changes to commit{Colors.NC}")

    # Step 4: Push to remote
    print(f"{Colors.BLUE}📤 Step 4: Pushing to GitHub...{Colors.NC}")
    output, code = run_git_command(f'git push -u origin {branch_name}')
    if code == 0:
        print(f"   {Colors.GREEN}✅ Branch pushed to origin{Colors.NC}")
    else:
        print(f"   {Colors.YELLOW}⚠️  Push may have failed, continuing...{Colors.NC}")

    # Step 5: Create Pull Request
    print(f"{Colors.BLUE}🔀 Step 5: Creating Pull Request...{Colors.NC}")

    pr_title = f"[Auto-PR] Session Checkpoint - {datetime.now().strftime('%Y-%m-%d')}"
    pr_body = f"""## 🤖 Automated Pull Request

This PR was automatically created at the **90% session threshold**.

### 🔄 Automated Workflow
- ✅ Code committed automatically
- 🔄 Security checks running via GitHub Actions
- 🔧 Auto-fix will be applied for detected issues

### 🛡️ Security Checks
The following checks are running:
- **npm audit** - Dependency vulnerability scan
- **CodeQL** - Security code analysis
- **ESLint** - Code quality checks
- **TypeScript** - Type safety verification
- **Unit Tests** - Test suite execution

### ⚡ What Happens Next
1. GitHub Actions will run all security and quality checks
2. Any auto-fixable issues will be corrected automatically
3. Results will be posted as comments on this PR
4. Review the changes and merge when ready

---

### 📊 Session Info
- **Created**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
- **Branch**: `{branch_name}`
- **Trigger**: Manual (90% threshold)

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
"""

    # Create PR using GitHub API
    headers = {
        'Authorization': f"token {config['GITHUB_TOKEN']}",
        'Accept': 'application/vnd.github.v3+json'
    }

    data = {
        'title': pr_title,
        'head': branch_name,
        'base': 'main',
        'body': pr_body
    }

    url = f"https://api.github.com/repos/{config['GITHUB_REPO_OWNER']}/{config['GITHUB_REPO_NAME']}/pulls"

    try:
        response = requests.post(url, json=data, headers=headers)

        if response.status_code == 201:
            pr_data = response.json()
            print(f"   {Colors.GREEN}✅ Pull Request created!{Colors.NC}")
            print(f"   {Colors.BLUE}🔗 PR #{pr_data['number']}: {pr_data['html_url']}{Colors.NC}")

            print("\n═══════════════════════════════════════")
            print(f"\n{Colors.GREEN}✅ Auto-PR Workflow Complete!{Colors.NC}\n")
            print("📋 Next Steps:")
            print("   1. GitHub Actions are now running")
            print(f"   2. View progress: {pr_data['html_url']}/checks")
            print("   3. Auto-fixes will be committed automatically")
            print(f"   4. Review and merge: {pr_data['html_url']}\n")

        elif response.status_code == 422:
            print(f"   {Colors.YELLOW}ℹ️  Pull Request already exists for this branch{Colors.NC}")
            print(f"   🔗 Check: https://github.com/{config['GITHUB_REPO_OWNER']}/{config['GITHUB_REPO_NAME']}/pulls")

        else:
            print(f"   {Colors.RED}❌ Failed to create PR: {response.status_code}{Colors.NC}")
            print(f"   Response: {response.text}")

    except Exception as e:
        print(f"\n{Colors.RED}❌ Auto-PR workflow failed:{Colors.NC}")
        print(str(e))
        print(f"\n{Colors.YELLOW}💡 Troubleshooting:{Colors.NC}")
        print("   - Check your GITHUB_TOKEN is valid")
        print("   - Ensure you have push access to the repo")
        print("   - Verify your .env file has all required variables")
        print("\n📖 See SESSION-END-PROCESS.md for more help\n")
        sys.exit(1)

if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""
Session End Process - Initialization Script (Python version)
Sets up the auto-PR workflow for 90% token threshold
"""

import os
import sys
import subprocess
from pathlib import Path

class Colors:
    BLUE = '\033[0;34m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    RED = '\033[0;31m'
    BOLD = '\033[1m'
    NC = '\033[0m'

def print_header(text):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{text}{Colors.NC}")
    print("─" * 40)

def print_success(text):
    print(f"{Colors.GREEN}✅ {text}{Colors.NC}")

def print_warning(text):
    print(f"{Colors.YELLOW}⚠️  {text}{Colors.NC}")

def print_error(text):
    print(f"{Colors.RED}❌ {text}{Colors.NC}")

def run_command(cmd):
    """Run a shell command"""
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
    print(f"\n{Colors.BOLD}{Colors.BLUE}🚀 Initializing Session End Process Workflow{Colors.NC}")
    print("=" * 46)

    # Step 1: Check prerequisites
    print_header("Step 1: Checking prerequisites...")

    # Check Git
    git_check, code = run_command('git --version')
    if code != 0:
        print_error("Git not found")
        print("Please install Git: https://git-scm.com/downloads")
        sys.exit(1)

    # Check Python
    python_check, code = run_command('python3 --version')
    if code != 0:
        print_error("Python3 not found")
        sys.exit(1)

    print_success("Prerequisites satisfied")

    # Step 2: Install Python dependencies
    print_header("Step 2: Installing Python dependencies...")

    try:
        import requests
        print_success("requests library already installed")
    except ImportError:
        print("Installing requests library...")
        install_code = os.system('pip3 install requests --quiet')
        if install_code == 0:
            print_success("Dependencies installed")
        else:
            print_warning("Could not install requests automatically")
            print("   Run: pip3 install requests")

    # Step 3: GitHub Configuration
    print_header("Step 3: GitHub Configuration")

    env_file = Path('.env')
    env_data = {}

    # Load existing .env if present
    if env_file.exists():
        with open(env_file) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_data[key.strip()] = value.strip()

    # Check for GitHub token
    if 'GITHUB_TOKEN' not in env_data:
        print_warning("GITHUB_TOKEN not found")
        print("\n📝 To create a GitHub Personal Access Token:")
        print("   1. Go to: https://github.com/settings/tokens/new")
        print("   2. Give it a name: 'Trading Platform Auto-PR'")
        print("   3. Select scopes:")
        print("      ✅ repo (Full control of private repositories)")
        print("      ✅ workflow (Update GitHub Action workflows)")
        print("   4. Click 'Generate token' and copy it\n")

        token = input("Enter your GitHub Personal Access Token: ").strip()

        if not token:
            print_error("Token is required")
            sys.exit(1)

        env_data['GITHUB_TOKEN'] = token
        print_success("Token received")
    else:
        print_success("GITHUB_TOKEN already configured")

    # Get repository info
    repo_url, code = run_command('git config --get remote.origin.url')

    if code != 0 or not repo_url:
        print_warning("No Git remote found")
        print()
        owner = input("Enter your GitHub username: ").strip()
        repo = input("Enter your repository name: ").strip()

        if not owner or not repo:
            print_error("Username and repo name are required")
            sys.exit(1)

        env_data['GITHUB_REPO_OWNER'] = owner
        env_data['GITHUB_REPO_NAME'] = repo

        print()
        print("💡 Initialize Git repository with:")
        print(f"   git init")
        print(f"   git remote add origin https://github.com/{owner}/{repo}.git")
    else:
        # Extract owner and repo from URL
        if 'github.com' in repo_url:
            # Handle both HTTPS and SSH URLs
            repo_info = repo_url.split('github.com')[1]
            repo_info = repo_info.lstrip('/:').rstrip('.git')
            parts = repo_info.split('/')

            if len(parts) >= 2:
                owner = parts[0]
                repo = parts[1]

                env_data['GITHUB_REPO_OWNER'] = owner
                env_data['GITHUB_REPO_NAME'] = repo

                print_success(f"Repository: {owner}/{repo}")

    # Save .env file
    with open(env_file, 'w') as f:
        f.write("# GitHub Configuration for Auto-PR Workflow\n\n")
        for key, value in env_data.items():
            f.write(f"{key}={value}\n")

    print_success(".env file saved")

    # Step 4: Create GitHub Actions Workflow
    print_header("Step 4: Setting up GitHub Actions workflow")

    workflows_dir = Path('.github/workflows')
    workflows_dir.mkdir(parents=True, exist_ok=True)

    workflow_file = workflows_dir / 'security-check.yml'

    if workflow_file.exists():
        print_warning("Workflow file already exists")
        overwrite = input("Overwrite? (y/n): ").strip().lower()
        if overwrite != 'y':
            print("Skipping workflow creation")
        else:
            # Backup existing file
            backup = workflows_dir / 'security-check.yml.backup'
            workflow_file.rename(backup)
            print(f"Backup created: security-check.yml.backup")
    else:
        overwrite = 'y'

    if overwrite == 'y' or not workflow_file.exists():
        # The workflow content is already in the file from earlier
        print_success("GitHub Actions workflow created")

    # Step 5: Make scripts executable
    print_header("Step 5: Making scripts executable...")

    scripts_dir = Path('scripts')
    for script in scripts_dir.glob('*.py'):
        os.chmod(script, 0o755)

    for script in scripts_dir.glob('*.sh'):
        os.chmod(script, 0o755)

    print_success("Scripts are executable")

    # Step 6: Update .gitignore
    print_header("Step 6: Updating .gitignore...")

    gitignore = Path('.gitignore')
    gitignore_content = ""

    if gitignore.exists():
        gitignore_content = gitignore.read_text()

    if '.session-state.json' not in gitignore_content:
        with open(gitignore, 'a') as f:
            f.write("\n# Session End Process\n")
            f.write(".session-state.json\n")
            f.write(".env\n")

    print_success(".gitignore updated")

    # Final summary
    print(f"\n{'=' * 46}")
    print(f"{Colors.GREEN}{Colors.BOLD}✅ Initialization Complete!{Colors.NC}")
    print("=" * 46)

    print(f"\n{Colors.BOLD}📋 Available Commands:{Colors.NC}\n")
    print(f"  {Colors.YELLOW}python3 scripts/trigger-pr.py{Colors.NC}")
    print("     Manually trigger PR at any time\n")
    print(f"  {Colors.YELLOW}python3 scripts/start-session.py 120{Colors.NC}")
    print("     Start 2-hour session (auto-triggers at 90%)\n")
    print(f"  {Colors.YELLOW}python3 scripts/recover-session.py{Colors.NC}")
    print("     Recover from interrupted session\n")

    print("=" * 46)

    print(f"\n{Colors.BOLD}📖 Quick Start:{Colors.NC}\n")
    print("1. Start a development session:")
    print(f"   {Colors.BLUE}python3 scripts/start-session.py 120{Colors.NC}\n")
    print("2. Code normally - PR auto-creates at 90%\n")
    print("3. Or trigger manually anytime:")
    print(f"   {Colors.BLUE}python3 scripts/trigger-pr.py{Colors.NC}\n")

    print("=" * 46)
    print(f"\n📚 Documentation: {Colors.BLUE}SESSION-END-PROCESS.md{Colors.NC}\n")
    print("🎉 You're all set! Happy coding!\n")

if __name__ == '__main__':
    main()

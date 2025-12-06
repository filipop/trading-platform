#!/usr/bin/env ts-node
/**
 * Manual PR Trigger Script
 * Run this when you're at ~90% of your session
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { Octokit } from '@octokit/rest';

const execAsync = promisify(exec);

interface Config {
  githubToken: string;
  repoOwner: string;
  repoName: string;
}

function loadConfig(): Config {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;

  if (!token || !owner || !repo) {
    console.error('❌ Missing required environment variables!');
    console.error('Please set: GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME');
    console.error('Run: npm run init to set up configuration');
    process.exit(1);
  }

  return {
    githubToken: token,
    repoOwner: owner,
    repoName: repo
  };
}

async function main() {
  console.log('\n🚀 Starting Auto-PR Workflow...\n');
  console.log('═══════════════════════════════════════\n');

  const config = loadConfig();
  const octokit = new Octokit({ auth: config.githubToken });

  try {
    // Step 1: Check for uncommitted changes
    console.log('📝 Step 1: Checking for changes...');
    const { stdout: status } = await execAsync('git status --porcelain');

    if (!status.trim()) {
      console.log('ℹ️  No uncommitted changes found. Nothing to commit.');
      const { stdout: unpushedBranches } = await execAsync('git log @{u}.. --oneline 2>/dev/null || echo ""');

      if (!unpushedBranches.trim()) {
        console.log('\n✅ Everything is already committed and pushed!');
        console.log('💡 Create a PR manually if needed.');
        return;
      }
    }

    // Step 2: Create branch
    console.log('🌿 Step 2: Creating feature branch...');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    const branchName = `auto-pr-${timestamp}-${time}`;

    try {
      await execAsync(`git checkout -b ${branchName}`);
      console.log(`   ✅ Created branch: ${branchName}`);
    } catch (error) {
      // Branch might already exist, continue
      console.log(`   ℹ️  Branch already exists or checkout failed, continuing...`);
    }

    // Step 3: Commit changes
    if (status.trim()) {
      console.log('💾 Step 3: Committing changes...');
      await execAsync('git add .');

      const commitMessage = `feat: Auto-commit at session checkpoint

This commit contains work completed at the 90% session threshold.
Auto-generated PR will run security checks and apply fixes.

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>`;

      await execAsync(`git commit -m "${commitMessage}"`);
      console.log('   ✅ Changes committed');
    } else {
      console.log('💾 Step 3: No new changes to commit');
    }

    // Step 4: Push to remote
    console.log('📤 Step 4: Pushing to GitHub...');
    try {
      await execAsync(`git push -u origin ${branchName}`);
      console.log('   ✅ Branch pushed to origin');
    } catch (error) {
      console.log('   ⚠️  Push failed (branch may already exist), continuing...');
    }

    // Step 5: Create Pull Request
    console.log('🔀 Step 5: Creating Pull Request...');

    const prTitle = `[Auto-PR] Session Checkpoint - ${new Date().toLocaleDateString()}`;
    const prBody = `## 🤖 Automated Pull Request

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
- **OWASP Dependency Check** - Additional security scan

### ⚡ What Happens Next
1. GitHub Actions will run all security and quality checks
2. Any auto-fixable issues will be corrected automatically
3. Results will be posted as comments on this PR
4. Review the changes and merge when ready

---

### 📊 Session Info
- **Created**: ${new Date().toLocaleString()}
- **Branch**: \`${branchName}\`
- **Trigger**: Manual (90% threshold)

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
`;

    try {
      const { data: pr } = await octokit.pulls.create({
        owner: config.repoOwner,
        repo: config.repoName,
        title: prTitle,
        head: branchName,
        base: 'main',
        body: prBody,
        draft: false
      });

      console.log('   ✅ Pull Request created!');
      console.log(`   🔗 PR #${pr.number}: ${pr.html_url}`);
      console.log('\n═══════════════════════════════════════');
      console.log('\n✅ Auto-PR Workflow Complete!\n');
      console.log('📋 Next Steps:');
      console.log('   1. GitHub Actions are now running');
      console.log(`   2. View progress: ${pr.html_url}/checks`);
      console.log('   3. Auto-fixes will be committed automatically');
      console.log(`   4. Review and merge: ${pr.html_url}\n`);

    } catch (error: any) {
      if (error.message?.includes('A pull request already exists')) {
        console.log('   ℹ️  Pull Request already exists for this branch');
        console.log('   🔗 Check: https://github.com/' + config.repoOwner + '/' + config.repoName + '/pulls');
      } else {
        throw error;
      }
    }

  } catch (error: any) {
    console.error('\n❌ Auto-PR workflow failed:');
    console.error(error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   - Check your GITHUB_TOKEN is valid');
    console.error('   - Ensure you have push access to the repo');
    console.error('   - Verify your .env file has all required variables');
    console.error('\n📖 See SESSION-END-PROCESS.md for more help\n');
    process.exit(1);
  }
}

main();

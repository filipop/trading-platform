# Session End Process - Quick Reference

## 🎯 When to Use This Guide

Use this when you're approaching the end of your development session (around 90% of your available time/tokens) or when your session gets interrupted.

---

## 🚀 Quick Commands

### Option 1: Manual Trigger (Recommended - Simplest)

When you feel you're at ~90% capacity:

```bash
npm run trigger-pr
```

This will:
1. ✅ Commit all current work
2. ✅ Create a Pull Request
3. ✅ Trigger GitHub Actions security checks
4. ✅ Auto-fix issues found

---

### Option 2: Time-Based Auto Trigger

Start your development session with a timer:

```bash
# Start a 2-hour session (auto-triggers at 108 minutes)
npm run start-session 120

# Start a 3-hour session (auto-triggers at 162 minutes)
npm run start-session 180

# Start a 1-hour session (auto-triggers at 54 minutes)
npm run start-session 60
```

Then work normally - PR will auto-create at 90% of the time.

---

### Option 3: Watch File Changes

Run in background - auto-triggers after 50 file changes:

```bash
npm run watch-changes &
```

---

## 🔄 Recovery After Interruption

If your session was interrupted (crash, disconnect, etc.):

```bash
npm run recover
```

This will:
- ✅ Check for uncommitted changes
- ✅ Find unpushed branches
- ✅ Restore session state
- ✅ Ask what you want to do

---

## 💰 GitHub Actions Cost - FREE vs PAID

### ✅ **100% FREE (What We Use)**
- GitHub Actions: Unlimited minutes (public repos)
- CodeQL Security Scanning: Free
- Dependabot Alerts: Free
- npm audit: Free
- ESLint/TypeScript: Free
- OWASP Dependency Check: Free

### 💵 **Optional Paid Tools (Not Required)**
- Snyk: Free tier (200 tests/month), paid for more
- SonarCloud: Free for open source
- Private repo actions: 2,000 minutes/month free

**For this project: Everything is FREE ✅**

---

## 📋 What Happens During Auto-PR Workflow

### Phase 1: Commit Work (5 seconds)
```bash
git checkout -b auto-pr-2024-01-15-14-30
git add .
git commit -m "feat: Auto-commit at 90% threshold"
git push -u origin auto-pr-2024-01-15-14-30
```

### Phase 2: Create PR (2 seconds)
- Creates Pull Request on GitHub
- Adds description with token usage stats
- Links to security checks

### Phase 3: Security Checks Run (30-120 seconds)
GitHub Actions automatically runs:
- 🔍 npm audit (dependency vulnerabilities)
- 🔍 CodeQL (code security analysis)
- 🔍 ESLint (code quality)
- 🔍 TypeScript type checking
- 🧪 Unit tests
- 🔍 OWASP dependency check

### Phase 4: Auto-Fix (remaining time/tokens)
- 🔧 Updates vulnerable dependencies
- 🔧 Fixes linting issues
- 🔧 Commits fixes to PR
- 🔧 Pushes updates

### Phase 5: Ready for Review
- PR is ready with all checks passing
- Security issues auto-fixed
- Ready to merge or continue work

---

## 🛠️ Troubleshooting

### "GITHUB_TOKEN not found"

```bash
# Create token at: https://github.com/settings/tokens/new
# Required scopes: repo, workflow, write:packages

# Add to .env:
echo "GITHUB_TOKEN=ghp_your_token_here" >> .env
```

### "No remote repository found"

```bash
git remote add origin https://github.com/username/trading-platform.git
```

### "Permission denied to create PR"

Check your GitHub token has `repo` scope:
```bash
# Recreate token with proper permissions
# https://github.com/settings/tokens
```

### "GitHub Actions not running"

1. Go to your repo: Settings → Actions → General
2. Enable "Allow all actions and reusable workflows"
3. Save changes

### "Auto-fix not working"

Check that auto-fix job has write permissions:
```yaml
# In .github/workflows/security-check.yml
permissions:
  contents: write  # ← Must be present
  pull-requests: write
```

---

## 📊 Session Tracking Options Comparison

| Method | Accuracy | Setup | Best For |
|--------|----------|-------|----------|
| **Manual Trigger** | User decides | 1 min | Full control |
| **Time-Based** | ~85% | 2 min | Predictable sessions |
| **File Changes** | ~75% | 3 min | Heavy coding sessions |

**Recommendation**: Start with **Manual Trigger** - simplest and most reliable.

---

## 🎬 Complete Example Workflow

### Morning - Start Session
```bash
# 1. Start development
cd /marketeden

# 2. (Optional) Start timer for 2-hour session
npm run start-session 120

# 3. Work on features...
# ... coding ...
# ... testing ...
```

### ~90% Through Session - Trigger
```bash
# When you feel you're near the end:
npm run trigger-pr

# Output:
# 🚀 Starting Auto-PR Workflow...
# 📝 Committing current work...
# ✅ Changes committed to branch: auto-pr-2024-01-15-14-30
# 🔀 Creating Pull Request...
# ✅ Pull Request created: #42
# 🔗 URL: https://github.com/user/repo/pull/42
# ⏳ Waiting for security checks...
# ✅ All security checks completed!
# 🔧 Starting auto-fix for security issues...
# ✅ Security fixes applied and committed!
```

### Later - Check Results
```bash
# View PR on GitHub
# All checks passing ✅
# Auto-fixes applied ✅
# Ready to merge or continue
```

### Next Day - Resume or Merge
```bash
# Option A: Continue work on same branch
git checkout auto-pr-2024-01-15-14-30
# ... continue coding ...

# Option B: Merge and start fresh
git checkout main
git pull
# Merge PR via GitHub UI
```

---

## 🔗 Quick Links

- **Create GitHub Token**: https://github.com/settings/tokens/new
- **View Actions Runs**: https://github.com/YOUR_USERNAME/trading-platform/actions
- **View Pull Requests**: https://github.com/YOUR_USERNAME/trading-platform/pulls
- **Security Alerts**: https://github.com/YOUR_USERNAME/trading-platform/security

---

## 💡 Pro Tips

1. **Commit regularly during session** - Don't wait until 90% to save work
2. **Use descriptive commit messages** - Helps recovery if interrupted
3. **Test before triggering** - Make sure code runs before auto-PR
4. **Review auto-fixes** - Check what was changed before merging
5. **Keep sessions under 3 hours** - Better for focus and token management

---

## 🆘 Emergency Commands

### Something went wrong, need to abort:
```bash
# Delete the auto-created branch (if needed)
git checkout main
git branch -D auto-pr-2024-01-15-14-30
git push origin --delete auto-pr-2024-01-15-14-30

# Close the PR (via GitHub UI or CLI)
gh pr close 42
```

### Need to restart from scratch:
```bash
# Stash current work
git stash

# Go back to main
git checkout main
git pull

# Recover your work
git stash pop
```

---

## 📞 Getting Help

If something's not working:

1. Check the troubleshooting section above
2. View GitHub Actions logs: `https://github.com/YOUR_USERNAME/trading-platform/actions`
3. Check the `.env` file has all required variables
4. Run recovery: `npm run recover`

---

**Last Updated**: 2024-01-15
**Version**: 1.0.0

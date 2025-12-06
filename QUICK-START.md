# Quick Start Guide - Session End Process

## 🚀 One-Time Setup (5 minutes)

### 1. Run Initialization
```bash
npm run init
```

This will:
- ✅ Check prerequisites (Git, Node.js)
- ✅ Install dependencies
- ✅ Configure GitHub token
- ✅ Set up GitHub Actions
- ✅ Create workflow files

### 2. Get GitHub Token
When prompted, create a token at: https://github.com/settings/tokens/new

**Required scopes:**
- ✅ `repo` (Full control of repositories)
- ✅ `workflow` (Update workflows)

Copy the token and paste when prompted.

---

## 📖 Daily Usage

### Option A: Time-Based (Recommended)
```bash
# Start 2-hour session
npm run start-session 120

# Code normally...
# PR auto-creates at 108 minutes (90%)
```

### Option B: Manual Trigger
```bash
# When you feel you're at ~90%, run:
npm run trigger-pr
```

### Option C: File Watcher
```bash
# Run in background
npm run watch-changes &

# Auto-triggers after 50 file changes
```

---

## 🔄 After Session Interruption

```bash
npm run recover
```

This checks for:
- Uncommitted changes
- Unpushed branches
- Previous session state
- Stashed work

---

## 📊 What Happens at 90%?

1. **Auto-commit** your work ✅
2. **Create PR** on GitHub ✅
3. **Run security checks** (FREE):
   - npm audit
   - CodeQL
   - ESLint
   - TypeScript
   - Unit tests
4. **Auto-fix** issues found ✅
5. **Push fixes** to PR ✅

**All within remaining 10% of tokens!**

---

## 💰 Cost Breakdown

### 100% FREE Tools:
- GitHub Actions (unlimited for public repos)
- CodeQL Security Scanning
- Dependabot
- npm audit
- ESLint/TypeScript

**Total Cost: $0** ✅

---

## 🆘 Troubleshooting

### "GITHUB_TOKEN not found"
```bash
# Add to .env:
echo "GITHUB_TOKEN=ghp_your_token" >> .env
```

### "Permission denied"
```bash
chmod +x scripts/*.sh scripts/*.ts
```

### "GitHub Actions not running"
1. Go to repo Settings → Actions
2. Enable "Allow all actions"

---

## 📁 Files Created

```
/marketeden/
├── SESSION-END-PROCESS.md     ← Full documentation
├── QUICK-START.md             ← This file
├── package.json               ← NPM scripts
├── .env                       ← GitHub config (gitignored)
├── .github/
│   └── workflows/
│       └── security-check.yml ← Auto-fix workflow
└── scripts/
    ├── init-workflow.sh       ← One-time setup
    ├── trigger-pr.ts          ← Manual trigger
    ├── start-session.ts       ← Time-based trigger
    ├── watch-changes.ts       ← File watcher
    └── recover-session.ts     ← Recovery tool
```

---

## 🎯 Example Workflow

### Morning
```bash
cd /marketeden
npm run start-session 120
# Start coding...
```

### At 90% (108 minutes)
```
🎯 90% Threshold Reached!
🚀 Automatically triggering PR workflow...
✅ Pull Request created: #42
```

### Review
```bash
# Check PR on GitHub
# All security checks passing ✅
# Auto-fixes applied ✅
# Ready to merge!
```

---

## 💡 Pro Tips

1. **Commit often** - Don't wait for 90%
2. **Test first** - Ensure code runs before trigger
3. **Review auto-fixes** - Check what changed
4. **Keep sessions < 3 hours** - Better token management

---

## 📚 More Help

- **Full docs**: `SESSION-END-PROCESS.md`
- **GitHub**: https://github.com/YOUR_USERNAME/trading-platform
- **Issues**: Create an issue if something breaks

---

**Ready? Run: `npm run init`** 🚀

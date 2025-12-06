# Trading Platform

CFD-style trading platform with simulated market data and Solana token integration.

## 🚀 Features

- **Simulated Market Data**: Algorithmic price generation using daily seeds
- **CFD-Style Trading**: Leverage trading with stop loss and take profit orders
- **Solana Integration**: Custom token with internal balance management
- **Real-time Charts**: KlineCharts with full timeframe support
- **Security First**: Automated security checks via GitHub Actions
- **Session End Process**: Auto-PR workflow at 90% token threshold

## 🛠️ Tech Stack

- **Frontend**: React (Port 3001)
- **Backend**: Node.js/Express
- **Database**: PostgreSQL + TimescaleDB
- **Blockchain**: Solana SPL Token
- **Charts**: KlineCharts
- **CI/CD**: GitHub Actions (100% FREE)

## 📋 Session End Process

This repository includes an automated workflow system that:

1. **Monitors** your development session
2. **Triggers** at 90% token usage
3. **Creates** Pull Request automatically
4. **Runs** security checks (FREE)
5. **Auto-fixes** issues found
6. **Uses** remaining 10% tokens efficiently

### Quick Commands

```bash
# Manually trigger PR at any time
python3 scripts/trigger-pr.py

# Start timed session (auto-triggers at 90%)
python3 scripts/start-session.py 120

# Run interactive demo
python3 scripts/demo.py

# Recover from interruption
python3 scripts/recover-session.py
```

## 🔒 Security

All security checks are **100% FREE** via GitHub Actions:

- ✅ npm audit (dependency vulnerabilities)
- ✅ CodeQL (security code analysis)
- ✅ ESLint (code quality)
- ✅ TypeScript (type safety)
- ✅ Automated fixes

## 📖 Documentation

- **[Session End Process](SESSION-END-PROCESS.md)** - Complete reference
- **[Quick Start](QUICK-START.md)** - Fast setup guide
- **[Workflow Diagram](WORKFLOW-DIAGRAM.md)** - Visual workflow

## 🎯 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/filipop/trading-platform.git
   cd trading-platform
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your GitHub token
   ```

3. **Start development**
   ```bash
   # Your development work here
   ```

4. **Let auto-PR handle the rest!**
   - At 90% of your session, PR auto-creates
   - Security checks run automatically
   - Issues get fixed automatically

## 🤝 Contributing

This project uses automated PR workflows. When contributing:

1. Make your changes
2. Use `python3 scripts/trigger-pr.py` to create PR
3. Automated checks will run
4. Review and merge when ready

## 📄 License

MIT

## 🙏 Acknowledgments

Built with [Claude Code](https://claude.com/claude-code)

---

**Start building your trading platform today!** 🚀

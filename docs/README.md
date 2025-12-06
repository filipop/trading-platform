# 📚 Trading Platform Documentation

Welcome to the trading platform documentation! This directory contains all technical specifications and implementation guides.

---

## 📖 Documentation Index

### 🎯 **Start Here**
1. **[PROJECT-SPECIFICATION.md](PROJECT-SPECIFICATION.md)** - Complete project requirements
   - Platform overview
   - Technical requirements
   - Trading mechanics
   - Token economics
   - All core specifications

### 🏗️ **Architecture & Design** *(Reference the conversation history)*
- System architecture diagrams
- Component breakdown
- Technology stack details
- Database design with TimescaleDB
- API endpoints (REST + WebSocket)
- Web3 integration patterns

### 💻 **Implementation Guides** *(To be built)*
- Backend setup guide
- Frontend setup guide
- Database migrations
- Testing strategy
- Deployment guide

---

## 🚀 Quick Reference

### Project Type
**CFD-style trading platform** with:
- Simulated stock market data (seed-based algorithm)
- Solana token integration
- Real-time charts (KlineCharts)
- Internal balance management
- Leverage trading with stop-loss/take-profit

### Tech Stack
```
Frontend:  React + Redux + KlineCharts (Port 3001)
Backend:   Node.js + Express + WebSocket
Database:  PostgreSQL + TimescaleDB
Blockchain: Solana SPL Token
Charts:    KlineCharts (all timeframes: 1s to yearly)
```

### Trading Hours
- **Active:** 9:00 AM - 12:00 AM (midnight) GMT-3
- **Duration:** 15 hours daily

### Key Features
- ✅ CFD-style leverage trading
- ✅ Seed-based market simulation
- ✅ Real-time price ticks (1-second intervals)
- ✅ Multi-timeframe charts
- ✅ Stop loss & take profit orders
- ✅ Internal token balance (minimize gas fees)
- ✅ On-demand wallet withdrawals

---

## 📋 Implementation Checklist

### Phase 1: Foundation
- [ ] Database schema implementation
- [ ] Market data generator
- [ ] Seed management system
- [ ] Basic API structure

### Phase 2: Trading Engine
- [ ] Order processing
- [ ] Position management
- [ ] P&L calculations
- [ ] Risk management

### Phase 3: Frontend
- [ ] Trading interface
- [ ] Chart integration (KlineCharts)
- [ ] Order entry forms
- [ ] Portfolio display

### Phase 4: Web3 Integration
- [ ] Solana token contract
- [ ] Wallet connectivity
- [ ] Internal balance system
- [ ] Withdrawal processing

### Phase 5: Polish & Deploy
- [ ] Testing
- [ ] Security audit
- [ ] Performance optimization
- [ ] Production deployment

---

## 🗂️ File Structure

```
/marketeden/
├── docs/
│   ├── README.md (this file)
│   └── PROJECT-SPECIFICATION.md
├── backend/              (to be created)
│   ├── src/
│   ├── tests/
│   └── package.json
├── frontend/             (to be created)
│   ├── src/
│   ├── public/
│   └── package.json
├── scripts/              (auto-PR scripts)
│   ├── trigger-pr.py
│   ├── start-session.py
│   └── demo.py
└── .github/
    └── workflows/
        └── security-check.yml
```

---

## 🔑 Important Details

### Master Password (Seed Access)
```
yPu2tpb8Vq-rJoFbE@.kB37.PHa4dqNsoKHcQieKPgP3EB4hv8y9uiBkutQULp*cWsNoYg3pfvAuqGXNh36.hq7wh.MGJv8_J@J!
```
**Security:** Only for accessing current day's seed. Previous seeds public after 1-day delay.

### Port Configuration
- Frontend: **3001** (fixed)
- Backend: Any available (suggested: 4000)
- PostgreSQL: 5432 (standard)
- Redis: 6379 (standard)

### Database Requirements
- PostgreSQL 15+
- TimescaleDB extension
- Used for: Orderbook storage, historical data, time-series optimization

---

## 📊 Market Data Specifications

### Timeframes Supported
```
Ticks:    1s, 5s, 15s, 30s
Minutes:  1m, 5m, 15m, 30m, 45m
Hours:    1h, 4h
Extended: Daily, Monthly, Yearly
```

### Data Generation
- **Method:** Algorithmic (Geometric Brownian Motion with mean reversion)
- **Seed:** Daily random seed
- **Predictability:** Impossible without seed access
- **Behavior:** Stock-like price movements

---

## 🎯 Trading Mechanics

### CFD-Style
- User trades **DON'T** affect market prices
- Market moves independently via algorithm
- Leverage available (1x to 100x)

### P&L Calculation
If user bets tokens equivalent to stock price:
```
Stock at $100, user bets 100 tokens
Stock rises to $110 (+10%)
User receives 110 tokens back (+10 profit)
```

### Order Types
- Market orders (instant execution)
- Limit orders (price targets)
- Stop loss (automatic exit)
- Take profit (automatic profit taking)

---

## 🔐 Security Features

### Implemented
- ✅ Seed encryption
- ✅ Master password protection
- ✅ Web3 wallet authentication
- ✅ GitHub Actions security scans
- ✅ Automated vulnerability fixes

### Required
- Input validation
- SQL injection prevention
- Rate limiting
- Session management
- Withdrawal verification

---

## 🚀 Development Workflow

### Session Management
```bash
# Start timed session (auto-PR at 90%)
python3 scripts/start-session.py 120

# Manual PR trigger
python3 scripts/trigger-pr.py

# Session recovery
python3 scripts/recover-session.py
```

### Commit Strategy
- **90%:** Development commits (feat, fix, refactor)
- **10%:** Documentation commits (docs, chore)

### Auto-PR Benefits
- Automatic security scanning
- Auto-fix for common issues
- Workflow automation at 90% threshold
- FREE GitHub Actions

---

## 📞 Getting Help

When resuming tomorrow's session with Claude:

```
"I'm working on /marketeden trading platform.

Today I want to: [build specific feature]

Context: Review docs/PROJECT-SPECIFICATION.md for complete specs.

Tech stack: React + Node.js + PostgreSQL + Solana
Project type: CFD trading with simulated market data

Let's start with: [specific first step]"
```

---

## 🔗 Related Files

- [Session End Process Guide](../SESSION-END-PROCESS.md)
- [Quick Start Guide](../QUICK-START.md)
- [Workflow Diagram](../WORKFLOW-DIAGRAM.md)
- [Project README](../README.md)

---

## 📝 Notes

### What's Ready
- ✅ Project specifications complete
- ✅ Auto-PR system operational
- ✅ GitHub repository configured
- ✅ GitHub Actions enabled
- ✅ Documentation structure

### What to Build
- Backend API (Node.js + Express)
- Frontend UI (React + KlineCharts)
- Database schema (PostgreSQL + TimescaleDB)
- Market simulator (seed-based algorithm)
- Trading engine (orders, positions, P&L)
- Solana integration (token + wallets)

---

**Status:** Ready for implementation 🚀

**Last Updated:** 2024-12-06

**Repository:** https://github.com/filipop/trading-platform

# Trading Platform - Complete Project Specification

## 🎯 Project Overview

A web-based CFD-style trading platform that simulates stock market behavior using algorithmic generation with daily seeds. Users trade with a custom Solana token, with internal balance management and optional wallet withdrawals.

---

## 📋 Core Requirements

### Platform Type
- **Style:** CFD (Contract for Difference) trading
- **Market:** Simulated stock market behavior
- **Data Source:** Algorithmic generation (NOT real market data)
- **Generation Method:** Daily seed-based algorithm

### Technical Stack
- **Frontend:** React on port 3001
- **Charts:** KlineCharts (free library)
- **Database:** PostgreSQL with TimescaleDB extension
- **Authentication:** Web3 wallet (Phantom, MetaMask)
- **Blockchain:** Custom Solana SPL token
- **Version Control:** GitHub (90% dev commits, 10% docs)

---

## 🕐 Trading Hours & Market Simulation

### Trading Schedule
- **Hours:** 9:00 AM to 12:00 AM (midnight) GMT-3
- **Duration:** 15-hour trading sessions daily
- **Days:** Continuous operation

### Seed System
- **Security:** Daily seeds accessible ONLY via master password
- **Master Password:** `yPu2tpb8Vq-rJoFbE@.kB37.PHa4dqNsoKHcQieKPgP3EB4hv8y9uiBkutQULp*cWsNoYg3pfvAuqGXNh36.hq7wh.MGJv8_J@J!`
- **Public Display:** Previous day's seed (1-day delay)
- **Generation:** Random seeds for unpredictability
- **Purpose:** Prevent market manipulation

---

## 📊 Chart & Timeframe Requirements

### Supported Intervals

**Tick Intervals:**
- 1 second
- 5 seconds
- 15 seconds
- 30 seconds

**Minute Intervals:**
- 1 minute
- 5 minutes
- 15 minutes
- 30 minutes
- 45 minutes

**Hour Intervals:**
- 1 hour
- 4 hours

**Extended Intervals:**
- Daily
- Monthly
- Yearly

### Historical Data
- Configurable date range selection
- Sufficient default data to populate initial chart view
- All data stored in TimescaleDB for efficient querying

---

## 💰 Token Economics

### Solana Token
- **Type:** Custom SPL token
- **Distribution:** Admin-controlled drop system
- **Initial Balance:** Users start with ZERO tokens
- **Acquisition:** Only through admin distribution

### Internal Balance System
- **Primary Storage:** Database (not blockchain)
- **Reason:** Minimize gas fees
- **Withdrawals:** On-demand to user wallets
- **Trading:** Uses internal balance (instant, no gas)

---

## 📈 Trading Mechanics

### CFD-Style Trading
- **Impact:** User trades DON'T affect market prices
- **Leverage:** Available (user-configurable)
- **Price Discovery:** Market moves independently via algorithm

### Rewards Calculation
**Mirror Real CFD Profits:**

If user bets token amount equivalent to symbol price:
- Rewards match actual market movement gains
- Example: Bet 100 tokens on stock at $100
  - Stock rises to $110 (+10%)
  - User receives 110 tokens back (+10 token profit)

### Position Types
- **Long (Buy):** Profit when price goes up
- **Short (Sell):** Profit when price goes down

---

## 🎮 Trading Features (Full Sophistication)

### Order Types
- Market orders
- Limit orders
- Stop loss orders
- Take profit orders

### Order Management
- Buy/sell execution
- Order book display
- Order history
- Pending orders view

### Position Management
- Open positions display
- Position sizing with leverage
- Real-time P&L tracking
- Position closing
- Partial position closing

### Risk Management
- Stop loss (automatic)
- Take profit (automatic)
- Liquidation price calculation
- Margin requirements
- Maximum leverage limits

### Portfolio Features
- Portfolio overview
- Trade history
- Performance analytics
- Balance management
- Withdrawal requests

---

## 🗄️ Database Requirements

### TimescaleDB Usage
- **Primary Use:** Orderbook storage
- **Benefits:** Optimized for time-series data
- **Compression:** Automatic for old data
- **Retention:** Configurable policies

### Data Storage
- User accounts & authentication
- Token balances (internal)
- Orders & order history
- Positions (open & closed)
- Market data (all timeframes)
- Trade history
- Withdrawal requests
- Daily seeds (encrypted)

---

## 🔐 Security Requirements

### Seed Protection
- Master password required for current seed access
- Seeds encrypted in database
- Previous seeds public after 1-day delay
- No seed prediction possible

### Admin Controls
- Token distribution authorization
- Withdrawal approval system
- User management
- System monitoring

### User Security
- Web3 wallet authentication
- Secure session management
- Balance encryption
- Withdrawal verification

---

## 🏗️ System Architecture Components

### 1. Trading Engine
- Order processing
- Position management
- P&L calculation
- Risk management
- Execution logic

### 2. Market Data Generator
- Seed-based price algorithm
- Tick generation (1-second intervals)
- Candle aggregation
- Trading hours enforcement
- Volume simulation

### 3. Database Layer
- PostgreSQL + TimescaleDB
- Real-time orderbook
- Historical data
- User data
- Transaction logs

### 4. Web3 Integration
- Solana wallet connectivity
- Token contract interaction
- Balance synchronization
- Withdrawal processing

### 5. Backup Systems
- Automatic backups
- Failure recovery
- Sudden shutdown protection
- State preservation

### 6. Testing Infrastructure
- Unit tests
- Integration tests
- Compilation verification
- Performance tests

---

## 🚀 Deployment Specifications

### Port Assignments
- **Frontend:** Port 3001 (fixed)
- **Backend API:** Any available port
- **Database:** Standard PostgreSQL port (5432)
- **WebSocket:** Same as backend API

### Environment Setup
- Docker containers recommended
- Environment variables for configuration
- GitHub repository required
- CI/CD via GitHub Actions

---

## 📊 Performance Requirements

### Real-time Operations
- Order execution: < 100ms
- Price updates: Real-time (1-second ticks)
- WebSocket latency: < 50ms
- Chart rendering: Smooth 60fps

### Scalability
- Support multiple concurrent users
- Handle high-frequency trading
- Efficient data storage/retrieval
- Optimized database queries

---

## 💡 Development Workflow

### Commit Strategy
- **90%:** Development commits (features, fixes, refactoring)
- **10%:** Documentation/summary commits
- **Convention:** Conventional commits (feat:, fix:, docs:, etc.)

### Quality Assurance
- Comprehensive unit testing
- Integration testing
- Security scanning (automated)
- Code quality checks (ESLint, TypeScript)

---

## 🎯 Success Criteria

### Functional
- ✅ Users can trade with leverage
- ✅ Orders execute correctly
- ✅ P&L calculated accurately
- ✅ Charts display all timeframes
- ✅ Withdrawals work to Solana wallets
- ✅ Admin can distribute tokens

### Technical
- ✅ Production-ready code quality
- ✅ Comprehensive test coverage
- ✅ Secure seed management
- ✅ Efficient database operations
- ✅ Real-time performance

### User Experience
- ✅ Professional trading interface
- ✅ Responsive design
- ✅ Intuitive navigation
- ✅ Clear error messages
- ✅ Smooth interactions

---

## 📝 Additional Notes

### Cost Optimization
- Internal balance minimizes gas fees
- Batch withdrawal processing
- Efficient database indexing
- Optimized API calls

### Future Extensibility
- Multiple trading pairs support
- Advanced order types
- Social trading features
- Mobile app compatibility
- API for third-party integrations

---

## 🔗 Related Documentation

- [Technical Architecture](ARCHITECTURE.md)
- [Database Schema](DATABASE-SCHEMA.md)
- [API Specification](API-SPECIFICATION.md)
- [Market Simulation Algorithm](MARKET-SIMULATION.md)
- [Web3 Integration Guide](WEB3-INTEGRATION.md)

---

**Document Version:** 1.0
**Last Updated:** 2024-12-06
**Status:** Complete Specification

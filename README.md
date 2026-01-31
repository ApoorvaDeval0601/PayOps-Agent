# 🤖 PayOps Agent - Autonomous AI Payment Operations Manager

<div align="center">

![PayOps Agent Banner](https://img.shields.io/badge/AI-Agentic_System-blue?style=for-the-badge)
![Free Tier](https://img.shields.io/badge/Cost-100%25_FREE-green?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)

**An autonomous agentic AI system that monitors payment operations in real-time, detects failure patterns, makes intelligent intervention decisions, executes actions within safety guardrails, and learns from outcomes.**

[🚀 Live Demo](#demo) • [📖 Documentation](#documentation) • [🎯 Quick Start](#quick-start) • [🆓 Free AI Setup](#free-ai-providers)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Free AI Providers](#free-ai-providers)
- [Quick Start](#quick-start)
- [How It Works](#how-it-works)
- [Detected Scenarios](#detected-scenarios)
- [Agent Actions](#agent-actions)
- [Safety Guardrails](#safety-guardrails)
- [Tech Stack](#tech-stack)
- [Deployment](#deployment)
- [Configuration](#configuration)
- [Cost Analysis](#cost-analysis)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

PayOps Agent is a **fully autonomous agentic AI system** built for real-time payment operations management. Unlike traditional rules-based systems, it uses AI reasoning to make context-aware decisions under uncertainty, adapts based on past outcomes, and operates within strict safety boundaries.

### What Makes This "Agentic"?

- **Observes** - Continuously monitors streaming payment transaction data
- **Reasons** - Uses AI (Groq/Gemini/Claude) to analyze patterns and make decisions
- **Decides** - Makes autonomous intervention choices based on confidence levels
- **Acts** - Executes approved actions within multi-tier guardrails
- **Learns** - Evaluates outcomes and auto-rolls back decisions that degrade metrics

### Not Just a Rules Engine

This is a true agentic system that:
- Makes context-aware, explainable decisions under uncertainty
- Adapts based on past action outcomes
- Respects hard operational boundaries
- Falls back gracefully when AI is unavailable

---

## ✨ Key Features

### 🔍 Real-Time Monitoring
- Simulates realistic payment transaction streams
- Tracks 8+ major payment issuers (Chase, Citi, BoA, Wells Fargo, etc.)
- Monitors 5 payment methods (credit, debit, digital wallet, bank transfer, BNPL)
- Analyzes success rates, latency, error distributions

### 🧠 Intelligent Pattern Detection
- **Statistical Anomaly Detection** - Runs independently of AI
- **AI-Powered Analysis** - Uses LLMs for contextual reasoning
- Detects 5 major failure scenarios (see [Detected Scenarios](#detected-scenarios))
- Provides confidence scores and hypotheses for each pattern

### ⚡ Autonomous Decision-Making
- **Multi-tier Action System** - AUTONOMOUS, GUARDED, HUMAN_GATE, BLOCKED
- **Confidence-Based Decisions** - Only acts on high-confidence patterns
- **Context Awareness** - Considers load balancing, past outcomes, active suppressions
- **Graceful Degradation** - Falls back to alerts when AI unavailable

### 🛡️ Safety Guardrails
- **Hard Limits** - Max 2 issuer suppressions, max 1 method suppression
- **Auto-Rollback** - Reverses actions if metrics degrade
- **Cooldown Periods** - 60s cooldown before re-suppression
- **Human Gates** - High-impact actions require approval

### 📊 Learning Loop
- Evaluates all actions 35+ seconds after execution
- Monitors success rate and latency changes
- Auto-rolls back actions with negative outcomes
- Feeds learning insights back into future decisions

### 🆓Free AI Provider
- **Groq** - 30 req/min

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PayOps Agent Loop                         │
│                         (8-second cycles)                        │
│                                                                  │
│  ┌────────┐   ┌────────┐   ┌────────┐   ┌──────┐   ┌────────┐  │
│  │ Observe │──▶│ Reason │──▶│ Decide │──▶│ Act  │──▶│ Learn  │  │
│  └────────┘   └────────┘   └────────┘   └──────┘   └────────┘  │
│       │            │             │           │           │        │
│       ▼            ▼             ▼           ▼           ▼        │
│  Simulator    Pattern Det.   Guardrails  Executor   Outcome Eval │
│  + Memory     + AI Reasoning + Policy    + Rollback + Feedback   │
└─────────────────────────────────────────────────────────────────┘
```

### Core Modules

#### 1. **Simulator** (`/pages/index.js`)
Generates realistic payment transaction streams with:
- 8 issuers, 5 payment methods, 8 merchants
- Configurable failure scenarios
- Realistic latency and error patterns

#### 2. **Memory** (`/pages/index.js`)
Maintains agent state:
- Rolling 600-transaction buffer
- Issuer & method profiles (success rates, latency, errors)
- Pattern log (detected anomalies)
- Action log (full audit trail)
- Outcome log (post-action evaluations)
- Suppression state (active suppressions with expiry)

#### 3. **Pattern Detector** (`/pages/index.js`)
Statistical anomaly detection:
- Issuer degradation (failure rate > 35%)
- Latency spikes (avg latency > 2000ms)
- Retry storms (avg retries > 4)
- Method fatigue (failure rate > 30%)
- Correlated failures (>25% issuers failing)

#### 4. **AI Reasoning Engine** (`/pages/index.js`)
Multi-provider AI integration:
- Analyzes patterns and context
- Generates structured JSON decisions
- Provides confidence scores
- Explains reasoning step-by-step

#### 5. **Guardrails** (`/pages/index.js`)
Safety boundary enforcement:
- Action tier classification
- Hard limit validation
- Cooldown period tracking
- Rollback trigger detection

#### 6. **Executor** (`/pages/index.js`)
Action execution:
- Suppress issuer/method
- Adjust retry policies
- Reroute traffic
- Alert operations team
- Rollback previous actions

---


## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- FREE AI API key (see options above)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/payops-agent.git
cd payops-agent

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.local.example .env.local
```

### Configuration

Edit `.env.local`:

```env
# Choose one: groq (recommended), gemini, huggingface, openrouter
NEXT_PUBLIC_AI_PROVIDER=groq

# Your FREE API key
NEXT_PUBLIC_AI_API_KEY=gsk_your_groq_api_key_here
```

### Run Locally

```bash
# Start development server
npm run dev

# Open browser
# Navigate to http://localhost:3000
```

### Deploy to Vercel (Free!)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard:
# - NEXT_PUBLIC_AI_PROVIDER
# - NEXT_PUBLIC_AI_API_KEY

# Deploy to production
vercel --prod
```

---

## 🔄 How It Works

### Agent Cycle (Every 8 Seconds)

```
1. OBSERVE
   ├─ Read transaction buffer (last 600 transactions)
   ├─ Compute metrics (success rate, latency, error distribution)
   └─ Get recent patterns, actions, outcomes

2. REASON
   ├─ Run statistical pattern detector
   ├─ Send context to AI (Groq/Gemini/etc)
   ├─ Receive structured decision with confidence score
   └─ Get recommended actions with reasoning

3. DECIDE
   ├─ Evaluate each action through guardrails
   ├─ Classify as: AUTONOMOUS, GUARDED, HUMAN_GATE, or BLOCKED
   └─ Consider: load balancing, past outcomes, active suppressions

4. ACT
   ├─ Execute approved actions (AUTONOMOUS & GUARDED)
   ├─ Log pending actions (HUMAN_GATE)
   └─ Record all actions in audit trail

5. LEARN
   ├─ Evaluate actions executed 35+ seconds ago
   ├─ Compare metrics: success rate, latency
   ├─ Auto-rollback if metrics degraded
   └─ Feed outcomes into next cycle
```

### Example Flow

```
CYCLE 1: Observe → Chase failure rate 78% → AI reasons → Suppress Chase
CYCLE 2: Observe → Success rate improved → Continue monitoring
CYCLE 8: Evaluate → Chase suppression worked → Log positive outcome
CYCLE 50: Observe → Chase healthy → Unsuppress Chase
```

---

## 🎯 Detected Scenarios

The agent can detect and respond to these failure patterns:

### 1. Issuer Degradation
**Signal**: Single issuer with >35% failure rate (min 6 samples)
**Example**: Chase fails 78% of transactions
**Response**: Suppress issuer, reroute traffic
**Hypothesis**: "Issuer experiencing internal system issues"

### 2. Bank Outage
**Signal**: 100% failure + ERR_BANK_UNAVAILABLE
**Example**: HSBC completely unavailable
**Response**: Suppress bank, alert ops
**Hypothesis**: "Complete bank infrastructure failure"

### 3. Network Latency Spike
**Signal**: Average latency > 2000ms for an issuer
**Example**: Citi & Wells latency jumps to 3400ms+
**Response**: Alert ops, monitor, potentially reroute
**Hypothesis**: "Network congestion or routing issues"

### 4. Method Fatigue
**Signal**: Payment method failure rate > 30%
**Example**: Digital wallet degrades progressively
**Response**: Suppress method temporarily, alert ops
**Hypothesis**: "Third-party service degradation"

### 5. Retry Storm
**Signal**: Average retries > 4 or multiple rate-limited txns
**Example**: ShopFast merchant triggers 8x retry loops
**Response**: Adjust retry policy, alert merchant
**Hypothesis**: "Merchant integration issue causing retry loops"

### 6. Correlated Failure
**Signal**: >25% of issuers failing simultaneously
**Example**: 3+ issuers degraded at once
**Response**: Alert ops (high priority), investigate infrastructure
**Hypothesis**: "Shared infrastructure or network issue"

---

## ⚙️ Agent Actions

The agent can take these autonomous actions:

### suppress_issuer
```javascript
{
  type: 'suppress_issuer',
  issuer: 'Chase',
  duration: 300000, // 5 minutes
  reason: 'Degradation detected: 78% failure rate'
}
```
**Effect**: Adds issuer to suppression list, reroutes all traffic
**Tier**: GUARDED (with auto-rollback)

### suppress_method
```javascript
{
  type: 'suppress_method',
  method: 'digital_wallet',
  duration: 180000, // 3 minutes
  reason: 'Method fatigue: 42% failure rate'
}
```
**Effect**: Blocks payment method temporarily
**Tier**: GUARDED (with auto-rollback)

### adjust_retry
```javascript
{
  type: 'adjust_retry',
  merchant: 'ShopFast',
  currentRetryCount: 5,
  proposedRetryCount: 2,
  reason: 'Retry storm detected'
}
```
**Effect**: Changes retry policy for merchant
**Tier**: AUTONOMOUS

### reroute_traffic
```javascript
{
  type: 'reroute_traffic',
  fromIssuer: 'Chase',
  toIssuers: ['Citi', 'BoA'],
  percentage: 100,
  reason: 'Load balancing during Chase degradation'
}
```
**Effect**: Redirects traffic to healthy issuers
**Tier**: GUARDED

### alert_ops
```javascript
{
  type: 'alert_ops',
  severity: 'high',
  title: 'Correlated Failure Detected',
  body: '3 issuers degraded simultaneously - investigate infrastructure'
}
```
**Effect**: Sends notification to operations team
**Tier**: AUTONOMOUS

### rollback
```javascript
{
  type: 'rollback',
  originalActionId: 'ACT-12345',
  reason: 'Negative outcome: success rate dropped 6.2%'
}
```
**Effect**: Reverses a previous action
**Tier**: AUTONOMOUS

---

## 🛡️ Safety Guardrails

### Action Tiers

| Tier | Meaning | Examples | Auto-Execute? |
|------|---------|----------|---------------|
| **AUTONOMOUS** | Safe to execute immediately | Retry adjustments, alerts | ✅ Yes |
| **GUARDED** | Execute with rollback monitoring | Issuer/method suppression | ✅ Yes |
| **HUMAN_GATE** | Requires human approval | High-volume issuer suppression | ❌ No (logged) |
| **BLOCKED** | Violates policy limits | >2 issuers suppressed | ❌ No (rejected) |

### Hard Limits

```javascript
MAX_SIMULTANEOUS_ISSUER_SUPPRESSIONS: 2
MAX_SIMULTANEOUS_METHOD_SUPPRESSIONS: 1
MIN_SUPPRESSION_DURATION: 30000      // 30 seconds
MAX_SUPPRESSION_DURATION: 600000     // 10 minutes
MIN_RETRY_COUNT: 1
MAX_RETRY_COUNT: 5
MAX_RETRY_REDUCTION_PERCENT: 50
SUPPRESSION_COOLDOWN_MS: 60000       // 1 minute
```

### Rollback Triggers

Actions are auto-rolled back if:
- Success rate drops > 5 percentage points
- Average latency exceeds 1800ms
- Evaluation occurs 35+ seconds after action

### Example Guardrail Logic

```
Action: suppress_issuer (Chase)
├─ Check: Already 2 suppressions active? → BLOCKED
├─ Check: Duration within 30s-600s range? → AUTO-CLAMP
├─ Check: Issuer has >100 txns in window? → HUMAN_GATE
├─ Check: Cooldown period expired? → APPROVED
└─ Result: GUARDED (execute + monitor for rollback)
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14
- **UI Library**: React 18
- **Styling**: Tailwind CSS 3
- **Icons**: Lucide React

### AI Integration
- **Groq** (llama-3.3-70b-versatile)

### Deployment
- **Hosting**: Vercel (free tier)
- **CI/CD**: GitHub Actions
- **Environment**: Node.js 18+

### Development Tools
- ESLint (code quality)
- PostCSS (CSS processing)
- Autoprefixer (CSS compatibility)

---

## 🚀 Deployment

### Vercel 

#### From GitHub
1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_AI_PROVIDER=groq`
   - `NEXT_PUBLIC_AI_API_KEY=your_key`
5. Click Deploy

#### Using CLI
```bash
npm install -g vercel
vercel login
vercel

# Add env vars in dashboard
vercel --prod
```


## ⚙️ Configuration

### Environment Variables

```env
# AI Provider (required)
NEXT_PUBLIC_AI_PROVIDER=groq

# AI API Key (required)
NEXT_PUBLIC_AI_API_KEY=your_key_here
```

### Cycle Configuration

In `pages/index.js`, adjust these constants:

```javascript
// Agent cycle interval (milliseconds)
const CYCLE_INTERVAL = 8000; // 8 seconds

// Transaction generation rate
const TRANSACTION_BATCH_SIZE = 40; // per cycle

// Memory settings
const TRANSACTION_BUFFER_SIZE = 600; // rolling window
const PATTERN_LOG_SIZE = 200;
const ACTION_LOG_SIZE = 100;
```

### Guardrail Tuning

```javascript
// In pages/index.js
const GUARDRAIL_LIMITS = {
  MAX_ISSUER_SUPPRESSIONS: 2,
  MAX_METHOD_SUPPRESSIONS: 1,
  MIN_SUPPRESSION_DURATION: 30000,
  MAX_SUPPRESSION_DURATION: 600000,
  SUPPRESSION_COOLDOWN: 60000,
  MIN_RETRY_COUNT: 1,
  MAX_RETRY_COUNT: 5
};
```

### Pattern Detection Thresholds

```javascript
// Issuer degradation threshold
const ISSUER_FAIL_THRESHOLD = 0.35; // 35%

// Latency spike threshold
const LATENCY_SPIKE_THRESHOLD = 2000; // ms

// Method fatigue threshold
const METHOD_FAIL_THRESHOLD = 0.30; // 30%

// Retry storm threshold
const RETRY_STORM_THRESHOLD = 4; // avg retries
```

---

### Project Structure

```
payops-agent-free/
├── pages/
│   ├── _app.js              # Next.js app wrapper
│   ├── index.js             # Main dashboard + all agent logic
│   └── api/
│       └── claude.js        # Optional: Server-side API route
├── styles/
│   └── globals.css          # Global styles + Tailwind
├── public/                  # Static assets
├── .github/
│   └── workflows/
│       └── deploy.yml       # CI/CD pipeline
├── package.json             # Dependencies
├── next.config.js           # Next.js config
├── tailwind.config.js       # Tailwind config
├── .env.local.example       # Env template
├── FREE_AI_GUIDE.md        # AI provider setup guide
├── README.md               # This file
└── DEPLOYMENT.md           # Deployment guide
```

### Running Tests

```bash
# Start dev server
npm run dev

# Test different scenarios:
# 1. Click "Start Agent"
# 2. Toggle failure scenarios
# 3. Watch agent reasoning
# 4. Verify actions executed
# 5. Check rollback behavior
```

### Adding New Scenarios

```javascript
// In pages/index.js, add to simulator:
scenarios: {
  // ... existing scenarios
  new_scenario: {
    active: false,
    customParam: 'value',
    startedAt: null
  }
}

// Add detection logic:
function generateTransaction() {
  // ... existing logic
  if (scenarios.new_scenario.active) {
    // Modify transaction based on scenario
  }
}
```

### Extending Pattern Detection

```javascript
// In detectPatterns() function:
function detectPatterns(txns) {
  const patterns = [];
  
  // Add new pattern:
  if (customCondition) {
    patterns.push({
      type: 'NEW_PATTERN',
      severity: 'high',
      confidence: 0.9,
      hypothesis: 'Your hypothesis here',
      evidence: { /* relevant data */ }
    });
  }
  
  return patterns;
}
```

---

## 🤝 Contributing

We welcome contributions! Here's how:

### Reporting Issues

1. Check existing issues first
2. Use issue templates
3. Include:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots/logs
   - Environment (OS, Node version, etc.)

### Submitting Pull Requests

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Development Guidelines

- Follow existing code style
- Add comments for complex logic
- Test all scenarios before submitting
- Update documentation if needed
- Keep commits focused and descriptive

### Areas for Contribution

- [ ] Add new failure scenario types
- [ ] Improve pattern detection algorithms
- [ ] Enhance visualizations
- [ ] Add more AI providers
- [ ] Improve guardrail logic
- [ ] Add unit tests
- [ ] Optimize performance
- [ ] Better error handling
- [ ] Mobile responsiveness
- [ ] Dark mode
- [ ] Export functionality (CSV, PDF)
- [ ] Historical analytics
- [ ] Multi-tenancy support

---

## 📄 License

MIT License

Copyright (c) 2026 PayOps Agent

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- AI powered by [Groq](https://groq.com/)
- Icons by [Lucide](https://lucide.dev/)
- Hosted on [Vercel](https://vercel.com/)

---

## 🌟 Star History

If you find this project useful, please consider giving it a star! ⭐

---

<div align="center">

**Built with ❤️**

[⬆ Back to Top](#-payops-agent---autonomous-ai-payment-operations-manager)

</div>

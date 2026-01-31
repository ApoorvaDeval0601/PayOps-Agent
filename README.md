# PayOps Agent — Agentic AI for Smart Payment Operations (FREE AI Edition!)

A fully autonomous agentic AI system that acts as a real-time payment operations manager. The agent continuously observes streaming payment data, detects failure patterns, makes context-aware intervention decisions, executes actions within strict safety guardrails, and learns from outcomes.

**🆓 NOW WITH FREE AI SUPPORT!** No payment required - works with Groq, Google Gemini, Hugging Face, and OpenRouter!

![PayOps Agent](https://img.shields.io/badge/AI-Agentic-blue) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![React](https://img.shields.io/badge/React-18-blue) ![Free](https://img.shields.io/badge/AI-100%25%20Free-green)

## 🆓 Free AI Providers Supported

This app works with **4 completely FREE AI providers** - no credit card required:

- **Groq** ⭐ (Recommended) - 30 req/min, super fast
- **Google Gemini** ⭐ - 60 req/min, most generous
- **Hugging Face** - Unlimited, completely free
- **OpenRouter** - Free models available

**See [FREE_AI_GUIDE.md](FREE_AI_GUIDE.md) for detailed setup!**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- **FREE** AI API key from one of these providers (no credit card needed):
  - [Groq](https://console.groq.com/) (Recommended)
  - [Google Gemini](https://makersuite.google.com/app/apikey)
  - [Hugging Face](https://huggingface.co/settings/tokens)
  - [OpenRouter](https://openrouter.ai/keys)

**👉 See [FREE_AI_GUIDE.md](FREE_AI_GUIDE.md) for step-by-step API key setup!**

### Local Development

1. **Clone or download this repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and configure your AI provider:
   ```
   # Choose one: groq (recommended), gemini, huggingface, or openrouter
   NEXT_PUBLIC_AI_PROVIDER=groq
   
   # Your FREE API key (see FREE_AI_GUIDE.md)
   NEXT_PUBLIC_AI_API_KEY=your_actual_api_key_here
   ```
   
   **Get your FREE API key**: See [FREE_AI_GUIDE.md](FREE_AI_GUIDE.md) for detailed instructions!

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 Deploy to Vercel (Recommended)

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

### Manual Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Add environment variable**
   In your Vercel project settings, add:
   - Name: `NEXT_PUBLIC_AI_PROVIDER`
   - Value: `groq` (or your chosen provider)
   - Name: `NEXT_PUBLIC_AI_API_KEY`
   - Value: Your free API key from Groq/Gemini/HuggingFace/OpenRouter

4. **Redeploy** (if needed)
   ```bash
   vercel --prod
   ```

## 🐙 Deploy to GitHub Pages (Alternative)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/payops-agent.git
   git push -u origin main
   ```

2. **Update next.config.js** for static export:
   ```javascript
   const nextConfig = {
     output: 'export',
     basePath: '/payops-agent', // Your repo name
     images: { unoptimized: true }
   }
   ```

3. **Build and deploy**
   ```bash
   npm run build
   # Push the out/ folder to gh-pages branch
   ```

## 📋 Features

### Core Capabilities
- **Real-time Payment Monitoring** — Simulates and observes streaming payment transactions
- **Pattern Detection** — Statistical anomaly detection for payment failures
- **AI-Powered Reasoning** — Uses Claude to analyze patterns and make decisions
- **Safety Guardrails** — Multi-tier action approval system with auto-rollback
- **Learning Loop** — Evaluates action outcomes and improves future decisions

### Detected Scenarios
- **Issuer Degradation** — High failure rates on specific payment issuers
- **Bank Outages** — Complete unavailability of banking services
- **Network Latency Spikes** — Excessive processing delays
- **Method Fatigue** — Progressive degradation of payment methods
- **Retry Storms** — Excessive retry attempts causing rate limiting

### Available Actions
- Suppress issuer/method
- Adjust retry policies
- Reroute traffic
- Alert operations team
- Auto-rollback on degradation

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PayOps Agent Loop                         │
│                                                                  │
│  ┌────────┐   ┌────────┐   ┌────────┐   ┌──────┐   ┌────────┐  │
│  │ Observe │──▶│ Reason │──▶│ Decide │──▶│ Act  │──▶│ Learn  │  │
│  └────────┘   └────────┘   └────────┘   └──────┘   └────────┘  │
│       │            │             │           │           │        │
│       ▼            ▼             ▼           ▼           ▼        │
│  Simulator    Pattern Det.   Guardrails  Executor   Outcome Eval │
│  + Memory     + Claude API   + Policy    + Rollback + Feedback   │
└─────────────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **UI**: React 18 with Tailwind CSS
- **Icons**: Lucide React
- **AI**: Anthropic Claude API (Sonnet 4.5)
- **Deployment**: Vercel (or any Node.js hosting)

## 📁 Project Structure

```
payops-agent/
├── pages/
│   ├── _app.js          # Next.js app wrapper
│   └── index.js         # Main dashboard component
├── styles/
│   └── globals.css      # Global styles with Tailwind
├── public/              # Static assets
├── package.json         # Dependencies
├── next.config.js       # Next.js configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── .env.local.example   # Environment variables template
└── README.md           # This file
```

## 🔐 Security Notes

- **API Key**: Never commit your `.env.local` file. It's included in `.gitignore`.
- **Client-side API Key**: This demo uses `NEXT_PUBLIC_` prefix which exposes the key to the browser. For production, implement server-side API routes.
- **Rate Limiting**: Consider implementing rate limiting for the Claude API calls.

## 🎯 Usage

1. Click **Start Agent** to begin the simulation
2. Use **Failure Scenarios** panel to inject different failure types
3. Watch the agent detect patterns and take autonomous actions
4. Observe the learning loop as actions are evaluated
5. Review the detailed reasoning in the Agent Reasoning panel

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for learning and development.

## 🐛 Troubleshooting

### API Key Issues
- Ensure your API key is set in `.env.local`
- Verify the key starts with `sk-ant-`
- Check your Anthropic account has API access enabled

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Deployment Issues
- Ensure environment variables are set in Vercel dashboard
- Check build logs for any errors
- Verify Node.js version is 18+

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check [Next.js Documentation](https://nextjs.org/docs)
- Review [Anthropic API Documentation](https://docs.anthropic.com/)

---

Built with ❤️ using Claude AI

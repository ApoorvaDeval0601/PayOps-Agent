# Quick Start Guide - FREE AI Edition! 🆓

## 🎯 Get Running in 3 Minutes (100% FREE)

### Step 1: Setup
```bash
# On Mac/Linux
./setup.sh

# On Windows
setup.bat

# Or manually
npm install
cp .env.local.example .env.local
```

### Step 2: Get FREE API Key (Choose One)

**Option A: Groq (Recommended - Fastest)** ⭐
1. Go to: https://console.groq.com/
2. Sign up (free, no card needed)
3. Create API Key
4. Copy the key (starts with `gsk_`)

**Option B: Google Gemini (Most Generous)** ⭐
1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Create API key
4. Copy the key (starts with `AIza`)

**Need detailed help?** → See [FREE_AI_GUIDE.md](FREE_AI_GUIDE.md)

### Step 3: Configure
Edit `.env.local`:
```
NEXT_PUBLIC_AI_PROVIDER=groq  # or gemini, huggingface, openrouter
NEXT_PUBLIC_AI_API_KEY=gsk_your_actual_key_here
```

### Step 4: Run
```bash
npm run dev
```

Open http://localhost:3000 🎉

---

## 🚀 Deploy to Vercel (2 Minutes)

### One-Click Deploy
1. Push to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_AI_PROVIDER` = `groq`
   - `NEXT_PUBLIC_AI_API_KEY` = your Groq API key
5. Click Deploy

### Or use CLI
```bash
npm install -g vercel
vercel
# Add API key in dashboard
vercel --prod
```

Your app is now live! 🌐

---

## 📖 What to Try

1. **Start the Agent** — Click the "Start Agent" button
2. **Inject Failures** — Toggle scenarios in the "Failure Scenarios" panel:
   - Issuer Degradation (Chase fails 78%)
   - Bank Outage (HSBC completely down)
   - Network Latency Spike (Citi & Wells slow)
   - Method Fatigue (Digital wallets degrade)
   - Retry Storm (ShopFast triggers excessive retries)

3. **Watch the Agent Work**:
   - Detects patterns in real-time
   - Reasons about the issues using Claude AI
   - Takes autonomous actions (suppress issuer, adjust retries, etc.)
   - Learns from outcomes and auto-rolls back bad decisions

4. **Explore the Dashboard**:
   - **Agent Reasoning** — See Claude's step-by-step thinking
   - **Action Log** — Every action with guardrail status
   - **Detected Patterns** — Statistical anomalies
   - **Issuer Health** — Real-time health bars
   - **Error Stream** — Live failing transactions

---

## 🔧 Troubleshooting

### "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### API key not working
- Check it starts with `sk-ant-`
- Restart dev server after adding to .env.local
- Make sure file is named `.env.local` (with the dot)

### Build fails
```bash
rm -rf .next
npm run build
```

---

## 📚 Next Steps

- Read [README.md](README.md) for full documentation
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment options
- Modify scenarios in `pages/index.js`
- Add authentication for production use

---

## 💡 Pro Tips

1. **Change Cycle Speed**: In `pages/index.js`, search for `CYCLE_INTERVAL` and adjust from 8000ms
2. **Add New Scenarios**: Extend the `scenarios` object in the simulator
3. **Customize Actions**: Modify the `guardrails` section to change safety limits
4. **View Source**: The entire app is in `pages/index.js` — it's well-commented!

---

## 🆘 Need Help?

- Check the console for errors (F12 in browser)
- Review the README.md file
- Open an issue on GitHub
- Check [Next.js docs](https://nextjs.org/docs)
- Check [Anthropic docs](https://docs.anthropic.com/)

Enjoy building with PayOps Agent! 🎉

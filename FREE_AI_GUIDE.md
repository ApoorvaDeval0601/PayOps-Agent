# 🆓 FREE AI Options Guide

This version of PayOps Agent supports **4 FREE AI providers** - no payment required!

## 🚀 Quick Setup (Pick One)

### Option 1: Groq (Recommended - Fastest)
**Free Tier**: 30 requests/minute

1. **Get API Key**: https://console.groq.com/
   - Sign up (free, no credit card needed)
   - Go to API Keys
   - Create new key

2. **Configure**:
   ```bash
   # In .env.local
   NEXT_PUBLIC_AI_PROVIDER=groq
   NEXT_PUBLIC_AI_API_KEY=gsk_your_groq_api_key
   ```

3. **Model**: `llama-3.3-70b-versatile` (very fast, high quality)

---

### Option 2: Google Gemini (Best Free Tier)
**Free Tier**: 60 requests/minute (most generous!)

1. **Get API Key**: https://makersuite.google.com/app/apikey
   - Sign in with Google
   - Create API key

2. **Configure**:
   ```bash
   # In .env.local
   NEXT_PUBLIC_AI_PROVIDER=gemini
   NEXT_PUBLIC_AI_API_KEY=AIza_your_gemini_api_key
   ```

3. **Model**: `gemini-1.5-flash` (very fast)

---

### Option 3: Hugging Face (Completely Free)
**Free Tier**: Unlimited (rate-limited per model)

1. **Get API Key**: https://huggingface.co/settings/tokens
   - Sign up
   - Create new token (read access is enough)

2. **Configure**:
   ```bash
   # In .env.local
   NEXT_PUBLIC_AI_PROVIDER=huggingface
   NEXT_PUBLIC_AI_API_KEY=hf_your_huggingface_token
   ```

3. **Model**: `meta-llama/Llama-3.2-3B-Instruct` (smaller, slower)

---

### Option 4: OpenRouter (Free Models Available)
**Free Tier**: Multiple free models available

1. **Get API Key**: https://openrouter.ai/keys
   - Sign up
   - Create API key
   - Add $1 credit (optional) for faster models

2. **Configure**:
   ```bash
   # In .env.local
   NEXT_PUBLIC_AI_PROVIDER=openrouter
   NEXT_PUBLIC_AI_API_KEY=sk-or-your_openrouter_key
   ```

3. **Model**: `meta-llama/llama-3.2-3b-instruct:free`

---

## 📊 Comparison Table

| Provider | Free Tier | Speed | Quality | Sign-up |
|----------|-----------|-------|---------|---------|
| **Groq** ⭐ | 30 req/min | ⚡⚡⚡⚡⚡ | ⭐⭐⭐⭐⭐ | No card |
| **Gemini** ⭐ | 60 req/min | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | No card |
| **Hugging Face** | Unlimited* | ⚡⚡⚡ | ⭐⭐⭐ | No card |
| **OpenRouter** | Limited | ⚡⚡⚡⚡ | ⭐⭐⭐ | Optional card |

*Rate-limited per model

---

## 🎯 Recommended for PayOps Agent

### Best Overall: **Groq**
- Super fast responses
- High-quality reasoning
- Generous free tier (30 req/min)
- With 8-second cycles, you get 240 requests = 32 minutes of continuous running

### Most Generous: **Gemini**
- 60 requests/minute
- With 8-second cycles, you get ~64 minutes of continuous running
- Great for longer testing sessions

### For Learning: **Hugging Face**
- Completely free
- No rate limits (just queue times)
- Perfect for development

---

## ⚙️ Setup Steps

### 1. Choose Your Provider
Pick one from the options above based on your needs.

### 2. Get Your API Key
Follow the link for your chosen provider and sign up.

### 3. Configure .env.local
```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local and set:
NEXT_PUBLIC_AI_PROVIDER=groq  # or gemini, huggingface, openrouter
NEXT_PUBLIC_AI_API_KEY=your_actual_api_key_here
```

### 4. Start the App
```bash
npm run dev
```

### 5. Test It!
- Click "Start Agent"
- Inject a failure scenario
- Watch the AI reason about it!

---

## 🔧 Troubleshooting

### "AI_API_KEY not configured"
- Make sure `.env.local` exists
- Check the key is properly set
- Restart dev server: `Ctrl+C` then `npm run dev`

### "AI API error: 401"
- Your API key is invalid or expired
- Generate a new key from your provider
- Make sure you copied the entire key

### "AI API error: 429" (Rate limit)
- You've hit the free tier limit
- Wait a few minutes
- Consider switching providers
- Or increase `CYCLE_INTERVAL` in the code (from 8000ms to 15000ms)

### Slow responses
- Hugging Face can be slow (uses queue system)
- Try Groq or Gemini for faster responses
- Check your internet connection

### "Model not found"
- Check you're using the correct model name for your provider
- See the provider-specific sections above

---

## 💡 Pro Tips

### 1. Optimize Cycle Speed for Free Tier
```javascript
// In pages/index.js, change this line:
const CYCLE_INTERVAL = 8000; // 8 seconds

// To this for better rate limit usage:
const CYCLE_INTERVAL = 15000; // 15 seconds
```

**Math**:
- Groq (30/min): With 15s cycles = 4 req/min ✅
- Gemini (60/min): With 15s cycles = 4 req/min ✅
- Never hit limits!

### 2. Switch Providers Easily
Just change one line in `.env.local`:
```bash
NEXT_PUBLIC_AI_PROVIDER=gemini  # Switch to Gemini
```
Restart the app and you're using a different AI!

### 3. Test Multiple Providers
Create multiple env files:
```bash
.env.local.groq
.env.local.gemini
.env.local.huggingface
```

Copy whichever you want to `.env.local`

### 4. For Production
Consider rotating between providers:
```javascript
// Randomly pick provider to distribute load
const providers = ['groq', 'gemini', 'huggingface'];
const provider = providers[Math.floor(Math.random() * providers.length)];
```

---

## 📈 Cost Comparison

| Provider | Free Usage | After Free Tier |
|----------|------------|-----------------|
| **Groq** | 30 req/min forever | N/A - stays free |
| **Gemini** | 60 req/min forever | N/A - stays free |
| **Hugging Face** | Unlimited* | N/A - stays free |
| **OpenRouter** | Limited free models | Pay per token |

All providers have **generous free tiers** that are perfect for:
- Learning and development
- Demos and hackathons
- Small-scale production (with cycle optimization)

---

## 🎓 Getting Your First API Key (Step-by-Step)

### For Groq (Easiest):

1. Go to: https://console.groq.com/
2. Click "Sign Up"
3. Use Google/GitHub or email
4. Verify email (if needed)
5. Go to "API Keys" in sidebar
6. Click "Create API Key"
7. Give it a name (e.g., "PayOps Agent")
8. Copy the key (starts with `gsk_`)
9. Paste into `.env.local`

**Done! You're ready to go! 🎉**

---

## ❓ FAQ

### Q: Do I need a credit card?
**A**: No! Groq, Gemini, and Hugging Face are completely free without any card.

### Q: Which is best for this project?
**A**: Groq - it's fast, high quality, and free.

### Q: Can I use multiple providers?
**A**: Yes! Just change `NEXT_PUBLIC_AI_PROVIDER` in `.env.local`

### Q: Will I run out of free requests?
**A**: With the default 8-second cycle, you might hit limits after ~30 minutes. Increase to 15 seconds for unlimited usage.

### Q: Is the AI quality as good as Claude/GPT-4?
**A**: Groq's llama-3.3-70b is excellent for this use case. It won't write poetry as well, but for structured decision-making it's great!

### Q: Can I deploy this to production for free?
**A**: Yes! Vercel hosting is free, and Groq/Gemini APIs are free. Total cost: $0.

---

## 🚀 Ready to Start?

1. **Pick a provider** (we recommend Groq)
2. **Get your API key** (takes 2 minutes)
3. **Set up .env.local**
4. **Run the app**: `npm run dev`
5. **Watch the magic happen!** ✨

---

**Need help?** Open an issue or check the main README.md!

**Happy building! 🎉**

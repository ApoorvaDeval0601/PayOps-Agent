# Deployment Guide

## Method 1: Vercel (Easiest - Recommended)

### Option A: Deploy from GitHub

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/payops-agent.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variable:
     - Key: `NEXT_PUBLIC_ANTHROPIC_API_KEY`
     - Value: Your Anthropic API key
   - Click "Deploy"

3. **Done!** Your app will be live at `https://your-project.vercel.app`

### Option B: Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts, then add your API key in the dashboard
```

---

## Method 2: Netlify

1. **Push to GitHub** (same as above)

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repo
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`
   - Add environment variable:
     - Key: `NEXT_PUBLIC_ANTHROPIC_API_KEY`
     - Value: Your API key
   - Click "Deploy"

---

## Method 3: Docker + Any Cloud Provider

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and run**
   ```bash
   docker build -t payops-agent .
   docker run -p 3000:3000 -e NEXT_PUBLIC_ANTHROPIC_API_KEY=your_key payops-agent
   ```

3. **Deploy to**:
   - Google Cloud Run
   - AWS ECS/Fargate
   - Azure Container Instances
   - DigitalOcean App Platform

---

## Method 4: Static Export (GitHub Pages, S3, etc.)

**Note**: This requires client-side API key exposure or a separate backend.

1. **Update next.config.js**
   ```javascript
   const nextConfig = {
     output: 'export',
     images: { unoptimized: true }
   }
   ```

2. **Build**
   ```bash
   npm run build
   ```

3. **Deploy the `out/` folder** to:
   - GitHub Pages
   - AWS S3 + CloudFront
   - Cloudflare Pages
   - Any static hosting

---

## Security Recommendations

### For Production:

1. **Use Server-Side API Route** (recommended)
   - Uncomment the API route setup in the code
   - Use `ANTHROPIC_API_KEY` (without NEXT_PUBLIC_)
   - Update fetch calls to use `/api/claude` instead of direct API

2. **Implement Rate Limiting**
   ```bash
   npm install express-rate-limit
   ```

3. **Add Authentication**
   - Protect your dashboard with login
   - Use NextAuth.js or similar

4. **Environment-Specific Keys**
   - Use different API keys for dev/staging/prod
   - Store keys in environment variable managers (Vercel Env, AWS Secrets Manager, etc.)

---

## Environment Variables

### Development (.env.local)
```
NEXT_PUBLIC_ANTHROPIC_API_KEY=sk-ant-your-key
```

### Production (Vercel/Netlify Dashboard)
```
NEXT_PUBLIC_ANTHROPIC_API_KEY=sk-ant-your-key
```

### For Server-Side API Route (More Secure)
```
ANTHROPIC_API_KEY=sk-ant-your-key
```

---

## Troubleshooting

### "API key not found"
- Check `.env.local` file exists and has correct format
- Restart dev server after adding env variables
- In production, verify env var is set in hosting platform dashboard

### Build fails on Vercel
- Check Node.js version (should be 18+)
- Verify all dependencies in package.json
- Check build logs for specific errors

### API calls failing
- Verify API key is valid
- Check Anthropic API status
- Look for CORS errors (if using custom backend)
- Check rate limits on your API key

---

## Cost Estimation

**Anthropic API Costs** (Claude Sonnet 4.5):
- Input: $3 per million tokens
- Output: $15 per million tokens

**Typical Usage**:
- Each agent cycle: ~2000 input tokens, ~500 output tokens
- Cost per cycle: ~$0.01
- Running continuously: ~$14.40/day (at 8-second cycles)

**Optimization Tips**:
- Increase cycle interval (e.g., 15 seconds instead of 8)
- Reduce context size if patterns repeat
- Use Claude Haiku for development/testing (cheaper)

---

## Next Steps

1. Deploy to Vercel
2. Test with real scenarios
3. Add authentication if making public
4. Implement server-side API route for production
5. Set up monitoring and alerts
6. Consider cost optimization strategies

Need help? Open an issue on GitHub!

# Vercel Deployment Guide for sBTC Payment Links

## 🚀 Quick Deploy (Recommended)

Click the deploy button below to deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/sbtc-payment-links)

## 📋 Manual Deployment Steps

### 1. Prerequisites
- Vercel account (free at [vercel.com](https://vercel.com))
- Git repository (already configured)

### 2. Deploy via Vercel Dashboard

1. **Visit Vercel Dashboard**: Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. **Import Project**: Click "New Project" and import from Git
3. **Select Repository**: Choose your `sbtc-payment-links` repository
4. **Configure Settings**:
   - Framework Preset: **Next.js**
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm install` (auto-detected)

### 3. Environment Variables (Optional)
No environment variables are required for basic functionality. The app uses sensible defaults:
- Stacks Network: Mainnet
- API URLs: Official Stacks API endpoints

### 4. Deploy
Click "Deploy" and wait for the build to complete (~2-3 minutes).

## 🔧 Vercel CLI Deployment

If you prefer using the CLI:

```bash
# Install Vercel CLI globally
npm install -g vercel@latest

# Deploy from project directory
cd sbtc-payment-links
vercel

# For production deployment
vercel --prod
```

## 📁 Project Configuration

The project includes a `vercel.json` configuration file with optimized settings:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "regions": ["iad1"],
  "functions": {
    "app/**": {
      "runtime": "nodejs18.x"
    }
  }
}
```

## ✅ Post-Deployment

After deployment:

1. **Test the app**: Visit your Vercel URL
2. **Custom domain** (optional): Add your custom domain in Vercel dashboard
3. **Environment variables**: Add any custom configuration if needed

## 🔗 Sample Deployment URLs

- **Preview**: `https://sbtc-payment-links-git-main-username.vercel.app`
- **Production**: `https://sbtc-payment-links.vercel.app`

## 🛠️ Troubleshooting

### Build Errors
If you encounter build errors:

```bash
# Test build locally first
npm run build

# Check for any TypeScript or linting errors
npm run lint
```

### Environment Issues
The app works without additional environment variables, but you can configure:

- `NEXT_PUBLIC_STACKS_NETWORK`: "mainnet" or "testnet"
- `NEXT_PUBLIC_STACKS_API_URL`: Custom Stacks API endpoint

### Performance
The app is optimized for Vercel with:
- Static generation where possible
- Edge runtime support
- Automatic image optimization
- CDN distribution

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Stacks.js Documentation](https://docs.stacks.co/docs/stacks.js/)

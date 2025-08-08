# 🚀 Quick Start Guide - sBTC Payment Links

Get your sBTC Payment Links application running in minutes!

## 📋 Prerequisites

- **Node.js 18.0.0+** ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))

## ⚡ Quick Setup

### 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd sbtc-payment-links

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit the environment file (optional)
# Default settings work for local development
```

### 3. Start Development Server

```bash
npm run dev
```

🎉 **That's it!** Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 What You Can Do

### Generate Payment Links
1. Enter sBTC amount (e.g., `0.001`)
2. Add recipient Stacks address (starts with `SP` or `ST`)
3. Optional: Add label and message
4. Click "Generate Payment Link"

### Share Your Links
- 📧 Copy URL for email
- 📱 Scan QR code on mobile
- 🐦 Share on social media
- 💬 Send via messaging apps

### Process Payments
- Recipients click your link
- Connect their Stacks wallet
- Send payment with one click

## 🔧 Configuration Options

### Network Settings

Edit `.env.local`:

```bash
# For mainnet (real Bitcoin)
NEXT_PUBLIC_STACKS_NETWORK=mainnet

# For testnet (testing only)
NEXT_PUBLIC_STACKS_NETWORK=testnet
```

### Custom Domain

```bash
# Set your production URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## 📱 Mobile Testing

1. Start dev server: `npm run dev`
2. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
3. Open `http://YOUR_IP:3000` on mobile
4. Test QR code scanning

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🛠️ Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Check code quality
```

## 🐛 Troubleshooting

### Common Issues

**"Cannot find module" errors**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Port 3000 already in use**
```bash
npm run dev -- -p 3001
```

**Wallet connection fails**
- Check network (mainnet/testnet)
- Ensure Stacks wallet is installed
- Try refreshing the page

### Getting Help

1. Check [DOCS.md](./DOCS.md) for detailed documentation
2. Search [GitHub Issues](https://github.com/your-username/sbtc-payment-links/issues)
3. Create a new issue with error details

## 🎨 Customization

### Styling
- Colors: Edit `tailwind.config.js`
- Layout: Modify components in `src/components/`
- Global styles: Update `src/app/globals.css`

### Features
- Payment validation: `src/utils/paymentUtils.ts`
- UI components: `src/components/`
- Pages: `src/app/`

## 📚 Next Steps

1. **Read the docs**: Check [DOCS.md](./DOCS.md) for advanced features
2. **Customize design**: Update colors and layout
3. **Add features**: Extend functionality for your needs
4. **Deploy**: Share your payment links with the world!

## 🔒 Security Notes

- Never share private keys
- Validate all addresses before sending
- Use testnet for development
- Verify transactions in wallet before confirming

---

**Need help?** Join our community or create an issue on GitHub!

Happy building! 🎉

# sBTC Payment Links

Generate shareable payment request URLs for sBTC transactions. Perfect for invoices, donations, or any Bitcoin payment needs.

## 🚀 Features

- **Generate Payment Links**: Create shareable URLs with custom amounts and messages
- **QR Code Support**: Generate QR codes for easy mobile payments
- **Real-time Validation**: Address validation with Stacks API integration
- **Wallet Integration**: Support for Leather, Xverse, and other Stacks wallets
- **Mock Testing**: Development mode with mock payments for testing

## 🛠️ Technology Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Stacks.js** - Stacks blockchain integration
- **Lucide React** - Beautiful icons

## 🌐 Live Demo

Visit the live application: [https://your-app.vercel.app](https://your-app.vercel.app)

## 📦 Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Configuration

The app works out of the box with mainnet Stacks configuration. For development:

- Mock wallet connections are available in development mode
- Test addresses are provided for validation testing
- Real wallet integration requires compatible browser extensions

## 📱 Usage

1. **Create Payment Request**: Fill in amount, recipient address, and optional details
2. **Generate Link**: Get a shareable URL with payment information
3. **Share**: Send via email, messaging, or social media
4. **Pay**: Recipients can connect their wallet and complete payment

## 🔐 Security

- All payment data is encoded in URLs (no server storage)
- Address validation using official Stacks APIs
- Wallet connections use standard Stacks Connect protocols
- No private keys are ever handled by the application

## 🚀 Deployment

This project is optimized for Vercel deployment:

```bash
npm run build
```

Deploy to Vercel with one click or using the Vercel CLI.

## 📄 License

MIT License - see LICENSE file for details.

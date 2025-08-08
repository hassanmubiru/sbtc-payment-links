# sBTC Payment Links - Developer Documentation

## Overview

sBTC Payment Links is a web application that allows users to generate shareable payment request URLs for sBTC (Stacks Bitcoin) transactions. The application provides an easy way for businesses and individuals to request payments via messaging, email, or social media.

## Architecture

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **QR Codes**: qrcode library

### Blockchain Integration
- **Blockchain**: Stacks (Layer 2 Bitcoin)
- **Wallet Connection**: Stacks Connect
- **Network**: Configurable (Mainnet/Testnet)

## Key Features

### 1. Payment Link Generation
- Generate BIP21-like URLs for sBTC payments
- Include amount, recipient, label, and message
- Real-time URL preview and validation

### 2. QR Code Generation
- Automatic QR code creation for mobile payments
- High-resolution codes optimized for scanning
- Download capability for offline use

### 3. Wallet Integration
- Connect with Stacks-compatible wallets
- One-click payment processing
- Transaction status tracking

### 4. Sharing Options
- Native Web Share API support
- Pre-configured social media sharing
- Email and messaging integration

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Home page
│   └── pay/               # Payment processing page
│       └── page.tsx
├── components/            # React components
│   ├── Header.tsx         # Navigation header
│   ├── Footer.tsx         # Site footer
│   ├── PaymentForm.tsx    # Payment creation form
│   └── PaymentPreview.tsx # Payment preview and sharing
└── utils/                 # Utility functions
    └── paymentUtils.ts    # Payment URL generation and validation
```

## API Reference

### Payment URL Format

The application generates URLs following a modified BIP21 standard:

```
sbtc:<address>?amount=<amount>&label=<label>&message=<message>
```

#### Parameters

- `address` (required): Stacks address (SP/ST format)
- `amount` (required): Amount in sBTC (decimal format)
- `label` (optional): Short description or invoice number
- `message` (optional): Detailed message or description

#### Example

```
sbtc:SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173?amount=0.001&label=Invoice%20123&message=Payment%20for%20services
```

### Utility Functions

#### `generatePaymentUrl(paymentData: PaymentData): string`

Generates a payment URL from payment data object.

```typescript
const url = generatePaymentUrl({
  amount: "0.001",
  recipient: "SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173",
  label: "Invoice 123",
  message: "Payment for services"
});
```

#### `parsePaymentUrl(url: string): ParsedPaymentData`

Parses a payment URL back into individual components.

```typescript
const data = parsePaymentUrl("sbtc:SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173?amount=0.001");
// Returns: { recipient: "SP...", amount: "0.001" }
```

#### `isValidStacksAddress(address: string): boolean`

Validates Stacks address format.

```typescript
const isValid = isValidStacksAddress("SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173");
// Returns: true
```

#### `formatAmount(amount: string | number): string`

Formats amount for display with appropriate decimal places.

```typescript
const formatted = formatAmount("0.00100000");
// Returns: "0.001"
```

## Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Network configuration
NEXT_PUBLIC_STACKS_NETWORK=mainnet  # or 'testnet'
NEXT_PUBLIC_APP_URL=http://localhost:3000

# API URLs (automatically set based on network)
# Mainnet: https://stacks-node-api.mainnet.stacks.co
# Testnet: https://stacks-node-api.testnet.stacks.co
```

### Network Configuration

The application supports both Stacks Mainnet and Testnet. Configure the network in your environment variables or directly in the code:

```typescript
// For mainnet
const network = new StacksMainnet();

// For testnet
const network = new StacksTestnet();
```

## Development

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy environment file: `cp .env.example .env.local`
4. Start development server: `npm run dev`

### Building for Production

```bash
npm run build
npm start
```

### Testing

The application includes basic validation and error handling. For comprehensive testing:

1. Test with different Stacks addresses
2. Verify QR code generation
3. Test wallet connectivity on both networks
4. Validate sharing functionality

## Security Considerations

### Address Validation

- All Stacks addresses are validated using regex patterns
- Invalid addresses are rejected before URL generation

### Transaction Security

- Users must confirm all transaction details in their wallet
- No private keys are stored or transmitted
- All transactions use Stacks Connect for secure signing

### Input Sanitization

- All user inputs are sanitized before URL encoding
- XSS protection through React's built-in escaping
- URL parameters are validated and type-checked

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

### Manual Deployment

1. Build the application: `npm run build`
2. Start production server: `npm start`
3. Configure reverse proxy (nginx/Apache)
4. Set up SSL/TLS certificates

### Environment Variables for Production

```bash
NEXT_PUBLIC_STACKS_NETWORK=mainnet
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Browser Compatibility

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

### Required Features

- ES2020 support
- Web Share API (optional, fallback provided)
- Clipboard API
- LocalStorage

## Contributing

### Code Style

- Use TypeScript for all new files
- Follow Prettier formatting rules
- Use descriptive variable and function names
- Add JSDoc comments for public functions

### Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request with description

## License

MIT License - see LICENSE file for details.

## Support

For questions or issues:

1. Check the documentation
2. Search existing GitHub issues
3. Create a new issue with detailed description
4. Join our Discord community

## Roadmap

### Upcoming Features

- [ ] Multi-currency support
- [ ] Payment request templates
- [ ] Analytics dashboard
- [ ] API endpoints for integration
- [ ] Mobile app
- [ ] Recurring payment links
- [ ] Payment notifications

### Performance Improvements

- [ ] Code splitting optimization
- [ ] Image optimization
- [ ] Caching strategies
- [ ] Bundle size reduction

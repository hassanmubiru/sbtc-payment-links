# sBTC Payment Links

A simple tool for generating payment requests as URLs, allowing businesses and individuals to request payments in sBTC via messaging, email, or social media.

## Features

- 🔗 Generate payment request URLs with custom amounts and messages
- 📱 QR code generation for easy mobile payments
- 💼 Business-friendly interface for invoice generation
- 🔄 Real-time URL preview and validation
- 📧 Easy sharing via email, messaging, and social media
- ⚡ Built with Next.js and Stacks Connect for sBTC integration

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How It Works

1. **Enter Payment Details**: Specify the sBTC amount, recipient address, and optional message
2. **Generate Link**: The tool creates a shareable URL with encoded payment information
3. **Share**: Send the link via any communication method
4. **Pay**: Recipients click the link to initiate the sBTC transaction

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Stacks Connect, sBTC
- **QR Codes**: qrcode library
- **Icons**: Lucide React

## License

MIT License

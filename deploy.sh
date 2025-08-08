#!/bin/bash

# sBTC Payment Links Deployment Script
# This script helps deploy the application to various platforms

set -e

echo "🚀 sBTC Payment Links Deployment Script"
echo "======================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Function to check prerequisites
check_prerequisites() {
    echo "🔍 Checking prerequisites..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    if [ "$(printf '%s\n' "18.0.0" "$NODE_VERSION" | sort -V | head -n1)" != "18.0.0" ]; then
        echo "❌ Node.js 18.0.0 or higher is required. Current version: $NODE_VERSION"
        exit 1
    fi
    
    echo "✅ Node.js version: $NODE_VERSION"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        echo "❌ npm is not installed"
        exit 1
    fi
    
    echo "✅ npm version: $(npm -v)"
}

# Function to install dependencies
install_dependencies() {
    echo "📦 Installing dependencies..."
    npm ci
    echo "✅ Dependencies installed"
}

# Function to run tests
run_tests() {
    echo "🧪 Running tests..."
    npm run lint
    echo "✅ Tests passed"
}

# Function to build application
build_application() {
    echo "🏗️  Building application..."
    npm run build
    echo "✅ Build completed"
}

# Function to deploy to Vercel
deploy_vercel() {
    echo "🌐 Deploying to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        echo "📦 Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Check if .env.local exists
    if [ ! -f ".env.local" ]; then
        echo "⚠️  .env.local not found. Creating from .env.example..."
        cp .env.example .env.local
        echo "📝 Please update .env.local with your production values"
    fi
    
    vercel --prod
    echo "✅ Deployed to Vercel"
}

# Function to deploy to Netlify
deploy_netlify() {
    echo "🌐 Deploying to Netlify..."
    
    if ! command -v netlify &> /dev/null; then
        echo "📦 Installing Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    netlify deploy --prod --dir=.next
    echo "✅ Deployed to Netlify"
}

# Function to create Docker image
create_docker_image() {
    echo "🐳 Creating Docker image..."
    
    # Create Dockerfile if it doesn't exist
    if [ ! -f "Dockerfile" ]; then
        cat > Dockerfile << EOF
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
EOF
        echo "✅ Dockerfile created"
    fi
    
    # Create .dockerignore if it doesn't exist
    if [ ! -f ".dockerignore" ]; then
        cat > .dockerignore << EOF
Dockerfile
.dockerignore
node_modules
npm-debug.log
README.md
.env
.env.local
.next
.git
EOF
        echo "✅ .dockerignore created"
    fi
    
    docker build -t sbtc-payment-links .
    echo "✅ Docker image created: sbtc-payment-links"
}

# Function to setup environment
setup_environment() {
    echo "⚙️  Setting up environment..."
    
    if [ ! -f ".env.local" ]; then
        cp .env.example .env.local
        echo "📝 .env.local created from .env.example"
        echo "⚠️  Please update .env.local with your configuration:"
        echo "   - NEXT_PUBLIC_STACKS_NETWORK (mainnet/testnet)"
        echo "   - NEXT_PUBLIC_APP_URL (your domain)"
    fi
    
    echo "✅ Environment setup complete"
}

# Main menu
show_menu() {
    echo ""
    echo "Select deployment option:"
    echo "1) Full deployment check (install, test, build)"
    echo "2) Deploy to Vercel"
    echo "3) Deploy to Netlify"
    echo "4) Create Docker image"
    echo "5) Setup environment only"
    echo "6) Exit"
    echo ""
    read -p "Enter your choice (1-6): " choice
    
    case $choice in
        1)
            check_prerequisites
            setup_environment
            install_dependencies
            run_tests
            build_application
            echo "🎉 Deployment check completed successfully!"
            ;;
        2)
            check_prerequisites
            setup_environment
            install_dependencies
            build_application
            deploy_vercel
            ;;
        3)
            check_prerequisites
            setup_environment
            install_dependencies
            build_application
            deploy_netlify
            ;;
        4)
            check_prerequisites
            setup_environment
            create_docker_image
            ;;
        5)
            setup_environment
            ;;
        6)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please try again."
            show_menu
            ;;
    esac
}

# Run the menu
show_menu

echo ""
echo "🎉 Deployment script completed!"
echo "📖 Check DOCS.md for more detailed deployment instructions."

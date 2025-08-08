const { execSync } = require('child_process');

// Check if Node.js version is compatible
const nodeVersion = process.version;
const requiredVersion = 'v18.0.0';

if (nodeVersion < requiredVersion) {
  console.error(`Error: Node.js ${requiredVersion} or higher is required. Current version: ${nodeVersion}`);
  process.exit(1);
}

console.log('✅ Node.js version is compatible');

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies');
  process.exit(1);
}

// Check if .env file exists
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  console.log('📄 Creating .env file from .env.example...');
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ .env file created');
}

console.log('\n🚀 Setup complete! You can now run:');
console.log('   npm run dev     - Start development server');
console.log('   npm run build   - Build for production');
console.log('   npm start       - Start production server');
console.log('\n📖 Open http://localhost:3000 to view the application');

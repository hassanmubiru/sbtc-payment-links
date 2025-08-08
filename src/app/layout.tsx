import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'sBTC Payment Links - Generate Payment Requests',
  description: 'A simple tool for generating payment requests as URLs, allowing businesses and individuals to request payments in sBTC via messaging, email, or social media.',
  keywords: ['sBTC', 'Bitcoin', 'Stacks', 'Payment', 'Links', 'Cryptocurrency'],
  authors: [{ name: 'sBTC Payment Links' }],
  openGraph: {
    title: 'sBTC Payment Links',
    description: 'Generate shareable sBTC payment request URLs',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Handle extension conflicts early
              window.addEventListener('error', function(e) {
                if (e.message && e.message.includes('StacksProvider')) {
                  console.warn('Extension conflict detected, continuing anyway...');
                  e.preventDefault();
                  return false;
                }
              });
              
              // Prevent extension conflicts by making property definition more flexible
              try {
                const originalDefineProperty = Object.defineProperty;
                Object.defineProperty = function(obj, prop, descriptor) {
                  if (prop === 'StacksProvider' && obj === window) {
                    try {
                      return originalDefineProperty.call(this, obj, prop, {
                        ...descriptor,
                        configurable: true
                      });
                    } catch (e) {
                      console.warn('StacksProvider already exists, skipping redefinition');
                      return obj;
                    }
                  }
                  return originalDefineProperty.call(this, obj, prop, descriptor);
                };
              } catch (e) {
                console.warn('Could not patch defineProperty:', e);
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}

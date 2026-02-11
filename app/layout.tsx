import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { App } from 'antd'
import ThemeProvider from '@/app/components/providers/ThemeProvider'
import AxeProvider from '@/app/components/providers/AxeProvider'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'Grid',
  description:
    'Grid is a Trello clone built with Next.js 16, React 19, TypeScript, Clerk, Supabase, Ant Design and Tailwind CSS.'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <AxeProvider>
            <ThemeProvider>
              <App>{children}</App>
            </ThemeProvider>
          </AxeProvider>
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  )
}

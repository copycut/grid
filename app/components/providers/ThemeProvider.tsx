'use client'
import { ConfigProvider } from 'antd'
import { ReactNode } from 'react'
import { useTheme } from '@/lib/hooks/useTheme'

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme()
  return <ConfigProvider theme={theme}>{children}</ConfigProvider>
}

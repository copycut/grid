'use client'
import { Tag } from 'antd'
import { useDeviceDetection } from '@/lib/hooks/useDeviceDetection'

export default function ShortcutIndicator({
  children,
  color = 'white'
}: {
  children: React.ReactNode
  color?: string
}) {
  const { isMobile, isMac } = useDeviceDetection()

  if (isMobile) {
    return null
  }

  return (
    <Tag variant="outlined" color={color} className="bg-transparent! opacity-50!">
      <span className="text-xs">{isMac ? '⌘' : 'Ctrl'}</span>
      {children}
    </Tag>
  )
}

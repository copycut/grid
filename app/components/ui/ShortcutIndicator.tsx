import { Tag } from 'antd'

export default function ShortcutIndicator({
  children,
  color = 'white'
}: {
  children: React.ReactNode
  color?: string
}) {
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  const isMac = () => {
    return /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)
  }

  if (isMobile()) {
    return null
  }

  return (
    <Tag variant="outlined" color={color} className="bg-transparent! opacity-50!">
      <span className="text-xs">{isMac() ? '⌘' : 'Ctrl'}</span>
      {children}
    </Tag>
  )
}

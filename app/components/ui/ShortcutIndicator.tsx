import { Tag } from 'antd'

export default function ShortcutIndicator({
  children,
  color = 'white'
}: {
  children: React.ReactNode
  color?: string
}) {
  // detect if the user is on mac or windows to display the correct shortcut
  const isMac = () => {
    return /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)
  }

  return (
    <Tag variant="outlined" color={color} className="bg-transparent! opacity-50!">
      <span className="text-xs">{isMac() ? '⌘' : 'Ctrl'}</span>
      {children}
    </Tag>
  )
}

import { ArrowLeftOutlined, EllipsisOutlined, ProjectFilled, StarFilled, StarOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { Button } from 'antd'

export default function NavBarTitle({
  isHomePage,
  isDashboard,
  boardTitle,
  isFavorite,
  boardId,
  onEditBoard,
  onToggleFavorite
}: {
  isHomePage: boolean
  isDashboard: boolean
  boardTitle?: string
  isFavorite?: boolean
  boardId?: number
  onEditBoard?: () => void
  onToggleFavorite?: (boardId: number) => void
}) {
  return isDashboard || isHomePage ? (
    <div className="flex items-center text-primary">
      <ProjectFilled className="text-2xl" />
      <div className="text-2xl font-bold pl-2 flex items-center gap-2 text-gray-700 dark:text-white">
        <span>Grid</span>
      </div>
    </div>
  ) : (
    <div className="flex flex-1 min-w-0 items-center text-primary">
      <Link href="/dashboard" className="flex items-center shrink-0 text-sm gap-2 pr-4 group">
        <ArrowLeftOutlined className="text-lg text-primary-400! group-hover:text-primary-900! dark:group-hover:text-primary-300! transition-colors" />
        <span className="hidden sm:inline font-medium text-primary-400 group-hover:text-primary-900 dark:group-hover:text-primary-300 transition-colors">
          Back to dashboard
        </span>
      </Link>

      <ProjectFilled className="text-2xl shrink-0" />

      <div className="flex items-center min-w-0 gap-2 text-2xl font-bold pl-2 text-gray-700 dark:text-white">
        <h1 className="truncate">{boardTitle ?? 'Board Name'}</h1>

        <Button type="text" shape="circle" onClick={() => onToggleFavorite?.(boardId || 0)} title="Toggle favorite">
          {isFavorite ? <StarFilled className="text-primary!" /> : <StarOutlined className="text-primary!" />}
        </Button>

        {onEditBoard && <Button type="text" shape="circle" icon={<EllipsisOutlined />} onClick={onEditBoard} />}
      </div>
    </div>
  )
}

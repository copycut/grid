import { ArrowLeftOutlined, EllipsisOutlined, ProjectFilled } from '@ant-design/icons'
import Link from 'next/link'
import { Button } from 'antd'

export default function NavBarTitle({
  isHomePage,
  isDashboard,
  boardTitle,
  onEditBoard
}: {
  isHomePage: boolean
  isDashboard: boolean
  boardTitle?: string
  onEditBoard?: () => void
}) {
  return isDashboard || isHomePage ? (
    <div className="flex items-center text-primary">
      <ProjectFilled className="text-2xl" />
      <div className="text-2xl font-bold pl-2 flex items-center space-x-2 text-gray-700 dark:text-white">
        <span>Grid</span>
      </div>
    </div>
  ) : (
    <div className="flex items-center text-primary">
      <Link href="/dashboard" className="flex items-center text-sm space-x-2 group">
        <ArrowLeftOutlined className="text-lg text-primary group-hover:text-primary-900! transition-colors" />
        <span className="hidden sm:inline font-medium text-primary group-hover:text-primary-900! transition-colors">
          Back to dashboard
        </span>
      </Link>
      <div className="h-4 sm:h-6 w-px bg-gray-300 hidden sm:block mx-4"></div>
      <ProjectFilled className="text-2xl" />
      <div className="flex items-center text-2xl font-bold pl-2 text-gray-700 dark:text-white">
        <div className="truncate">{boardTitle ?? 'Board Name'}</div>
        {onEditBoard && (
          <Button className="ml-2" type="text" shape="circle" icon={<EllipsisOutlined />} onClick={onEditBoard} />
        )}
      </div>
    </div>
  )
}

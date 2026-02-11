import Link from 'next/link'
import { Button, Card } from 'antd'
import { Board } from '@/lib/supabase/models'
import { RightOutlined, StarOutlined, StarFilled } from '@ant-design/icons'

export default function DashboardListItem({
  board,
  onToggleFavorite
}: {
  board: Board
  onToggleFavorite: (boardId: number) => void
}) {
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onToggleFavorite(board.id)
  }

  return (
    <Link key={board.id} href={`/boards/${board.id}`} className="group">
      <Card hoverable size="small" className="group-hover:border-primary-500!">
        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2">
              <Button type="text" shape="circle" onClick={handleToggleFavorite} title="Toggle favorite">
                {board.is_favorite ? (
                  <StarFilled className="text-primary!" />
                ) : (
                  <StarOutlined className="text-primary!" />
                )}
              </Button>
              <div className="group-hover:text-primary-500 transition-colors font-bold text-xl">{board.title}</div>
            </div>

            <div className="pl-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Created at </span>
              <span>{new Date(board.created_at).toLocaleDateString()}</span>
              <span className="font-semibold ml-4">Updated at </span>
              <span>{new Date(board.updated_at).toLocaleDateString()}</span>
            </div>
          </div>
          <RightOutlined className="text-xl text-gray-300! dark:text-gray-600! group-hover:text-primary-500! transition-colors" />
        </div>
      </Card>
    </Link>
  )
}

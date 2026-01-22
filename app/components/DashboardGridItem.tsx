import Link from 'next/link'
import { Button, Card, Tag } from 'antd'
import { Board } from '@/lib/supabase/models'
import { EllipsisOutlined } from '@ant-design/icons'

export default function DashboardGridItem({
  board,
  onEditBoard
}: {
  board: Board
  onEditBoard: (boardId: number) => void
}) {
  const isNewBoard = new Date(board.created_at) > new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)

  const handleEditBoard = (e: React.MouseEvent) => {
    e.preventDefault()
    onEditBoard(board.id)
  }

  return (
    <Link key={board.id} href={`/boards/${board.id}`} className="flex flex-col group">
      <Card
        title={
          <div className="flex items-center space-x-2 group-hover:text-primary-500 transition-colors truncate">
            <span>{board.title}</span>
            <Tag className={`text-primary ${!isNewBoard && 'hidden'}`}>New</Tag>
          </div>
        }
        extra={
          <Button type="text" size="small" onClick={handleEditBoard}>
            <EllipsisOutlined />
          </Button>
        }
        hoverable
      >
        <div className="flex flex-col space-x-2 text-sm text-gray-500">
          <div className="flex flex-nowrap items-center">
            Created at {new Date(board.created_at).toLocaleDateString()}
          </div>
          <div className="flex flex-nowrap items-center">
            Updated at {new Date(board.updated_at).toLocaleDateString()}
          </div>
        </div>
      </Card>
    </Link>
  )
}

import Link from 'next/link'
import { Card, Tag } from 'antd'
import { Board } from '@/lib/supabase/models'

export default function DashboardGridItem({ board }: { board: Board }) {
  return (
    <Link key={board.id} href={`/boards/${board.id}`} className="flex flex-col group">
      <Card
        title={<span className="group-hover:text-primary-500 transition-colors">{board.title}</span>}
        extra={<Tag className="text-primary">new</Tag>}
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

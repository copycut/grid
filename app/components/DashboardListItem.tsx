import Link from 'next/link'
import { Card } from 'antd'
import { Board } from '@/lib/supabase/models'
import { RightOutlined } from '@ant-design/icons'

export default function DashboardListItem({ board }: { board: Board }) {
  return (
    <Link
      key={board.id}
      href={`/boards/${board.id}`}
      className="group border border-gray-300 dark:border-gray-700 hover:border-primary-500 rounded-xl"
    >
      <Card hoverable size="small">
        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-2">
            <div className="group-hover:text-primary-500 transition-colors font-bold text-xl">{board.title}</div>
            <div className="text-sm text-gray-500">
              Created at <span>{new Date(board.created_at).toLocaleDateString()}</span>
            </div>
            <div className="text-sm text-gray-500">
              Updated at <span>{new Date(board.updated_at).toLocaleDateString()}</span>
            </div>
          </div>
          <RightOutlined className="text-2xl text-gray-300! dark:text-gray-600! group-hover:text-primary-500! transition-colors" />
        </div>
      </Card>
    </Link>
  )
}

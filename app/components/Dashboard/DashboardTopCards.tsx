import { Card } from 'antd'
import { ProjectFilled, RocketFilled, StarFilled } from '@ant-design/icons'
import { Board } from '@/lib/supabase/models'

export default function DashboardTopCards({ boards }: { boards: Board[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 sm:gap-6 pb-6 sm:pb-8">
      <Card title="Total Boards">
        <div className="flex items-center justify-between">
          <p className="text-xl sm:text-2xl font-bold">{boards.length}</p>
          <div className="bg-primary-200 dark:bg-primary-900 rounded-lg p-2 flex items-center justify-center text-primary-500">
            <ProjectFilled className=" text-2xl" />
          </div>
        </div>
      </Card>

      <Card title="Recent Activity">
        <div className="flex items-center justify-between">
          <p className="text-xl sm:text-2xl font-bold">
            {
              boards.filter((board) => {
                return new Date(board.created_at) > new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
              }).length
            }
          </p>
          <div className="bg-green-200 dark:bg-green-900 rounded-lg p-2 flex items-center justify-center text-green-700 dark:text-green-500">
            <RocketFilled className=" text-2xl" />
          </div>
        </div>
      </Card>

      <Card title="Total Favorites">
        <div className="flex items-center justify-between">
          <p className="text-xl sm:text-2xl font-bold">{boards.filter((board) => board.is_favorite).length}</p>
          <div className="bg-yellow-200 dark:bg-yellow-900 rounded-lg p-2 flex items-center justify-center text-yellow-700 dark:text-yellow-500">
            <StarFilled className=" text-2xl" />
          </div>
        </div>
      </Card>
    </div>
  )
}

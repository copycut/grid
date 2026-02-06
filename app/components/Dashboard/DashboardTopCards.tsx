import { Card } from 'antd'
import { ProjectFilled, RocketFilled, StarFilled } from '@ant-design/icons'
import { Board } from '@/lib/supabase/models'
import { cn } from '@/lib/utils'

export default function DashboardTopCards({ boards }: { boards: Board[] }) {
  const cardContent = [
    {
      title: 'Total Boards',
      icon: ProjectFilled,
      colorClasses: 'bg-primary-200 dark:bg-primary-900 text-primary-500',
      value: boards.length
    },
    {
      title: 'Recent Activity',
      icon: RocketFilled,
      colorClasses: 'bg-green-200 dark:bg-green-900 text-green-700 dark:text-green-500',
      value: boards.filter((board) => {
        return new Date(board.created_at) > new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
      }).length
    },
    {
      title: 'Total Favorites',
      icon: StarFilled,
      colorClasses: 'bg-yellow-200 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-500',
      value: boards.filter((board) => board.is_favorite).length
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 sm:gap-6 pb-6 sm:pb-8">
      {cardContent.map((card) => (
        <div key={card.title} className="sm:hidden flex items-center gap-4">
          <div className={cn(card.colorClasses, 'rounded-lg p-2 flex items-center justify-center')}>
            <card.icon className=" text-xl" />
          </div>
          <p className="text-nm font-bold">
            {card.title}: {card.value}
          </p>
        </div>
      ))}
      {cardContent.map((card) => (
        <Card key={card.title} title={card.title} className="hidden sm:block">
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold">{card.value}</p>
            <div className={cn(card.colorClasses, 'rounded-lg p-2 flex items-center justify-center')}>
              <card.icon className=" text-2xl" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

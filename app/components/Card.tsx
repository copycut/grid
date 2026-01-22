import { Card as CardType } from '@/lib/supabase/models'
import { NewCard } from '@/types/types'
import { Tag } from 'antd'
import { AlignLeftOutlined } from '@ant-design/icons'

export default function Card({ card, onEditCard }: { card: CardType; onEditCard: (card: NewCard) => void }) {
  const priorityColors = {
    low: 'green',
    medium: 'orange',
    high: 'red',
    default: ''
  }

  // Crop description to 2 lines
  const croppedDescription = card.description?.split(' ').slice(0, 10).join(' ') + '...'

  return (
    <div
      className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-300 dark:border-neutral-700 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onEditCard(card)}
    >
      <div className="py-2 px-3">
        <div className="flex items-center justify-between space-x-2 min-w-0">
          <h3 className="font-bold mb-0 truncated">{card.title}</h3>
          <Tag color={priorityColors[card.priority]}>
            <span className="capitalize">{card.priority}</span>
          </Tag>
        </div>
        {card.description && (
          <div className="flex items-center space-x-4 py-2">
            <AlignLeftOutlined className="opacity-30" />
            <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{croppedDescription}</div>
          </div>
        )}
      </div>
    </div>
  )
}

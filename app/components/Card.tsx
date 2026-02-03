import { Card as CardType } from '@/lib/supabase/models'
import { NewCard } from '@/types/types'
import { Tag } from 'antd'
import { AlignLeftOutlined } from '@ant-design/icons'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function Card({
  card,
  priorityOptions,
  onEditCard
}: {
  card: CardType
  priorityOptions: { value: string; label: string; color: string }[]
  onEditCard: (card: NewCard) => void
}) {
  const { setNodeRef, listeners, attributes, transform, transition, isDragging } = useSortable({ id: card.id })
  const styles = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-300 dark:border-neutral-700 cursor-pointer hover:shadow-lg transition-shadow"
      style={styles}
      onClick={() => onEditCard(card)}
    >
      <div className="py-2 px-3">
        <div className="flex items-center justify-between space-x-2 min-w-0">
          <h3 className="font-medium mb-0 truncated">{card.title}</h3>
          <Tag color={priorityOptions.find((option) => option.value === card.priority)?.color || ''}>
            {priorityOptions.find((option) => option.value === card.priority)?.label}
          </Tag>
        </div>
        {card.description && (
          <div className="flex items-start space-x-4 py-2">
            <AlignLeftOutlined className="opacity-30 mt-1" />
            <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{card.description}</div>
          </div>
        )}
      </div>
    </div>
  )
}

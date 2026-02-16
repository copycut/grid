import { Card as CardType } from '@/lib/supabase/models'
import { NewCard } from '@/types/types'
import { Tag } from 'antd'
import { AlignLeftOutlined } from '@ant-design/icons'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { formatDate } from '@/lib/utils/date'

export default function Card({
  card,
  priorityOptions,
  onEditCard
}: {
  card: CardType
  priorityOptions: { value: string; label: string; color: string }[]
  onEditCard?: (card: NewCard) => void
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
      onClick={() => onEditCard?.(card)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onEditCard?.(card)
        }
      }}
    >
      <div className="py-2 px-3">
        <div className="flex items-center justify-between space-x-2 min-w-0">
          <h3 className="font-medium mb-0 truncated user-select-none">{card.title}</h3>
          <Tag
            color={priorityOptions.find((option) => option.value === card.priority)?.color || ''}
            className="user-select-none"
          >
            {priorityOptions.find((option) => option.value === card.priority)?.label}
          </Tag>
        </div>
        {card.description && (
          <div className="flex items-start space-x-4 py-2 user-select-none">
            <AlignLeftOutlined className="opacity-50 mt-0.5" />
            <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{formatDate(card.updated_at)}</div>
          </div>
        )}
      </div>
    </div>
  )
}

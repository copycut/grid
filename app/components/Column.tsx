import { ColumnWithCards as ColumnType } from '@/lib/supabase/models'
import { Button, Tag } from 'antd'
import { EllipsisOutlined, PlusOutlined } from '@ant-design/icons'
import { useDroppable } from '@dnd-kit/core'

export default function Column({
  column,
  children,
  onCreateCard,
  onEditColumn
}: {
  column: ColumnType
  children: React.ReactNode
  onCreateCard: () => void
  onEditColumn: () => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <div className="w-full lg:shrink-0 lg:w-80 pt-1">
      <div
        ref={setNodeRef}
        className={`${isOver ? 'ring-2 ring-primary-500' : ''} bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-300 dark:border-gray-700 transition-all`}
      >
        {/* Column header */}
        <div className="p-3 sm:p-4 border-b border-b-gray-300 dark:border-b-neutral-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0">
              <h3 className="font-bold truncated">{column.title}</h3>
              <Tag>{column.cards.length}</Tag>
            </div>
            <Button type="text" shape="circle" icon={<EllipsisOutlined />} onClick={onEditColumn} />
          </div>
        </div>

        {/* Column content */}
        <div className="p-2 space-y-3">{children}</div>

        {/* Column footer */}
        <div className="p-2">
          <Button
            className="w-full opacity-50 hover:opacity-100 transitions-opacity"
            type="text"
            onClick={onCreateCard}
          >
            <PlusOutlined />
            Add Card
          </Button>
        </div>
      </div>
    </div>
  )
}

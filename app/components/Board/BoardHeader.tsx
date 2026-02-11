import { Button, Tag } from 'antd'
import { PlusOutlined, CloseOutlined } from '@ant-design/icons'
import { Filter } from '@/types/types'

export default function BoardHeader({
  filteredCardsCount,
  totalCardsCount,
  filterCount,
  filters,
  filterOptions,
  onResetFilters,
  onAddCard
}: {
  filteredCardsCount: number
  totalCardsCount: number
  filterCount: number
  filters: Filter
  filterOptions: { priority: { value: string; label: string; color: string }[] }
  onResetFilters: () => void
  onAddCard: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-2 pb-6 px-4">
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 pb-2">
        <div className="text-sm text-gray-600 dark:text-white/50">
          <h2 className="inline font-medium">Total cards: </h2>
          {filterCount > 0 && <span>{filteredCardsCount}/</span>}
          <span>{totalCardsCount}</span>
        </div>

        {filterCount > 0 && (
          <div className="flex items-center flex-wrap gap-2 text-sm text-gray-600 dark:text-white/50">
            <span className="font-medium">Filters:</span>
            {filters.priority?.map((priority) => (
              <Tag key={priority} color={filterOptions.priority.find((option) => option.value === priority)?.color}>
                {filterOptions.priority.find((option) => option.value === priority)?.label}
              </Tag>
            ))}
            <div className="flex items-center gap-2">
              <Button type="text" size="small" onClick={onResetFilters}>
                <CloseOutlined />
                Reset filters
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className="pb-2">
        <Button color="primary" variant="solid" onClick={onAddCard}>
          <PlusOutlined />
          Add Card
        </Button>
      </div>
    </div>
  )
}

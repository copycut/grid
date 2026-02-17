'use client'

import {
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  DndContext,
  rectIntersection,
  DragOverlay
} from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDragAndDrop } from '@/lib/hooks/useDragAndDrop'
import { moveColumn as moveColumnAction } from '@/lib/actions/column.actions'
import { moveCard as moveCardAction } from '@/lib/actions/card.actions'
import { ColumnWithCards, Card as CardType } from '@/lib/supabase/models'
import { NewCard } from '@/types/types'
import Column from '@/app/components/Column'
import Card from '@/app/components/Card'
import AddColumnButton from '@/app/components/Board/AddColumnButton'

interface BoardContentProps {
  filteredColumns: ColumnWithCards[]
  filterOptions: { priority: { value: string; label: string; color: string }[] }
  boardId: number
  setColumns: React.Dispatch<React.SetStateAction<ColumnWithCards[]>>
  onEditCard: (card: NewCard | CardType | null, columnId: number | null) => void
  onEditColumn: (column: ColumnWithCards | null) => void
  onAddColumn: () => void
  newlyCreatedCardId: number | null
}

export default function BoardContent({
  filteredColumns,
  filterOptions,
  boardId,
  setColumns,
  onEditCard,
  onEditColumn,
  onAddColumn,
  newlyCreatedCardId
}: BoardContentProps) {
  const sensors = useSensors(
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const { activeCard, activeColumn, handleDragStart, handleDragOver, handleDragEnd } = useDragAndDrop(
    filteredColumns,
    setColumns,
    (cardId: number, newColumnId: number, newPosition: number) =>
      moveCardAction(cardId, newColumnId, newPosition, boardId),
    (columnId: number, newPosition: number) => moveColumnAction(columnId, newPosition, boardId)
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={filteredColumns.map((col) => col.id)} strategy={horizontalListSortingStrategy}>
        <div
          id="board"
          className="flex flex-col lg:flex-row lg:space-x-6 lg:overflow-x-auto lg:pb-6 px-2 lg:px-4 space-y-4 lg:space-y-0 min-h-dvh"
        >
          {filteredColumns?.map((column) => (
            <Column
              key={column.id}
              column={column}
              onCreateCard={() => onEditCard(null, column.id)}
              onEditColumn={() => onEditColumn(column)}
            >
              <SortableContext items={column.cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
                {column.cards.map((card) => (
                  <Card
                    key={card.id}
                    card={card}
                    priorityOptions={filterOptions.priority}
                    onEditCard={(card: NewCard | CardType) => onEditCard(card, column.id)}
                    isNewlyCreated={card.id === newlyCreatedCardId}
                  />
                ))}
              </SortableContext>
            </Column>
          ))}
          <AddColumnButton onAddColumn={onAddColumn} />
        </div>
      </SortableContext>

      <DragOverlay>
        {activeCard && (
          <div style={{ transform: 'rotate(2deg)', transition: 'transform 0.3s ease-out' }}>
            <Card card={activeCard} priorityOptions={filterOptions.priority} />
          </div>
        )}
        {activeColumn && (
          <Column column={activeColumn}>
            <div className="space-y-3">
              {activeColumn.cards.map((card) => (
                <Card key={card.id} card={card} priorityOptions={filterOptions.priority} />
              ))}
            </div>
          </Column>
        )}
      </DragOverlay>
    </DndContext>
  )
}

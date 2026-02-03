'use client'
import { useState } from 'react'
import { Filter, NewCard } from '@/types/types'
import { Column as ColumnType, Card as CardType, ColumnWithCards } from '@/lib/supabase/models'
import { useParams } from 'next/navigation'
import { useBoard } from '@/lib/hooks/useBoards'
import { Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import NavBar from '@/app/components/NavBar'
import CardEditionModal from '@/app/components/CardEditionModal'
import BoardEditionModal from '@/app/components/BoardEditionModal'
import BoardFiltersModal from '@/app/components/BoardFiltersModal'
import Column from '@/app/components/Column'
import Card from '@/app/components/Card'
import ColumnEditionModal from '@/app/components/ColumnEditionModal'
import { DndContext, DragOverlay, PointerSensor, rectIntersection, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import { verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDragAndDrop } from '@/lib/hooks/useDragAndDrop'
import { AddColumnButton } from '@/app/components/AddColumnButton'

export default function BoardPage() {
  const { id } = useParams<{ id: string }>()
  const boardId = Number(id)
  const {
    board,
    columns,
    updateBoard,
    setColumns,
    createColumn,
    deleteColumn,
    updateColumn,
    createCard,
    updateCard,
    moveCard
  } = useBoard(boardId)
  const [isBoardEditing, setIsBoardEditing] = useState(false)
  const [isFiltering, setIsFiltering] = useState(false)
  const [filters, setFilters] = useState<Filter>({})
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [cardToEdit, setCardToEdit] = useState<NewCard | CardType | null>(null)
  const [columnTargetId, setColumnTargetId] = useState<number | null>(null)
  const [isEditingColumn, setIsEditingColumn] = useState(false)
  const [columnToEdit, setColumnToEdit] = useState<ColumnType | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))
  const { activeCard, handleDragStart, handleDragOver, handleDragEnd } = useDragAndDrop(columns, setColumns, moveCard)

  const handleUpdateBoard = async (title: string) => {
    if (!board || !title.trim()) return

    try {
      await updateBoard(board.id, { title: title.trim() })
    } catch (error) {
      console.error(error)
    } finally {
      setIsBoardEditing(false)
    }
  }

  const filterOptions = {
    priority: [
      { value: 'default', label: 'None' },
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' }
    ]
  }

  const handleSubmitFilters = (filters: Filter) => {
    setFilters(filters)
    // TODO: filter cards

    setIsFiltering(false)
  }

  const handleResetFilters = () => {
    setFilters({ ...filters, priority: 'default' })
    setIsFiltering(false)
  }

  const filterCount = () => {
    return Object.keys(filters).reduce(
      (count, filterKey) => (filters[filterKey as keyof Filter] !== 'default' ? count + 1 : count),
      0
    )
  }

  const handleEditColumn = (column: ColumnType | null) => {
    setColumnToEdit(column)
    setIsEditingColumn(true)
  }

  const handleUpdateColumn = async (column: ColumnWithCards) => {
    await updateColumn(column)
    setIsEditingColumn(false)
    setColumnToEdit(null)
  }

  const handleEditCard = (card: NewCard | CardType | null, columnId: number | null) => {
    setCardToEdit(card)
    setColumnTargetId(columnId || columns[0].id)
    setIsAddingCard(true)
  }

  const handleCreateCard = async (newCard: NewCard, columnId: number) => {
    if (!newCard.title.trim()) return

    await createCard(newCard, columnId)
    setIsAddingCard(false)
    setColumnTargetId(null)
    setCardToEdit(null)
  }

  const handleCreateColumn = async (title: string) => {
    if (!title) return

    await createColumn(title)
    setIsEditingColumn(false)
    setColumnToEdit(null)
  }

  const handleDeleteColumn = async (columnId: number) => {
    await deleteColumn(columnId)
    setIsEditingColumn(false)
    setColumnToEdit(null)
  }

  const handleUpdateCard = async (card: CardType, columnId: number | null) => {
    if (!card.title.trim()) return

    await updateCard(card, columnId || columns[0].id)
    setIsAddingCard(false)
    setColumnTargetId(null)
    setCardToEdit(null)
  }

  return (
    <div className="min-h-screen">
      <NavBar
        boardTitle={board?.title}
        onEditBoard={() => setIsBoardEditing(true)}
        onFilter={() => setIsFiltering(true)}
        filterCount={filterCount()}
      />

      <main className="py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 space-x-4 sm:space-x-0 px-2 sm:px-4 ">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pb-2">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Total cards: </span>
              <span>{columns?.reduce((count, column) => count + column.cards.length, 0)}</span>
            </div>
          </div>
          <div className="pb-2">
            <Button color="primary" variant="solid" onClick={() => handleEditCard(null, null)}>
              <PlusOutlined />
              Add Card
            </Button>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={rectIntersection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div
            id="board"
            className="flex flex-col lg:flex-row lg:space-x-6 lg:overflow-x-auto lg:pb-6 px-2 lg:px-4 lg:[&::-webkit-scrollbar]:h2 lg:[&::-webkit-scrollbar-track]:bg-gray-300 lg:[&::-webkit-scrollbar-thumb]:rounded-xl lg:[&::-webkit-scrollbar-thumb]:bg-gray-400 space-y-4 lg:space-y-0 h-[calc(100vh-200px)]"
          >
            {columns?.map((column) => (
              <Column
                key={column.id}
                column={column}
                onCreateCard={() => handleEditCard(null, column.id)}
                onEditColumn={() => handleEditColumn(column)}
              >
                <SortableContext items={column.cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
                  {column.cards.map((card) => (
                    <Card
                      key={card.id}
                      card={card}
                      onEditCard={(card: NewCard | CardType) => handleEditCard(card, column.id)}
                    />
                  ))}
                </SortableContext>
              </Column>
            ))}

            <AddColumnButton onAddColumn={() => handleEditColumn(null)} />
          </div>

          <DragOverlay>{activeCard && <Card card={activeCard} onEditCard={() => {}} />}</DragOverlay>
        </DndContext>
      </main>

      <ColumnEditionModal
        isOpen={isEditingColumn}
        column={columnToEdit}
        onClose={() => setIsEditingColumn(false)}
        onSave={(title) => handleCreateColumn(title)}
        onEdit={(column) => handleUpdateColumn(column)}
        onDeleteColumn={(columnId) => handleDeleteColumn(columnId)}
      />

      <CardEditionModal
        isOpen={isAddingCard}
        columnTargetId={columnTargetId}
        columns={columns}
        card={cardToEdit}
        filterOptions={filterOptions}
        onClose={() => setIsAddingCard(false)}
        onEdit={(newCard: CardType, columnId: number) => handleUpdateCard(newCard, columnId)}
        onSave={(newCard: NewCard, columnId: number) => handleCreateCard(newCard, columnId)}
      />

      <BoardEditionModal
        isOpen={isBoardEditing}
        board={board}
        onClose={() => setIsBoardEditing(false)}
        onSubmit={(title: string) => handleUpdateBoard(title)}
      />

      <BoardFiltersModal
        isOpen={isFiltering}
        filters={filters}
        priorities={filterOptions}
        onReset={handleResetFilters}
        onClose={() => setIsFiltering(false)}
        onSubmit={(filters: Filter) => handleSubmitFilters(filters)}
      />
    </div>
  )
}

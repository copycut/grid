'use client'
import { useState } from 'react'
import { Filter, NewCard } from '@/types/types'
import { Column as ColumnType, Card as CardType } from '@/lib/supabase/models'
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

export default function BoardPage() {
  const { id } = useParams<{ id: string }>()
  const boardId = Number(id)
  const { board, columns, updateBoard, createCard, updateCard } = useBoard(boardId)
  const [isBoardEditing, setIsBoardEditing] = useState(false)
  const [isFiltering, setIsFiltering] = useState(false)
  const [filters, setFilters] = useState<Filter>({})
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [cardToEdit, setCardToEdit] = useState<NewCard | CardType | null>(null)
  const [columnTargetId, setColumnTargetId] = useState<number | null>(null)
  const [isEditingColumn, setIsEditingColumn] = useState(false)
  const [columnToEdit, setColumnToEdit] = useState<ColumnType | null>(null)

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

  const handleEditColumn = (column: ColumnType) => {
    setColumnToEdit(column)
    setIsEditingColumn(true)
  }

  const handleUpdateColumn = (column: ColumnType) => {
    console.log(column)
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
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Total cards: </span>
              <span>{columns?.reduce((count, column) => count + column.cards.length, 0)}</span>
            </div>
          </div>
          <Button color="primary" variant="solid" onClick={() => handleEditCard(null, null)}>
            <PlusOutlined />
            Add Card
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row lg:space-x-6 lg:overflow-x-auto lg:pb-6 px-2 lg:px-4 lg:[&::-webkit-scrollbar]:h2 lg:[&::-webkit-scrollbar-track]:bg-gray-300 lg:[&::-webkit-scrollbar-thumb]:rounded-xl lg:[&::-webkit-scrollbar-thumb]:bg-gray-400 space-y-4 lg:space-y-0 h-[calc(100vh-200px)]">
          {columns?.map((column) => (
            <Column
              key={column.id}
              column={column}
              onCreateCard={() => handleEditCard(null, column.id)}
              onEditColumn={() => handleEditColumn(column)}
            >
              <div className="space-y-3">
                {column.cards.map((card) => (
                  <Card
                    key={card.id}
                    card={card}
                    onEditCard={(card: NewCard | CardType) => handleEditCard(card, column.id)}
                  />
                ))}
              </div>
            </Column>
          ))}
        </div>
      </main>

      <ColumnEditionModal
        isOpen={isEditingColumn}
        column={columnToEdit}
        onClose={() => setIsEditingColumn(false)}
        onSubmit={(column) => handleUpdateColumn(column)}
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

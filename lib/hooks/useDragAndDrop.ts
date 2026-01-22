import { useState } from 'react'
import { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'
import { Card as CardType, ColumnWithCards } from '@/lib/supabase/models'

export function useDragAndDrop(
  columns: ColumnWithCards[],
  setColumns: React.Dispatch<React.SetStateAction<ColumnWithCards[]>>,
  moveCard: (cardId: number, newColumnId: number, newPosition: number) => Promise<void>
) {
  const [activeCard, setActiveCard] = useState<CardType | null>(null)

  const handleDragStart = (event: DragStartEvent) => {
    const cardId = event.active.id
    const card = columns.flatMap((column) => column.cards).find((card) => card.id === cardId)

    if (card) {
      setActiveCard(card)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const sourceColumn = columns.find((column) => column.cards.find((card) => card.id === activeId))
    const targetColumn = columns.find((column) => column.cards.find((card) => card.id === overId))

    if (!sourceColumn || !targetColumn) return

    if (sourceColumn.id === targetColumn.id) {
      const activeIndex = sourceColumn.cards.findIndex((card) => card.id === activeId)
      const overIndex = targetColumn.cards.findIndex((card) => card.id === overId)

      if (activeIndex !== overIndex) {
        setColumns((prev: ColumnWithCards[]) => {
          const newColumns = [...prev]
          const column = newColumns.find((column) => column.id === sourceColumn.id)

          if (column) {
            const cards = [...column.cards]
            const [removedCard] = cards.splice(activeIndex, 1)
            cards.splice(overIndex, 0, removedCard)
            column.cards = cards
          }
          return newColumns
        })
      }
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCard(null)
    if (!over) return

    const cardId = active.id as number
    const overId = over.id as number

    const sourceColumn = columns.find((column) => column.cards.find((card) => card.id === cardId))
    const targetColumn = columns.find(
      (column) => column.id === overId || column.cards.find((card) => card.id === overId)
    )

    if (!sourceColumn || !targetColumn) return

    let newPosition: number
    if (targetColumn.id === overId) {
      newPosition = targetColumn.cards.length
    } else {
      newPosition = targetColumn.cards.findIndex((card) => card.id === overId)
    }

    const oldPosition = sourceColumn.cards.findIndex((card) => card.id === cardId)
    if (sourceColumn.id === targetColumn.id && oldPosition === newPosition) {
      return
    }

    setColumns((prev: ColumnWithCards[]) => {
      const newColumns = [...prev]
      let cardToMove: CardType | null = null
      let oldColumnId: number | null = null

      for (const column of newColumns) {
        const cardIndex = column.cards.findIndex((card) => card.id === cardId)
        if (cardIndex !== -1) {
          cardToMove = column.cards[cardIndex]
          oldColumnId = column.id
          column.cards.splice(cardIndex, 1)
          break
        }
      }

      if (cardToMove) {
        const targetCol = newColumns.find((column) => column.id === targetColumn.id)
        if (targetCol) {
          cardToMove.column_id = targetColumn.id
          targetCol.cards.splice(newPosition, 0, cardToMove)

          targetCol.cards.forEach((card, index) => {
            card.position = index
          })
        }

        if (oldColumnId !== targetColumn.id) {
          const oldCol = newColumns.find((column) => column.id === oldColumnId)
          if (oldCol) {
            oldCol.cards.forEach((card, index) => {
              card.position = index
            })
          }
        }
      }

      return newColumns
    })

    try {
      await moveCard(cardId, targetColumn.id, newPosition)
    } catch (error) {
      console.error('Failed to move card:', error)
    }
  }

  return { activeCard, handleDragStart, handleDragOver, handleDragEnd }
}

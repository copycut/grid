import { Priority } from '@/types/types'

export interface Board {
  id: number
  title: string
  user_id: string
  created_at: string
  updated_at: string
  is_favorite?: boolean
  background_color?: string | null
}

export interface Column {
  id: number
  title: string
  position: number
  board_id: number
  created_at: string
}

export interface Card {
  id: number
  title: string
  description?: string
  position: number
  priority: Priority
  column_id: number
  created_at: string
  updated_at: string
}

export type ColumnWithCards = Column & { cards: Card[] }

export type OptimisticCard = Card & { isOptimistic?: boolean }
export type OptimisticColumn = ColumnWithCards & { isOptimistic?: boolean; cards: OptimisticCard[] }

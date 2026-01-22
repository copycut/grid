export interface Board {
  id: number
  title: string
  user_id: string
  created_at: string
  updated_at: string
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
  priority: 'default' | 'low' | 'medium' | 'high'
  column_id: number
  created_at: string
  updated_at: string
}

export type ColumnWithCards = Column & { cards: Card[] }

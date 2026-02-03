export type Priority = 'default' | 'low' | 'medium' | 'high'

export interface Filter {
  priority?: Priority[]
}

export interface NewCard {
  title: string
  description?: string
  priority: Priority
  column_id: number
}

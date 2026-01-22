export interface Filter {
  priority?: 'default' | 'low' | 'medium' | 'high'
}

export interface NewCard {
  title: string
  description?: string
  priority: 'default' | 'low' | 'medium' | 'high'
  column_id: number
}

type OptimisticItem = { isOptimistic?: boolean }

interface DeduplicationConfig<T extends OptimisticItem> {
  getKey: (item: T) => string
}

export function deduplicateOptimisticItems<T extends OptimisticItem>(items: T[], config: DeduplicationConfig<T>): T[] {
  const seenKeys = new Map<string, { item: T; index: number }>()
  const result: T[] = []

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const key = config.getKey(item)
    const existing = seenKeys.get(key)

    if (!existing) {
      seenKeys.set(key, { item, index: result.length })
      result.push(item)
    } else if (!item.isOptimistic && existing.item.isOptimistic) {
      result[existing.index] = item
      seenKeys.set(key, { item, index: existing.index })
    }
  }

  return result
}

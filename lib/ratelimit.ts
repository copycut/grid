interface RateLimitEntry {
  count: number
  resetTime: number
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

export class InMemoryRateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(
    private maxRequests: number,
    private windowMs: number,
    private name: string = 'default'
  ) {
    // Clean up expired entries every minute to prevent memory leaks
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000)
  }

  async limit(identifier: string): Promise<RateLimitResult> {
    const now = Date.now()
    const key = `${this.name}:${identifier}`
    const entry = this.store.get(key)

    // Clean up expired entry
    if (entry && entry.resetTime < now) {
      this.store.delete(key)
    }

    const current = this.store.get(key)

    // First request in this window
    if (!current) {
      const resetTime = now + this.windowMs
      this.store.set(key, {
        count: 1,
        resetTime
      })
      return {
        success: true,
        limit: this.maxRequests,
        remaining: this.maxRequests - 1,
        reset: resetTime
      }
    }

    // Rate limit exceeded
    if (current.count >= this.maxRequests) {
      return {
        success: false,
        limit: this.maxRequests,
        remaining: 0,
        reset: current.resetTime
      }
    }

    // Increment count
    current.count++
    return {
      success: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - current.count,
      reset: current.resetTime
    }
  }

  // Clean up expired entries to prevent memory leaks
  private cleanup() {
    const now = Date.now()
    let cleaned = 0

    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime < now) {
        this.store.delete(key)
        cleaned++
      }
    }

    if (cleaned > 0) {
      console.log(`[RateLimit:${this.name}] Cleaned up ${cleaned} expired entries`)
    }
  }

  // Get current stats for debugging
  getStats() {
    return {
      name: this.name,
      activeEntries: this.store.size,
      maxRequests: this.maxRequests,
      windowMs: this.windowMs
    }
  }

  // Clear all entries (useful for testing)
  clear() {
    this.store.clear()
  }

  // Cleanup on shutdown
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.store.clear()
  }
}

// Rate limiter instances for different operations
export const cardCreateLimiter = new InMemoryRateLimiter(30, 60000, 'card:create')
export const cardUpdateLimiter = new InMemoryRateLimiter(30, 60000, 'card:update')
export const cardMoveLimiter = new InMemoryRateLimiter(60, 60000, 'card:move')
export const cardDeleteLimiter = new InMemoryRateLimiter(20, 60000, 'card:delete')
export const columnCreateLimiter = new InMemoryRateLimiter(20, 60000, 'column:create')
export const columnUpdateLimiter = new InMemoryRateLimiter(20, 60000, 'column:update')
export const columnMoveLimiter = new InMemoryRateLimiter(40, 60000, 'column:move')
export const columnDeleteLimiter = new InMemoryRateLimiter(15, 60000, 'column:delete')
export const boardCreateLimiter = new InMemoryRateLimiter(10, 60000, 'board:create')
export const boardUpdateLimiter = new InMemoryRateLimiter(20, 60000, 'board:update')
export const boardDeleteLimiter = new InMemoryRateLimiter(10, 60000, 'board:delete')
export const boardLoadLimiter = new InMemoryRateLimiter(60, 60000, 'board:load')

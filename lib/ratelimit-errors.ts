export class RateLimitError extends Error {
  constructor(
    message: string,
    public limit: number,
    public remaining: number,
    public reset: number
  ) {
    super(message)
    this.name = 'RateLimitError'
  }
}

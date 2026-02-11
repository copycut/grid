export function formatDate(date: string | Date | number, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }

  return new Date(date).toLocaleString('en-US', options || defaultOptions)
}

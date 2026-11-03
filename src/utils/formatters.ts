export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('en-PH', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatDateTime(date: string | Date): string {
  return `${formatDate(date)} ${formatTime(date)}`
}

export function formatCalories(cal: number): string {
  return `${Math.round(cal)} kcal`
}

export function formatWeight(kg: number): string {
  return `${kg.toFixed(1)} kg`
}

export function formatMoney(php: number): string {
  return `₱${php.toFixed(2)}`
}

export function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)

  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(date)
}

export function isToday(date: string): boolean {
  return new Date(date).toDateString() === new Date().toDateString()
}

export function isYesterday(date: string): boolean {
  const d = new Date(date)
  const y = new Date()
  y.setDate(y.getDate() - 1)
  return d.toDateString() === y.toDateString()
}

export function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function dayLabel(date: string): string {
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return formatDate(date)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function percent(value: number, total: number): number {
  if (total <= 0) return 0
  return clamp(Math.round((value / total) * 100), 0, 100)
}


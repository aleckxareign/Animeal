
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

type ButtonProps = {
  to: string
  children: ReactNode
  variant?: 'primary' | 'outline'
  className?: string
}

export default function Button({
  to,
  children,
  variant = 'primary',
  className = '',
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-lg px-6 py-3 text-base font-semibold transition-colors duration-200'

  const styles =
    variant === 'primary'
      ? 'bg-brand-dark text-white hover:opacity-90'
      : 'border border-brand-dark bg-transparent text-brand-dark transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-sage hover:bg-white hover:shadow-md'

  return (
    <Link to={to} className={`${base} ${styles} ${className}`}>
      {children}
    </Link>
  )
}

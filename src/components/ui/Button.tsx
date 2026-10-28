import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

type ButtonProps = {
  to: string
  children: ReactNode
  variant?: 'primary' | 'outline'
}

export default function Button({ to, children, variant = 'primary' }: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-lg px-6 py-3 text-base font-semibold transition'
  const styles =
    variant === 'primary'
      ? 'bg-brand-dark text-white hover:opacity-90'
      : 'border border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white'

  return (
    <Link to={to} className={`${base} ${styles}`}>
      {children}
    </Link>
  )
}
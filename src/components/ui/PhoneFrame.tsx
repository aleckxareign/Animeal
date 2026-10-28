import type { ReactNode } from 'react'

export default function PhoneFrame({ children }: { children?: ReactNode }) {
  return (
    <div className="relative mx-auto h-64 w-32 overflow-hidden rounded-[1.5rem] border-4 border-gray-900 bg-white">
      <div className="absolute left-1/2 top-1 h-3 w-12 -translate-x-1/2 rounded-full bg-gray-900" />
      {children}
    </div>
  )
}
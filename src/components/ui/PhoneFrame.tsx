import type { ReactNode } from 'react'

export default function PhoneFrame({ children }: { children?: ReactNode }) {
  return (
    <div className="relative mx-auto h-[340px] w-[180px] sm:w-[200px] sm:h-[370px] overflow-hidden rounded-[2.5rem] border-[6px] border-foreground bg-card shadow-2xl ring-1 ring-black/10 transition-transform duration-300 hover:scale-[1.02]">
      {/* Dynamic Island / Speaker Pill */}
      <div className="absolute left-1/2 top-2 z-20 h-3.5 w-16 -translate-x-1/2 rounded-full bg-brand-dark shadow-xs" />
      {/* Screen Content */}
      <div className="h-full w-full overflow-hidden pt-7 bg-background/20">
        {children}
      </div>
    </div>
  )
}

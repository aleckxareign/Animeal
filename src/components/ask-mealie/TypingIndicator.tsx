export default function TypingIndicator() {
  return (
    <div className="flex justify-start gap-2.5 animate-fade-in pr-6">
      {/* Mealie Avatar */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-cream ring-1 ring-brand-sage/30 shadow-xs mt-1">
        <img
          src="/images/mealie.svg"
          alt="Mealie"
          className="h-6 w-6 object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
            const parent = e.currentTarget.parentElement
            if (parent) {
              parent.innerHTML = '<span class="text-sm">🐾</span>'
            }
          }}
        />
      </div>

      {/* Typing Bubble */}
      <div className="flex flex-col items-start">
        <div className="flex items-center gap-2 rounded-2xl rounded-tl-xs border border-brand-dark/10 bg-white px-4 py-3 shadow-xs">
          <div className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full bg-brand-sage animate-bounce"
              style={{ animationDelay: '0ms', animationDuration: '0.8s' }}
            />
            <span
              className="h-2 w-2 rounded-full bg-brand-sage animate-bounce"
              style={{ animationDelay: '150ms', animationDuration: '0.8s' }}
            />
            <span
              className="h-2 w-2 rounded-full bg-brand-sage animate-bounce"
              style={{ animationDelay: '300ms', animationDuration: '0.8s' }}
            />
          </div>
          <span className="text-xs text-brand-dark/60 font-medium ml-1">
            Mealie is thinking... <span className="text-[11px] opacity-75">(Nagiisip si Mealie)</span>
          </span>
        </div>
      </div>
    </div>
  )
}

type SectionHeadingProps = {
  eyebrow?: string
  title: string
  subtitle?: string
}

export default function SectionHeading({ eyebrow, title, subtitle }: SectionHeadingProps) {
  return (
    <div className="max-w-2xl">
      {eyebrow && (
        <p className="mb-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-brand-sage">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-dark tracking-tight leading-tight text-balance">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-base text-brand-dark/75 leading-relaxed text-pretty">
          {subtitle}
        </p>
      )}
    </div>
  )
}

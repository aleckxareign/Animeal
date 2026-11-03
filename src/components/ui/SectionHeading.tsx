type SectionHeadingProps = {
  eyebrow?: string
  title: string
  subtitle?: string
}

export default function SectionHeading({ eyebrow, title, subtitle }: SectionHeadingProps) {
  return (
    <div className="mb-12 max-w-4xl">
      {eyebrow && (
        <p className="mb-3 text-sm sm:text-base font-bold uppercase tracking-wider text-brand-sage">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-dark tracking-tight leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base sm:text-lg lg:text-xl text-brand-dark/75 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  )
}
type SectionHeadingProps = {
  eyebrow?: string
  title: string
  subtitle?: string
}

export default function SectionHeading({ eyebrow, title, subtitle }: SectionHeadingProps) {
  return (
    <div className="mb-10 max-w-3xl">
      {eyebrow && (
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-dark/70">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-3xl text-brand-dark md:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-gray-600">{subtitle}</p>}
    </div>
  )
}
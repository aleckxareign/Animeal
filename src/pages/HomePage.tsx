import Hero from '../components/home/Hero'
import TrustStrip from '../components/home/TrustStrip'
import ToolShowcase from '../components/home/ToolShowcase'
import NearbyVets from '../components/home/NearbyVets'

export default function HomePage() {
  return (
    <>
      <div className="flex min-h-[calc(100dvh-4rem)] sm:min-h-[calc(100dvh-4.5rem)] flex-col justify-between bg-brand-cream">
        <Hero className="flex-1" />
        <TrustStrip />
      </div>
      <ToolShowcase />
      <NearbyVets />
    </>
  )
}

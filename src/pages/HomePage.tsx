import Hero from '../components/home/Hero'
import TrustStrip from '../components/home/TrustStrip'
import FeatureCards from '../components/home/FeatureCards'
import HowItWorks from '../components/home/HowItWorks'
import NearbyVets from '../components/home/NearbyVets'
import MealiePreview from '../components/home/MealiePreview'

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <FeatureCards />
      <HowItWorks />
      <NearbyVets />
      <MealiePreview />
    </>
  )
}
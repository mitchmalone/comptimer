import { Marquee } from './_components/marquee'
import { SiteHeader } from './_components/site-header'
import { Hero } from './_components/hero'
import { HowItWorks } from './_components/how-it-works'
import { FeaturePills } from './_components/feature-pills'
import { DuoShowcase } from './_components/duo-showcase'
import { Formats } from './_components/formats'
import { CtaBand } from './_components/cta-band'
import { SiteFooter } from './_components/site-footer'

export default function Home() {
  return (
    <>
      <Marquee />
      <SiteHeader />
      <main>
        <Hero />
        <HowItWorks />
        <FeaturePills />
        <DuoShowcase />
        <Formats />
        <CtaBand />
      </main>
      <SiteFooter />
    </>
  )
}

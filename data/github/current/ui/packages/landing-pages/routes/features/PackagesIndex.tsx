import {ThemeProvider, Hero} from '@primer/react-brand'
import {Spacer} from './components/Spacer'

const extURLs = {
  get_started: 'https://docs.github.com/packages',
}

export function PackagesIndex() {
  return (
    <ThemeProvider colorMode="dark" className="fp-hasFontSmoothing">
      {/* Header + Subnav = 136px */}
      <Spacer size="136px" />
      <Spacer size="48px" size1012="96px" />

      {/* Section Hero */}

      <section id="hero">
        <div className="fp-Section-container">
          <Hero data-hpc className="fp-Hero">
            <Hero.Label color="purple">GitHub Packages</Hero.Label>
            <Hero.Heading size="2">Your packages, at home with their code</Hero.Heading>
            <Hero.Description size="300">
              With GitHub Packages, you can safely publish and consume packages within your organization or with the
              entire world.
            </Hero.Description>
            <Hero.PrimaryAction href={extURLs.get_started}>Get started for free</Hero.PrimaryAction>
            <Hero.SecondaryAction hasArrow={false} href="#pricing">
              View pricing
            </Hero.SecondaryAction>
            <Hero.Image src="/images/modules/site/packages/fp24/hero.webp" alt="TODO" />
          </Hero>
        </div>
      </section>

      <Spacer size="64px" size1012="128px" />
    </ThemeProvider>
  )
}

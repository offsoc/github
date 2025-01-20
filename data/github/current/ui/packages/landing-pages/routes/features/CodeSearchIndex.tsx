import {
  ThemeProvider,
  Hero,
  SectionIntro,
  Grid,
  Pillar,
  River,
  Image,
  Text,
  Testimonial,
  CTABanner,
  Button,
  FAQ,
} from '@primer/react-brand'
import {PlayIcon, SparkleFillIcon, StackIcon, ZapIcon} from '@primer/octicons-react'
import {Spacer} from './components/Spacer'

const extURLs = {
  try: 'https://github.com/search?type=code&auto_enroll=true',
  video: 'https://www.youtube.com/watch?v=ujVY8xqkflQ',
}

export function CodeSearchIndex() {
  return (
    <ThemeProvider colorMode="light" className="fp-hasFontSmoothing">
      {/* Header + Subnav = 136px */}
      <Spacer size="136px" />
      <Spacer size="48px" size1012="96px" />

      {/* Section Hero */}

      <section id="hero">
        <div className="fp-Section-container">
          <Hero data-hpc align="center" className="fp-Hero">
            <Hero.Label color="green">Code Search</Hero.Label>
            <Hero.Heading size="2">Exactly what you’re looking for</Hero.Heading>
            <Hero.Description size="300">
              With GitHub Packages, you can safely publish and consume packages within your organization or with the
              entire world.
            </Hero.Description>
            <Hero.PrimaryAction href={extURLs.try}>Try it now</Hero.PrimaryAction>
            <Hero.SecondaryAction href={extURLs.video} trailingVisual={<PlayIcon />}>
              Watch video
            </Hero.SecondaryAction>
            <Hero.Image src="/images/modules/site/code-search/fp24/hero.webp" alt="TODO" />
          </Hero>
        </div>
      </section>

      {/* Cards */}

      <section id="cards">
        <div className="fp-Section-container">
          <Spacer size="56px" size1012="112px" />

          <SectionIntro className="fp-SectionIntro" align="center" fullWidth>
            <SectionIntro.Heading size="3">
              Search, navigate, and understand your <br className="fp-breakWhenWide" /> team’s code—and billions of
              lines of <br className="fp-breakWhenWide" /> public code.
            </SectionIntro.Heading>
          </SectionIntro>

          <Spacer size="40px" size1012="80px" />

          <Grid className="lp-Grid">
            <Grid.Column className="lp-GridColumn" span={{xsmall: 12, large: 4}}>
              <Pillar>
                <Pillar.Icon color="green" icon={<SparkleFillIcon />} />
                <Pillar.Heading>Fast, relevant results</Pillar.Heading>
                <Pillar.Description>
                  Code search understands your code—and brings you relevant results with incredible speed.
                </Pillar.Description>
              </Pillar>
            </Grid.Column>
            <Grid.Column className="lp-GridColumn" span={{xsmall: 12, large: 4}}>
              <Pillar>
                <Pillar.Icon color="green" icon={<ZapIcon />} />
                <Pillar.Heading>A power userʼs dream</Pillar.Heading>
                <Pillar.Description>
                  Search using regular expressions, boolean operations, keyboard shortcuts, and more.
                </Pillar.Description>
              </Pillar>
            </Grid.Column>
            <Grid.Column className="lp-GridColumn" span={{xsmall: 12, large: 4}}>
              <Pillar>
                <Pillar.Icon color="green" icon={<StackIcon />} />
                <Pillar.Heading>More than just search</Pillar.Heading>
                <Pillar.Description>
                  Dig deeper with the all-new code view—tightly integrating browsing and code navigation.
                </Pillar.Description>
              </Pillar>
            </Grid.Column>
          </Grid>
        </div>
      </section>

      {/* Features */}

      <section id="features">
        <div className="fp-Section-container">
          <Spacer size="64px" size1012="128px" />

          <SectionIntro className="fp-SectionIntro" align="center">
            <SectionIntro.Heading size="3">Way more than grep.</SectionIntro.Heading>
            <SectionIntro.Description>
              GitHub code search can search across multiple repositories and is always up to date. It understands your
              code, and puts the most relevant results first.
            </SectionIntro.Description>
          </SectionIntro>

          <Spacer size="48px" size1012="96px" />

          <River className="fp-River" align="end">
            <River.Visual>
              <Image src="/images/modules/site/code-search/fp24/features-river-1.webp" alt="TODO" />
            </River.Visual>
            <River.Content>
              <Text size="400" weight="semibold">
                <strong>Suggestions, completions, and more.</strong> Use the new search input to find symbols and
                files—and jump right to them.
              </Text>
            </River.Content>
          </River>

          <River className="fp-River">
            <River.Visual>
              <Image src="/images/modules/site/code-search/fp24/features-river-2.webp" alt="TODO" />
            </River.Visual>
            <River.Content>
              <Text size="400" weight="semibold">
                <strong>Powerful search syntax.</strong> Know exactly what you’re looking for? Express it with our
                powerful search operators.
              </Text>
            </River.Content>
          </River>

          <Spacer size="64px" size1012="128px" />

          <SectionIntro className="fp-SectionIntro" align="center">
            <SectionIntro.Heading size="3">Meet the all-new code view.</SectionIntro.Heading>
            <SectionIntro.Description>
              Dig deeper into complex codebases with tightly integrated search, code navigation and browsing.
            </SectionIntro.Description>
          </SectionIntro>

          <Spacer size="48px" size1012="96px" />

          <River className="fp-River" align="end">
            <River.Visual>
              <Image src="/images/modules/site/code-search/fp24/features-river-3.webp" alt="TODO" />
            </River.Visual>
            <River.Content>
              <Text size="400" weight="semibold">
                <strong>Code navigation.</strong> Instantly jump to definitions in over 10 languages. No setup required.
              </Text>
            </River.Content>
          </River>

          <River className="fp-River">
            <River.Visual>
              <Image src="/images/modules/site/code-search/fp24/features-river-4.webp" alt="TODO" />
            </River.Visual>
            <River.Content>
              <Text size="400" weight="semibold">
                <strong>File browser.</strong> Keep all your code in context and instantly switch files with the new
                file tree pane.
              </Text>
            </River.Content>
          </River>

          <Spacer size="64px" size1012="128px" />
        </div>
      </section>

      {/* CTA */}

      <section id="cta" className="fp-Section--isRaised">
        <div className="fp-Section-container">
          <Spacer size="64px" size1012="128px" />

          <SectionIntro className="fp-SectionIntro" align="center" fullWidth>
            <SectionIntro.Heading size="3">What developers are saying</SectionIntro.Heading>
          </SectionIntro>

          <Spacer size="48px" size1012="96px" />

          <Grid className="lp-Grid lp-Grid--isRaised">
            <Grid.Column className="lp-GridColumn" span={{xsmall: 12, medium: 6}}>
              <Testimonial quoteMarkColor="green">
                <Testimonial.Quote>
                  Code search makes it effortless to quickly find what Iʼm looking for in my code, or across all of
                  GitHub
                </Testimonial.Quote>
                <Testimonial.Name position="Software Engineer">Keith Smiley</Testimonial.Name>
                <Testimonial.Avatar
                  src="/images/modules/site/code-search/fp24/testimonials-avatar-keith.jpg"
                  alt="Circular avatar from Keith Smiley's GitHub profile"
                />
              </Testimonial>
            </Grid.Column>
            <Grid.Column className="lp-GridColumn" span={{xsmall: 12, medium: 6}}>
              <Testimonial quoteMarkColor="green">
                <Testimonial.Quote>
                  Code search turns what wouldʼve been a ~10 minute grep search into a 2 second UI search
                </Testimonial.Quote>
                <Testimonial.Name position="Platform Engineer">Marco Montagna</Testimonial.Name>
                <Testimonial.Avatar
                  src="/images/modules/site/code-search/fp24/testimonials-avatar-marco.jpg"
                  alt="Circular avatar from Marco Montagna's GitHub profile"
                />
              </Testimonial>
            </Grid.Column>
          </Grid>

          <Spacer size="48px" size1012="96px" />

          <ThemeProvider colorMode="dark">
            <CTABanner className="lp-CTABanner" align="center" hasShadow={false}>
              <CTABanner.Heading size="2">Find more, search less</CTABanner.Heading>
              <CTABanner.Description className="lp-CTABannerDescription">
                TODO: Lorem ipsum dolor sit amet, consectetur adipiscing elit. In sapien sit ullamcorper id. Aliquam
                luctus sed turpis felis nam pulvinar risus elementum.
              </CTABanner.Description>
              <CTABanner.ButtonGroup buttonsAs="a">
                <Button href={extURLs.try}>Try it now</Button>
                <Button href={extURLs.video}>Watch video</Button>
              </CTABanner.ButtonGroup>
            </CTABanner>
          </ThemeProvider>

          <Spacer size="48px" size1012="96px" />

          <FAQ>
            <FAQ.Heading>Frequently asked questions</FAQ.Heading>
            <FAQ.Item>
              <FAQ.Question>Will the FAQs be moved to Contentful?</FAQ.Question>
              <FAQ.Answer>
                <p>Yes</p>
              </FAQ.Answer>
            </FAQ.Item>
            <FAQ.Item>
              <FAQ.Question>Question 2</FAQ.Question>
              <FAQ.Answer>
                <p>Answer 2</p>
              </FAQ.Answer>
            </FAQ.Item>
            <FAQ.Item>
              <FAQ.Question>Question 3</FAQ.Question>
              <FAQ.Answer>
                <p>Answer 3</p>
              </FAQ.Answer>
            </FAQ.Item>
          </FAQ>

          <Spacer size="64px" size1012="128px" />
        </div>
      </section>
    </ThemeProvider>
  )
}

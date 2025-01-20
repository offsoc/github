import {
  ThemeProvider,
  Hero,
  River,
  Image,
  Text,
  Heading,
  RiverBreakout,
  Timeline,
  SectionIntro,
  Pillar,
  Grid,
  Testimonial,
  FAQ,
  CTABanner,
  Button,
  Box,
} from '@primer/react-brand'
import {Spacer} from './components/Spacer'
import {BugIcon, DatabaseIcon, DeviceMobileIcon, ZapIcon} from '@primer/octicons-react'

const extURLs = {
  get_started_cta: 'https://github.com/codespaces',
  get_started_doc: 'https://docs.github.com/codespaces/overview',
}

export function CodespacesIndex() {
  return (
    <ThemeProvider colorMode="dark" className="fp-hasFontSmoothing">
      {/* Header + Subnav = 136px */}
      <Spacer size="136px" />
      <Spacer size="48px" size1012="96px" />

      {/* Hero */}

      <section id="hero" className="lp-SectionHero">
        <div className="fp-Section-container">
          <Hero data-hpc className="fp-Hero">
            <Hero.Label color="purple">GitHub Codespaces</Hero.Label>
            <Hero.Heading size="2">Secure development made simple</Hero.Heading>
            <Hero.Description size="300">
              GitHub Codespaces gets you up and coding faster with fully configured, secure cloud development
              environments native to GitHub.
            </Hero.Description>
            <Hero.PrimaryAction href={extURLs.get_started_cta}>Get started for free</Hero.PrimaryAction>
            <Hero.SecondaryAction hasArrow={false} href="#pricing">
              View pricing
            </Hero.SecondaryAction>
            <Hero.Image src="/images/modules/site/codespaces/fp24/hero.webp" alt="TODO" />
          </Hero>
        </div>
      </section>

      {/* Features */}

      <section id="features">
        <div className="fp-Section-container">
          <Spacer size="64px" size1012="128px" />

          <River className="fp-River">
            <River.Visual>
              <Image src="/images/modules/site/codespaces/fp24/features-river-1.webp" alt="TODO" />
            </River.Visual>
            <River.Content>
              <Heading as="h2" size="4">
                Secure by design
              </Heading>
              <Text>
                Created with security in mind, Codespaces provides a secure development environment through its built-in
                capabilities and native integration with the GitHub platform.
              </Text>
            </River.Content>
          </River>

          <River className="fp-River">
            <River.Visual>
              <Image src="/images/modules/site/codespaces/fp24/features-river-2.webp" alt="TODO" />
            </River.Visual>
            <River.Content>
              <Heading as="h2" size="4">
                Collaborate where you code
              </Heading>
              <Text>Codespaces provides a shared development environment and removes the need for complex setups.</Text>
            </River.Content>
          </River>

          <Spacer size="64px" size1012="128px" />

          <RiverBreakout className="fp-RiverBreakout">
            <RiverBreakout.A11yHeading>TODO</RiverBreakout.A11yHeading>
            <RiverBreakout.Visual>
              <Image
                className="fp-RiverBreakoutVisualImage"
                src="/images/modules/site/codespaces/fp24/features-river-breakout.webp"
                alt="TODO"
              />
            </RiverBreakout.Visual>
            <RiverBreakout.Content
              trailingComponent={() => (
                <Timeline>
                  <Timeline.Item>
                    <em>Start coding instantly from anywhere in the world.</em> Switching projects? Grab a new machine
                    from the cloud that’s preconfigured for that project. Your settings travel with you.
                  </Timeline.Item>
                  <Timeline.Item>
                    <em>Tabs or spaces? Monokai or Solarized? Prettier or Beautify? It’s up to you.</em> Control every
                    nerdy detail only you care about with your own dotfiles repository.
                  </Timeline.Item>
                </Timeline>
              )}
            >
              <Text>
                <em>Your space, your way.</em> Codespaces is a home away from home for your code that feels just like
                your usual machine.
                <Image
                  className="lp-FeaturesLogos"
                  src="/images/modules/site/codespaces/fp24/features-logos.webp"
                  width={496}
                  alt="TODO"
                />
              </Text>
            </RiverBreakout.Content>
          </RiverBreakout>

          <Spacer size="64px" size1012="128px" />

          <River className="fp-River">
            <River.Visual>
              <Image src="/images/modules/site/codespaces/fp24/features-river-3.webp" alt="TODO" />
            </River.Visual>
            <River.Content>
              <Heading as="h2" size="4">
                Browser preview and port forwarding
              </Heading>
              <Text>
                Preview your changes and get feedback from teammates by sharing ports within the scope allowed by
                policy.
              </Text>
            </River.Content>
          </River>

          <River className="fp-River">
            <River.Visual>
              <Image src="/images/modules/site/codespaces/fp24/features-river-4.webp" alt="TODO" />
            </River.Visual>
            <River.Content>
              <Heading as="h2" size="4">
                Onboard faster
              </Heading>
              <Text>
                Quickly spin up a codespace with only an IDE or browser and a GitHub account. With a few configuration
                files, you can give your developers an instant, fully configured, and secure development environment so
                they can start coding immediately.
              </Text>
            </River.Content>
          </River>

          <Spacer size="64px" size1012="128px" />
        </div>
      </section>

      {/* Context */}

      <section id="context" className="fp-Section--isRaised">
        <div className="fp-Section-container">
          <Spacer size="64px" size1012="128px" />

          <SectionIntro className="fp-SectionIntro" align="center" fullWidth>
            <SectionIntro.Heading size="3">What you can do with Codespaces</SectionIntro.Heading>
            <SectionIntro.Link href="https://github.blog/2021-08-11-githubs-engineering-team-moved-codespaces/">
              Learn how GitHub builds with Codespaces
            </SectionIntro.Link>
          </SectionIntro>

          <Spacer size="40px" size1012="80px" />

          <Grid className="lp-Grid lp-Grid--raised">
            <Grid.Column className="lp-GridColumn" span={{xsmall: 12, medium: 6}}>
              <Pillar>
                <Pillar.Icon icon={<DeviceMobileIcon />} color="purple" />
                <Pillar.Heading>Code from any device</Pillar.Heading>
                <Pillar.Description>
                  Want to code on an iPad? Go for it. Spin up Codespaces from any device with internet access. Don’t
                  worry if your device is powerful enough—Codespaces lives in the cloud.
                </Pillar.Description>
              </Pillar>
            </Grid.Column>
            <Grid.Column className="lp-GridColumn" span={{xsmall: 12, medium: 6}}>
              <Pillar>
                <Pillar.Icon icon={<ZapIcon />} color="purple" />
                <Pillar.Heading>Onboard at the speed of thought</Pillar.Heading>
                <Pillar.Description>
                  No more building your dev environment while you onboard. Codespaces launches instantly from any
                  repository on GitHub with pre-configured, secure environments.
                </Pillar.Description>
              </Pillar>
            </Grid.Column>
            <Grid.Column className="lp-GridColumn" span={{xsmall: 12, medium: 6}}>
              <Pillar>
                <Pillar.Icon icon={<DatabaseIcon />} color="purple" />
                <Pillar.Heading>Streamline contractor onboarding</Pillar.Heading>
                <Pillar.Description>
                  Codespaces gives you control over how your consultants access your resources, while providing them
                  with instant onboarding and a fluid developer experience.
                </Pillar.Description>
              </Pillar>
            </Grid.Column>
            <Grid.Column className="lp-GridColumn" span={{xsmall: 12, medium: 6}}>
              <Pillar>
                <Pillar.Icon icon={<BugIcon />} color="purple" />
                <Pillar.Heading>Fix bugs right from a pull request</Pillar.Heading>
                <Pillar.Description>
                  Got a pull request detailing a bug or security issue? Open Codespaces right from the pull request
                  without waiting for your dev environment to load.
                </Pillar.Description>
              </Pillar>
            </Grid.Column>
          </Grid>

          <Spacer size="64px" size1012="128px" />
        </div>
      </section>

      {/* Testimonials */}

      <section id="testimonials">
        <div className="fp-Section-container">
          <Spacer size="64px" size1012="128px" />

          <SectionIntro className="fp-SectionIntro" align="center" fullWidth>
            <SectionIntro.Heading size="3">What developers are saying</SectionIntro.Heading>
          </SectionIntro>

          <Spacer size="40px" size1012="80px" />

          <Grid className="lp-Grid">
            <Grid.Column className="lp-GridColumn" span={{xsmall: 12, medium: 6}}>
              <Testimonial quoteMarkColor="purple">
                <Testimonial.Quote>
                  What used to be a 15-step process is just one step: open Codespaces and you’re off and running.
                </Testimonial.Quote>
                <Testimonial.Name position="Developer Lead, Synergy">Clint Chester</Testimonial.Name>
                <Testimonial.Avatar
                  src="/images/modules/site/codespaces/fp24/testimonials-avatar-clint.png"
                  alt="Circular avatar from Clint Chester's GitHub profile"
                />
              </Testimonial>
            </Grid.Column>
            <Grid.Column className="lp-GridColumn" span={{xsmall: 12, medium: 6}}>
              <Testimonial quoteMarkColor="purple">
                <Testimonial.Quote>
                  It’s so much easier for developers to use or even contribute to any repo when they can just spin up a
                  codespace and immediately start working with the code.
                </Testimonial.Quote>
                <Testimonial.Name position="Staff Developer, TELUS">Katie Peters</Testimonial.Name>
                <Testimonial.Avatar
                  src="/images/modules/site/codespaces/fp24/testimonials-avatar-katie.jpg"
                  alt="Circular avatar from Katie Peters's GitHub profile"
                />
              </Testimonial>
            </Grid.Column>
            <Grid.Column className="lp-GridColumn" span={{xsmall: 12, medium: 6}}>
              <Testimonial quoteMarkColor="purple">
                <Testimonial.Quote>
                  Before Codespaces, the onboarding process was tedious. Instead of taking two days, now it only takes a
                  minute for a developer to access a pristine, steady-state environment, thanks to prebuilds.
                </Testimonial.Quote>
                <Testimonial.Name position="Software Engineering Manager, Vanta Security">
                  Robbie Ostrow
                </Testimonial.Name>
                <Testimonial.Avatar
                  src="/images/modules/site/codespaces/fp24/testimonials-avatar-robbie.png"
                  alt="Circular avatar from Robbie Ostrow's GitHub profile"
                />
              </Testimonial>
            </Grid.Column>
            <Grid.Column className="lp-GridColumn" span={{xsmall: 12, medium: 6}}>
              <Testimonial quoteMarkColor="purple">
                <Testimonial.Quote>
                  Codespaces… lets developers skip the tedious, error-prone stuff that normally stands between them and
                  getting started on real work.
                </Testimonial.Quote>
                <Testimonial.Name position="Cloud Capability Lead, KPMG, UK">Keith Annette</Testimonial.Name>
                <Testimonial.Avatar
                  src="/images/modules/site/codespaces/fp24/testimonials-avatar-keith.png"
                  alt="Circular avatar from Keith Annette's GitHub profile"
                />
              </Testimonial>
            </Grid.Column>
          </Grid>
        </div>
      </section>

      {/* Pricing */}

      <section id="pricing">
        <div className="fp-Section-container">
          <Spacer size="64px" size1012="128px" />

          <SectionIntro className="fp-SectionIntro" align="center" fullWidth>
            <SectionIntro.Heading size="3">Environments on demand</SectionIntro.Heading>
            <SectionIntro.Description>
              Individuals can use Codespaces for free each month for 60 hours, with pay-as-you-go pricing after. Teams
              or Enterprises pay for Codespaces. A maximum monthly cap can also be set for extra pricing control.
            </SectionIntro.Description>
            <SectionIntro.Link href={extURLs.get_started_doc}>Get started</SectionIntro.Link>
          </SectionIntro>

          <Spacer size="40px" size1012="80px" />

          <Box
            borderWidth="thin"
            borderColor="default"
            backgroundColor="subtle"
            borderRadius="xlarge"
            padding="spacious"
          >
            <Text as="p" size="500" align="center">
              Pricing table
            </Text>
          </Box>
        </div>
      </section>

      {/* FAQs */}

      <section id="faq">
        <div className="fp-Section-container">
          <Spacer size="64px" size1012="128px" />

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
        </div>
      </section>

      {/* CTA */}

      <section id="cta">
        <div className="fp-Section-container">
          <Spacer size="64px" size1012="128px" />

          <CTABanner className="lp-CTABanner" align="center" hasShadow={false}>
            <CTABanner.Heading size="2">Start coding in seconds with Codespaces</CTABanner.Heading>
            <CTABanner.Description className="lp-CTABannerDescription">
              Go to any repository and open your own Codespaces environment instantly.
            </CTABanner.Description>
            <CTABanner.ButtonGroup buttonsAs="a">
              <Button href={extURLs.get_started_cta}>Get started now</Button>
            </CTABanner.ButtonGroup>
          </CTABanner>
        </div>
      </section>

      <Spacer size="64px" size1012="128px" />
    </ThemeProvider>
  )
}

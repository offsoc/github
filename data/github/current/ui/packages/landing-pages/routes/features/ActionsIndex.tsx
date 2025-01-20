import {
  ThemeProvider,
  Hero,
  Box,
  SectionIntro,
  Grid,
  Pillar,
  River,
  Heading,
  Image,
  Text,
  RiverBreakout,
  Timeline,
  Link,
  Testimonial,
  Stack,
  Card,
  CTABanner,
  Button,
} from '@primer/react-brand'
import {
  BookIcon,
  GraphIcon,
  HeartIcon,
  KeyIcon,
  LogIcon,
  PackageIcon,
  RepoIcon,
  StackIcon,
} from '@primer/octicons-react'
import {Spacer} from './components/Spacer'

const extURLs = {
  get_started: 'https://docs.github.com/actions',
  contact_sales:
    'https://github.com/enterprise/contact?ref_cta=Contact+Sales&ref_loc=hero&ref_page=%2Ffeatures%2Factions&scid=&utm_campaign=Actions_feature_page_contact_sales_cta_utmroutercampaign&utm_content=Actions&utm_medium=site&utm_source=github',
}

export function ActionsIndex() {
  return (
    <ThemeProvider colorMode="dark" className="fp-hasFontSmoothing">
      {/* Header + Subnav = 136px */}
      <Spacer size="136px" />
      <Spacer size="48px" size1012="96px" />

      {/* Hero */}

      <section id="hero">
        <div className="fp-Section-container">
          <Hero data-hpc align="center" className="fp-Hero">
            <Hero.Label color="green">GitHub Actions</Hero.Label>
            <Hero.Heading size="2">Automate your workflow from idea to production</Hero.Heading>
            <Hero.Description size="300">
              GitHub Actions makes it easy to automate all your software workflows, now with world-class CI/CD. Build,
              test, and deploy your code right from GitHub. Make code reviews, branch management, and issue triaging
              work the way you want.
            </Hero.Description>
            <Hero.PrimaryAction href={extURLs.get_started}>Get started with actions</Hero.PrimaryAction>
            <Hero.SecondaryAction href={extURLs.contact_sales}>Contact sales</Hero.SecondaryAction>
            <Hero.Image src="/images/modules/site/actions/fp24/hero.webp" alt="TODO" />
          </Hero>
        </div>
      </section>

      {/* Features */}

      <section id="features">
        <div className="fp-Section-container">
          <Spacer size="64px" size1012="128px" />

          <SectionIntro className="fp-SectionIntro" align="center" fullWidth>
            <SectionIntro.Heading size="3">
              Kick off workflows on any <br className="fp-breakWhenWide" /> GitHub event to automate tasks
            </SectionIntro.Heading>
          </SectionIntro>

          <Spacer size="40px" size1012="80px" />

          <Grid className="lp-Grid">
            <Grid.Column className="lp-GridColumn" span={{xsmall: 12, medium: 6, large: 4}}>
              <Pillar>
                <Pillar.Icon icon={<PackageIcon />} color="green" />
                <Pillar.Heading>Hosted runners for every major OS</Pillar.Heading>
                <Pillar.Description>
                  Linux, macOS, Windows, ARM, and containers make it easy to build and test all your projects. Run
                  directly on a VM or inside a container. Use your own VMs, in the cloud or on-prem, with self-hosted
                  runners.
                </Pillar.Description>
              </Pillar>
            </Grid.Column>
            <Grid.Column className="lp-GridColumn" span={{xsmall: 12, medium: 6, large: 4}}>
              <Pillar>
                <Pillar.Icon icon={<HeartIcon />} color="green" />
                <Pillar.Heading>Matrix builds</Pillar.Heading>
                <Pillar.Description>
                  Save time with matrix workflows that simultaneously test across multiple operating systems and
                  versions of your runtime.
                </Pillar.Description>
              </Pillar>
            </Grid.Column>
            <Grid.Column className="lp-GridColumn" span={{xsmall: 12, medium: 6, large: 4}}>
              <Pillar>
                <Pillar.Icon icon={<BookIcon />} color="green" />
                <Pillar.Heading>Any language</Pillar.Heading>
                <Pillar.Description>
                  GitHub Actions supports Node.js, Python, Java, Ruby, PHP, Go, Rust, .NET, and more. Build, test, and
                  deploy applications in your language of choice.
                </Pillar.Description>
              </Pillar>
            </Grid.Column>
            <Grid.Column className="lp-GridColumn" span={{xsmall: 12, medium: 6, large: 4}}>
              <Pillar>
                <Pillar.Icon icon={<LogIcon />} color="green" />
                <Pillar.Heading>Live logs</Pillar.Heading>
                <Pillar.Description>
                  See your workflow run in realtime with color and emoji. It’s one click to copy a link that highlights
                  a specific line number to share a CI/CD failure.
                </Pillar.Description>
              </Pillar>
            </Grid.Column>
            <Grid.Column className="lp-GridColumn" span={{xsmall: 12, medium: 6, large: 4}}>
              <Pillar>
                <Pillar.Icon icon={<KeyIcon />} color="green" />
                <Pillar.Heading>Built in secret store</Pillar.Heading>
                <Pillar.Description>
                  Automate your software development practices with workflow files embracing the Git flow by codifying
                  it in your repository.
                </Pillar.Description>
              </Pillar>
            </Grid.Column>
            <Grid.Column className="lp-GridColumn" span={{xsmall: 12, medium: 6, large: 4}}>
              <Pillar>
                <Pillar.Icon icon={<StackIcon />} color="green" />
                <Pillar.Heading>Multi-container testing</Pillar.Heading>
                <Pillar.Description>
                  Test your web service and its DB in your workflow by simply adding some docker-compose to your
                  workflow file.
                </Pillar.Description>
              </Pillar>
            </Grid.Column>
          </Grid>

          <Spacer size="64px" size1012="128px" />

          <River className="fp-River" align="end">
            <River.Visual>
              <Image src="/images/modules/site/actions/fp24/features-river-1.webp" alt="TODO" />
            </River.Visual>
            <River.Content>
              <Heading as="h2" size="4">
                Run a workflow on <br className="fp-breakWhenWide" /> any GitHub event
              </Heading>
              <Text>
                Whether you want to build a container, deploy a web service, or automate welcoming new users to your
                open source projects—thereʼs an action for that. Pair GitHub Packages with Actions to simplify package
                management, including version updates, fast distribution with our global CDN, and dependency resolution,
                using your existing GITHUB_TOKEN.
              </Text>
            </River.Content>
          </River>

          <Spacer size="64px" size1012="128px" />

          <RiverBreakout className="fp-RiverBreakout">
            <RiverBreakout.A11yHeading>TODO</RiverBreakout.A11yHeading>
            <RiverBreakout.Visual>
              <Image
                className="fp-RiverBreakoutVisualImage"
                src="/images/modules/site/actions/fp24/features-river-breakout.webp"
                alt="TODO"
              />
            </RiverBreakout.Visual>
            <RiverBreakout.Content
              trailingComponent={() => (
                <Timeline>
                  <Timeline.Item>
                    <em>Easily deploy to any cloud, create tickets in Jira, or publish a package to npm.</em>
                  </Timeline.Item>
                  <Timeline.Item>
                    <em>Want to venture off the beaten path?</em> Use the millions of open source libraries available on
                    GitHub to create your own actions. Write them in JavaScript or create a container action—both can
                    interact with the full GitHub API and any other public API.
                  </Timeline.Item>
                </Timeline>
              )}
            >
              <Text>
                <em>GitHub Actions connects all of your tools</em> to automate every step of your development workflow.
              </Text>
              <Link href="https://github.com/marketplace?type=actions">Explore the actions marketplace</Link>
            </RiverBreakout.Content>
          </RiverBreakout>
        </div>
      </section>

      {/* Testimonials */}

      <section id="testimonials" className="lp-Testimonials">
        <div className="fp-Section-container lp-TestimonialsContainer">
          <Image
            className="lp-TestimonialsVisual lp-TestimonialsVisual--1"
            src="/images/modules/site/actions/fp24/testimonial-bg-1.webp"
            width={662}
            alt=""
          />
          <Image
            className="lp-TestimonialsVisual lp-TestimonialsVisual--2"
            src="/images/modules/site/actions/fp24/testimonial-bg-2.webp"
            width={1080}
            alt=""
          />

          <Spacer size="64px" size1012="128px" />

          <Testimonial quoteMarkColor="green" size="large" className="lp-Testimonial">
            <Testimonial.Quote className="lp-TestimonialQuote">
              Actions is an exciting development and unlocks so much potential beyond CI/CD.{' '}
              <span className="lp-TestimonialQuoteDescription">
                It promises to streamline our workflows for a variety of tasks, from deploying our websites to querying
                the GitHub API for custom status reports to standard CI builds.
              </span>
            </Testimonial.Quote>
            <Testimonial.Name position="SciPy maintainer">Ralf Gommers</Testimonial.Name>
          </Testimonial>

          <Spacer size="64px" size1012="128px" />
        </div>
      </section>

      {/* Pricing */}

      <section id="pricing" className="fp-Section--isRaised">
        <div className="fp-Section-container">
          <Spacer size="64px" size1012="128px" />

          <SectionIntro className="fp-SectionIntro" align="center" fullWidth>
            <SectionIntro.Heading size="3">Simple, pay-as-you-go pricing</SectionIntro.Heading>
          </SectionIntro>

          <Spacer size="40px" size1012="80px" />

          <Stack
            direction={{narrow: 'vertical', regular: 'horizontal', wide: 'horizontal'}}
            gap="spacious"
            padding="none"
          >
            <div className="lp-CardWrapper">
              <Card
                className="lp-Card"
                ctaText="View docs"
                href="https://docs.github.com/billing/managing-billing-for-github-actions/about-billing-for-github-actions"
              >
                <Card.Icon icon={<RepoIcon />} color="green" />
                <Card.Heading size="6">GitHub Actions is free for public repositories</Card.Heading>
                <Card.Description>
                  We take pride in our Open Source legacy, and are happy to provide free CI/CD for public repositories.
                  Check out the doc to see which runners are included.
                </Card.Description>
              </Card>
            </div>
            <div className="lp-CardWrapper">
              <Card className="lp-Card" ctaText="View pricing" href="https://github.com/pricing">
                <Card.Icon icon={<GraphIcon />} color="green" />
                <Card.Heading size="6">Every GitHub plan includes free usage</Card.Heading>
                <Card.Description>
                  Check out plan details to see how many minutes are included and the pricing table below to see which
                  runners you can use your free minutes on.
                </Card.Description>
              </Card>
            </div>
          </Stack>

          <Spacer size="24px" size1012="48px" />

          <Box
            borderWidth="thin"
            borderColor="default"
            backgroundColor="default"
            borderRadius="xlarge"
            padding="spacious"
          >
            <Text as="p" size="500" align="center">
              Pricing table
            </Text>
          </Box>

          <Spacer size="24px" size1012="48px" />

          <CTABanner className="lp-CTABanner" align="center" hasShadow={false}>
            <CTABanner.Heading size="2">The future of workflow automation is now</CTABanner.Heading>
            <CTABanner.Description className="lp-CTABannerDescription">
              Get started with GitHub Actions today and explore community created <br className="fp-breakWhenWide" />
              actions in the GitHub Marketplace.
            </CTABanner.Description>
            <CTABanner.ButtonGroup buttonsAs="a">
              <Button href={extURLs.get_started}>Get started with actions</Button>
              <Button href="https://github.com/pricing">See pricing</Button>
            </CTABanner.ButtonGroup>
          </CTABanner>

          <Spacer size="48px" size1012="96px" />
        </div>
      </section>
    </ThemeProvider>
  )
}

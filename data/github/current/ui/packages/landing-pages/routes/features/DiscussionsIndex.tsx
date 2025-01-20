import {
  ThemeProvider,
  Hero,
  SectionIntro,
  Text,
  River,
  RiverBreakout,
  Stack,
  Card,
  Timeline,
  CTABanner,
  Button,
  Image,
  Pillar,
} from '@primer/react-brand'
import {IssueOpenedIcon, WorkflowIcon} from '@primer/octicons-react'
import {Spacer} from './components/Spacer'

const extURLs = {
  cta_enable: 'https://docs.github.com/discussions/quickstart',
}

export function DiscussionsIndex() {
  return (
    <ThemeProvider colorMode="dark" className="fp-hasFontSmoothing">
      {/* Header + Subnav = 136px */}
      <Spacer size="136px" />
      <Spacer size="48px" size1012="96px" />

      {/* Hero */}

      <section id="hero">
        <div className="fp-Section-container">
          <Hero data-hpc className="fp-Hero">
            <Hero.Label color="purple">GitHub Discussions</Hero.Label>
            <Hero.Heading size="2">
              The home for
              <br />
              developer communities
            </Hero.Heading>
            <Hero.Description size="300">
              Ask questions, share ideas, and build connections with each other—all right next to your code. GitHub
              Discussions enables healthy and productive software collaboration.
            </Hero.Description>
            <Hero.PrimaryAction href={extURLs.cta_enable}>Enable Discussions</Hero.PrimaryAction>
            <Hero.Image src="/images/modules/site/discussions/fp24/hero.webp" alt="TODO" />
          </Hero>
        </div>
      </section>

      {/* Features */}

      <section id="features">
        <div className="fp-Section-container">
          <Spacer size="56px" size1012="112px" />

          <SectionIntro className="fp-SectionIntro" align="center">
            <SectionIntro.Heading size="3">Dedicated space for conversations</SectionIntro.Heading>
            <SectionIntro.Description>
              Decrease the burden of managing active work in issues and pull requests by providing a separate space to
              host ongoing discussions, questions, and ideas.
            </SectionIntro.Description>
          </SectionIntro>

          <Spacer size="48px" size1012="96px" />

          <River className="fp-River" align="end">
            <River.Visual>
              <Image src="/images/modules/site/discussions/fp24/features-river-1.webp" alt="TODO" />
            </River.Visual>
            <River.Content>
              <Text size="400" weight="semibold">
                <strong>Mark what’s most helpful.</strong> Highlight quality responses and make the best answer more
                discoverable for future community members to find.
              </Text>
            </River.Content>
          </River>

          <River className="fp-River" align="end">
            <River.Visual>
              <Image src="/images/modules/site/discussions/fp24/features-river-2.webp" alt="TODO" />
            </River.Visual>
            <River.Content>
              <Text size="400" weight="semibold">
                <strong>Thread conversations.</strong> Keep context in-tact and conversations on track with threaded
                comments.
              </Text>
            </River.Content>
          </River>

          <River className="fp-River" align="end">
            <River.Visual>
              <Image src="/images/modules/site/discussions/fp24/features-river-3.webp" alt="TODO" />
            </River.Visual>
            <River.Content>
              <Text size="400" weight="semibold">
                <strong>Ask your community with polls.</strong> Gauge interest in a feature, vote on a meetup time, or
                learn more about your community with custom polls.
              </Text>
            </River.Content>
          </River>

          <River className="fp-River" align="end">
            <River.Visual>
              <Image src="/images/modules/site/discussions/fp24/features-river-4.webp" alt="TODO" />
            </River.Visual>
            <River.Content>
              <Text size="400" weight="semibold">
                <strong>Leverage GraphQL API and webhooks.</strong> Decrease maintainer burden by integrating your
                workflows where your teams already are.
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

          <SectionIntro className="fp-SectionIntro" align="center">
            <SectionIntro.Heading size="3">Give each conversation the right context</SectionIntro.Heading>
            <SectionIntro.Description>
              GitHub Discussions is dedicated space for your community to come together, ask and answer questions, and
              have open-ended conversations.
            </SectionIntro.Description>
          </SectionIntro>

          <Spacer size="48px" size1012="96px" />

          <River className="fp-River">
            <River.Visual>
              <Image src="/images/modules/site/discussions/fp24/context-river-1.webp" alt="TODO" />
            </River.Visual>
            <River.Content>
              <Text size="400" weight="semibold" style={{color: 'var(--brand-color-text-default'}}>
                Give your open ended conversations the room they need outside of issues.
              </Text>
            </River.Content>
          </River>

          <River className="fp-River">
            <River.Visual>
              <Image src="/images/modules/site/discussions/fp24/context-river-2.webp" alt="TODO" />
            </River.Visual>
            <River.Content>
              <Text size="400" weight="semibold" style={{color: 'var(--brand-color-text-default'}}>
                Convert issue to Discussion
              </Text>
            </River.Content>
          </River>

          <River className="fp-River">
            <River.Visual>
              <Image src="/images/modules/site/discussions/fp24/context-river-3.webp" alt="TODO" />
            </River.Visual>
            <River.Content>
              <Text size="400" weight="semibold" style={{color: 'var(--brand-color-text-default'}}>
                Convert discussions into issues when youʼre ready to scope out work.
              </Text>
            </River.Content>
          </River>

          <Spacer size="64px" size1012="128px" />
        </div>
      </section>

      {/* Discuss */}

      <section id="discuss">
        <div className="fp-Section-container">
          <Spacer size="64px" size1012="128px" />

          <RiverBreakout className="fp-RiverBreakout">
            <RiverBreakout.A11yHeading>TODO</RiverBreakout.A11yHeading>
            <RiverBreakout.Visual>
              <Image
                className="fp-RiverBreakoutVisualImage"
                src="/images/modules/site/discussions/fp24/discuss-river-1.webp"
                alt="TODO"
              />
            </RiverBreakout.Visual>
            <RiverBreakout.Content
              style={{rowGap: '0'}} // Remove gap when 2nd row is unused
              trailingComponent={() => (
                <Timeline>
                  <Timeline.Item>
                    <em>Custom categories</em> Create discussion categories that fit your communityʼs needs.
                  </Timeline.Item>
                  <Timeline.Item>
                    <em>Label and organize</em> Make announcements and the most important discussions more visible for
                    contributors.
                  </Timeline.Item>
                  <Timeline.Item>
                    <em>Pin discussions</em> Make announcements and the most important discussions more visible for
                    contributors.
                  </Timeline.Item>
                </Timeline>
              )}
            >
              <Text>
                <em>
                  Personalize for your community and team with any ways to make your space unique for you and your
                  collaborators.
                </em>
              </Text>
            </RiverBreakout.Content>
          </RiverBreakout>
        </div>
      </section>

      {/* Statement */}

      <section id="statement">
        <div className="fp-Section-container">
          <Spacer size="64px" size1012="128px" />

          <SectionIntro className="fp-SectionIntro">
            <SectionIntro.Heading>Monitor insights</SectionIntro.Heading>
            <SectionIntro.Description>
              Track the health and growth of your community with a dashboard full of actionable data.
            </SectionIntro.Description>
          </SectionIntro>

          <Spacer size="40px" size1012="80px" />

          <Stack
            direction={{narrow: 'vertical', regular: 'horizontal', wide: 'horizontal'}}
            gap="spacious"
            padding="none"
          >
            <div style={{margin: '0 auto'}}>
              <div className="lp-PillarVisual">
                <Image
                  className="lp-PillarVisualImage"
                  src="/images/modules/site/discussions/fp24/statement-1.svg"
                  alt="TODO"
                />
              </div>
              <Pillar>
                <Pillar.Heading>Contribution activity</Pillar.Heading>
                <Pillar.Description>
                  Count of total contribution activity to Discussions, Issues, and PRs.
                </Pillar.Description>
              </Pillar>
            </div>
            <div style={{margin: '0 auto'}}>
              <div className="lp-PillarVisual">
                <Image
                  className="lp-PillarVisualImage"
                  src="/images/modules/site/discussions/fp24/statement-2.svg"
                  alt="TODO"
                />
              </div>
              <Pillar>
                <Pillar.Heading>Discussions page views</Pillar.Heading>
                <Pillar.Description>
                  Total page views to Discussions segmented by logged in vs anonymous users.
                </Pillar.Description>
              </Pillar>
            </div>
            <div style={{margin: '0 auto'}}>
              <div className="lp-PillarVisual">
                <Image
                  className="lp-PillarVisualImage"
                  src="/images/modules/site/discussions/fp24/statement-3.svg"
                  alt="TODO"
                />
              </div>
              <Pillar>
                <Pillar.Heading>Discussions daily contributors</Pillar.Heading>
                <Pillar.Description>
                  Count of unique users who have reacted, upvoted, marked an answer, commented, or posted in the
                  selected period.
                </Pillar.Description>
              </Pillar>
            </div>
          </Stack>
        </div>
      </section>

      {/* Mobile */}

      <section id="mobile">
        <div className="fp-Section-container">
          <Spacer size="56px" size1012="112px" />

          <SectionIntro className="fp-SectionIntro" align="center">
            <SectionIntro.Heading size="3">Respond on-the-go</SectionIntro.Heading>
            <SectionIntro.Description>
              Converse, check in, and respond to discussions whenever and wherever is convenient for you.
            </SectionIntro.Description>
          </SectionIntro>

          <Spacer size="48px" size1012="96px" />

          <Image
            width={754}
            src="/images/modules/site/discussions/fp24/mobile-1.webp"
            alt="TODO"
            style={{display: 'block', margin: '0 auto'}}
          />

          <Spacer size="32px" size1012="64px" />
        </div>
      </section>

      {/* CTA */}

      <section id="cta">
        <div className="fp-Section-container">
          <Spacer size="64px" size1012="128px" />

          <CTABanner className="lp-CTABanner" align="center" hasShadow={false}>
            <CTABanner.Heading size="2">Start the conversation with your community</CTABanner.Heading>
            <CTABanner.ButtonGroup buttonsAs="a">
              <Button href={extURLs.cta_enable}>Enable Discussions</Button>
            </CTABanner.ButtonGroup>
          </CTABanner>
        </div>
      </section>

      {/* Resources */}

      <section id="resources">
        <div className="fp-Section-container">
          <Spacer size="64px" size1012="128px" />

          <SectionIntro className="fp-SectionIntro" align="center">
            <SectionIntro.Heading size="3">Additional Resources</SectionIntro.Heading>
          </SectionIntro>

          <Spacer size="32px" size1012="64px" />

          <Stack
            direction={{narrow: 'vertical', regular: 'horizontal', wide: 'horizontal'}}
            gap="spacious"
            padding="none"
          >
            <div className="lp-CardWrapper">
              <Card className="lp-Card" ctaText="Explore GitHub Issues" href="https://github.com/features/issues">
                <Card.Icon icon={<IssueOpenedIcon />} hasBackground />
                <Card.Heading>Project Planning for developers</Card.Heading>
                <Card.Description>TODO: Add description here</Card.Description>
              </Card>
            </div>
            <div className="lp-CardWrapper">
              <Card className="lp-Card" ctaText="Explore GitHub Actions" href="https://github.com/features/actions">
                <Card.Icon icon={<WorkflowIcon />} hasBackground />
                <Card.Heading>Automate your workflow from idea to production</Card.Heading>
                <Card.Description>TODO: Add description here</Card.Description>
              </Card>
            </div>
          </Stack>
        </div>
      </section>

      <Spacer size="64px" size1012="128px" />
    </ThemeProvider>
  )
}

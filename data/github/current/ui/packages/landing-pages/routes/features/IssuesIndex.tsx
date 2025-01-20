import {
  ThemeProvider,
  Hero,
  SectionIntro,
  LogoSuite,
  Image,
  River,
  Heading,
  Text,
  Timeline,
  RiverBreakout,
  Bento,
  Card,
  Grid,
  FAQ,
  CTABanner,
  Button,
  Testimonial,
} from '@primer/react-brand'
import {PlayIcon, SlidersIcon} from '@primer/octicons-react'
import {Spacer} from './components/Spacer'

const extURLs = {
  get_started: 'https://github.com/projects',
  video: 'https://www.youtube.com/watch?v=o1wuW24Nv4E',
}

export function IssuesIndex() {
  return (
    <ThemeProvider colorMode="light" className="fp-hasFontSmoothing">
      {/* Header + Subnav = 136px */}
      <Spacer size="136px" />
      <Spacer size="48px" size1012="96px" />

      {/* Hero */}

      <section id="hero">
        <div className="fp-Section-container">
          <Hero data-hpc align="center" className="fp-Hero">
            <Hero.Label color="purple">GitHub Issues</Hero.Label>
            <Hero.Heading size="2">Project planning for developers</Hero.Heading>
            <Hero.Description size="300">
              Create issues, break them into tasks, track relationships, add custom fields, and have conversations.
              Visualize large projects as tables, boards, or roadmaps, and automate everything with code.
            </Hero.Description>
            <Hero.PrimaryAction href={extURLs.get_started}>Start using projects</Hero.PrimaryAction>
            <Hero.SecondaryAction href={extURLs.video} trailingVisual={<PlayIcon />}>
              What is GitHub Issues
            </Hero.SecondaryAction>
            <Hero.Image className="lp-HeroImage" src="/images/modules/site/issues/fp24/hero.webp" alt="TODO" />
          </Hero>
        </div>
      </section>

      {/* Features */}

      <section id="features">
        <div className="fp-Section-container">
          <Spacer size="64px" size1012="128px" />

          <SectionIntro className="fp-SectionIntro" align="center" fullWidth>
            <SectionIntro.Heading size="3">
              Bored of boards? <br className="fp-breakWhenWide" /> Switch to tables and roadmaps.
            </SectionIntro.Heading>
            <SectionIntro.Description>
              Built like a spreadsheet, project tables give you a live workspace to filter, sort, and group issues and
              pull requests. Tailor them to your needs with custom fields and saved views, then visualize your project
              with roadmaps.
            </SectionIntro.Description>
          </SectionIntro>

          <Spacer size="32px" size1012="56px" />

          <LogoSuite hasDivider={false}>
            <LogoSuite.Heading visuallyHidden>Featured logos</LogoSuite.Heading>
            <LogoSuite.Logobar variant="muted">
              <Image
                src="/images/modules/site/issues/fp24/logo-shopify.svg"
                alt="Shopify"
                style={{height: '42px', filter: 'none', alignSelf: 'center'}}
              />
              <Image
                src="/images/modules/site/issues/fp24/logo-vercel.svg"
                alt="Vercel"
                style={{height: '30px', filter: 'none', alignSelf: 'center'}}
              />
              <Image
                src="/images/modules/site/issues/fp24/logo-stripe.svg"
                alt="Stripe"
                style={{height: '48px', filter: 'none', alignSelf: 'center'}}
              />
              <Image
                src="/images/modules/site/issues/fp24/logo-ford.svg"
                alt="Ford"
                style={{height: '48px', filter: 'none', alignSelf: 'center'}}
              />
              <Image
                src="/images/modules/site/issues/fp24/logo-nasa.svg"
                alt="NASA"
                style={{height: '34px', filter: 'none', alignSelf: 'center'}}
              />
            </LogoSuite.Logobar>
          </LogoSuite>

          <Spacer size="32px" size1012="56px" />

          <River className="fp-River" align="end">
            <River.Visual>
              <Image src="/images/modules/site/issues/fp24/features-river-1.webp" alt="TODO" />
            </River.Visual>
            <River.Content>
              <Heading as="h3" size="4">
                Break issues into <br className="fp-breakWhenWide" /> actionable tasks
              </Heading>
              <Text>
                Tackle complex issues with task lists and track their status with new progress indicators. Convert tasks
                into their own issues and navigate your work hierarchy.
              </Text>
            </River.Content>
          </River>

          <River className="fp-River" align="end">
            <River.Visual>
              <Image src="/images/modules/site/issues/fp24/features-river-2.webp" alt="TODO" />
            </River.Visual>
            <River.Content>
              <Heading as="h3" size="4">
                Move conversations forward
              </Heading>
              <Text>
                Express ideas with GitHub Flavored Markdown, mention contributors, react with emoji, clarify with
                attachments, and see references from commits, pull requests, releases, and deploys. Coordinate by
                assigning contributors and teams, or by adding them to milestones and projects. All in a single
                timeline.
                <Timeline className="lp-TimelineInRiver">
                  <Timeline.Item>Upload and attach videos to comments</Timeline.Item>
                  <Timeline.Item>Dive into work faster with issue forms and templates</Timeline.Item>
                </Timeline>
              </Text>
            </River.Content>
          </River>

          <Spacer size="64px" size1012="128px" />
        </div>
      </section>

      {/* Features 2 */}

      <section id="features-2">
        <ThemeProvider colorMode="dark" style={{backgroundColor: 'var(--brand-color-canvas-default'}}>
          <div className="fp-Section-container">
            <Spacer size="64px" size1012="128px" />

            <RiverBreakout className="fp-RiverBreakout">
              <RiverBreakout.A11yHeading as="h2">TODO</RiverBreakout.A11yHeading>
              <RiverBreakout.Visual>
                <Image
                  className="fp-RiverBreakoutVisualImage"
                  src="/images/modules/site/issues/fp24/features-river-breakout.webp"
                  alt="TODO"
                />
              </RiverBreakout.Visual>
              <RiverBreakout.Content
                trailingComponent={() => (
                  <Timeline>
                    <Timeline.Item>
                      <em>Save views for sprints, backlogs, teams, or releases.</em>
                      Rank, group, sort, slice and filter to suit the occasion. Create swimlanes, share templates and
                      set work in progress limits.
                    </Timeline.Item>
                    <Timeline.Item>
                      <em>No mouse? No problem.</em> Every action you can take with the mouse has a keyboard shortcut or
                      command. Filter, sort, group, and assign issues. Your hands never leave the keyboard.
                    </Timeline.Item>
                  </Timeline>
                )}
              >
                <Text>
                  <em>Bored of boards?</em> Switch to tables and roadmaps. Create views for how you work.
                </Text>
              </RiverBreakout.Content>
            </RiverBreakout>

            <Spacer size="64px" size1012="128px" />

            <Bento className="lp-Bento">
              <Bento.Item className="lp-BentoItem lp-BentoItem1" columnSpan={12} flow={{large: 'column'}}>
                <Bento.Content className="lp-BentoItem-content" verticalAlign="end" leadingVisual={<SlidersIcon />}>
                  <Bento.Heading as="h3" size="5" weight="semibold">
                    Extend issues with <br className="fp-breakWhenWide" /> custom fields
                  </Bento.Heading>
                  <Text as="p" style={{marginBottom: 0}}>
                    Track metadata like iterations, priority, story points, dates, notes, and links. Add custom fields
                    to projects and edit from the issue sidebar.
                  </Text>
                </Bento.Content>
                <Bento.Visual className="lp-BentoItem-visual" fillMedia={false}>
                  <Image src="/images/modules/site/issues/fp24/features-bento-1.webp" alt="TODO" width="566" />
                </Bento.Visual>
              </Bento.Item>

              <Bento.Item className="lp-BentoItem lp-BentoItem2" columnSpan={{xsmall: 12, large: 6}}>
                <Bento.Content className="lp-BentoItem-content">
                  <Bento.Heading as="h3" size="5" weight="semibold">
                    Track progress with <br className="fp-breakWhenWide" /> project insights
                  </Bento.Heading>
                  <Text as="p" style={{marginBottom: 0}}>
                    Track the health of your current iteration cycle, milestone, or any other custom field you create
                    with new project insights. Identify bottlenecks and issues blocking the team from making progress
                    with the new burn up chart.
                  </Text>
                </Bento.Content>
                <Bento.Visual className="lp-BentoItem-visual" fillMedia={false}>
                  <Image src="/images/modules/site/issues/fp24/features-bento-2.webp" alt="TODO" width="548" />
                </Bento.Visual>
              </Bento.Item>

              <Bento.Item className="lp-BentoItem lp-BentoItem3" columnSpan={{xsmall: 12, large: 6}}>
                <Bento.Content className="lp-BentoItem-content">
                  <Bento.Heading as="h3" size="5" weight="semibold">
                    Share best practices with <br className="fp-breakWhenWide" /> project templates
                  </Bento.Heading>
                  <Text as="p" style={{marginBottom: 0}}>
                    Create templates to share and reuse when getting started with a new project. Share inspiration
                    across teams and get started with a single click.
                  </Text>
                </Bento.Content>
                <Bento.Visual className="lp-BentoItem-visual" fillMedia={false}>
                  <Image src="/images/modules/site/issues/fp24/features-bento-3.webp" alt="TODO" width="547" />
                </Bento.Visual>
              </Bento.Item>

              <Bento.Item columnSpan={12}>
                <Bento.Content horizontalAlign="center">
                  <Bento.Heading as="h3" size="5" weight="semibold">
                    Manage work automatically
                  </Bento.Heading>
                  <Text as="p" style={{marginBottom: 0, maxWidth: '460px'}}>
                    Accelerate your project planning with workflows. Automatically triage issues, set values for custom
                    fields, and auto add or archive issues.
                  </Text>
                </Bento.Content>
                <Bento.Visual
                  fillMedia={false}
                  horizontalAlign="center"
                  padding={{xsmall: 'normal', medium: 'spacious'}}
                >
                  <Image src="/images/modules/site/issues/fp24/features-bento-4.webp" alt="TODO" width="1002" />
                </Bento.Visual>
              </Bento.Item>
            </Bento>

            <Spacer size="64px" size1012="128px" />
          </div>
        </ThemeProvider>
      </section>

      {/* Integration */}

      <section id="integration">
        <div className="fp-Section-container">
          <Spacer size="64px" size1012="128px" />

          <SectionIntro className="fp-SectionIntro" align="center" fullWidth>
            <SectionIntro.Heading size="3">Issues, where you need them</SectionIntro.Heading>
            <SectionIntro.Description>
              Issues can be viewed, created, and managed in your browser, your favorite terminal, or on your phone or
              tablet.
            </SectionIntro.Description>
          </SectionIntro>

          <Spacer size="40px" size1012="80px" />

          <Grid className="lp-Grid">
            <Grid.Column className="lp-GridColumn" span={{xsmall: 12, medium: 6}}>
              <Card className="lp-Card" variant="minimal" href="https://cli.github.com">
                <Card.Image
                  className="lp-CardImage"
                  src="/images/modules/site/issues/fp24/integration-card-1.webp"
                  alt="TODO"
                  width={600}
                />
                <Card.Heading size="6">GitHub CLI</Card.Heading>
                <Card.Description>View, update, and create issues without ever leaving your terminal.</Card.Description>
              </Card>
            </Grid.Column>
            <Grid.Column className="lp-GridColumn" span={{xsmall: 12, medium: 6}}>
              <Card className="lp-Card" variant="minimal" href="https://github.com/mobile">
                <Card.Image
                  className="lp-CardImage"
                  src="/images/modules/site/issues/fp24/integration-card-2.webp"
                  alt="TODO"
                  width={600}
                />
                <Card.Heading size="6">GitHub Mobile</Card.Heading>
                <Card.Description>
                  Create and manage issues on the go with our native iOS and Android mobile apps.
                </Card.Description>
              </Card>
            </Grid.Column>
          </Grid>

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
        </div>

        <Spacer size="48px" size1012="96px" />

        <div className="fp-Section-container lp-TestimonialsContainer">
          <Image
            className="lp-TestimonialsVisual lp-TestimonialsVisual--1"
            src="/images/modules/site/issues/fp24/testimonial-bg-1.webp"
            width={574}
            alt=""
          />
          <Image
            className="lp-TestimonialsVisual lp-TestimonialsVisual--2"
            src="/images/modules/site/issues/fp24/testimonial-bg-2.webp"
            width={526}
            alt=""
          />

          <Testimonial quoteMarkColor="purple" size="large" className="lp-Testimonial">
            <Testimonial.Quote className="lp-TestimonialQuote">
              The new planning and tracking functionality keeps my project management close to my code. I no longer find
              myself needing to reach for spreadsheets or 3P tools which go stale instantly.
            </Testimonial.Quote>
            <Testimonial.Name position="Development Manager">Dan Godfrey</Testimonial.Name>
          </Testimonial>
        </div>

        <Spacer size="48px" size1012="96px" />

        <div className="fp-Section-container">
          <ThemeProvider colorMode="dark">
            <CTABanner className="lp-CTABanner" align="center" hasShadow={false}>
              <CTABanner.Heading size="2">Flexible project planning for developers</CTABanner.Heading>
              <CTABanner.ButtonGroup buttonsAs="a">
                <Button href="https://youtu.be/o1wuW24Nv4E" trailingVisual={<PlayIcon />}>
                  Watch video
                </Button>
                <Button href="#TODO">Start using projects</Button>
              </CTABanner.ButtonGroup>
            </CTABanner>
          </ThemeProvider>

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

          <Spacer size="64px" size1012="128px" />
        </div>
      </section>
    </ThemeProvider>
  )
}

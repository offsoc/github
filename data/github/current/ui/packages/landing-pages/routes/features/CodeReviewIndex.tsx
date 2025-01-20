import {
  ThemeProvider,
  Hero,
  RiverBreakout,
  Image,
  Text,
  Timeline,
  Link,
  SectionIntro,
  River,
  Heading,
  Grid,
  Card,
  PricingOptions,
} from '@primer/react-brand'
import {CheckCircleIcon, GitBranchIcon, PersonAddIcon} from '@primer/octicons-react'
import {Spacer} from './components/Spacer'

const extURLs = {
  get_started: '#pricing',
  how_gh_works: 'https://www.youtube.com/watch?v=w3jLJU7DT5E',
}

export function CodeReviewIndex() {
  return (
    <ThemeProvider colorMode="light" className="fp-hasFontSmoothing">
      {/* Header + Subnav = 136px */}
      <Spacer size="136px" />
      <Spacer size="48px" size1012="96px" />

      {/* Hero */}

      <section id="hero">
        <div className="fp-Section-container">
          <Hero data-hpc align="center" className="fp-Hero">
            <Hero.Label color="purple">Code Review</Hero.Label>
            <Hero.Heading size="2">Write better code</Hero.Heading>
            <Hero.Description size="300">
              On GitHub, lightweight code review tools are built into every pull request. Your team can create review
              processes that improve the quality of your code and fit neatly into your workflow.
            </Hero.Description>
            <Hero.PrimaryAction href={extURLs.get_started}>Get started</Hero.PrimaryAction>
          </Hero>

          <Spacer size="40px" size1012="80px" />

          <RiverBreakout className="fp-RiverBreakout">
            <RiverBreakout.A11yHeading>TODO</RiverBreakout.A11yHeading>
            <RiverBreakout.Visual>
              <Image
                className="fp-RiverBreakoutVisualImage"
                src="/images/modules/site/code-review/fp24/hero.webp"
                alt="TODO"
              />
            </RiverBreakout.Visual>
            <RiverBreakout.Content
              trailingComponent={() => (
                <Timeline>
                  <Timeline.Item>
                    Start a new feature or propose a change to existing code with a pull request—a base for your team to
                    coordinate details and refine your changes.
                  </Timeline.Item>
                  <Timeline.Item>
                    Pull requests are fundamental to how teams review and improve code on GitHub. Evolve projects,
                    propose new features, and discuss implementation details before changing your source code.
                  </Timeline.Item>
                </Timeline>
              )}
            >
              <Text>
                <em>Every change starts with a pull request.</em>
              </Text>
              <Link
                size="large"
                href="https://docs.github.com/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests"
              >
                Learn pull request fundementals
              </Link>
            </RiverBreakout.Content>
          </RiverBreakout>

          <Spacer size="64px" size1012="128px" />
        </div>
      </section>

      {/* Features */}

      <section id="features" className="fp-Section--isRaised">
        <div className="fp-Section-container">
          <Spacer size="64px" size1012="128px" />

          <SectionIntro className="fp-SectionIntro" align="center">
            <SectionIntro.Heading size="3">See every update and act on it, in-situ</SectionIntro.Heading>
          </SectionIntro>

          <Spacer size="48px" size1012="96px" />

          <River className="fp-River">
            <River.Visual>
              <Image src="/images/modules/site/code-review/fp24/features-river-1.webp" alt="TODO" />
            </River.Visual>
            <River.Content>
              <Heading as="h3">Diffs</Heading>
              <Text size="200">
                Preview changes in context with your code to see what is being proposed. Side-by-side Diffs highlight
                added, edited, and deleted code right next to the original file, so you can easily spot changes.
              </Text>
              <Link href="https://docs.github.com/articles/about-comparing-branches-in-pull-requests/">Learn more</Link>
            </River.Content>
          </River>

          <River className="fp-River">
            <River.Visual>
              <Image src="/images/modules/site/code-review/fp24/features-river-2.webp" alt="TODO" />
            </River.Visual>
            <River.Content>
              <Heading as="h3">History</Heading>
              <Text size="200">
                Browse commits, comments, and references related to your pull request in a timeline-style interface.
                Your pull request will also highlight what’s changed since you last checked.
              </Text>
              <Link href="https://docs.github.com/articles/searching-commits/">Learn more</Link>
            </River.Content>
          </River>

          <River className="fp-River">
            <River.Visual>
              <Image src="/images/modules/site/code-review/fp24/features-river-3.webp" alt="TODO" />
            </River.Visual>
            <River.Content>
              <Heading as="h3">Blame</Heading>
              <Text size="200">
                See what a file looked like before a particular change. With blame view, you can see how any portion of
                your file has evolved over time without viewing the file’s full history.
              </Text>
              <Link href="https://docs.github.com/articles/tracing-changes-in-a-file/">Learn more</Link>
            </River.Content>
          </River>

          <Spacer size="64px" size1012="128px" />
        </div>
      </section>

      {/* Discuss */}

      <section id="discuss">
        <div className="fp-Section-container">
          <Spacer size="64px" size1012="128px" />

          <SectionIntro className="fp-SectionIntro" align="center">
            <SectionIntro.Heading size="3">
              Discuss code <br className="fp-breakWhenWide" /> within your code
            </SectionIntro.Heading>
          </SectionIntro>

          <Spacer size="48px" size1012="96px" />

          <River className="fp-River">
            <River.Visual>
              <Image src="/images/modules/site/code-review/fp24/discuss-river-1.webp" alt="TODO" />
            </River.Visual>
            <River.Content>
              <Heading as="h3">Comments</Heading>
              <Text size="200">
                On GitHub, conversations happen alongside your code. Leave detailed comments on code syntax and ask
                questions about structure inline.
              </Text>
            </River.Content>
          </River>

          <River className="fp-River">
            <River.Visual>
              <Image src="/images/modules/site/code-review/fp24/discuss-river-2.webp" alt="TODO" />
            </River.Visual>
            <River.Content>
              <Heading as="h3">Review requests</Heading>
              <Text size="200">
                If you’re on the other side of the code, requesting peer reviews is easy. Add users to your pull
                request, and they’ll receive a notification letting them know you need their feedback.
              </Text>
            </River.Content>
          </River>

          <River className="fp-River">
            <River.Visual>
              <Image src="/images/modules/site/code-review/fp24/discuss-river-3.webp" alt="TODO" />
            </River.Visual>
            <River.Content>
              <Heading as="h3">Reviews</Heading>
              <Text size="200">
                Save your teammates a few notifications. Bundle your comments into one cohesive review, then specify
                whether comments are required changes or just suggestions.
              </Text>
            </River.Content>
          </River>

          <River className="fp-River">
            <River.Visual>
              <Image src="/images/modules/site/code-review/fp24/discuss-river-4.webp" alt="TODO" />
            </River.Visual>
            <River.Content>
              <Heading as="h3">Resolve simple conflicts</Heading>
              <Text size="200">
                You can’t always avoid conflict. Merge pull requests faster by resolving simple merge conflicts on
                GitHub—no command line necessary.
              </Text>
              <Link href="https://docs.github.com/articles/resolving-a-merge-conflict-on-github/">
                Learn how to resolve merge conflicts
              </Link>
            </River.Content>
          </River>

          <Spacer size="64px" size1012="128px" />
        </div>
      </section>

      {/* Quality */}

      <section id="quality" className="fp-Section--isRaised">
        <div className="fp-Section-container">
          <Spacer size="64px" size1012="128px" />

          <SectionIntro className="fp-SectionIntro" align="center" fullWidth>
            <SectionIntro.Heading size="3">Merge the highest quality code</SectionIntro.Heading>
            <SectionIntro.Description>
              Reviews can improve your code, but mistakes happen. Limit human error and ensure only high quality code
              gets merged with detailed permissions and status checks.
            </SectionIntro.Description>
          </SectionIntro>

          <Spacer size="40px" size1012="80px" />

          <Grid className="lp-Grid">
            <Grid.Column className="lp-GridColumn" span={{xsmall: 12, medium: 4}}>
              <Card className="lp-Card" ctaText="See plan options" href="https://github.com/pricing">
                <Card.Icon icon={<PersonAddIcon />} color="purple" />
                <Card.Heading size="6">Fast, relevant results</Card.Heading>
                <Card.Description>
                  Give collaborators as much access as they need through your repository settings. You can extend access
                  to a few teams and select which ones can read or write to your files. The options you have for
                  permissions depend on your plan.
                </Card.Description>
              </Card>
            </Grid.Column>

            <Grid.Column className="lp-GridColumn" span={{xsmall: 12, medium: 4}}>
              <Card
                className="lp-Card"
                ctaText="Learn more"
                href="https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches"
              >
                <Card.Icon icon={<GitBranchIcon />} color="purple" />
                <Card.Heading size="6">Protected branches</Card.Heading>
                <Card.Description>
                  Protected Branches help you maintain the integrity of your code. Limit who can push to a branch, and
                  disable force pushes to specific branches. Then scale your policies with the Protected Branches API.
                </Card.Description>
              </Card>
            </Grid.Column>

            <Grid.Column className="lp-GridColumn" span={{xsmall: 12, medium: 4}}>
              <Card className="lp-Card" ctaText="Status API doc" href="https://docs.github.com/rest/commits/statuses">
                <Card.Icon icon={<CheckCircleIcon />} color="purple" />
                <Card.Heading size="6">Required status checks</Card.Heading>
                <Card.Description>
                  Create required status checks to add an extra layer of error prevention on branches. Use the Status
                  API to enforce checks and disable the merge button until they pass. To err is human; to automate,
                  divine!
                </Card.Description>
              </Card>
            </Grid.Column>
          </Grid>

          <Spacer size="64px" size1012="128px" />
        </div>
      </section>

      {/* Pricing */}

      <section id="pricing">
        <div className="fp-Section-container">
          <Spacer size="64px" size1012="128px" />

          <SectionIntro className="fp-SectionIntro" align="center">
            <SectionIntro.Heading size="3">Get started</SectionIntro.Heading>
          </SectionIntro>

          <Spacer size="40px" size1012="80px" />

          <PricingOptions variant="cards">
            <PricingOptions.Item>
              <PricingOptions.Heading>Free</PricingOptions.Heading>
              <PricingOptions.Description>The basics for individuals and organizations</PricingOptions.Description>
              <PricingOptions.Price currencySymbol="$" trailingText="per month">
                0
              </PricingOptions.Price>
              <PricingOptions.SecondaryAction as="a" href="#TODO">
                Create a free organization
              </PricingOptions.SecondaryAction>
            </PricingOptions.Item>

            <PricingOptions.Item>
              <PricingOptions.Heading>Team</PricingOptions.Heading>
              <PricingOptions.Description>
                Advanced collaboration for individuals and organizations
              </PricingOptions.Description>
              <PricingOptions.Price currencySymbol="$" trailingText="per user / month">
                4
              </PricingOptions.Price>
              <PricingOptions.PrimaryAction as="a" href="#TODO">
                Continue with Team
              </PricingOptions.PrimaryAction>
            </PricingOptions.Item>

            <PricingOptions.Item>
              <PricingOptions.Heading>Enterprise</PricingOptions.Heading>
              <PricingOptions.Description>Security, compliance, and flexible deployment</PricingOptions.Description>
              <PricingOptions.Price currencySymbol="$" trailingText="per user / month">
                21
              </PricingOptions.Price>
              <PricingOptions.PrimaryAction as="a" href="#TODO">
                Start a free trial
              </PricingOptions.PrimaryAction>
            </PricingOptions.Item>
          </PricingOptions>

          <Spacer size="64px" size1012="128px" />
        </div>
      </section>
    </ThemeProvider>
  )
}

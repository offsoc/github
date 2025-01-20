import {useEffect, useRef, useState} from 'react'
import {
  ThemeProvider,
  Hero,
  EyebrowBanner,
  LogoSuite,
  AnchorNav,
  SectionIntro,
  River,
  Heading,
  Text,
  Button,
  Link,
  Image,
  Box,
  Grid,
  Stack,
  Testimonial,
  Card,
  CTABanner,
  FAQ,
  FAQGroup,
  AnimationProvider,
  Bento,
} from '@primer/react-brand'
import {BookIcon} from '@primer/octicons-react'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {CustomerStoryBento} from './enterprise/CustomerStoryBento'
import EnterpriseSubNav from './enterprise/EnterpriseSubNav'
import {isFeatureEnabled} from '@github-ui/feature-flags'

export function EnterpriseIndex() {
  const videoLgRef = useRef<HTMLVideoElement>(null)
  const videoSmRef = useRef<HTMLVideoElement>(null)
  const {heroLgMovUrl} = useRoutePayload<{heroLgMovUrl: string}>()
  const {heroSmMovUrl} = useRoutePayload<{heroSmMovUrl: string}>()
  const {siteSecurityReactEnabled} = useRoutePayload<{siteSecurityReactEnabled: boolean}>()
  const {eyebrowBannerData} = useRoutePayload<{
    eyebrowBannerData: {
      render: boolean
      title: string
      subtitle: string | null
      url: string
      icon: string | null
      analytics: {
        'analytics-event': string
      }
    }
  }>()

  const [isLogoSuiteAnimationPaused, setIsLogoSuiteAnimationPaused] = useState(false)
  const [logoSuiteAnimationButtonLabel, setLogoSuiteAnimationButtonLabel] = useState('Pause')
  const [logoSuiteAnimationButtonAriaLabel, setLogoSuiteAnimationButtonAriaLabel] = useState(
    'Logo suite animation is currently playing. Click to pause.',
  )
  const toggleLogoSuiteAnimationPause = () => {
    setIsLogoSuiteAnimationPaused(!isLogoSuiteAnimationPaused)
    if (isLogoSuiteAnimationPaused) {
      setLogoSuiteAnimationButtonAriaLabel('Logo suite animation is currently playing. Click to pause.')
      setLogoSuiteAnimationButtonLabel('Pause')
    } else {
      setLogoSuiteAnimationButtonAriaLabel('Logo suite animation is paused. Click to play.')
      setLogoSuiteAnimationButtonLabel('Play')
    }
  }
  const useMeteredBillingUpdate = isFeatureEnabled('site_metered_billing_update')

  useEffect(() => {
    const anchorNavEl = document.getElementById('anchor-nav')
    const nextSiblingEl = document.getElementById('scale')
    if (!nextSiblingEl || !anchorNavEl) return

    const anchorNavHeight = anchorNavEl.getBoundingClientRect().height

    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'data-sticky') {
          if (mutation.target instanceof HTMLElement) {
            const dataSticky = mutation.target.getAttribute('data-sticky')
            if (dataSticky === 'true' && nextSiblingEl instanceof HTMLElement) {
              nextSiblingEl.style.paddingTop = `${anchorNavHeight}px`
            } else if (nextSiblingEl instanceof HTMLElement) {
              nextSiblingEl.style.paddingTop = '0px'
            }
          }
        }
      }
    })

    observer.observe(anchorNavEl, {attributes: true})

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const playVideo = (videoElement: HTMLVideoElement | null) => {
      videoElement?.play()
    }

    const videoLgElement = videoLgRef.current
    const videoSmElement = videoSmRef.current

    const handleVideoLgElement = () => playVideo(videoLgElement)
    const handleVideoSmElement = () => playVideo(videoSmElement)

    videoLgElement?.addEventListener('canplay', handleVideoLgElement)
    videoSmElement?.addEventListener('canplay', handleVideoSmElement)

    return () => {
      videoLgElement?.removeEventListener('canplay', handleVideoLgElement)
      videoSmElement?.removeEventListener('canplay', handleVideoSmElement)
    }
  }, [])

  return (
    <>
      <ThemeProvider colorMode="dark" className="enterprise-lp enterprise-dark-bg">
        <Box className="enterprise-hero-background overflow-hidden">
          <EnterpriseSubNav />
          <Box paddingBlockEnd={64} className="enterprise-hero-grid">
            <Hero align="center" className="enterprise-hero">
              {eyebrowBannerData && eyebrowBannerData.render && (
                <EyebrowBanner
                  href={eyebrowBannerData.url}
                  className="mx-3 mx-sm-auto mb-5 mb-md-7 eyebrow-glass"
                  data-analytics-event={eyebrowBannerData.analytics['analytics-event']}
                >
                  {eyebrowBannerData.icon && (
                    <EyebrowBanner.Visual>
                      <img width="44" height="44" alt="" aria-hidden="true" src={eyebrowBannerData.icon} />
                    </EyebrowBanner.Visual>
                  )}
                  <EyebrowBanner.Heading>{eyebrowBannerData.title}</EyebrowBanner.Heading>
                  {eyebrowBannerData.subtitle && (
                    <EyebrowBanner.SubHeading>{eyebrowBannerData.subtitle}</EyebrowBanner.SubHeading>
                  )}
                </EyebrowBanner>
              )}
              <Hero.Heading size="1" weight="bold" className="enterprise-hero-heading">
                The AI-powered
                <br aria-hidden="true" />
                developer platform.
              </Hero.Heading>
              <Hero.Description size="500" weight="normal">
                To build, scale, and deliver secure software.
              </Hero.Description>
              <Hero.PrimaryAction href="/organizations/enterprise_plan?ref_cta=Start+a+free+trial&ref_loc=hero&ref_page=%2Fenterprise">
                Start a free trial
              </Hero.PrimaryAction>
              <Hero.SecondaryAction
                href="/enterprise/contact?ref_cta=Contact+Sales&ref_loc=hero&ref_page=%2Fenterprise&scid=&utm_campaign=Enterprise&utm_content=Enterprise&utm_medium=referral&utm_source=github"
                hasArrow={false}
              >
                Contact sales
              </Hero.SecondaryAction>
              <Hero.Image
                src="/images/modules/site/enterprise/2023/hero-visual.png"
                alt="A platform with GitHub logo on it"
                className="enterprise-hero-visual hide-no-pref-motion"
              />
            </Hero>

            <video
              ref={videoLgRef}
              autoPlay={true}
              playsInline={true}
              muted={true}
              className="enterprise-hero-video-lg d-none d-md-block hide-reduced-motion top-n6"
              width="1400"
              height="1312"
            >
              <source src={heroLgMovUrl} type="video/mp4" />
            </video>

            <video
              ref={videoSmRef}
              autoPlay={true}
              playsInline={true}
              muted={true}
              className="enterprise-hero-video-sm d-md-none hide-reduced-motion height-auto"
              width="670"
              height="1300"
            >
              <source src={heroSmMovUrl} type="video/mp4" />
            </video>
          </Box>
          <LogoSuite className="enterprise-logo-suite container-lg" hasDivider={false}>
            <LogoSuite.Heading visuallyHidden>Featured sponsors</LogoSuite.Heading>
            <LogoSuite.Logobar marquee marqueeSpeed="slow" data-animation-paused={isLogoSuiteAnimationPaused}>
              <Image
                src="/images/modules/site/enterprise/2023/logos/logo-stripe.svg"
                alt="Stripe's logo"
                style={{height: '50px'}}
              />
              <Image
                src="/images/modules/site/enterprise/2023/logos/logo-twilio.svg"
                alt="Twilio's logo"
                style={{height: '50px'}}
              />
              <Image
                src="/images/modules/site/enterprise/2023/logos/logo-spotify.svg"
                alt="Spotify's logo"
                style={{height: '50px'}}
              />
              <Image
                src="/images/modules/site/enterprise/2023/logos/logo-arduino.svg"
                alt="Arduino's logo"
                style={{height: '50px'}}
              />
              <Image
                src="/images/modules/site/enterprise/2023/logos/logo-ford.svg"
                alt="Ford's logo"
                style={{height: '60px'}}
              />
              <Image
                src="/images/modules/site/enterprise/2023/logos/logo-3m.svg"
                alt="3M's logo"
                style={{height: '40px'}}
              />
              <Image
                src="/images/modules/site/enterprise/2023/logos/logo-pg.svg"
                alt="PG's logo"
                style={{height: '40px'}}
              />
              <Image
                src="/images/modules/site/enterprise/2023/logos/logo-aa.svg"
                alt="American Airlines's logo"
                style={{height: '50px'}}
              />
              <Image
                src="/images/modules/site/enterprise/2023/logos/logo-nationwide.svg"
                alt="Nationwide's logo"
                style={{height: '50px'}}
              />
              <Image
                src="/images/modules/site/enterprise/2023/logos/logo-kpmg.svg"
                alt="KPMG's logo"
                style={{height: '40px'}}
              />
            </LogoSuite.Logobar>
          </LogoSuite>

          <Box paddingBlockStart={12} className="enterprise-LogoSuite-control">
            <Button
              variant="subtle"
              hasArrow={false}
              className="enterprise-LogoSuite-controlButton"
              onClick={toggleLogoSuiteAnimationPause}
              aria-pressed={isLogoSuiteAnimationPaused}
              aria-label={logoSuiteAnimationButtonAriaLabel}
            >
              {logoSuiteAnimationButtonLabel}
            </Button>
          </Box>
        </Box>

        <AnchorNav hideUntilSticky id="anchor-nav">
          <AnchorNav.Link href="#scale">Scale</AnchorNav.Link>
          <AnchorNav.Link href="#ai">AI</AnchorNav.Link>
          <AnchorNav.Link href="#security">Security</AnchorNav.Link>
          <AnchorNav.Link href="#reliability">Reliability</AnchorNav.Link>
          <AnchorNav.Action href="/organizations/enterprise_plan?ref_cta=Start+a+free+trial&ref_loc=navigation&ref_page=%2Fenterprise">
            Start a free trial
          </AnchorNav.Action>
        </AnchorNav>
      </ThemeProvider>
      <ThemeProvider colorMode="dark" id="scale" className="enterprise-dark-bg">
        <Box
          paddingBlockStart={{
            regular: 32,
          }}
          paddingBlockEnd={{
            narrow: 64,
            regular: 128,
          }}
          className="overflow-hidden"
        >
          <Grid>
            <Grid.Column>
              <section className="enterprise-center-until-medium">
                <Stack padding="none">
                  <Grid>
                    <Grid.Column span={{xlarge: 10}}>
                      <SectionIntro
                        fullWidth
                        className="enterprise-spacer--SectionIntro-River"
                        style={{gap: 'var(--base-size-24)'}}
                      >
                        <SectionIntro.Label size="large" className="section-intro-label-custom">
                          Scale
                        </SectionIntro.Label>
                        <SectionIntro.Heading size="1" weight="bold">
                          The enterprise-ready platform that developers know and love.
                        </SectionIntro.Heading>
                      </SectionIntro>
                    </Grid.Column>
                  </Grid>
                  <AnimationProvider runOnce>
                    <River imageTextRatio="60:40" animate="slide-in-down">
                      <River.Visual className="enterprise-river-visual">
                        <a
                          href="https://docs.github.com/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning"
                          data-analytics-event='{"category":"enterprise consolidate","action":"click on enterprise consolidate","label":"ref_cta:enterprise_consolidate;ref_loc:body"}'
                        >
                          <Image
                            src="/images/modules/site/enterprise/2023/devops.png"
                            alt="A notification panel from a development operations tool showing statuses such as 'Changes requested,' 'Some checks were not successful,' and 'Merging is blocked."
                          />
                        </a>
                      </River.Visual>
                      <River.Content>
                        <Heading size="5" as="h3" weight="medium">
                          Consolidate DevSecOps processes and enable unparalleled collaboration.
                        </Heading>
                        <Link href="https://resources.github.com/forrester/" variant="accent">
                          Learn more about the ROI of GitHub
                        </Link>
                      </River.Content>
                    </River>

                    <River imageTextRatio="60:40" animate="slide-in-down">
                      <River.Visual className="enterprise-river-visual">
                        <a
                          href="https://github.com/marketplace"
                          data-analytics-event='{"category":"enterprise secure","action":"click on enterprise secure","label":"ref_cta:enterprise_secure;ref_loc:body"}'
                        >
                          <Image
                            src="/images/modules/site/enterprise/2023/platform.png"
                            alt="A collection of application icons for various development tools like Imgbot, AccessLint, WakaTime, Circle CI, Cirrus CI and Code Climate."
                          />
                        </a>
                      </River.Visual>
                      <River.Content
                        trailingComponent={() => (
                          <div className="pr-lg-10">
                            <hr className="enterprise-separator mb-6 mt-n3" />
                            <Heading as="h4" size="3">
                              17,000+
                            </Heading>
                            <Text as="p" size="300" weight="light" variant="muted">
                              Third-party tools support your favorite languages and frameworks <sup>1</sup>
                            </Text>
                          </div>
                        )}
                      >
                        <Heading size="5" as="h3" weight="medium">
                          Leverage the industry’s most flexible secure development platform.
                        </Heading>
                      </River.Content>
                    </River>

                    <River imageTextRatio="60:40" animate="slide-in-down">
                      <River.Visual className="enterprise-river-visual">
                        <a
                          href="https://docs.github.com/copilot/github-copilot-chat/about-github-copilot-chat#about-github-copilot-chat"
                          data-analytics-event='{"category":"enterprise ai","action":"click on enterprise ai","label":"ref_cta:enterprise_ai;ref_loc:body"}'
                        >
                          <Image
                            src="/images/modules/site/enterprise/2023/ai.png"
                            alt="A user interface element with a search bar inviting to 'Ask a question or type '/' for topics'."
                          />
                        </a>
                      </River.Visual>
                      <River.Content>
                        <Heading size="5" as="h3" weight="medium">
                          Unlocking innovation at scale with AI-driven software development.
                        </Heading>
                      </River.Content>
                    </River>
                  </AnimationProvider>
                </Stack>
              </section>
            </Grid.Column>
          </Grid>

          <Box className="position-relative">
            <Grid>
              <Grid.Column>
                <AnimationProvider runOnce>
                  <Box
                    animate="slide-in-down"
                    padding={{
                      narrow: 24,
                      regular: 96,
                      wide: 128,
                    }}
                    marginBlockStart={64}
                    className="position-relative z-1 testimonial-glass"
                  >
                    <Testimonial size="large" quoteMarkColor="purple">
                      <Testimonial.Quote>
                        We’ve used GitHub from the inception of Datadog. It’s a high-quality product,{' '}
                        <Text variant="muted" size="600">
                          and a lot of our engineers contribute to open source so there’s a sense of community there.
                          GitHub is ingrained in the DNA of our engineering, it’s become part of the culture.”
                        </Text>
                      </Testimonial.Quote>
                      <Testimonial.Avatar
                        src="/images/modules/site/enterprise/2023/avatar-emilio.png"
                        alt="Emilio Escobar's avatar"
                      />
                      <Testimonial.Name
                        position="Chief Information Security Officer @ Datadog"
                        className="enterprise-testimonial-name"
                      >
                        Emilio Escobar
                      </Testimonial.Name>
                    </Testimonial>
                  </Box>
                </AnimationProvider>
              </Grid.Column>
            </Grid>

            <Image
              src="/images/modules/site/enterprise/2023/element-1.png"
              alt="Decorative element"
              width="634"
              height="634"
              className="position-absolute testimonial-element-1 d-none d-md-block"
            />

            <Image
              src="/images/modules/site/enterprise/2023/element-2.png"
              alt="Decorative element"
              width="766"
              height="788"
              className="position-absolute testimonial-element-2"
            />
          </Box>
        </Box>
      </ThemeProvider>
      <ThemeProvider colorMode="dark" style={{backgroundColor: 'var(--brand-color-canvas-subtle)'}} id="ai">
        <Grid>
          <Grid.Column>
            <Box
              paddingBlockStart={{
                narrow: 64,
                regular: 128,
              }}
              paddingBlockEnd={{
                narrow: 64,
                regular: 128,
              }}
              marginBlockEnd={{
                narrow: 32,
                regular: 64,
              }}
            >
              <section className="enterprise-center-until-medium">
                <Stack padding="none" gap="spacious">
                  <SectionIntro className="enterprise-spacer--SectionIntro-Bento" style={{gap: 'var(--base-size-24)'}}>
                    <SectionIntro.Label size="large" className="section-intro-label-custom">
                      AI
                    </SectionIntro.Label>
                    <SectionIntro.Heading size="1" weight="bold">
                      Build, secure, and ship software faster
                    </SectionIntro.Heading>
                  </SectionIntro>

                  <Bento>
                    <Bento.Item
                      columnSpan={{
                        xsmall: 12,
                        large: 7,
                      }}
                      rowSpan={{
                        xsmall: 4,
                        large: 5,
                      }}
                      visualAsBackground
                      className="bento-item-ai-copilot"
                    >
                      <Bento.Content
                        padding={{
                          xsmall: 'normal',
                          medium: 'spacious',
                        }}
                      >
                        <Bento.Heading as="h3" size="3" weight="semibold">
                          Push what&apos;s possible with GitHub Copilot, the world&apos;s most trusted and widely
                          adopted AI developer tool.
                        </Bento.Heading>
                        <Link href="/features/copilot" size="large" variant="default">
                          Learn more about Copilot
                        </Link>
                      </Bento.Content>
                    </Bento.Item>
                    <Bento.Item
                      columnSpan={{
                        xsmall: 12,
                        large: 5,
                      }}
                      rowSpan={5}
                      style={{background: 'var(--base-color-scale-black-0)', gridGap: 0}}
                    >
                      <Bento.Content
                        padding={{
                          xsmall: 'normal',
                          medium: 'spacious',
                        }}
                        horizontalAlign="center"
                      >
                        <Bento.Heading
                          as="h3"
                          size="display"
                          style={{
                            marginBottom: 'var(--base-size-8)',
                            fontSize: '112px',
                            letterSpacing: '-0.5rem',
                          }}
                        >
                          88%
                        </Bento.Heading>
                        <Text align="center" size="400" weight="normal">
                          of developers experience increased productivity.
                        </Text>
                      </Bento.Content>
                      <Bento.Visual
                        horizontalAlign="center"
                        verticalAlign="center"
                        padding="spacious"
                        fillMedia={false}
                      >
                        <Image
                          src="/images/modules/site/enterprise/2023/copilot-icon.png"
                          alt="Copilot logo"
                          width="112"
                          height="112"
                        />
                      </Bento.Visual>
                    </Bento.Item>
                    <Bento.Item
                      columnSpan={12}
                      rowSpan={{
                        xsmall: 3,
                        small: 4,
                        medium: 4,
                        large: 5,
                      }}
                      className="bento-item-ai-code"
                    >
                      <Bento.Visual fillMedia={false} horizontalAlign="center" verticalAlign="end">
                        <a
                          href="https://docs.github.com/copilot/quickstart#introduction"
                          data-analytics-event='{"category":"enterprise copilot","action":"click on enterprise copilot","label":"ref_cta:enterprise_copilot;ref_loc:body"}'
                        >
                          <Image
                            src="/images/modules/site/enterprise/2023/code-window.png"
                            alt="Code editor showing code suggestions"
                            className="bento-item-ai-code-img"
                          />
                        </a>
                      </Bento.Visual>
                    </Bento.Item>
                    <CustomerStoryBento />
                  </Bento>
                </Stack>
              </section>
            </Box>
          </Grid.Column>
        </Grid>
      </ThemeProvider>
      <ThemeProvider
        colorMode="light"
        style={{background: 'var(--base-color-scale-gray-1)'}}
        id="security"
        className="enterprise-section-rounded"
      >
        <Grid>
          <Grid.Column>
            <Box
              paddingBlockStart={{
                narrow: 64,
                regular: 128,
              }}
              paddingBlockEnd={{
                narrow: 64,
                regular: 128,
              }}
              marginBlockEnd={{
                narrow: 32,
                regular: 64,
              }}
            >
              <section className="enterprise-center-until-medium">
                <Stack padding="none" gap="spacious">
                  <SectionIntro
                    align="center"
                    className="enterprise-spacer--SectionIntro-Bento"
                    style={{gap: 'var(--base-size-24)'}}
                  >
                    <SectionIntro.Label size="large" className="section-intro-label-custom">
                      Security
                    </SectionIntro.Label>
                    <SectionIntro.Heading size="1" weight="bold">
                      Efficiency and security at every step.
                    </SectionIntro.Heading>
                  </SectionIntro>

                  <Bento>
                    <Bento.Item
                      columnSpan={12}
                      rowSpan={{
                        xsmall: 5,
                        medium: 6,
                        large: 7,
                      }}
                      colorMode="dark"
                      className="bento-item-security-ci-cd"
                      style={{gridGap: 0}}
                    >
                      <Bento.Content
                        padding={{
                          xsmall: 'normal',
                          medium: 'spacious',
                        }}
                        horizontalAlign="center"
                      >
                        <Bento.Heading
                          as="h3"
                          size="3"
                          weight="semibold"
                          className="text-center"
                          style={{maxWidth: '625px'}}
                        >
                          Deliver secure software fast, with enterprise-ready CI/CD using GitHub Actions.
                        </Bento.Heading>
                        <Link href="/solutions/ci-cd/" size="large" variant="default">
                          Learn more about CI/CD
                        </Link>
                      </Bento.Content>
                      <Bento.Visual fillMedia={false} position="50% 100%" style={{padding: '0 5%'}}>
                        <Image src="/images/modules/site/enterprise/2023/ci-cd.png" alt="CI/CD interface" />
                      </Bento.Visual>
                    </Bento.Item>
                    <Bento.Item
                      columnSpan={{xsmall: 12, medium: 5}}
                      rowSpan={{
                        xsmall: 4,
                        large: 5,
                      }}
                    >
                      <Bento.Visual
                        horizontalAlign="center"
                        verticalAlign="center"
                        padding={{
                          xsmall: 'normal',
                          medium: 'spacious',
                        }}
                        fillMedia={false}
                      >
                        <Box
                          marginBlockStart={{
                            narrow: 36,
                            regular: 'none',
                            wide: 36,
                          }}
                        >
                          <Image
                            src="/images/modules/site/enterprise/2023/time.png"
                            alt="Time icon"
                            width="110"
                            height="110"
                            style={{objectFit: 'contain'}}
                          />
                        </Box>
                      </Bento.Visual>
                      <Bento.Content padding="spacious">
                        <Bento.Heading
                          as="h3"
                          size="4"
                          weight="semibold"
                          className="text-center width-full"
                          style={{color: 'var(--base-color-scale-blue-5)', marginBottom: '0'}}
                        >
                          Fix vulnerabilities in minutes, not months.
                        </Bento.Heading>
                      </Bento.Content>
                    </Bento.Item>
                    <Bento.Item
                      columnSpan={{xsmall: 12, medium: 7}}
                      rowSpan={{xsmall: 4, large: 5}}
                      colorMode="dark"
                      className="bento-item-security-end-to-end"
                    >
                      <Bento.Content
                        padding={{
                          xsmall: 'normal',
                          medium: 'spacious',
                        }}
                        horizontalAlign="center"
                      >
                        <Bento.Heading as="h3" size="4" weight="semibold" className="text-center">
                          Stay secure end-to-end
                        </Bento.Heading>
                        <Link
                          href={siteSecurityReactEnabled ? '/enterprise/advanced-security' : '/features/security'}
                          size="large"
                          variant="default"
                        >
                          Explore GitHub Advanced Security
                        </Link>
                      </Bento.Content>
                      <Bento.Visual position="0 0" style={{paddingLeft: 'var(--base-size-24)'}}>
                        <Image src="/images/modules/site/enterprise/2023/testing.png" alt="UI of workflow runs" />
                      </Bento.Visual>
                    </Bento.Item>
                    <Bento.Item
                      columnSpan={12}
                      rowSpan={{
                        xsmall: 6,
                        medium: 5,
                      }}
                      flow={{
                        xsmall: 'row',
                        medium: 'column',
                      }}
                      colorMode="dark"
                      style={{background: 'var(--base-color-scale-black-0)', gridGap: 0}}
                    >
                      <Bento.Content
                        padding={{
                          xsmall: 'normal',
                          medium: 'spacious',
                        }}
                      >
                        <Bento.Heading as="h3" size="4" weight="semibold">
                          See how DVAG puts customers first by optimizing developer efficiency and security.
                        </Bento.Heading>
                        <Link href="/customer-stories/dvag" size="large">
                          Read customer story
                        </Link>
                      </Bento.Content>
                      <Bento.Visual padding="normal" position="50% 10%">
                        <Image
                          src="/images/modules/site/enterprise/2023/dvag.jpg"
                          alt="A photo of people looking at a tablet"
                        />
                      </Bento.Visual>
                    </Bento.Item>
                  </Bento>
                </Stack>
              </section>
            </Box>
          </Grid.Column>
        </Grid>
      </ThemeProvider>
      <ThemeProvider
        colorMode="light"
        style={{background: '#F8F6F9'}}
        id="reliability"
        className="enterprise-section-rounded"
      >
        <Grid>
          <Grid.Column>
            <Box
              paddingBlockStart={{
                narrow: 64,
                regular: 128,
              }}
              paddingBlockEnd={{
                narrow: 64,
                regular: 128,
              }}
              marginBlockEnd={{
                narrow: 32,
                regular: 64,
              }}
            >
              <section className="enterprise-center-until-medium">
                <Stack padding="none" gap="spacious">
                  <SectionIntro className="enterprise-spacer--SectionIntro-Bento" style={{gap: 'var(--base-size-24)'}}>
                    <SectionIntro.Label size="large" className="section-intro-label-custom">
                      Reliability
                    </SectionIntro.Label>
                    <SectionIntro.Heading size="1" weight="bold">
                      90% of the Fortune 100 choose GitHub
                    </SectionIntro.Heading>
                  </SectionIntro>

                  <Bento>
                    <Bento.Item
                      columnSpan={12}
                      rowSpan={{
                        xsmall: 6,
                        large: 5,
                      }}
                      flow={{
                        xsmall: 'row',
                        medium: 'column',
                      }}
                      colorMode="dark"
                      className="bento-item-reliability-transformation"
                      style={{gridGap: 0}}
                    >
                      <Bento.Content
                        padding={{
                          xsmall: 'normal',
                          medium: 'spacious',
                        }}
                      >
                        <Bento.Heading as="h3" size="3" weight="semibold">
                          Migrate, scale, and use cloud-based compute to accelerate digital transformation.
                        </Bento.Heading>
                        <Link
                          href="https://docs.github.com/migrations/overview/planning-your-migration-to-github"
                          size="large"
                          variant="default"
                        >
                          Explore GitHub Enterprise Importer
                        </Link>
                      </Bento.Content>
                      <Bento.Visual position="16px 0" fillMedia className="bento-visual-reliability-transformation">
                        <Image
                          src="/images/modules/site/enterprise/2023/terminal.png"
                          alt="A terminal showcasing the GitHub CLI"
                        />
                      </Bento.Visual>
                    </Bento.Item>
                    <Bento.Item
                      columnSpan={{xsmall: 12, large: 7}}
                      rowSpan={{
                        xsmall: 4,
                        large: 5,
                      }}
                      colorMode="dark"
                      order="reversed"
                      className="bento-item-reliability-distributed"
                      visualAsBackground
                    >
                      <Bento.Visual position="0% 60%" style={{marginTop: 'auto', maxHeight: '500px'}}>
                        <Image
                          src="/images/modules/site/enterprise/2023/globe.png"
                          alt="An illustration of the globe"
                        />
                      </Bento.Visual>
                      <Bento.Content
                        padding={{
                          xsmall: 'normal',
                          medium: 'spacious',
                        }}
                      >
                        <Bento.Heading as="h3" size="4" weight="semibold">
                          Reliability when it matters most with GitHub’s distributed architecture.
                        </Bento.Heading>
                      </Bento.Content>
                    </Bento.Item>
                    <Bento.Item
                      columnSpan={{xsmall: 12, large: 5}}
                      rowSpan={5}
                      order="reversed"
                      style={{background: 'var(--base-color-scale-white-0)', gridGap: 0}}
                    >
                      <Bento.Content padding="spacious" verticalAlign="end">
                        <Bento.Heading
                          as="h3"
                          size="display"
                          style={{
                            color: 'var(--base-color-scale-purple-7)',
                            marginBottom: 'var(--base-size-8)',
                            fontSize: '96px',
                            letterSpacing: '-0.5rem',
                          }}
                        >
                          75%
                        </Bento.Heading>
                        <Bento.Heading as="h4" size="6" weight="normal" variant="muted" style={{marginBottom: '0'}}>
                          Reduced time spent
                          <br /> managing tools.
                        </Bento.Heading>
                      </Bento.Content>
                      <Bento.Visual fillMedia={false} padding="spacious">
                        <Image
                          src="/images/modules/site/enterprise/2023/reduce.png"
                          alt="An icon illustrating reduction"
                          width="112"
                          height="112"
                        />
                      </Bento.Visual>
                    </Bento.Item>
                    <Bento.Item
                      columnSpan={12}
                      rowSpan={{
                        xsmall: 6,
                        medium: 5,
                      }}
                      flow={{
                        xsmall: 'row',
                        medium: 'column',
                      }}
                      style={{background: 'var(--base-color-scale-white-0)', gridGap: 0}}
                    >
                      <Bento.Content
                        padding={{
                          xsmall: 'normal',
                          medium: 'spacious',
                        }}
                      >
                        <Bento.Heading as="h3" size="4" weight="semibold">
                          See how Telus saved $16.9 million in costs by replacing their DevOps tools with GitHub
                        </Bento.Heading>
                        <Link href="/customer-stories/telus" size="large">
                          Read customer story
                        </Link>
                      </Bento.Content>
                      <Bento.Visual padding="normal" position="50% 10%">
                        <Image
                          src="/images/modules/site/enterprise/2023/telus.jpg"
                          alt="A photo of people looking at a tablet"
                        />
                      </Bento.Visual>
                    </Bento.Item>
                  </Bento>
                </Stack>
              </section>
            </Box>
          </Grid.Column>
        </Grid>
      </ThemeProvider>
      <ThemeProvider
        colorMode="dark"
        style={{backgroundColor: 'var(--base-color-scale-black-0)'}}
        className="enterprise-section-rounded"
      >
        <Grid>
          <Grid.Column>
            <Box
              paddingBlockStart={{
                narrow: 64,
                regular: 128,
              }}
              paddingBlockEnd={{
                narrow: 64,
                regular: 128,
              }}
            >
              <Box
                className="cta-banner-box"
                paddingBlockStart={{
                  narrow: 64,
                  regular: 32,
                  wide: 'none',
                }}
                paddingBlockEnd={{
                  narrow: 64,
                  regular: 32,
                  wide: 'none',
                }}
              >
                <CTABanner hasShadow={false} hasBackground={false} align="center">
                  <CTABanner.Heading weight="bold" className="mb-4">
                    Start your journey with GitHub
                  </CTABanner.Heading>
                  <CTABanner.ButtonGroup>
                    <Button
                      as="a"
                      href="/organizations/enterprise_plan?ref_cta=Start+a+free+trial&ref_loc=footer&ref_page=%2Fenterprise"
                    >
                      Start a free trial
                    </Button>
                    <Button
                      as="a"
                      href="/enterprise/contact?ref_cta=Contact+Sales&ref_loc=plans&ref_page=%2Fenterprise&scid=&utm_campaign=Enterprise&utm_content=Enterprise&utm_medium=referral&utm_source=github"
                    >
                      Contact sales
                    </Button>
                  </CTABanner.ButtonGroup>
                </CTABanner>
              </Box>

              <Box
                paddingBlockStart={64}
                paddingBlockEnd={32}
                className="enterprise-cards enterprise-center-until-medium"
              >
                <Stack
                  direction={{narrow: 'vertical', regular: 'horizontal', wide: 'horizontal'}}
                  gap="normal"
                  padding="none"
                >
                  {/* These divs make sure the <Card>s height gets evenly stretched */}
                  <div>
                    <Card
                      href="https://docs.github.com/migrations/overview/planning-your-migration-to-github"
                      style={{width: '100%'}}
                    >
                      <Card.Icon icon={<BookIcon />} color="purple" hasBackground />
                      <Card.Heading>Planning your migration to GitHub</Card.Heading>
                    </Card>
                  </div>
                  <div>
                    <Card
                      href="https://docs.github.com/get-started/onboarding/getting-started-with-github-enterprise-cloud"
                      style={{width: '100%'}}
                    >
                      <Card.Icon icon={<BookIcon />} color="purple" hasBackground />
                      <Card.Heading>Getting started with GitHub Enterprise Cloud</Card.Heading>
                    </Card>
                  </div>
                  <div>
                    <Card href="https://resources.github.com/devops/tools/compare/" style={{width: '100%'}}>
                      <Card.Icon icon={<BookIcon />} color="purple" hasBackground />
                      <Card.Heading>Compare GitHub vs. GitLab and other DevOps tools</Card.Heading>
                    </Card>
                  </div>
                </Stack>
              </Box>

              <hr className="enterprise-separator my-10" />

              <FAQGroup>
                <FAQGroup.Heading>
                  Frequently asked <br /> questions.
                </FAQGroup.Heading>
                <FAQ>
                  <FAQ.Heading>About GitHub Enterprise</FAQ.Heading>
                  <FAQ.Item>
                    <FAQ.Question>What is GitHub Enterprise?</FAQ.Question>
                    <FAQ.Answer className="enterprise-faq-answer">
                      <p>
                        GitHub Enterprise is an enterprise-ready software development platform designed for the complex
                        workflows of modern development. It offers all the features and functionality of the cloud-based
                        GitHub.com platform but with additional security, administrative, and customization options.
                      </p>

                      <p>
                        There are two choices for deployment:{' '}
                        <a href="https://docs.github.com/enterprise-server@3.5/admin/overview/about-github-enterprise-server">
                          GitHub Enterprise Server
                        </a>{' '}
                        or{' '}
                        <a href="https://docs.github.com/get-started/onboarding/getting-started-with-github-enterprise-cloud">
                          GitHub Enterprise Cloud
                        </a>
                        . With GitHub Enterprise Server, organizations can install the platform on their own servers,
                        whereas GitHub Enterprise Cloud is hosted in the cloud on GitHub.com.
                      </p>

                      <p>
                        As a platform solution, GitHub Enterprise also includes{' '}
                        <a href="https://github.com/marketplace?type=">
                          additional management and customization options for administrators
                        </a>
                        . These options include custom workflows, automating tasks with webhooks and integrations, and
                        custom policies for repository use.
                      </p>
                    </FAQ.Answer>
                  </FAQ.Item>
                  <FAQ.Item>
                    <FAQ.Question>Why should organizations use GitHub Enterprise?</FAQ.Question>
                    <FAQ.Answer className="enterprise-faq-answer">
                      <p>
                        There are several reasons why organizations should consider using GitHub Enterprise for their
                        development process:
                      </p>

                      <ol>
                        <li>
                          Enhanced security and compliance: GitHub Enterprise offers security and compliance features
                          that are important for organizations with strict data privacy regulations or compliance
                          requirements. These features include enhanced authentication and access controls, audit logs,
                          SOC, ISO, FedRAMP, and LiSaaS.
                        </li>
                        <li>
                          Greater flexibility over data: Organizations can install the platform on their own servers,
                          behind their own firewalls, or on the GitHub cloud.
                        </li>
                        <li>
                          Customizable workflows and automation tools: GitHub Enterprise offers a range of customization
                          options that allow organizations to create custom workflows, automate tasks, and develop
                          bespoke policies for repository use. This helps businesses streamline their development
                          processes.
                        </li>
                        <li>
                          Core collaboration features: GitHub Enterprise offers a range of collaboration features, such
                          as pull requests, code review tools, and project management capabilities that make it easier
                          for teams to work together on projects.
                        </li>
                        <li>
                          Scalability: GitHub Enterprise is designed to scale with organizations’ needs, whether teams
                          are small or large.
                        </li>
                      </ol>
                    </FAQ.Answer>
                  </FAQ.Item>
                  <FAQ.Item>
                    <FAQ.Question>Who uses GitHub Enterprise?</FAQ.Question>
                    <FAQ.Answer className="enterprise-faq-answer">
                      <p>
                        GitHub Enterprise is used by organizations of all sizes that require greater productivity,
                        collaboration, and security capabilities for their software development process. GitHub
                        Enterprise can scale with teams, all the way from a small startup to a large corporation.
                      </p>
                    </FAQ.Answer>
                  </FAQ.Item>
                  <FAQ.Item>
                    <FAQ.Question>What is GitHub Enterprise Cloud?</FAQ.Question>
                    <FAQ.Answer className="enterprise-faq-answer">
                      <p>
                        <a href="https://docs.github.com/get-started/onboarding/getting-started-with-github-enterprise-cloud">
                          GitHub Enterprise Cloud
                        </a>{' '}
                        is the cloud-based version of GitHub Enterprise. It’s hosted on GitHub&apos;s servers, which
                        means that organizations do not need to maintain their own servers or infrastructure to use it.
                        GitHub Enterprise Cloud offers the same features as{' '}
                        <a href="https://docs.github.com/enterprise-server@3.5/admin/overview/about-github-enterprise-server">
                          GitHub Enterprise Server
                        </a>
                        , including pull requests, code reviews, and project management tools, but with the added
                        benefits of cloud hosting.
                      </p>

                      <p>
                        One of the key advantages of GitHub Enterprise Cloud is that organizations can get up and
                        running quickly, without the need to install any software or hardware. They can also take
                        advantage of automatic updates and maintenance, which are handled by GitHub&apos;s team of
                        experts. GitHub Enterprise Cloud receives the latest features and functionality immediately when
                        released.
                      </p>

                      <p>
                        Organizations can easily add or remove users as needed, and they can also increase storage
                        capacity or processing power as their needs change.
                      </p>

                      <p>
                        GitHub Enterprise Cloud offers enhanced security and compliance features, such as{' '}
                        <a href="https://docs.github.com/enterprise-cloud@latest/authentication/keeping-your-account-and-data-secure/about-authentication-to-github">
                          advanced authentication and access controls
                        </a>
                        ,{' '}
                        <a href="https://docs.github.com/code-security/code-scanning/automatically-scanning-your-code-for-vulnerabilities-and-errors">
                          vulnerability scanning
                        </a>
                        , and{' '}
                        <a href="https://docs.github.com/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/reviewing-the-audit-log-for-your-organization">
                          audit logs
                        </a>
                        . These features have strict data privacy regulations or compliance requirements. GitHub
                        Enterprise Cloud also utilizes a full administrative platform for seamless tool management.
                      </p>
                    </FAQ.Answer>
                  </FAQ.Item>
                  <FAQ.Item>
                    <FAQ.Question>What is GitHub Enterprise Server?</FAQ.Question>
                    <FAQ.Answer className="enterprise-faq-answer">
                      <p>
                        <a href="https://docs.github.com/enterprise-server@3.5/admin/overview/about-github-enterprise-server">
                          GitHub Enterprise Server
                        </a>{' '}
                        is the self-hosted version of GitHub Enterprise. It is installed on-premises or on a private
                        cloud and provides organizations with a secure and customizable source code management and
                        collaboration platform.
                      </p>

                      <p>
                        One of the key advantages of GitHub Enterprise Server is that it provides organizations with
                        complete control over their source code and data. Organizations can choose where to store their
                        repositories and can control who has access to them. Administrators can also customize the
                        platform to meet specific needs, such as integrating other tools or implementing custom
                        workflows.
                      </p>

                      <p>
                        GitHub Enterprise Server also offers enhanced security and compliance features. Organizations
                        can configure their instance to meet their specific security requirements, such as using LDAP or
                        SAML for authentication, setting up two-factor authentication, or implementing network security
                        measures. Compliance features are also included, such as audit logs, access controls, and
                        vulnerability scanning.
                      </p>
                    </FAQ.Answer>
                  </FAQ.Item>
                  <FAQ.Item>
                    <FAQ.Question>How secure is GitHub Enterprise?</FAQ.Question>
                    <FAQ.Answer className="enterprise-faq-answer">
                      <p>
                        GitHub Enterprise is designed with security in mind and includes a range of features to help
                        organizations protect their code and data. Here are some of the key security features that
                        GitHub Enterprise offers:
                      </p>
                      <ol>
                        <li>
                          Authentication and access controls: GitHub Enterprise includes two-factor authentication, LDAP
                          and Active Directory integration, and OAuth authentication. This helps organizations ensure
                          that only authorized users can access their repositories and data.
                        </li>
                        <li>
                          Encryption: All data in transit between the user&apos;s computer and GitHub Enterprise server
                          is encrypted using HTTPS. All data at rest uses AES-256 encryption.
                        </li>
                        <li>
                          Vulnerability scanning: GitHub Enterprise includes built-in security scanning features that
                          can detect known vulnerabilities and alert users.
                        </li>
                        <li>
                          Audit logs: The platform provides detailed audit logs that record all user actions, including
                          repository access, changes, and deletions. This helps organizations track and monitor user
                          activity and identify potential security issues.
                        </li>
                        <li>
                          Customizable policies: GitHub Enterprise allows organizations to create custom policies for
                          repository access. This can help enforce compliance requirements and prevent unauthorized
                          access to sensitive data.
                        </li>
                        <li>
                          Regular security updates: There is also a dedicated security team that provides regular
                          updates, monitors for potential security threats, and responds quickly to any issues that
                          arise.
                        </li>
                      </ol>
                    </FAQ.Answer>
                  </FAQ.Item>
                  <FAQ.Item>
                    <FAQ.Question>Is GitHub Enterprise free?</FAQ.Question>
                    {useMeteredBillingUpdate ? (
                      <FAQ.Answer className="enterprise-faq-answer">
                        <p>
                          No, GitHub Enterprise is not free. It is a paid product that can be paid for either as a
                          metered service on a monthly basis or as a subscription, with the cost determined by the
                          number of users and the level of support required. For organizations interested in trying out
                          the platform before making a commitment, GitHub Enterprise offers a{' '}
                          <a href="https://github.com/enterprise/contact">free trial</a>. Furthermore, organizations can
                          contact the <a href="https://github.com/enterprise/contact">GitHub Sales team</a> for the
                          option to request a custom quote to meet their specific needs.
                        </p>
                      </FAQ.Answer>
                    ) : (
                      <FAQ.Answer className="enterprise-faq-answer">
                        <p>
                          No, GitHub Enterprise is not free. It is a paid product that requires an annual subscription
                          fee based on the number of users and support requirements. GitHub Enterprise does offer a free
                          45-day trial for organizations that want to test the platform before committing to a
                          subscription. Organizations can also request a custom quote based on their specific needs.
                        </p>
                      </FAQ.Answer>
                    )}
                  </FAQ.Item>
                </FAQ>

                <FAQ>
                  <FAQ.Heading>Using GitHub Enterprise </FAQ.Heading>
                  <FAQ.Item>
                    <FAQ.Question>How can developers collaborate with GitHub Enterprise?</FAQ.Question>
                    <FAQ.Answer className="enterprise-faq-answer">
                      <p>
                        Developers can collaborate with GitHub Enterprise using a variety of tools that are built into
                        the platform, including:
                      </p>
                      <ul>
                        <li>
                          Pull requests: Allows developers to propose changes to a repository and submit them for
                          review. Other team members can review the changes, leave comments, and suggest further
                          improvements.
                        </li>
                        <li>
                          GitHub Projects: Enables developers to track issues, assign tasks, and prioritize work. This
                          helps teams stay on track, identify and resolve issues quickly, and ensure that everyone is
                          working towards the same goals.
                        </li>
                        <li>
                          GitHub Discussions: Empowers developers to have conversations about specific topics. This can
                          be particularly useful for triaging complex issues or making decisions about the direction of
                          a project.
                        </li>
                      </ul>
                    </FAQ.Answer>
                  </FAQ.Item>
                </FAQ>

                <FAQ>
                  <FAQ.Heading>Choosing your plan</FAQ.Heading>
                  <FAQ.Item>
                    <FAQ.Question>How can organizations get started with GitHub Enterprise?</FAQ.Question>
                    {useMeteredBillingUpdate ? (
                      <FAQ.Answer className="enterprise-faq-answer">
                        <p>
                          To get started with GitHub Enterprise,{' '}
                          <a href="/account/enterprises/new">try a free trial today</a> or contact our{' '}
                          <a href="/enterprise/contact">sales team</a>.
                        </p>
                      </FAQ.Answer>
                    ) : (
                      <FAQ.Answer className="enterprise-faq-answer">
                        <p>
                          To get started with GitHub Enterprise, contact our{' '}
                          <a href="/enterprise/contact">sales team</a>.
                        </p>
                      </FAQ.Answer>
                    )}
                  </FAQ.Item>
                  <FAQ.Item>
                    <FAQ.Question>What GitHub Enterprise plans are available?</FAQ.Question>
                    <FAQ.Answer className="enterprise-faq-answer">
                      <p>
                        GitHub Enterprise{' '}
                        <a href="https://docs.github.com/get-started/learning-about-github/githubs-products#github-enterprise">
                          offers several plans
                        </a>{' '}
                        that vary in price and features. They are designed to accommodate different types of
                        organizations and teams, from small startups to large enterprises. These plans include:
                      </p>
                      <ol>
                        <li>
                          GitHub Enterprise Server: This is the self-hosted version of GitHub Enterprise. It is
                          installed on-premises or on a private cloud, and offers all the features of the cloud-based
                          version of GitHub, including pull requests, code reviews, and project management tools.
                          Pricing depends on the number of users and support requirements.
                        </li>
                        <li>
                          GitHub Enterprise Cloud: This is the cloud-based version of GitHub Enterprise. It is hosted on
                          GitHub&apos;s servers, and it offers all the features of GitHub Enterprise Server. The price
                          depends on the number of users and storage requirements.
                        </li>
                      </ol>
                    </FAQ.Answer>
                  </FAQ.Item>
                  <FAQ.Item>
                    <FAQ.Question>How much does GitHub Enterprise cost?</FAQ.Question>
                    <FAQ.Answer className="enterprise-faq-answer">
                      <p>
                        For more information on cost, please see our <a href="/pricing">pricing page</a>.
                      </p>
                    </FAQ.Answer>
                  </FAQ.Item>
                </FAQ>

                <FAQ>
                  <FAQ.Heading>Getting started with enterprise software development platforms </FAQ.Heading>
                  <FAQ.Item>
                    <FAQ.Question>What is a DevOps platform?</FAQ.Question>
                    <FAQ.Answer className="enterprise-faq-answer">
                      <p>
                        A DevOps platform is a set of tools, technologies, and practices that enable software
                        development and IT operations teams to collaborate and automate the software delivery process.
                        It typically includes version control, continuous integration and continuous delivery (CI/CD),
                        automated testing, deployment automation, and monitoring.
                      </p>

                      <p>
                        The main goal of a DevOps platform is to provide a single environment for software development
                        and IT operations teams. By automating the software delivery process, a DevOps platform helps
                        organizations reduce the time and cost of delivering software, while also improving the
                        reliability, security, and scalability of their applications.
                      </p>
                    </FAQ.Answer>
                  </FAQ.Item>
                  <FAQ.Item>
                    <FAQ.Question>What is developer experience?</FAQ.Question>
                    <FAQ.Answer className="enterprise-faq-answer">
                      <p>
                        Developer experience (DevEx) refers to the overall experience that software developers have when
                        using development tools, frameworks, and platforms to create software applications. It
                        encompasses all aspects of a developer&apos;s interaction with the tools, including onboarding,
                        maintaining, ease of use, and productivity.
                      </p>

                      <p>
                        The goal of optimizing DevEx is to make it as easy as possible for developers to create
                        high-quality software quickly. This can involve designing tools with intuitive interfaces,
                        providing clear and concise documentation, seamlessly integrating tools into workflows, and
                        offering comprehensive support to help developers overcome challenges and obstacles.
                      </p>

                      <p>
                        By prioritizing DevEx, organizations can improve the speed and quality of their software
                        development processes, increase developer satisfaction and retention, and ultimately deliver
                        better products.
                      </p>
                    </FAQ.Answer>
                  </FAQ.Item>
                  <FAQ.Item>
                    <FAQ.Question>What is a software development platform?</FAQ.Question>
                    <FAQ.Answer className="enterprise-faq-answer">
                      <p>
                        A software development platform is a set of tools, technologies, and resources that enable
                        software developers to create, test, deploy, and maintain software applications. This typically
                        includes a programming language or framework, an integrated development environment (IDE),
                        libraries, code repositories, debugging and testing tools, and deployment and hosting options.
                      </p>

                      <p>
                        The goal of a software development platform is to provide developers with a comprehensive set of
                        tools and resources that make it easier to develop high-quality software. By providing an
                        integrated environment for software development, a software development platform can help
                        developers streamline their workflows, reduce errors, and improve the speed and quality of their
                        work. Additionally, many software development platforms also provide access to a community of
                        developers who can offer support, advice, and resources for improving software development
                        practices.
                      </p>
                    </FAQ.Answer>
                  </FAQ.Item>
                  <FAQ.Item>
                    <FAQ.Question>What is an application development platform?</FAQ.Question>
                    <FAQ.Answer className="enterprise-faq-answer">
                      <p>
                        An application development platform is a set of tools that enables developers to build, deploy,
                        and manage custom software applications.
                      </p>

                      <p>
                        This kind of platform typically includes a programming language, software development kits
                        (SDKs), application programming interfaces (APIs), libraries, and testing and debugging tools.
                      </p>

                      <p>
                        These tools are designed to make it easier for developers to create and deploy custom
                        applications for a specific platform, such as a mobile device or web browser.
                      </p>

                      <p>
                        The goal of an application development platform is to provide developers with a comprehensive
                        set of tools that makes it easier to create high-quality applications that meet the specific
                        requirements of a particular platform or device.
                      </p>
                    </FAQ.Answer>
                  </FAQ.Item>
                  <FAQ.Item>
                    <FAQ.Question>What is software development collaboration?</FAQ.Question>
                    <FAQ.Answer className="enterprise-faq-answer">
                      <p>
                        Software development collaboration is the process of working together as a team to create, test,
                        and deploy software applications. It can involve a range of activities, such as brainstorming,
                        planning, code reviews, testing, and deployment. Collaboration is an essential component of the
                        software development process, as it allows multiple developers and stakeholders to work
                        together.
                      </p>
                      <p>
                        Effective collaboration requires open communication, clear goals and objectives, shared
                        resources, and a commitment to working together as a team. Collaboration tools such as version
                        control systems, collaborative coding environments, and project management software, can also
                        provide a centralized location for team members to share information, coordinate tasks, and
                        track progress.
                      </p>
                      <p>
                        Ultimately, software development collaboration is essential to creating high-quality software
                        that’s reliable, scalable, and meets the needs of end-users and stakeholders.
                      </p>
                    </FAQ.Answer>
                  </FAQ.Item>
                </FAQ>
              </FAQGroup>
            </Box>

            <Box paddingBlockEnd={64}>
              <Stack padding="none">
                <Text as="p" size="100" variant="muted">
                  <sup>1</sup>&nbsp; The Total Economic Impact™ Of GitHub Enterprise Cloud and Advanced Security, a
                  commissioned study conducted by Forrester Consulting, 2022. Results are for a composite organization
                  based on interviewed customers.
                </Text>

                <Text as="p" size="100" variant="muted">
                  <sup>2</sup>&nbsp; GitHub, Octoverse 2022 The state of open source software.
                </Text>
              </Stack>
            </Box>
          </Grid.Column>
        </Grid>
      </ThemeProvider>
    </>
  )
}

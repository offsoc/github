import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {ContentfulFaqGroup} from '@github-ui/swp-core/components/contentful/ContentfulFaqGroup'
import {
  ArrowSwitchIcon,
  BookIcon,
  BrowserIcon,
  ChevronDownIcon,
  CodeReviewIcon,
  CommentIcon,
  DeviceMobileIcon,
  GraphIcon,
  InfinityIcon,
  LocationIcon,
  MentionIcon,
  MortarBoardIcon,
  PackageIcon,
  PlugIcon,
  PlusCircleIcon,
  ProjectIcon,
  PulseIcon,
  RepoPushIcon,
  RocketIcon,
  ShieldCheckIcon,
  ShieldLockIcon,
  SparkleFillIcon,
  TriangleDownIcon,
  TriangleUpIcon,
  VerifiedIcon,
  VersionsIcon,
  XIcon,
} from '@primer/octicons-react'
import {
  AnchorNav,
  AnimationProvider,
  Bento,
  Box,
  Button,
  Card,
  Heading,
  Hero,
  Image,
  Link,
  LogoSuite,
  OrderedList,
  River,
  SectionIntro,
  Stack,
  Testimonial,
  Text,
  ThemeProvider,
  UnorderedList,
} from '@primer/react-brand'
import resolveResponse from 'contentful-resolve-response'
import {useEffect, useRef, useState} from 'react'

import {toContainerPage, toEntryCollection} from '../../lib/types/contentful'
import {toPayload} from '../../lib/types/payload'
import {toAdvancedSecurityTemplate, type AdvancedSecurityTemplate} from './utils/template'
import EnterpriseSubNav from './EnterpriseSubNav'

type EnterpriseAdvancedSecurityPayload = {
  [key: string]: unknown

  requestDemoPath: string
  heroContactSalesPath: string
  navContactSalesPath: string
  pricingContactSalesPath: string
}

export function EnterpriseAdvancedSecurityIndex() {
  const {requestDemoPath, heroContactSalesPath, navContactSalesPath, pricingContactSalesPath, ...payload} =
    useRoutePayload<EnterpriseAdvancedSecurityPayload>()

  let template: AdvancedSecurityTemplate | undefined

  try {
    const {contentfulRawJsonResponse} = toPayload(payload)
    const page = toContainerPage(toEntryCollection(resolveResponse(contentfulRawJsonResponse)).at(0))

    template = toAdvancedSecurityTemplate(page.fields.template)
  } catch {
    // We don't break the page if we can't parse the Contentful data.
  }

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

  const [isTickerAnimationPaused, setIsTickerAnimationPaused] = useState(false)
  const [tickerAnimationButtonLabel, setTickerAnimationButtonLabel] = useState('Pause')
  const [tickerAnimationButtonAriaLabel, setTickerAnimationButtonAriaLabel] = useState(
    'Animation is currently playing. Click to pause.',
  )
  const toggleTickerAnimationPause = () => {
    setIsTickerAnimationPaused(!isTickerAnimationPaused)
    if (isTickerAnimationPaused) {
      setTickerAnimationButtonAriaLabel('Animation is currently playing. Click to pause.')
      setTickerAnimationButtonLabel('Pause')
    } else {
      setTickerAnimationButtonAriaLabel('Animation is paused. Click to play.')
      setTickerAnimationButtonLabel('Play')
    }
  }

  const [expandedStates, setExpandedStates] = useState<{[key: string]: boolean}>({})
  const isDetailsExpanded = (id: string) => {
    return expandedStates[id]
  }

  const toggleDetailsExpanded = (e: React.MouseEvent<HTMLElement>) => {
    const id = (e.target as HTMLElement).getAttribute('data-target-id')
    if (!id) return
    setExpandedStates(prev => ({...prev, [id]: !prev[id]}))
  }

  useEffect(() => {
    /**
     * If the template is undefined, it means we haven't be able to parse the Contentful data. Typically,
     * this is because the data does not match the expected schema. In these instances, we throw an error
     * asynchronously so it is reported to Sentry but don't unmount the component from an uncaught error.
     *
     * Since the template is undefined, we render the page without the Contentful data (e.g., the FAQ section
     * will be empty).
     */
    if (template === undefined) {
      setTimeout(() => {
        throw new Error(`We were unable to parse the Contentful data for the Advanced Security landing page.`)
      })
    }
  }, [template])

  // Animate features testimonial glow on scroll
  // Make sure to only animate a child element to avoid flickering

  const featuresTestimonialAnimationRef = useRef(null)

  useEffect(() => {
    const currentElement = featuresTestimonialAnimationRef.current

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('lp-animateIn')
          } else {
            entry.target.classList.remove('lp-animateIn')
          }
        }
      },
      {
        threshold: 0.5, // Animate once 50% of the height is...
        rootMargin: `0% 0% -33% 0%`, // ...in the top 66% of the viewport
      },
    )

    if (currentElement) {
      observer.observe(currentElement)
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement)
      }
    }
  }, [])

  // Animate enterprise outro lines on scroll

  const enterpriseOutroAnimationRef = useRef(null)

  useEffect(() => {
    const currentElement = enterpriseOutroAnimationRef.current

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('lp-animateIn')
          } else {
            entry.target.classList.remove('lp-animateIn')
          }
        }
      },
      {
        threshold: 0.5, // Animate once 50% of the height is...
        rootMargin: `-15% 0% -15% 0%`, // ...in the center of the viewport
      },
    )

    if (currentElement) {
      observer.observe(currentElement)
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement)
      }
    }
  }, [])

  return (
    <ThemeProvider colorMode="dark" className="lp-Security lp-has-fontSmoothing lp-textWrap--pretty">
      <EnterpriseSubNav />
      <section id="hero" className="lp-Hero">
        <div className="lp-Hero-visual">
          <canvas className="js-security-hero" />
        </div>
        <div className="lp-Hero-visualFallbackImage">
          <Image src="/images/modules/site/enterprise/advanced-security/hero-visual.jpg" alt="" width={1280} />
        </div>

        <div className="lp-Container">
          <Hero data-hpc align="center" className="lp-Hero-content">
            <Hero.Label color="green-blue" className="lp-Hero-label">
              GitHub Advanced Security
            </Hero.Label>
            <Hero.Heading size="1" weight="bold" className="lp-Hero-heading">
              Application security <br className="lp-breakWhenWide" /> where found means fixed
            </Hero.Heading>
            <Hero.Description className="lp-Hero-description">Powered by Copilot Autofix.</Hero.Description>
            <Hero.PrimaryAction href={heroContactSalesPath} className="lp-Hero-ctaButton">
              Contact sales
            </Hero.PrimaryAction>
            <Hero.SecondaryAction href={requestDemoPath} hasArrow={false} className="lp-Hero-ctaButton">
              Request a demo
            </Hero.SecondaryAction>
          </Hero>

          <div className="lp-Hero-logos">
            <LogoSuite className="enterprise-logo-suite" hasDivider={false}>
              <LogoSuite.Heading visuallyHidden>GitHub Security is used by</LogoSuite.Heading>
              <LogoSuite.Logobar marquee marqueeSpeed="slow" data-animation-paused={isLogoSuiteAnimationPaused}>
                <Image
                  src="/images/modules/site/enterprise/advanced-security/logos/telus.svg"
                  alt="Telus's logo"
                  style={{height: '36px'}}
                />
                <Image
                  src="/images/modules/site/enterprise/advanced-security/logos/ernst-young.svg"
                  alt="Ernst and Young's logo"
                  style={{height: '40px'}}
                />
                <Image
                  src="/images/modules/site/enterprise/advanced-security/logos/mercado-libre.svg"
                  alt="Mercado Libre's logo"
                  style={{height: '40px'}}
                />
                <Image
                  src="/images/modules/site/enterprise/advanced-security/logos/shopify.svg"
                  alt="Shopify's logo"
                  style={{height: '40px'}}
                />
                <Image
                  src="/images/modules/site/enterprise/advanced-security/logos/linkedin.svg"
                  alt="LinkedIn's logo"
                  style={{height: '36px'}}
                />
                <Image
                  src="/images/modules/site/enterprise/advanced-security/logos/3m.svg"
                  alt="3M's logo"
                  style={{height: '48px'}}
                />
                <Image
                  src="/images/modules/site/enterprise/advanced-security/logos/kpmg.svg"
                  alt="KPMG's logo"
                  style={{height: '38px'}}
                />
                <Image
                  src="/images/modules/site/enterprise/advanced-security/logos/raiffeisen-bank-international.svg"
                  alt="Raiffeisen Bank International's logo"
                  style={{height: '38px'}}
                />
                <Image
                  src="/images/modules/site/enterprise/advanced-security/logos/deutsche-borse.svg"
                  alt="Deutsche Börse's logo"
                  style={{height: '48px'}}
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
          </div>

          <Box className="lp-AnchorNav" style={{height: 0}}>
            <AnchorNav hideUntilSticky>
              <AnchorNav.Link href="#enterprise">Enterprise-ready</AnchorNav.Link>
              <AnchorNav.Link href="#features">Features</AnchorNav.Link>
              <AnchorNav.Link href="#pricing">Pricing</AnchorNav.Link>
              <AnchorNav.Link href="#faq">FAQs</AnchorNav.Link>
              <AnchorNav.Action href={navContactSalesPath}>Contact sales</AnchorNav.Action>
              <AnchorNav.SecondaryAction href={requestDemoPath}>Request a demo</AnchorNav.SecondaryAction>
            </AnchorNav>
          </Box>
        </div>
      </section>

      <section id="enterprise">
        <div className="lp-Container">
          <div
            className="lp-Spacer"
            style={{'--lp-space': '64px', '--lp-space-xl': '128px'} as React.CSSProperties}
            aria-hidden
          />

          <SectionIntro align="center" fullWidth>
            <SectionIntro.Label className="lp-SectionIntroLabel--muted">Enterprise-ready</SectionIntro.Label>
            <SectionIntro.Heading as="h2" size="2" weight="semibold">
              Fixes in minutes, <br className="lp-break-whenNarrow" /> not months.
            </SectionIntro.Heading>
            <SectionIntro.Description className="lp-Enterprise-sectionIntroDescription">
              With AI-powered remediation, static analysis, secret scanning, and software composition analysis, GitHub
              Advanced Security helps developers and security teams work together to eliminate security debt and keep
              new vulnerabilities out of code.
            </SectionIntro.Description>
          </SectionIntro>

          <div className="lp-Spacer" style={{'--lp-space': '64px'} as React.CSSProperties} aria-hidden />

          <Bento>
            {/* Bento 1 */}
            <Bento.Item columnSpan={{xsmall: 12, medium: 7}} rowSpan={{xsmall: 4, medium: 5}} visualAsBackground>
              <Bento.Content
                horizontalAlign="center"
                verticalAlign="center"
                padding={{xsmall: 'normal', medium: 'spacious'}}
              >
                <Bento.Heading
                  as="h3"
                  size="4"
                  weight="semibold"
                  className="lp-letterSpacing700-whenWide lp-fontSize32-whenNarrow"
                  style={{margin: '0'}}
                >
                  Secure code, accelerated
                </Bento.Heading>
              </Bento.Content>
              <Bento.Visual>
                <Image
                  src="/images/modules/site/enterprise/advanced-security/enterprise-bento-1.jpg"
                  alt=""
                  width="724"
                  height="500"
                  loading="lazy"
                />
              </Bento.Visual>
            </Bento.Item>

            {/* Bento 2 */}
            <Bento.Item
              columnSpan={{xsmall: 12, medium: 5}}
              rowSpan={{xsmall: 4, medium: 5}}
              visualAsBackground
              className="lp-Enterprise-bentoItem"
            >
              <Bento.Content
                horizontalAlign="center"
                verticalAlign="center"
                padding={{xsmall: 'normal', medium: 'spacious'}}
                leadingVisual={<PulseIcon />}
                className="lp-Bento--withAccentIcon lp-Bento--iconWithThickerStroke"
              >
                <Bento.Heading
                  as="h3"
                  className="lp-Enterprise-bentoStatsText lp-is-sansSerifAlt lp-letterSpacing700-whenWide"
                  style={{marginBottom: '24px', lineHeight: '100%'}}
                >
                  <span className="lp-Color-accent">28</span> <br /> minutes
                </Bento.Heading>
                <Text as="div" variant="muted" style={{marginBottom: '0'}}>
                  From vulnerability detection to successful remediation
                  <sup>1</sup>
                </Text>
              </Bento.Content>
            </Bento.Item>

            {/* Bento 3 */}
            <Bento.Item
              columnSpan={{xsmall: 12, medium: 5}}
              rowSpan={{xsmall: 4, medium: 5}}
              visualAsBackground
              className="lp-Enterprise-bentoItem"
            >
              <Bento.Content
                horizontalAlign="center"
                verticalAlign="center"
                padding={{xsmall: 'normal', medium: 'spacious'}}
                leadingVisual={<TriangleDownIcon />}
                className="lp-Bento--withAccentIcon lp-Bento--iconWithThickerStroke"
              >
                <Bento.Heading
                  as="h3"
                  className="lp-Enterprise-bentoStatsText lp-is-sansSerifAlt lp-letterSpacing700-whenWide"
                  style={{marginBottom: '24px', lineHeight: '100%'}}
                >
                  <span className="lp-Color-accent">2.4x</span> <br /> more <br /> precise
                </Bento.Heading>
                <Text as="div" variant="muted" style={{marginBottom: '0'}}>
                  Finds leaked secrets with <br className="lp-breakWhenWide" /> fewer false positives.<sup>2</sup>
                  <div className="lp-Bento--iconWithThickerStroke" style={{marginTop: '32px'}}>
                    <TriangleUpIcon size={44} className="lp-Color-accent" />
                  </div>
                </Text>
              </Bento.Content>
            </Bento.Item>

            {/* Bento 4 */}
            <Bento.Item
              columnSpan={{xsmall: 12, medium: 7}}
              rowSpan={{xsmall: 4, medium: 5}}
              style={{
                backgroundSize: 'cover',
                backgroundImage: 'url("/images/modules/site/enterprise/advanced-security/enterprise-bento-4.jpg")',
                gridTemplateRows: '1fr 1fr',
                rowGap: '0',
              }}
            >
              <Bento.Content
                horizontalAlign="center"
                verticalAlign="end"
                leadingVisual={<ShieldLockIcon />}
                className="lp-Bento--iconWithThickerStroke"
              >
                <Bento.Heading
                  as="h3"
                  size="4"
                  weight="semibold"
                  className="lp-letterSpacing700-whenWide lp-fontSize28-whenNarrow"
                >
                  Prevent secret leaks
                </Bento.Heading>
              </Bento.Content>
              <Bento.Visual
                fillMedia={false}
                padding="normal"
                horizontalAlign="center"
                verticalAlign="start"
                position="50% 0%"
              >
                <Image
                  src="/images/modules/site/enterprise/advanced-security/enterprise-bento-4-visual.webp"
                  alt="Screenshot of a failed git push due to the detection of a secret"
                  width="471"
                  height="128"
                  loading="lazy"
                  className="lp-borderRadiusNone"
                />
              </Bento.Visual>
            </Bento.Item>

            {/* Bento 5 */}
            <Bento.Item
              columnSpan={{xsmall: 12, medium: 7}}
              rowSpan={{xsmall: 4, medium: 5}}
              style={{
                backgroundSize: 'cover',
                backgroundImage: 'url("/images/modules/site/enterprise/advanced-security/enterprise-bento-5.jpg")',
                gridTemplateRows: 'auto',
                rowGap: '0',
              }}
            >
              <Bento.Content horizontalAlign="center" verticalAlign="end" className="lp-Enterprise-bento5Content">
                <Bento.Heading
                  as="h3"
                  size="4"
                  weight="semibold"
                  className="lp-letterSpacing700-whenWide lp-fontSize28-whenNarrow"
                >
                  Found means fixed
                </Bento.Heading>
              </Bento.Content>
              <Bento.Visual
                fillMedia={false}
                padding="normal"
                horizontalAlign="center"
                verticalAlign="start"
                position="50% 0%"
              >
                <Image
                  src="/images/modules/site/enterprise/advanced-security/enterprise-bento-5-visual.webp"
                  alt="Code scanning autofix example that highlights the line of vulnerable code and adds a secure code suggestion"
                  width="560"
                  height="183"
                  loading="lazy"
                  className="lp-borderRadiusNone"
                />
              </Bento.Visual>
            </Bento.Item>

            {/* Bento 6 */}
            <Bento.Item
              columnSpan={{xsmall: 12, medium: 5}}
              rowSpan={{xsmall: 3, medium: 5}}
              visualAsBackground
              className="lp-Enterprise-bentoItem"
            >
              <Bento.Content
                horizontalAlign="center"
                verticalAlign="center"
                padding={{xsmall: 'normal', medium: 'spacious'}}
                leadingVisual={<ShieldCheckIcon />}
                className="lp-Bento--withAccentIcon lp-Bento--iconWithThickerStroke"
              >
                <Bento.Heading
                  as="h3"
                  className="lp-Enterprise-bentoStatsText lp-is-sansSerifAlt lp-letterSpacing700-whenWide"
                  style={{marginBottom: '24px', lineHeight: '100%'}}
                >
                  <span className="lp-Color-accent">90%</span> <br /> coverage
                </Bento.Heading>
                <Text as="div" variant="muted" style={{marginBottom: '0'}}>
                  Copilot Autofix provides code suggestions for 90% of alert types in all supported languages
                </Text>
              </Bento.Content>
            </Bento.Item>

            {/* Bento 7 */}
            <Bento.Item
              columnSpan={12}
              rowSpan={{xsmall: 5, medium: 5}}
              visualAsBackground
              className="lp-Enterprise-bentoItem"
            >
              <Bento.Content
                horizontalAlign="center"
                verticalAlign="center"
                padding={{xsmall: 'normal', medium: 'spacious'}}
              >
                <Bento.Heading
                  as="h3"
                  size="4"
                  weight="semibold"
                  className="lp-letterSpacing700-whenWide lp-fontSize22-whenNarrow"
                  style={{maxWidth: '840px'}}
                >
                  <Image
                    src="/images/modules/site/enterprise/advanced-security/enterprise-bento-7-icon.svg"
                    alt="Telus's logo"
                    width="30"
                    height="24"
                    loading="lazy"
                  />
                  <div style={{marginBlockStart: '48px', marginBlockEnd: '48px'}}>
                    GitHub Advanced Security helps developers fix potential issues before production.
                  </div>
                  <Image
                    src="/images/modules/site/enterprise/advanced-security/enterprise-bento-7-logo.svg"
                    alt="Mercado libre's logo"
                    width="157"
                    height="40"
                    loading="lazy"
                  />
                </Bento.Heading>
              </Bento.Content>
              <Bento.Visual>
                <Image
                  src="/images/modules/site/enterprise/advanced-security/enterprise-bento-7.jpg"
                  alt=""
                  width="1248"
                  height="466"
                  loading="lazy"
                />
              </Bento.Visual>
            </Bento.Item>
          </Bento>
        </div>
      </section>

      <section id="features">
        <div className="lp-Container">
          <div>
            <Image
              src="/images/modules/site/enterprise/advanced-security/features-intro-sm.jpg"
              alt=""
              width={350}
              loading="lazy"
              className="lp-Features-introImage lp-Features-introImage--sm"
            />

            <svg
              fill="none"
              height="332"
              viewBox="0 0 1148 332"
              width="1148"
              aria-hidden="true"
              className="lp-Features-introImage lp-Features-introImage--lg"
              ref={enterpriseOutroAnimationRef}
            >
              <linearGradient
                id="a"
                gradientUnits="userSpaceOnUse"
                x1="579.009"
                x2="579.009"
                y1="359.876"
                y2="-187.685"
              >
                <stop offset=".187774" stopColor="#6bd6d0" />
                <stop offset=".479735" stopColor="#096bde" />
                <stop offset=".658117" stopColor="#000aff" stopOpacity="0" />
              </linearGradient>
              <radialGradient
                id="b"
                cx="0"
                cy="0"
                gradientTransform="matrix(-453.50206521 -223.9968189 134.68107385 -272.67416312 524.499 166.127)"
                gradientUnits="userSpaceOnUse"
                r="1"
              >
                <stop offset=".0229315" stopColor="#6bd6d0" />
                <stop offset=".779747" stopColor="#096bde" />
                <stop offset="1" stopColor="#000aff" />
              </radialGradient>
              <radialGradient
                id="c"
                cx="0"
                cy="0"
                gradientTransform="matrix(492.99945466 -201.99983908 121.45514351 296.42260999 642.501 189)"
                gradientUnits="userSpaceOnUse"
                r="1"
              >
                <stop offset="0" stopColor="#6bd6d0" />
                <stop offset=".659109" stopColor="#096bde" />
                <stop offset="1" stopColor="#000aff" />
              </radialGradient>
              <linearGradient id="d" gradientUnits="userSpaceOnUse" x1="574" x2="574" y1="0" y2="167">
                <stop offset="0" />
                <stop offset="1" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="e" gradientUnits="userSpaceOnUse" x1="1366" x2="1366" y1="540" y2="852">
                <stop offset=".700261" />
                <stop offset="1" stopOpacity="0" />
              </linearGradient>
              <clipPath id="f">
                <path d="m0 0h1148v332h-1148z" />
              </clipPath>
              <g clipPath="url(#f)">
                <path d="m0 0h1148v332h-1148z" fill="#000" />
                <g opacity=".6">
                  <g strokeWidth="2.5">
                    <path className="lp-Features-introLine-2" d="m579 291v-343" stroke="url(#a)" />
                    <path
                      className="lp-Features-introLine-1"
                      d="m579.415 519.126v-215.791c0-96.963-78.604-175.567-175.567-175.567h-287.698c-56.793 0-102.7929-46.116-102.6498-102.9091v-228.8589"
                      stroke="url(#b)"
                    />
                    <path
                      className="lp-Features-introLine-3"
                      d="m579.495 519.037v-217.824c0-96.963 78.604-175.567 175.566-175.567h274.289c56.95 0 103.24-45.9545 103.65-102.9089v-232.7371"
                      stroke="url(#c)"
                    />
                  </g>
                  <path d="m-67 0h1282v167h-1282z" fill="url(#d)" />
                  <path d="m970 540h792v312h-792z" fill="url(#e)" transform="matrix(-1 -0 0 -1 1940 1080)" />
                </g>
              </g>
            </svg>
          </div>

          <SectionIntro align="center" className="lp-Features-sectionIntro">
            <SectionIntro.Label className="lp-SectionIntroLabel--muted">Features</SectionIntro.Label>
            <SectionIntro.Heading
              as="h2"
              size="3"
              weight="semibold"
              className="lp-textWrap--balance"
              style={{maxWidth: '32ch'}}
            >
              For developers who love to code.{' '}
              <span className="lp-Color--muted">
                Detect, prevent, and fix vulnerabilities without leaving your flow.
              </span>
            </SectionIntro.Heading>
          </SectionIntro>

          <div
            className="lp-Spacer"
            style={{'--lp-space': '28px', '--lp-space-xl': '40px'} as React.CSSProperties}
            aria-hidden
          />

          {/* Features River */}

          <AnimationProvider runOnce={true}>
            {/* River 1 */}
            <River imageTextRatio="60:40" className="lp-River" animate="slide-in-up">
              <River.Content>
                <Heading as="h3" size="5">
                  Secure code in your flow
                </Heading>
                <Text as="p" className="lp-River-text">
                  With actionable feedback in the pull request, code scanning helps you find, triage, and prioritize
                  security vulnerabilities right in your workflow.
                </Text>
                <Link href="https://docs.github.com/en/enterprise-cloud@latest/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning">
                  Explore code scanning
                </Link>
              </River.Content>
              <River.Visual className="lp-River-visual">
                <Image
                  src="/images/modules/site/enterprise/advanced-security/features-river-1.webp"
                  alt="CodeQL warns of a reflected cross-site scripting vulnerability"
                  width="708"
                  height="510"
                  style={{display: 'block'}}
                  loading="lazy"
                />
              </River.Visual>
            </River>

            {/* River 2 */}
            <River imageTextRatio="60:40" className="lp-River" animate="slide-in-up">
              <River.Content>
                <Heading as="h3" size="5">
                  Autofixes anywhere
                </Heading>
                <Text as="p" className="lp-River-text">
                  Active in the pull request and on-demand for existing alerts, Copilot Autofix explains the
                  vulnerability and suggests fixes for ~90% of alert types.
                </Text>
                <Link href="https://www.youtube.com/watch?v=mr6vQMDy-YU" target="_blank">
                  Explore Copilot Autofix
                </Link>
              </River.Content>
              <River.Visual className="lp-River-visual">
                <Image
                  src="/images/modules/site/enterprise/advanced-security/features-river-2.webp"
                  alt="Code scanning autofix identifies vulnerable code and provides an explanation, together with a secure code suggestion to remediate the vulnerability"
                  width="708"
                  height="510"
                  style={{display: 'block'}}
                  loading="lazy"
                />
              </River.Visual>
            </River>

            {/* River 3 */}
            <River imageTextRatio="60:40" className="lp-River" animate="slide-in-up">
              <River.Content>
                <Heading as="h3" size="5">
                  Secure your secrets, protect your business
                </Heading>
                <Text as="p" className="lp-River-text">
                  Secret scanning with push protection guards over 200 token types and patterns from more than 150
                  service providers, even elusive secrets like passwords and PII.
                </Text>
                <Link href="https://docs.github.com/en/enterprise-cloud@latest/code-security/secret-scanning/introduction/about-secret-scanning">
                  Explore secret scanning
                </Link>
              </River.Content>
              <River.Visual className="lp-River-visual">
                <Image
                  src="/images/modules/site/enterprise/advanced-security/features-river-3.webp"
                  alt="GitHub push protection confirms an active secret and blocks the push"
                  width="708"
                  height="510"
                  style={{display: 'block'}}
                  loading="lazy"
                />
              </River.Visual>
            </River>
          </AnimationProvider>

          <div
            className="lp-Spacer"
            style={{'--lp-space': '64px', '--lp-space-xl': '104px'} as React.CSSProperties}
            aria-hidden
          />

          <div className="lp-Features-testimonialWrapper" ref={featuresTestimonialAnimationRef}>
            <div className="lp-Features-testimonialGradientWrapper">
              <div className="lp-Features-testimonialGradient" />
            </div>

            <Testimonial size="large" className="lp-Features-testimonial">
              <Testimonial.Quote className="lp-Features-testimonialQuote">
                Push protection is such a beautiful workflow. We’ve never received a single complaint from developers.
              </Testimonial.Quote>
              <Testimonial.Logo className="lp-Features-testimonialLogo">
                <img
                  src="/images/modules/site/enterprise/advanced-security/features-testimonial-logo.svg"
                  alt="Telus's logo"
                  width="173"
                  height="34"
                />
              </Testimonial.Logo>
            </Testimonial>
          </div>

          {/* Features Bento */}

          <Bento className="lp-FeaturesBento--autoHeightWhenNarrow">
            {/* Bento 1 */}
            <Bento.Item
              columnSpan={12}
              rowSpan={{xsmall: 5, medium: 6}}
              className="lp-FeaturesBento-item lp-FeaturesBento-item1"
            >
              <Bento.Content
                horizontalAlign={{xsmall: 'start', medium: 'center'}}
                verticalAlign="center"
                padding={{xsmall: 'normal', medium: 'spacious'}}
                className="lp-FeaturesBento-content"
              >
                <Bento.Heading as="h3" size="5" weight="semibold">
                  Dependencies you can depend on
                </Bento.Heading>
                <Text as="div" variant="muted" style={{maxWidth: '460px'}} className="lp-fontSize--smallWhenNarrow">
                  Secure, manage, and report on software supply chains with automated security, version updates, and
                  one-click software bills of material (SBOMs).
                </Text>
                <Link
                  href="https://docs.github.com/en/enterprise-cloud@latest/code-security/supply-chain-security/end-to-end-supply-chain/end-to-end-supply-chain-overview"
                  className="lp-Features-linkInBento"
                >
                  Secure your end-to-end supply chain
                </Link>
              </Bento.Content>
              <Bento.Visual
                fillMedia={false}
                padding="normal"
                horizontalAlign="center"
                verticalAlign="start"
                position="50% 0%"
                className="lp-FeaturesBento-visual"
              >
                <Image
                  as="picture"
                  src="/images/modules/site/enterprise/advanced-security/features-bento-1.webp"
                  sources={[
                    {
                      srcset: '/images/modules/site/enterprise/advanced-security/features-bento-1-sm.webp',
                      media: '(max-width: 767px)',
                    },
                  ]}
                  alt="Dependency review identifies high severity vulnerabilities in a .json package"
                  loading="lazy"
                  className="lp-FeaturesBento-img lp-borderRadiusNone"
                />
              </Bento.Visual>
            </Bento.Item>

            {/* Bento 2 */}
            <Bento.Item
              columnSpan={{xsmall: 12, medium: 6}}
              rowSpan={{xsmall: 5, medium: 6}}
              className="lp-FeaturesBento-item lp-FeaturesBento-item2"
            >
              <Bento.Content
                horizontalAlign="start"
                verticalAlign="end"
                padding={{xsmall: 'normal', medium: 'spacious'}}
                className="lp-FeaturesBento-content"
              >
                <Bento.Heading as="h3" size="5" weight="semibold" style={{maxWidth: '20ch'}}>
                  Security status at a glance
                </Bento.Heading>
                <Text as="div" variant="muted" className="lp-fontSize--smallWhenNarrow">
                  Verify progress and track trends to prioritize remediation tasks across multiple repositories.
                </Text>
                <Link
                  href="https://docs.github.com/en/enterprise-cloud@latest/code-security/security-overview/about-security-overview"
                  className="lp-Features-linkInBento"
                >
                  Discover security overview
                </Link>
              </Bento.Content>
              <Bento.Visual
                fillMedia={false}
                position="0% 0%"
                padding={{xsmall: 'normal', medium: 'spacious'}}
                className="lp-FeaturesBento-visual"
              >
                <Image
                  as="picture"
                  src="/images/modules/site/enterprise/advanced-security/features-bento-2.webp"
                  sources={[
                    {
                      srcset: '/images/modules/site/enterprise/advanced-security/features-bento-2-sm.webp',
                      media: '(max-width: 767px)',
                    },
                  ]}
                  alt="Trend graph showing a decline in critical vulnerabilities over time"
                  loading="lazy"
                  className="lp-FeaturesBento-img lp-borderRadiusNone"
                />
              </Bento.Visual>
            </Bento.Item>

            {/* Bento 3 */}
            <Bento.Item
              columnSpan={{xsmall: 12, medium: 6}}
              rowSpan={{xsmall: 6, medium: 6}}
              className="lp-FeaturesBento-item"
              style={{gridGap: '0'}}
            >
              <Bento.Content
                horizontalAlign="start"
                verticalAlign="end"
                padding={{xsmall: 'normal', medium: 'spacious'}}
                className="lp-FeaturesBento-content"
              >
                <Bento.Heading as="h3" size="5" weight="semibold">
                  Your workflows, <br /> your tools
                </Bento.Heading>
                <Text as="div" variant="muted" className="lp-fontSize--smallWhenNarrow">
                  With support for more than 17,000 app integrations and actions templates, GitHub Advanced Security
                  provides one workflow for your entire toolchain.
                </Text>
                <Link href="https://github.com/marketplace" className="lp-Features-linkInBento">
                  Explore GitHub Marketplace
                </Link>
              </Bento.Content>
              <Bento.Visual>
                <div
                  className="lp-Features-Ticker"
                  role="marquee"
                  aria-label="Scrolling ticker of solution categories found in the GitHub Marketplace"
                  data-animation-paused={isTickerAnimationPaused}
                >
                  <div className="lp-Features-Ticker-row">
                    <div className="lp-Features-Ticker-scroll">
                      <div className="lp-Features-Ticker-item">
                        <span className="lp-Features-Ticker-content">
                          <CommentIcon />
                          Chat
                        </span>
                      </div>
                      <div className="lp-Features-Ticker-item">
                        <span className="lp-Features-Ticker-content">
                          <ProjectIcon />
                          Project management
                        </span>
                      </div>
                      <div className="lp-Features-Ticker-item">
                        <span className="lp-Features-Ticker-content">
                          <SparkleFillIcon />
                          Code Quality
                        </span>
                      </div>
                      <div className="lp-Features-Ticker-item">
                        <span className="lp-Features-Ticker-content">
                          <RocketIcon />
                          Deployment
                        </span>
                      </div>
                      <div className="lp-Features-Ticker-item">
                        <span className="lp-Features-Ticker-content">
                          <InfinityIcon />
                          Continuous Integration
                        </span>
                      </div>
                      <div className="lp-Features-Ticker-item">
                        <span className="lp-Features-Ticker-content">
                          <MortarBoardIcon />
                          Learning
                        </span>
                      </div>
                    </div>
                    <div className="lp-Features-Ticker-scroll" aria-hidden>
                      <div className="lp-Features-Ticker-item">
                        <span className="lp-Features-Ticker-content">
                          <CommentIcon />
                          Chat
                        </span>
                      </div>
                      <div className="lp-Features-Ticker-item">
                        <span className="lp-Features-Ticker-content">
                          <ProjectIcon />
                          Project management
                        </span>
                      </div>
                      <div className="lp-Features-Ticker-item">
                        <span className="lp-Features-Ticker-content">
                          <SparkleFillIcon />
                          Code Quality
                        </span>
                      </div>
                      <div className="lp-Features-Ticker-item">
                        <span className="lp-Features-Ticker-content">
                          <RocketIcon />
                          Deployment
                        </span>
                      </div>
                      <div className="lp-Features-Ticker-item">
                        <span className="lp-Features-Ticker-content">
                          <InfinityIcon />
                          Continuous Integration
                        </span>
                      </div>
                      <div className="lp-Features-Ticker-item">
                        <span className="lp-Features-Ticker-content">
                          <MortarBoardIcon />
                          Learning
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="lp-Features-Ticker-row">
                    <div className="lp-Features-Ticker-scroll">
                      <div className="lp-Features-Ticker-item">
                        <span className="lp-Features-Ticker-content">
                          <GraphIcon />
                          Monitoring
                        </span>
                      </div>
                      <div className="lp-Features-Ticker-item">
                        <span className="lp-Features-Ticker-content">
                          <ShieldCheckIcon />
                          Security
                        </span>
                      </div>
                      <div className="lp-Features-Ticker-item">
                        <span className="lp-Features-Ticker-content">
                          <VersionsIcon />
                          Testing
                        </span>
                      </div>
                      <div className="lp-Features-Ticker-item">
                        <span className="lp-Features-Ticker-content">
                          <ArrowSwitchIcon />
                          API Management
                        </span>
                      </div>
                      <div className="lp-Features-Ticker-item">
                        <span className="lp-Features-Ticker-content">
                          <CodeReviewIcon />
                          Code review
                        </span>
                      </div>
                      <div className="lp-Features-Ticker-item">
                        <span className="lp-Features-Ticker-content">
                          <PackageIcon />
                          Dependency management
                        </span>
                      </div>
                    </div>
                    <div className="lp-Features-Ticker-scroll" aria-hidden>
                      <div className="lp-Features-Ticker-item">
                        <span className="lp-Features-Ticker-content">
                          <GraphIcon />
                          Monitoring
                        </span>
                      </div>
                      <div className="lp-Features-Ticker-item">
                        <span className="lp-Features-Ticker-content">
                          <ShieldCheckIcon />
                          Security
                        </span>
                      </div>
                      <div className="lp-Features-Ticker-item">
                        <span className="lp-Features-Ticker-content">
                          <VersionsIcon />
                          Testing
                        </span>
                      </div>
                      <div className="lp-Features-Ticker-item">
                        <span className="lp-Features-Ticker-content">
                          <ArrowSwitchIcon />
                          API Management
                        </span>
                      </div>
                      <div className="lp-Features-Ticker-item">
                        <span className="lp-Features-Ticker-content">
                          <CodeReviewIcon />
                          Code review
                        </span>
                      </div>
                      <div className="lp-Features-Ticker-item">
                        <span className="lp-Features-Ticker-content">
                          <PackageIcon />
                          Dependency management
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="lp-Features-Ticker-row">
                    <div className="lp-Features-Ticker-scroll">
                      <div className="lp-Features-Ticker-item">
                        <span className="lp-Features-Ticker-content">
                          <BrowserIcon />
                          IDEs
                        </span>
                      </div>
                      <div className="lp-Features-Ticker-item">
                        <span className="lp-Features-Ticker-content">
                          <LocationIcon />
                          Localization
                        </span>
                      </div>
                      <div className="lp-Features-Ticker-item">
                        <span className="lp-Features-Ticker-content">
                          <DeviceMobileIcon />
                          Mobile
                        </span>
                      </div>
                      <div className="lp-Features-Ticker-item">
                        <span className="lp-Features-Ticker-content">
                          <RepoPushIcon />
                          Publishing
                        </span>
                      </div>
                      <div className="lp-Features-Ticker-item">
                        <span className="lp-Features-Ticker-content">
                          <PlusCircleIcon />
                          Recently added
                        </span>
                      </div>
                      <div className="lp-Features-Ticker-item">
                        <span className="lp-Features-Ticker-content">
                          <MentionIcon />
                          Support
                        </span>
                      </div>
                      <div className="lp-Features-Ticker-item">
                        <span className="lp-Features-Ticker-content">
                          <PlugIcon />
                          Utilities
                        </span>
                      </div>
                    </div>
                    <div className="lp-Features-Ticker-scroll" aria-hidden>
                      <div className="lp-Features-Ticker-item">
                        <span className="lp-Features-Ticker-content">
                          <BrowserIcon />
                          IDEs
                        </span>
                      </div>
                      <div className="lp-Features-Ticker-item">
                        <span className="lp-Features-Ticker-content">
                          <LocationIcon />
                          Localization
                        </span>
                      </div>
                      <div className="lp-Features-Ticker-item">
                        <span className="lp-Features-Ticker-content">
                          <DeviceMobileIcon />
                          Mobile
                        </span>
                      </div>
                      <div className="lp-Features-Ticker-item">
                        <span className="lp-Features-Ticker-content">
                          <RepoPushIcon />
                          Publishing
                        </span>
                      </div>
                      <div className="lp-Features-Ticker-item">
                        <span className="lp-Features-Ticker-content">
                          <PlusCircleIcon />
                          Recently added
                        </span>
                      </div>
                      <div className="lp-Features-Ticker-item">
                        <span className="lp-Features-Ticker-content">
                          <MentionIcon />
                          Support
                        </span>
                      </div>
                      <div className="lp-Features-Ticker-item">
                        <span className="lp-Features-Ticker-content">
                          <PlugIcon />
                          Utilities
                        </span>
                      </div>
                    </div>
                  </div>
                  <Box paddingBlockStart={12} className="enterprise-LogoSuite-control">
                    <Button
                      variant="subtle"
                      hasArrow={false}
                      className="enterprise-LogoSuite-controlButton"
                      onClick={toggleTickerAnimationPause}
                      aria-pressed={isTickerAnimationPaused}
                      aria-label={tickerAnimationButtonAriaLabel}
                    >
                      {tickerAnimationButtonLabel}
                    </Button>
                  </Box>
                </div>
              </Bento.Visual>
            </Bento.Item>

            {/* Bento 4 */}
            <Bento.Item
              columnSpan={12}
              rowSpan={{xsmall: 5, medium: 5}}
              flow={{xsmall: 'row', medium: 'column'}}
              className="lp-FeaturesBento-item lp-FeaturesBento-item4"
            >
              <Bento.Content
                horizontalAlign="start"
                verticalAlign="center"
                padding={{xsmall: 'normal', medium: 'spacious'}}
                leadingVisual={<VerifiedIcon />}
                className="lp-FeaturesBento-content lp-FeaturesBento-item4-content lp-Bento--withAccentIcon lp-Bento--iconWithThickerStroke"
              >
                <Bento.Heading as="h3" size="5" weight="semibold" style={{marginTop: 'auto'}}>
                  Security expertise at your command
                </Bento.Heading>
                <Text as="p" variant="muted" className="lp-fontSize--smallWhenNarrow">
                  Powered by security experts and a global community of more than 100 million developers, GitHub
                  Advanced Security provides the insights and automation you need to ship more secure software on
                  schedule.
                </Text>
                <Link href="https://securitylab.github.com/" className="lp-Features-linkInBento">
                  Visit the Security Lab
                </Link>
              </Bento.Content>
              <Bento.Visual
                fillMedia={false}
                padding={{xsmall: 'normal', medium: 'spacious'}}
                className="lp-FeaturesBento-visual lp-FeaturesBento-item4-visual"
              >
                <Image
                  src="/images/modules/site/enterprise/advanced-security/features-bento-4.webp"
                  alt="Insights and remediation advice for a critical Log4j vulnerability as documented in the GitHub Advisory Database"
                  width="566"
                  height="402"
                  loading="lazy"
                  className="lp-FeaturesBento-img lp-FeaturesBento-item4-img lp-borderRadiusNone"
                />
              </Bento.Visual>
            </Bento.Item>
          </Bento>
        </div>
      </section>

      <section id="pricing" className="lp-Section--pricing">
        <div className="lp-Container">
          <div className="lp-Spacer--pricing" aria-hidden />

          <SectionIntro align="center" fullWidth>
            <SectionIntro.Label className="lp-SectionIntroLabel--muted">Pricing</SectionIntro.Label>
            <SectionIntro.Heading as="h2" size="2">
              Enable native security <br /> for every repository
            </SectionIntro.Heading>
            <SectionIntro.Description className="lp-Pricing-sectionIntroDescription">
              Eliminate toolchain cost and complexity with native DevSecOps tools for
              <br className="lp-break-whenMedium" /> GitHub Enterprise and Azure DevOps.
            </SectionIntro.Description>
          </SectionIntro>

          <div className="lp-Spacer" style={{'--lp-space': '40px'} as React.CSSProperties} aria-hidden />

          <Stack
            className="lp-Pricing-card"
            direction={{narrow: 'vertical', regular: 'horizontal'}}
            gap="none"
            padding="none"
          >
            {/* Standard */}

            <Stack padding="none" gap={{narrow: 16, regular: 24}} style={{flex: '1'}}>
              <Box>
                <Text size="100" weight="semibold" className="lp-Pricing-label">
                  Included with all plans
                </Text>
                <Box marginBlockStart={8} marginBlockEnd={16}>
                  <Heading as="h3" size="5">
                    Standard security
                  </Heading>
                </Box>
                <Text as="p" size="200" weight="normal" variant="muted" className="lp-Pricing-description">
                  Manage and secure open source components and public repositories
                </Text>
              </Box>

              <Box>
                <Stack direction="horizontal" gap={8} padding="none" className="lp-Pricing-price">
                  <Text size="500" weight="normal" className="lp-is-sansSerifAlt" style={{lineHeight: 1.3}}>
                    $
                  </Text>
                  <Text weight="normal" className="lp-is-sansSerifAlt" style={{fontSize: '56px', lineHeight: 1}}>
                    0
                  </Text>
                  <Text
                    size="500"
                    weight="normal"
                    className="lp-is-sansSerifAlt"
                    style={{lineHeight: 1.1, alignSelf: 'end', marginLeft: '8px'}}
                  >
                    USD
                  </Text>
                </Stack>
                <Text as="div" size="200" weight="normal" variant="muted" style={{marginTop: '8px'}}>
                  For all users and plans
                </Text>
              </Box>

              <Button
                as="a"
                href="https://docs.github.com/code-security/getting-started/github-security-features"
                block
              >
                Learn more
              </Button>

              <hr className="lp-Pricing-divider" />

              <div>
                <Text size="100" weight="semibold" variant="muted" className="lp-Pricing-listTitle">
                  What’s included:
                </Text>

                <button
                  type="button"
                  aria-expanded={isDetailsExpanded('standard')}
                  data-target-id="standard"
                  className="position-relative text-semibold lp-Pricing-features-toggle-btn mb-0 mb-md-3 d-md-none"
                  onClick={toggleDetailsExpanded}
                >
                  What&apos;s included
                  <span className="lp-Pricing-features-icon position-absolute top-0 right-0 bottom-0">
                    <ChevronDownIcon />
                  </span>
                </button>

                <div className="lp-Pricing-features-box">
                  <Text size="100" weight="semibold" variant="muted" className="lp-Pricing-groupTitle">
                    Code scanning
                  </Text>
                  <UnorderedList variant="checked" className="lp-Pricing-list">
                    <UnorderedList.Item>
                      <span className="sr-only">Included, </span>Code scanning for public repositories
                    </UnorderedList.Item>
                  </UnorderedList>
                  <UnorderedList
                    className="lp-Pricing-list lp-Pricing-list--excluded"
                    aria-label="What’s not included:"
                  >
                    <UnorderedList.Item>
                      <XIcon />
                      <span className="sr-only">Not included, </span>
                      Copilot Autofix**
                    </UnorderedList.Item>
                    <UnorderedList.Item>
                      <XIcon />
                      <span className="sr-only">Not included, </span>
                      Autofixes in pull requests and for existing alerts
                    </UnorderedList.Item>
                    <UnorderedList.Item>
                      <XIcon />
                      <span className="sr-only">Not included, </span>
                      Contextual vulnerability intelligence and advice
                    </UnorderedList.Item>
                    <UnorderedList.Item>
                      <XIcon />
                      <span className="sr-only">Not included, </span>
                      Hunt zero-day threats and their variants
                    </UnorderedList.Item>
                  </UnorderedList>

                  <Text size="100" weight="semibold" variant="muted" className="lp-Pricing-groupTitle">
                    Secret scanning
                  </Text>
                  <UnorderedList variant="checked" className="lp-Pricing-list">
                    <UnorderedList.Item>
                      <span className="sr-only">Included, </span>Find secrets in public repositories only
                    </UnorderedList.Item>
                    <UnorderedList.Item>
                      <span className="sr-only">Included, </span>Block secrets on pushes to public repositories
                    </UnorderedList.Item>
                  </UnorderedList>
                  <UnorderedList
                    className="lp-Pricing-list lp-Pricing-list--excluded"
                    aria-label="What’s not included:"
                  >
                    <UnorderedList.Item>
                      <XIcon />
                      <span className="sr-only">Not included, </span>
                      Revoke and notify on leaked secrets
                    </UnorderedList.Item>
                    <UnorderedList.Item>
                      <XIcon />
                      <span className="sr-only">Not included, </span>
                      Copilot Secret Scanning**
                    </UnorderedList.Item>
                    <UnorderedList.Item>
                      <XIcon />
                      <span className="sr-only">Not included, </span>
                      Find elusive secrets like PII and passwords**
                    </UnorderedList.Item>
                  </UnorderedList>

                  <Text size="100" weight="semibold" variant="muted" className="lp-Pricing-groupTitle">
                    Supply chain
                  </Text>
                  <UnorderedList variant="checked" className="lp-Pricing-list">
                    <UnorderedList.Item>
                      <span className="sr-only">Included, </span>Identify and update vulnerable open source components
                    </UnorderedList.Item>
                    <UnorderedList.Item>
                      <span className="sr-only">Included, </span>Access intelligence in the GitHub Advisory Database
                    </UnorderedList.Item>
                    <UnorderedList.Item>
                      <span className="sr-only">Included, </span>Report vulnerabilities to open source maintainers
                    </UnorderedList.Item>
                    <UnorderedList.Item>
                      <span className="sr-only">Included, </span>Generate and export SBOMs
                    </UnorderedList.Item>
                    <UnorderedList.Item>
                      <span className="sr-only">Included, </span>Manage transitive dependencies with submission API
                    </UnorderedList.Item>
                    <UnorderedList.Item>
                      <span className="sr-only">Included, </span>Detect calls to vulnerable functions (public
                      repositories)
                    </UnorderedList.Item>
                  </UnorderedList>
                  <UnorderedList
                    className="lp-Pricing-list lp-Pricing-list--excluded"
                    aria-label="What’s not included:"
                  >
                    <UnorderedList.Item>
                      <XIcon />
                      <span className="sr-only">Not included, </span>
                      Define and enforce auto-triage rules
                    </UnorderedList.Item>
                  </UnorderedList>

                  <Text size="100" weight="semibold" variant="muted" className="lp-Pricing-groupTitle">
                    Administration
                  </Text>
                  <UnorderedList
                    className="lp-Pricing-list lp-Pricing-list--excluded"
                    aria-label="What’s not included:"
                  >
                    <UnorderedList.Item>
                      <XIcon />
                      <span className="sr-only">Not included, </span>
                      View security metrics and insights
                    </UnorderedList.Item>
                    <UnorderedList.Item>
                      <XIcon />
                      <span className="sr-only">Not included, </span>
                      Assess feature adoption and code security risk
                    </UnorderedList.Item>
                    <UnorderedList.Item>
                      <XIcon />
                      <span className="sr-only">Not included, </span>
                      Enable security features for multiple repositories
                    </UnorderedList.Item>
                  </UnorderedList>
                </div>
              </div>
            </Stack>

            <hr className="lp-Pricing-divider lp-Pricing-divider--vertical" />

            {/* Advanced */}

            <Stack padding="none" gap={{narrow: 16, regular: 24}} style={{flex: '1'}}>
              <Box>
                <Text size="100" weight="semibold" className="lp-Pricing-label">
                  Requires GitHub Enterprise or Azure DevOps
                </Text>
                <Box marginBlockStart={8} marginBlockEnd={16}>
                  <Heading as="h3" size="5">
                    GitHub Advanced Security
                  </Heading>
                </Box>
                <Text as="p" size="200" weight="normal" variant="muted" className="lp-Pricing-description">
                  Detect, prevent, and remediate vulnerabilities in all public and private repositories
                </Text>
              </Box>

              <Box>
                <Stack direction="horizontal" gap={8} padding="none" className="lp-Pricing-price">
                  <Text size="500" weight="normal" className="lp-is-sansSerifAlt" style={{lineHeight: 1.3}}>
                    $
                  </Text>
                  <Text weight="normal" className="lp-is-sansSerifAlt" style={{fontSize: '56px', lineHeight: 1}}>
                    49
                  </Text>
                  <Text
                    size="500"
                    weight="normal"
                    className="lp-is-sansSerifAlt"
                    style={{lineHeight: 1.1, alignSelf: 'end', marginLeft: '8px'}}
                  >
                    USD
                  </Text>
                </Stack>
                <Text as="div" size="200" weight="normal" variant="muted" style={{marginTop: '8px'}}>
                  per month / per active committer
                </Text>
              </Box>

              <Button as="a" href={pricingContactSalesPath} variant="primary">
                Contact sales
              </Button>

              <hr className="lp-Pricing-divider" />

              <div>
                <Text size="100" weight="semibold" variant="muted" className="lp-Pricing-listTitle">
                  What’s included:
                </Text>

                <button
                  type="button"
                  aria-expanded={isDetailsExpanded('advanced')}
                  data-target-id="advanced"
                  className="position-relative text-semibold lp-Pricing-features-toggle-btn mb-0 mb-md-3 d-md-none"
                  onClick={toggleDetailsExpanded}
                >
                  What&apos;s included
                  <span className="lp-Pricing-features-icon position-absolute top-0 right-0 bottom-0">
                    <ChevronDownIcon />
                  </span>
                </button>

                <div className="lp-Pricing-features-box">
                  <Text size="100" weight="semibold" variant="muted" className="lp-Pricing-groupTitle">
                    Code scanning
                  </Text>
                  <UnorderedList variant="checked" className="lp-Pricing-list">
                    <UnorderedList.Item>
                      <span className="sr-only">Included, </span>Code scanning for private and public repositories
                    </UnorderedList.Item>
                    <UnorderedList.Item>
                      <span className="sr-only">Included, </span>Copilot Autofix**
                    </UnorderedList.Item>
                    <UnorderedList.Item>
                      <span className="sr-only">Included, </span>Autofixes in pull requests and for existing alerts
                    </UnorderedList.Item>
                    <UnorderedList.Item>
                      <span className="sr-only">Included, </span>Contextual vulnerability intelligence and advice
                    </UnorderedList.Item>
                    <UnorderedList.Item>
                      <span className="sr-only">Included, </span>Hunt zero-day threats and their variants
                    </UnorderedList.Item>
                  </UnorderedList>

                  <Text size="100" weight="semibold" variant="muted" className="lp-Pricing-groupTitle">
                    Secret scanning
                  </Text>
                  <UnorderedList variant="checked" className="lp-Pricing-list">
                    <UnorderedList.Item>
                      <span className="sr-only">Included, </span>Find secrets in public and private repositories
                    </UnorderedList.Item>
                    <UnorderedList.Item>
                      <span className="sr-only">Included, </span>Block secrets on pushes to public and private
                      repositories
                    </UnorderedList.Item>
                    <UnorderedList.Item>
                      <span className="sr-only">Included, </span>Revoke and notify on leaked secrets
                    </UnorderedList.Item>
                    <UnorderedList.Item>
                      <span className="sr-only">Included, </span>Copilot Secret Scanning**
                    </UnorderedList.Item>
                    <UnorderedList.Item>
                      <span className="sr-only">Included, </span>Find elusive secrets like PII and passwords**
                    </UnorderedList.Item>
                  </UnorderedList>

                  <Text size="100" weight="semibold" variant="muted" className="lp-Pricing-groupTitle">
                    Supply chain
                  </Text>
                  <UnorderedList variant="checked" className="lp-Pricing-list">
                    <UnorderedList.Item>
                      <span className="sr-only">Included, </span>Identify and update vulnerable open source components
                    </UnorderedList.Item>
                    <UnorderedList.Item>
                      <span className="sr-only">Included, </span>Access intelligence in the GitHub Advisory Database
                    </UnorderedList.Item>
                    <UnorderedList.Item>
                      <span className="sr-only">Included, </span>Report vulnerabilities to open source maintainers
                    </UnorderedList.Item>
                    <UnorderedList.Item>
                      <span className="sr-only">Included, </span>Generate and export SBOMs
                    </UnorderedList.Item>
                    <UnorderedList.Item>
                      <span className="sr-only">Included, </span>Manage transitive dependencies with submission API
                    </UnorderedList.Item>
                    <UnorderedList.Item>
                      <span className="sr-only">Included, </span>Detect calls to vulnerable functions (all repositories)
                    </UnorderedList.Item>
                    <UnorderedList.Item>
                      <span className="sr-only">Included, </span>Define and enforce auto-triage rules
                    </UnorderedList.Item>
                  </UnorderedList>

                  <Text size="100" weight="semibold" variant="muted" className="lp-Pricing-groupTitle">
                    Administration
                  </Text>
                  <UnorderedList variant="checked" className="lp-Pricing-list">
                    <UnorderedList.Item>
                      <span className="sr-only">Included, </span>View security metrics and insights
                    </UnorderedList.Item>
                    <UnorderedList.Item>
                      <span className="sr-only">Included, </span>Assess feature adoption and code security risk
                    </UnorderedList.Item>
                    <UnorderedList.Item>
                      <span className="sr-only">Included, </span>Enable security features for multiple repositories
                    </UnorderedList.Item>
                  </UnorderedList>

                  <Text size="100" variant="muted" className="lp-Pricing-footnote">
                    ** Only with GitHub Advanced Security on GitHub Enterprise Cloud
                  </Text>
                </div>
              </div>
            </Stack>
          </Stack>
        </div>
      </section>

      <section id="resources" className="lp-Section--resources">
        <div className="lp-Container">
          <div
            className="lp-Spacer"
            style={{'--lp-space': '64px', '--lp-space-xl': '104px'} as React.CSSProperties}
            aria-hidden
          />

          <SectionIntro align="center" fullWidth>
            <SectionIntro.Heading size="3">
              Get the most out of <br className="lp-break-whenWide" /> GitHub Advanced Security
            </SectionIntro.Heading>
          </SectionIntro>

          <div className="lp-Spacer" style={{'--lp-space': '40px'} as React.CSSProperties} aria-hidden />

          <Stack
            direction={{narrow: 'vertical', regular: 'horizontal', wide: 'horizontal'}}
            gap="normal"
            padding="none"
          >
            <div className="lp-Resources-card">
              <Card
                ctaText="Get started now"
                href="https://docs.github.com/code-security/getting-started/github-security-features"
              >
                <Card.Icon icon={<BookIcon />} color="blue" hasBackground />
                <Card.Heading>How to get started with GitHub Advanced Security</Card.Heading>
                <Card.Description>Discover how the AppSec solution can benefit your organization.</Card.Description>
              </Card>
            </div>
            <div className="lp-Resources-card">
              <Card
                ctaText="Read the Forrester Report"
                href="https://resources.github.com/forrester-industry-spotlight-github-advanced-security/"
              >
                <Card.Icon icon={<BookIcon />} color="blue" hasBackground />
                <Card.Heading>GitHub TEI spotlight for GitHub Advanced Security</Card.Heading>
                <Card.Description>
                  Explore the benefits of improving software security standards in organizations.
                </Card.Description>
              </Card>
            </div>
            <div className="lp-Resources-card">
              <Card
                ctaText="Watch the videos"
                href="https://www.github.com/enterprise/advanced-security/what-is-github-advanced-security"
              >
                <Card.Icon icon={<BookIcon />} color="blue" hasBackground />
                <Card.Heading>Expert strategies for using GitHub Advanced Security</Card.Heading>
                <Card.Description>
                  Learn how industry experts use GitHub Advanced Security to protect their code without sacrificing
                  developer productivity.
                </Card.Description>
              </Card>
            </div>
          </Stack>
        </div>
      </section>

      <section id="faq" className="lp-Section--faqs">
        <div className="lp-Container">
          <div
            className="lp-Spacer"
            style={{'--lp-space': '72px', '--lp-space-xl': '128px'} as React.CSSProperties}
            aria-hidden
          />

          {template !== undefined && (
            <ContentfulFaqGroup component={template.fields.sections[0].fields.components[0]} />
          )}

          <div
            className="lp-Spacer"
            style={{'--lp-space': '72px', '--lp-space-xl': '128px'} as React.CSSProperties}
            aria-hidden
          />
        </div>
      </section>

      <section id="footnotes" className="lp-Section--footnotes">
        <div className="lp-Container">
          <OrderedList>
            <OrderedList.Item className="lp-Footnotes-item">
              Overall, the median time for developers to use Copilot Autofix to automatically commit the fix for a
              PR-time alert was 28 minutes, compared to 1.5 hours to resolve the same alerts manually (3x faster). For
              SQL injection vulnerabilities: 18 minutes compared to 3.7 hours (12x faster). Based on new code scanning
              alerts found by CodeQL in pull requests (PRs) on repositories with GitHub Advanced Security enabled. These
              are examples; your results will vary.
            </OrderedList.Item>
            <OrderedList.Item className="lp-Footnotes-item">
              A Comparative Study of Software Secrets Reporting by Secret Detection Tools, Setu Kumar Basak et al.,
              North Carolina State University, 2023
            </OrderedList.Item>
          </OrderedList>

          <div
            className="lp-Spacer"
            style={{'--lp-space': '72px', '--lp-space-xl': '128px'} as React.CSSProperties}
            aria-hidden
          />
        </div>
      </section>
    </ThemeProvider>
  )
}

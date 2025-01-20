import {testIdProps} from '@github-ui/test-id-props'
import {fetchVariant} from '../utils'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {ContentfulFaqGroup} from '@github-ui/swp-core/components/contentful/ContentfulFaqGroup'
import {
  BookIcon,
  ColumnsIcon,
  CopilotIcon,
  DeviceMobileIcon,
  IterationsIcon,
  PeopleIcon,
  PlayIcon,
} from '@primer/octicons-react'
import {
  AnchorNav,
  AnimationProvider,
  Bento,
  Box,
  Button,
  Card,
  Grid,
  Heading,
  Hero,
  Label,
  Link,
  LogoSuite,
  OrderedList,
  River,
  RiverBreakout,
  SectionIntro,
  Stack,
  Text,
  ThemeProvider,
  Timeline,
} from '@primer/react-brand'
import resolveResponse from 'contentful-resolve-response'
import {useEffect, useRef, useState, type VideoHTMLAttributes} from 'react'

import {analyticsEvent} from '../lib/analytics'
import {Image} from '../components/Image/Image'
import {isFeatureCopilotPage, toContainerPage, toEntryCollection} from '../lib/types/contentful'
import {toPayload} from '../lib/types/payload'
import {CustomerStoryBento} from './copilot/CustomerStory'
import {PricingCards} from './copilot/PricingCards'
import {PricingTable} from './copilot/PricingTable'

export function CopilotIndex() {
  const {copilotSignupPath} = useRoutePayload<{copilotSignupPath: string}>()
  const {variantCopilotSignupPath} = useRoutePayload<{variantCopilotSignupPath: string}>()
  const {copilotForBusinessSignupPath} = useRoutePayload<{copilotForBusinessSignupPath: string}>()
  const {copilotContactSalesPath} = useRoutePayload<{copilotContactSalesPath: string}>()
  const {contentfulRawJsonResponse} = toPayload(useRoutePayload<unknown>())
  const {logged_in} = useRoutePayload<{logged_in: boolean}>()
  const {is_paid_media_campaign} = useRoutePayload<{is_paid_media_campaign: boolean}>()
  const {has_copilot_subscription} = useRoutePayload<{has_copilot_subscription: boolean}>()
  const {experimentation_copilot_alt_ctas_enabled} = useRoutePayload<{
    experimentation_copilot_alt_ctas_enabled: boolean
  }>()

  const page = toContainerPage(toEntryCollection(resolveResponse(contentfulRawJsonResponse)).at(0))

  // Hero Video player
  //
  // Video player with custom controls for the Hero

  const {heroVideoLg} = useRoutePayload<{heroVideoLg: string}>()
  const {heroVideoLgPoster} = useRoutePayload<{heroVideoLgPoster: string}>()
  const {heroVideoSm} = useRoutePayload<{heroVideoSm: string}>()

  const videoLgRef = useRef<HTMLVideoElement>(null)
  const videoSmRef = useRef<HTMLVideoElement>(null)
  const [videoState, setVideoState] = useState('playing')
  const [videoButtonLabel, setVideoButtonLabel] = useState('Pause')
  const [videoButtonPressed, setVideoButtonPressed] = useState(false)
  const [videoButtonAriaLabel, setVideoButtonAriaLabel] = useState(
    'GitHub Copilot Chat demo video is currently playing. Click to pause.',
  )
  const [VideoIcon, setVideoIcon] = useState(() => ColumnsIcon)

  const azureExperimentCopilotHeroCtaUrl = '/exp/webex/variants/features_copilot_alt_hero_ctas'
  const azureExperimentCopilotSignupPathUrl = '/exp/webex/variants/features_copilot_signup_path_test'

  const [ctaVariant, setCtaVariant] = useState<string>('single_btn_copilot_plans')
  const [loginVariant, setLoginVariant] = useState<string>('login')

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

  const handleVideoStateChange = () => {
    if (videoState === 'playing') {
      setVideoState('paused')
      setVideoButtonLabel('Play')
      setVideoButtonPressed(true)
      setVideoButtonAriaLabel('GitHub Copilot Chat demo animation is paused. Click to play.')
      setVideoIcon(() => PlayIcon)
      if (videoLgRef.current && videoSmRef.current) {
        videoLgRef.current.pause()
        videoSmRef.current.pause()
      }
    } else if (videoState === 'paused') {
      setVideoState('playing')
      setVideoButtonLabel('Pause')
      setVideoButtonAriaLabel('GitHub Copilot Chat demo animation is currently playing. Click to pause.')
      setVideoButtonPressed(false)
      setVideoIcon(() => ColumnsIcon)
      if (videoLgRef.current && videoSmRef.current) {
        videoLgRef.current.play()
        videoSmRef.current.play()
      }
    } else if (videoState === 'ended') {
      setVideoState('playing')
      setVideoButtonLabel('Pause')
      setVideoButtonAriaLabel('GitHub Copilot Chat demo animation is currently playing. Click to pause.')
      setVideoButtonPressed(false)
      setVideoIcon(() => ColumnsIcon)
      if (videoLgRef.current && videoSmRef.current) {
        videoLgRef.current.currentTime = 0
        videoSmRef.current.currentTime = 0
        videoLgRef.current.play()
        videoSmRef.current.play()
      }
    }
  }

  const handleVideoStateEnd = () => {
    setVideoState('ended')
    setVideoButtonLabel('Replay')
    setVideoButtonAriaLabel('GitHub Copilot Chat animation has ended. Click to replay.')
    setVideoButtonPressed(true)
    setVideoIcon(() => IterationsIcon)
  }

  // Auto-play videos
  //
  // Starts playing videos when they're in view

  interface VideoProps extends VideoHTMLAttributes<HTMLVideoElement> {
    src: string
    poster: string
  }

  function AutoPlayVideo({src, poster, ...props}: VideoProps) {
    const videoRef = useAutoplayVideo()

    return (
      <video ref={videoRef} playsInline={true} muted={true} preload="none" poster={poster} {...props}>
        <source src={src} type="video/mp4; codecs=avc1.4d002a" />
      </video>
    )
  }

  function useAutoplayVideo() {
    const videoRef = useRef<HTMLVideoElement | null>(null)

    useEffect(() => {
      const currentVideoRef = videoRef.current

      const observer = new IntersectionObserver(
        entries => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              if (currentVideoRef) currentVideoRef.play()
            } else {
              if (currentVideoRef) currentVideoRef.pause()
            }
          }
        },
        {
          threshold: 0.5, // Play once 50% of the height is...
          rootMargin: `-25% 0% -25% 0%`, // ...in the center 50% of the viewport
        },
      )

      if (currentVideoRef) {
        observer.observe(currentVideoRef)
      }

      return () => {
        if (currentVideoRef) {
          observer.unobserve(currentVideoRef)
        }
      }
    }, [])

    return videoRef
  }

  // Pricing deep link
  //
  // This is an alternative to using `href="#pricing"` on the Hero "Compare plans" button
  // It seems deep linking currently doesn't work reliably, so we're using `scrollTo()` instead

  const ctaPricingRef = useRef<HTMLButtonElement>(null)
  const sectionPricingRef = useRef<HTMLElement>(null)

  const handlePricingClick = (event: Event) => {
    event.preventDefault()

    if (sectionPricingRef.current) {
      // Set focus to the pricing section
      sectionPricingRef.current.setAttribute('tabindex', '-1')
      sectionPricingRef.current.focus({preventScroll: true})

      // Then scroll to the pricing section
      window.scrollTo({
        top: sectionPricingRef.current.offsetTop,
      })
    }
  }

  useEffect(() => {
    const currentCtaPricingRef = ctaPricingRef.current

    if (currentCtaPricingRef) {
      currentCtaPricingRef.addEventListener('click', handlePricingClick)
    }

    return () => {
      if (currentCtaPricingRef) {
        currentCtaPricingRef.removeEventListener('click', handlePricingClick)
      }
    }
  }, [])

  useEffect(() => {
    const getCtaVariant = async () => {
      const variant = await fetchVariant(azureExperimentCopilotHeroCtaUrl, 'single_btn_copilot_plans')

      setCtaVariant(variant)
    }

    if (logged_in && experimentation_copilot_alt_ctas_enabled && !is_paid_media_campaign && !has_copilot_subscription) {
      getCtaVariant()
    }
  }, [logged_in, experimentation_copilot_alt_ctas_enabled, is_paid_media_campaign, has_copilot_subscription])

  useEffect(() => {
    const getLoginVariant = async () => {
      const variant = await fetchVariant(azureExperimentCopilotSignupPathUrl, 'login')

      setLoginVariant(variant)
    }

    if (!logged_in) {
      getLoginVariant()
    }
  }, [logged_in])

  return (
    <>
      <ThemeProvider colorMode="dark" className="lp-Copilot">
        <section id="hero" className="lp-Section lp-Section--hero">
          <Grid>
            <Grid.Column span={12}>
              <Hero data-hpc align="center" className="lp-Hero">
                <Hero.Label
                  size="large"
                  leadingVisual={<CopilotIcon />}
                  color="purple-red"
                  className="label-purple-green mb-4"
                >
                  Copilot Enterprise now available
                </Hero.Label>
                <Hero.Heading size="1" weight="bold" className="lp-Hero-heading">
                  The world’s most widely adopted AI developer tool.
                </Hero.Heading>
                <div className="lp-Hero-ctaButtons">
                  {ctaVariant === 'single_btn_copilot_plans' && (
                    <Hero.PrimaryAction
                      href="/features/copilot/plans"
                      className="Button--heroCta"
                      {...analyticsEvent({action: 'get_started', tag: 'button', context: 'CTAs', location: 'hero'})}
                      {...testIdProps('single-btn-copilot-plans')}
                    >
                      Get started with Copilot
                    </Hero.PrimaryAction>
                  )}
                  {ctaVariant === 'dual_variant_copilot_btns' && (
                    <>
                      <Hero.PrimaryAction
                        href="/github-copilot/signup"
                        className="Button--heroCta"
                        {...analyticsEvent({action: 'start_trial', tag: 'button', context: 'CTAs', location: 'hero'})}
                        {...testIdProps('dual-btn-copilot-signup')}
                      >
                        Start a free trial
                      </Hero.PrimaryAction>
                      <Hero.SecondaryAction
                        href="/features/copilot/plans"
                        className="Button--heroCta"
                        {...analyticsEvent({action: 'see_plans', tag: 'button', context: 'CTAs', location: 'hero'})}
                        {...testIdProps('dual-btn-copilot-plans')}
                      >
                        See plans & pricing
                      </Hero.SecondaryAction>
                    </>
                  )}
                </div>
              </Hero>

              <Box className="lp-Hero-visual">
                <Box
                  role="img"
                  className="lp-Hero-videoContainer"
                  aria-label="A demonstration animation of a code editor using GitHub Copilot Chat, where the user requests GitHub Copilot to generate unit tests for a given code snippet."
                >
                  <video
                    autoPlay={true}
                    playsInline={true}
                    muted={true}
                    className="lp-Hero-video lp-Hero-video--landscape hide-reduced-motion"
                    width="1248"
                    height="735"
                    poster={heroVideoLgPoster}
                    ref={videoLgRef}
                    onEnded={() => handleVideoStateEnd()}
                  >
                    <source src={heroVideoLg} type="video/mp4; codecs=avc1.4d002a" />
                  </video>

                  <video
                    autoPlay={true}
                    playsInline={true}
                    muted={true}
                    className="lp-Hero-video lp-Hero-video--portrait hide-reduced-motion"
                    width="539.5"
                    height="682"
                    ref={videoSmRef}
                    onEnded={() => handleVideoStateEnd()}
                  >
                    <source src={heroVideoSm} type="video/mp4; codecs=avc1.4d002a" />
                  </video>

                  <Image
                    className="lp-Hero-videoImage hide-no-pref-motion"
                    src="/images/modules/site/copilot/hero.jpg"
                    alt="Editor with GitHub Copilot Chat"
                    width="1248"
                  />
                </Box>

                <Box paddingBlockStart={12} className="lp-Hero-videoPlayer">
                  <Button
                    leadingVisual={VideoIcon}
                    variant="subtle"
                    hasArrow={false}
                    className="lp-Hero-videoPlayerButton"
                    onClick={handleVideoStateChange}
                    aria-pressed={videoButtonPressed}
                    aria-label={videoButtonAriaLabel}
                    {...analyticsEvent({
                      action: videoButtonLabel.toLowerCase(),
                      tag: 'button',
                      context: 'demo_gif',
                      location: 'hero',
                    })}
                  >
                    {videoButtonLabel}
                  </Button>
                </Box>

                <Box className="lp-Hero-head hide-reduced-motion">
                  <div className="lp-Hero-headSize">
                    <div className="lp-Hero-headBlink js-copilot-head-wrapper">
                      <canvas
                        className="js-copilot-head"
                        {...analyticsEvent({action: 'copilot_head', tag: 'canvas', context: 'hero', location: 'hero'})}
                      />
                    </div>
                  </div>
                </Box>
              </Box>

              <LogoSuite hasDivider={false} className="lp-LogoSuite">
                <LogoSuite.Heading visuallyHidden>GitHub Copilot is used by</LogoSuite.Heading>
                <LogoSuite.Logobar marquee marqueeSpeed="slow" data-animation-paused={isLogoSuiteAnimationPaused}>
                  <Image
                    src="/images/modules/site/copilot/logos/coca-cola.svg"
                    alt="Coca Cola's logo"
                    style={{height: '40px'}}
                  />
                  <Image
                    src="/images/modules/site/copilot/logos/coyote-logistics.svg"
                    alt="Coyote Logistics's logo"
                    style={{height: '40px'}}
                  />
                  <Image
                    src="/images/modules/site/copilot/logos/duolingo.svg"
                    alt="Duolingo's logo"
                    style={{height: '40px'}}
                  />
                  <Image
                    src="/images/modules/site/copilot/logos/stripe.svg"
                    alt="Stripe's logo"
                    style={{height: '44px'}}
                  />
                  <Image
                    src="/images/modules/site/copilot/logos/shopify.svg"
                    alt="Shopify's logo"
                    style={{height: '40px'}}
                  />
                  <Image
                    src="/images/modules/site/copilot/logos/mercado-libre.svg"
                    alt="Mercado Libre's logo"
                    style={{height: '40px'}}
                  />
                  <Image
                    src="/images/modules/site/copilot/logos/mercedes.svg"
                    alt="Mercedes Benz's logo"
                    style={{height: '48px'}}
                  />
                  <Image
                    src="/images/modules/site/copilot/logos/fidelity.svg"
                    alt="Fidelity's logo"
                    style={{height: '36px'}}
                  />
                  <Image src="/images/modules/site/copilot/logos/dell.svg" alt="Dell's logo" style={{height: '60px'}} />
                  <Image
                    src="/images/modules/site/copilot/logos/lemonade.svg"
                    alt="Lemonade's logo"
                    style={{height: '36px'}}
                  />
                  <Image
                    src="/images/modules/site/copilot/logos/sas.svg"
                    alt="Scandinavian Airlines's logo"
                    style={{height: '36px'}}
                  />
                  <Image src="/images/modules/site/copilot/logos/itau.svg" alt="Itau's logo" style={{height: '50px'}} />
                  <Image
                    src="/images/modules/site/copilot/logos/hover.svg"
                    alt="Hover's logo"
                    style={{height: '36px'}}
                  />
                  <Image src="/images/modules/site/copilot/logos/lyft.svg" alt="Lyft's logo" style={{height: '64px'}} />
                </LogoSuite.Logobar>
              </LogoSuite>

              <Box paddingBlockStart={12} className="lp-Hero-videoPlayer">
                <Button
                  variant="subtle"
                  hasArrow={false}
                  className="lp-Hero-videoPlayerButton"
                  onClick={toggleLogoSuiteAnimationPause}
                  aria-pressed={isLogoSuiteAnimationPaused}
                  aria-label={logoSuiteAnimationButtonAriaLabel}
                  {...analyticsEvent({
                    action: logoSuiteAnimationButtonLabel.toLowerCase(),
                    tag: 'button',
                    context: 'brands',
                    location: 'hero',
                  })}
                >
                  {logoSuiteAnimationButtonLabel}
                </Button>
              </Box>
            </Grid.Column>
          </Grid>

          <Box style={{height: 0}}>
            <AnchorNav hideUntilSticky>
              <AnchorNav.Link
                href="#enterprise"
                {...analyticsEvent({action: 'enterprise_ready', tag: 'link', context: 'sticky', location: 'subnav'})}
              >
                Enterprise-ready
              </AnchorNav.Link>
              <AnchorNav.Link
                href="#features"
                {...analyticsEvent({action: 'features', tag: 'link', context: 'sticky', location: 'subnav'})}
              >
                Features
              </AnchorNav.Link>
              <AnchorNav.Link
                href="#pricing"
                {...analyticsEvent({action: 'pricing', tag: 'link', context: 'sticky', location: 'subnav'})}
              >
                Pricing
              </AnchorNav.Link>
              <AnchorNav.Link
                href="#faq"
                {...analyticsEvent({action: 'faqs', tag: 'link', context: 'sticky', location: 'subnav'})}
              >
                FAQs
              </AnchorNav.Link>
              {ctaVariant === 'single_btn_copilot_plans' && (
                <AnchorNav.Action
                  href="/features/copilot/plans"
                  {...analyticsEvent({
                    action: 'get_started',
                    tag: 'button',
                    context: 'sticky',
                    location: 'subnav',
                  })}
                >
                  Get started
                </AnchorNav.Action>
              )}
              {ctaVariant === 'dual_variant_copilot_btns' && [
                <AnchorNav.Action
                  key="signup"
                  href="/github-copilot/signup"
                  {...analyticsEvent({
                    action: 'start_trial',
                    tag: 'button',
                    context: 'sticky',
                    location: 'subnav',
                  })}
                >
                  Start a free trial
                </AnchorNav.Action>,
                <AnchorNav.Action
                  key="plans"
                  href="/features/copilot/plans"
                  {...analyticsEvent({
                    action: 'see_plans',
                    tag: 'button',
                    context: 'sticky',
                    location: 'subnav',
                  })}
                >
                  See plans & pricing
                </AnchorNav.Action>,
              ]}
            </AnchorNav>
          </Box>
          <div className="lp-Hero-cover" />
        </section>

        <section id="enterprise" className="lp-Section lp-Section--level-1">
          <Grid className="lp-Section-container--centerUntilMedium lp-Grid--noRowGap">
            <Grid.Column span={12}>
              <SectionIntro fullWidth className="lp-SectionIntro">
                <SectionIntro.Label size="large" className="lp-Label--section">
                  Enterprise-ready
                </SectionIntro.Label>
                <SectionIntro.Heading size="1" weight="bold">
                  The competitive advantage developers ask for by name.
                </SectionIntro.Heading>
              </SectionIntro>
            </Grid.Column>

            <Grid.Column span={12}>
              <Bento className="Bento Bento--inset">
                <Bento.Item
                  columnSpan={{xsmall: 12, medium: 6, large: 7}}
                  rowSpan={{xsmall: 4, small: 3, medium: 4, large: 5, xlarge: 5}}
                  visualAsBackground
                >
                  <Bento.Content padding={{xsmall: 'normal', xlarge: 'spacious'}}>
                    <Bento.Heading as="h3" size="3" weight="semibold">
                      Proven to increase developer productivity and accelerate the pace of software development.
                    </Bento.Heading>
                    <Link
                      href="https://github.blog/2022-09-07-research-quantifying-github-copilots-impact-on-developer-productivity-and-happiness/"
                      size="large"
                      variant="default"
                      {...analyticsEvent({
                        action: 'research_blog',
                        tag: 'link',
                        context: 'developer_productivity',
                        location: 'enterprise_ready',
                      })}
                    >
                      Read the research
                    </Link>
                  </Bento.Content>
                  <Bento.Visual>
                    <Image src="/images/modules/site/copilot/enterprise-1.jpg" alt="" width="724" height="540" />
                  </Bento.Visual>
                </Bento.Item>

                <Bento.Item
                  columnSpan={{xsmall: 12, medium: 6, large: 5}}
                  rowSpan={{xsmall: 3, small: 3, medium: 4, large: 5, xlarge: 5}}
                  visualAsBackground
                >
                  <Bento.Content
                    padding={{xsmall: 'normal', xlarge: 'spacious'}}
                    verticalAlign="end"
                    className="lp-Bento-lastChildNoMarginBottom"
                  >
                    <Bento.Heading as="h3" size="display" className="is-sansSerifAlt">
                      55%
                    </Bento.Heading>
                    <Text as="p" size="400" weight="medium" variant="muted" style={{marginBottom: '0'}}>
                      Faster coding
                    </Text>
                  </Bento.Content>
                  <Bento.Visual>
                    <Image
                      src="/images/modules/site/copilot/enterprise-2.webp"
                      className="object-pos-0"
                      alt=""
                      width="492"
                      height="540"
                    />
                  </Bento.Visual>
                </Bento.Item>

                <Bento.Item
                  columnSpan={{xsmall: 12, medium: 6, large: 5}}
                  rowSpan={{xsmall: 3, small: 3, medium: 4, large: 4, xlarge: 5}}
                  visualAsBackground
                >
                  <Bento.Content
                    padding={{xsmall: 'normal', xlarge: 'spacious'}}
                    verticalAlign="end"
                    className="lp-Bento-lastChildNoMarginBottom"
                  >
                    <Bento.Heading as="h3" size="4" weight="semibold">
                      Designed by leaders in AI so you can build with confidence.
                    </Bento.Heading>
                  </Bento.Content>
                  <Bento.Visual>
                    <Image
                      src="/images/modules/site/copilot/enterprise-3.webp"
                      className="object-pos-0"
                      alt=""
                      width="492"
                      height="540"
                    />
                  </Bento.Visual>
                </Bento.Item>

                <Bento.Item
                  columnSpan={{xsmall: 12, medium: 6, large: 7}}
                  rowSpan={{xsmall: 3, small: 3, medium: 4, large: 4, xlarge: 5}}
                  visualAsBackground
                >
                  <Bento.Content padding={{xsmall: 'normal', xlarge: 'spacious'}}>
                    <Bento.Heading as="h3" size="3" weight="semibold">
                      Committed to your privacy, security, and trust.
                    </Bento.Heading>
                    <Link
                      href="https://resources.github.com/copilot-trust-center/"
                      size="large"
                      variant="default"
                      {...analyticsEvent({
                        action: 'trust_center',
                        tag: 'link',
                        context: 'privacy_tile',
                        location: 'enterprise_ready',
                      })}
                    >
                      Visit the GitHub Copilot Trust Center
                    </Link>
                  </Bento.Content>
                  <Bento.Visual>
                    <Image src="/images/modules/site/copilot/enterprise-4.jpg" alt="" width="724" height="540" />
                  </Bento.Visual>
                </Bento.Item>

                <CustomerStoryBento />
              </Bento>
            </Grid.Column>
          </Grid>
        </section>

        <section
          id="productivity"
          className="lp-Section lp-Section--compact lp-Section--level-gradient lp-Section--illu"
        >
          <Grid
            className="lp-Section-container--centerUntilMedium lp-Grid--noRowGap lp-Section--illu-content"
            style={{paddingBottom: '32px'}}
          >
            <Grid.Column span={12}>
              <SectionIntro fullWidth className="lp-SectionIntro">
                <SectionIntro.Heading size="3">
                  The industry <br className="break-whenNarrow" /> standard.
                </SectionIntro.Heading>
              </SectionIntro>
            </Grid.Column>

            <Grid.Column span={12}>
              <AnimationProvider runOnce={true}>
                <Stack
                  direction={{narrow: 'vertical', regular: 'horizontal'}}
                  gap={32}
                  padding="none"
                  className="lp-Productivity"
                >
                  <Box
                    padding={32}
                    className="lp-Productivity-item has-BlurredBg has-GradientBorder"
                    animate="slide-in-up"
                  >
                    <Heading
                      as="h3"
                      weight="medium"
                      className="is-sansSerifAlt"
                      style={{fontSize: '56px', letterSpacing: '-1px'}}
                    >
                      50,000+
                    </Heading>
                    <Text as="p" weight="medium" variant="muted" style={{fontSize: '24px', letterSpacing: '-0.48px'}}>
                      Businesses have adopted GitHub Copilot
                    </Text>
                  </Box>

                  <Box
                    padding={32}
                    className="lp-Productivity-item has-BlurredBg has-GradientBorder"
                    animate="slide-in-up"
                  >
                    <Heading
                      as="h3"
                      weight="medium"
                      className="is-sansSerifAlt"
                      style={{fontSize: '56px', letterSpacing: '-1px'}}
                    >
                      1 in 3
                    </Heading>
                    <Text as="p" weight="medium" variant="muted" style={{fontSize: '24px', letterSpacing: '-0.48px'}}>
                      Fortune 500 companies use GitHub Copilot
                    </Text>
                    <Text size="200" variant="muted" style={{marginTop: '28px'}}>
                      Available for business since Dec 2022
                    </Text>
                  </Box>

                  <Box
                    padding={32}
                    className="lp-Productivity-item has-BlurredBg has-GradientBorder"
                    animate="slide-in-up"
                  >
                    <Heading
                      as="h3"
                      weight="medium"
                      className="is-sansSerifAlt"
                      style={{fontSize: '56px', letterSpacing: '-1px'}}
                    >
                      55%
                    </Heading>
                    <Text as="p" weight="medium" variant="muted" style={{fontSize: '24px', letterSpacing: '-0.48px'}}>
                      Developer preference for GitHub Copilot
                    </Text>
                    <Text size="200" variant="muted" style={{marginTop: '28px'}}>
                      Stack Overflow 2023 Survey
                    </Text>
                  </Box>
                </Stack>
              </AnimationProvider>

              <Box
                padding={32}
                className="lp-Productivity-item has-BlurredBg has-GradientBorder"
                marginBlockStart={32}
                animate="slide-in-up"
              >
                <div className="p-md-6">
                  <Image
                    src="/images/modules/site/copilot/quote.svg"
                    alt=""
                    width="48"
                    height="39"
                    className="mt-3 mt-md-0 mb-6 d-block lp-pricing-quote"
                  />
                  <Text size="600" weight="medium" className="is-sansSerifAlt mb-6 d-block">
                    Personalized, natural language recommendations are now at the fingertips of all our developers at
                    Figma. Our engineers are coding faster, collaborating more effectively, and building better
                    outcomes.
                  </Text>

                  <Stack direction={{narrow: 'vertical', regular: 'horizontal'}} gap={16}>
                    <Image src="/images/modules/site/copilot/logo-framer.svg" alt="" width="33" height="48" />
                    <Stack direction="vertical" gap="none" padding="none">
                      <Text as="p" weight="medium">
                        Tommy MacWilliam
                      </Text>
                      <Text as="p" weight="medium" variant="muted" className="text-mono">
                        Engineering Manager for Infrastructure @ Figma
                      </Text>
                    </Stack>
                  </Stack>
                </div>
              </Box>
            </Grid.Column>
          </Grid>

          <Image
            src="/images/modules/site/copilot/productivity-bg-2.webp"
            alt=""
            width="600"
            height="350"
            className="lp-Productivity-bg--kite2"
          />
          <Image
            src="/images/modules/site/copilot/productivity-bg-1.webp"
            alt=""
            width="706"
            height="338"
            className="lp-Productivity-bg--kite1"
          />
          <Image
            src="/images/modules/site/copilot/productivity-bg-head.png"
            alt=""
            width="234"
            height="204"
            className="lp-Section--illu-img lp-Productivity-bg--mascot"
          />
        </section>

        <section id="features" className="lp-Section lp-Section--noBottomPadding">
          <Grid className="lp-Section-container--centerUntilMedium lp-Grid--noRowGap">
            <Grid.Column span={12}>
              <SectionIntro fullWidth className="lp-SectionIntro">
                <SectionIntro.Label size="large" className="lp-Label--section">
                  Features
                </SectionIntro.Label>
                <SectionIntro.Heading as="h2" size="1" weight="bold">
                  The AI coding assistant <br className="break-whenWide" /> elevating developer workflows.
                </SectionIntro.Heading>
              </SectionIntro>
            </Grid.Column>

            <Grid.Column span={12}>
              <RiverBreakout style={{paddingTop: '0'}}>
                <a
                  href="https://docs.github.com/en/copilot/github-copilot-chat/about-github-copilot-chat#use-cases-for-github-copilot-chat"
                  aria-label="Accelerate workflow with interactive codebase chat"
                  {...analyticsEvent({
                    action: 'chat_docs',
                    tag: 'video',
                    context: 'copilot_chat',
                    location: 'features',
                  })}
                >
                  <RiverBreakout.Visual aria-hidden="true">
                    <AutoPlayVideo
                      src="/images/modules/site/copilot/features-breakout.mp4"
                      poster="/images/modules/site/copilot/features-breakout-poster.webp"
                      width="1248"
                      height="647"
                      className="d-none d-md-block hide-reduced-motion"
                      aria-label="Video demonstrating how GitHub Copilot accelerates workflow through interactive codebase chat"
                    />
                    <AutoPlayVideo
                      src="/images/modules/site/copilot/features-breakout-sm.mp4"
                      poster="/images/modules/site/copilot/features-breakout-poster-sm.webp"
                      width="350"
                      height="380"
                      className="d-block d-md-none hide-reduced-motion"
                      aria-label="Video demonstrating how GitHub Copilot accelerates workflow through interactive codebase chat"
                    />
                    <Image
                      src="/images/modules/site/copilot/features-breakout.webp"
                      alt="Screenshot showing how GitHub Copilot accelerates workflow through interactive codebase chat"
                      width="1248"
                      height="647"
                      style={{display: 'block'}}
                      className="hide-no-pref-motion"
                    />
                  </RiverBreakout.Visual>
                </a>
                <RiverBreakout.Content
                  trailingComponent={() => (
                    <Timeline className="lp-Timeline">
                      <Timeline.Item>
                        <em>Improve code quality and security.</em> Developers feel{' '}
                        <a
                          className="lp-Link--inline"
                          href="https://github.blog/2023-10-10-research-quantifying-github-copilots-impact-on-code-quality/"
                          {...analyticsEvent({
                            action: 'code_quality_blog',
                            tag: 'link',
                            context: 'copilot_chat',
                            location: 'features',
                          })}
                        >
                          more confident in their code quality
                        </a>{' '}
                        when authoring code with GitHub Copilot. And with the built-in{' '}
                        <a
                          className="lp-Link--inline"
                          href="https://github.blog/2023-02-14-github-copilot-now-has-a-better-ai-model-and-new-capabilities/#filtering-out-security-vulnerabilities-with-a-new-ai-system"
                          {...analyticsEvent({
                            action: 'vulnerability_blog',
                            tag: 'link',
                            context: 'copilot_chat',
                            location: 'features',
                          })}
                        >
                          vulnerability prevention system
                        </a>
                        , insecure coding patterns get blocked in real time.
                      </Timeline.Item>
                      <Timeline.Item>
                        <em>Enable greater collaboration.</em> GitHub Copilot’s the newest member of your team. You can
                        ask general programming questions or very specific ones about your codebase to get answers fast,
                        learn your way around, explain a mysterious regex, or get suggestions on how to improve legacy
                        code.
                      </Timeline.Item>
                    </Timeline>
                  )}
                >
                  <Text>
                    <em>Start a conversation about your codebase.</em> Whether you’re hunting down a bug or designing a
                    new feature—when you’re stuck, ask <br className="break-whenWide" />
                    GitHub Copilot.
                  </Text>
                  <Link
                    href="https://docs.github.com/en/copilot/github-copilot-chat/about-github-copilot-chat#use-cases-for-github-copilot-chat"
                    {...analyticsEvent({
                      action: 'chat_docs',
                      tag: 'link',
                      context: 'copilot_chat',
                      location: 'features',
                    })}
                  >
                    Read about use cases for GitHub Copilot Chat
                  </Link>
                </RiverBreakout.Content>
              </RiverBreakout>

              <River imageTextRatio="60:40">
                <River.Visual aria-hidden="true">
                  <a
                    href="https://docs.github.com/en/copilot/quickstart#introduction"
                    tabIndex={-1}
                    aria-hidden="true"
                    {...analyticsEvent({
                      action: 'quickstart_docs',
                      tag: 'video',
                      context: 'ai_suggestions',
                      location: 'features',
                    })}
                  >
                    <AutoPlayVideo
                      src="/images/modules/site/copilot/features-river-1.mp4"
                      poster="/images/modules/site/copilot/features-river-1-poster.webp"
                      width="708"
                      height="472"
                      className="d-none d-md-block hide-reduced-motion"
                      aria-label="Video showing editor with GitHub Copilot code suggestions in real time"
                    />
                    <AutoPlayVideo
                      src="/images/modules/site/copilot/features-river-1-sm.mp4"
                      poster="/images/modules/site/copilot/features-river-1-poster-sm.webp"
                      width="350"
                      height="290"
                      className="d-block d-md-none hide-reduced-motion"
                      aria-label="Video showing editor with GitHub Copilot code suggestions in real time"
                    />
                    <Image
                      src="/images/modules/site/copilot/features-river-1.webp"
                      alt="Editor with GitHub Copilot code suggestions in real time"
                      width="708"
                      height="472"
                      className="hide-no-pref-motion"
                    />
                  </a>
                </River.Visual>
                <River.Content>
                  <Heading as="h3">Get AI-based suggestions in real time.</Heading>
                  <Text as="p" variant="muted" className="lp-River-text">
                    GitHub Copilot suggests code completions as developers type and turns natural language prompts into
                    coding suggestions based on the project&apos;s context and style conventions.
                  </Text>
                  <Link
                    href="https://docs.github.com/en/copilot/quickstart#introduction"
                    {...analyticsEvent({
                      action: 'quickstart_docs',
                      tag: 'link',
                      context: 'ai_suggestions',
                      location: 'features',
                    })}
                  >
                    Read the docs
                  </Link>
                </River.Content>
              </River>

              <River imageTextRatio="60:40">
                <River.Visual aria-hidden="true">
                  <a
                    href="https://docs.github.com/en/copilot/github-copilot-enterprise/copilot-docset-management/about-copilot-docset-management"
                    tabIndex={-1}
                    aria-hidden="true"
                    {...analyticsEvent({
                      action: 'docset_docs',
                      tag: 'video',
                      context: 'documentation',
                      location: 'features',
                    })}
                  >
                    <AutoPlayVideo
                      src="/images/modules/site/copilot/features-river-2.mp4"
                      poster="/images/modules/site/copilot/features-river-2-poster.webp"
                      width="708"
                      height="472"
                      className="d-none d-md-block hide-reduced-motion"
                      aria-label="Video showing GitHub Copilot and different credential sources"
                    />
                    <AutoPlayVideo
                      src="/images/modules/site/copilot/features-river-2-sm.mp4"
                      poster="/images/modules/site/copilot/features-river-2-poster-sm.webp"
                      width="350"
                      height="290"
                      className="d-block d-md-none hide-reduced-motion"
                      aria-label="Video showing GitHub Copilot and different credential sources"
                    />
                    <Image
                      src="/images/modules/site/copilot/features-river-2.webp"
                      alt="GitHub Copilot showing different credential sources"
                      width="708"
                      height="472"
                      className="hide-no-pref-motion"
                    />
                  </a>
                </River.Visual>
                <River.Content>
                  <Heading as="h3">
                    <Label color="purple-red" className="lp-Label--inRiver label-purple-green">
                      Available for Copilot Enterprise
                    </Label>
                    Docs that feel tailored for you.
                  </Heading>
                  <Text as="p" variant="muted" className="lp-River-text">
                    Spend less time searching and more time learning, by getting personalized answers that are grounded
                    in your organization’s knowledge base, with inline citations. Load content → Ask question → Profit.
                  </Text>
                  <Link
                    href="https://docs.github.com/en/copilot/github-copilot-enterprise/copilot-docset-management/about-copilot-docset-management"
                    {...analyticsEvent({
                      action: 'docset_docs',
                      tag: 'link',
                      context: 'documentation',
                      location: 'features',
                    })}
                  >
                    Read the docs
                  </Link>
                </River.Content>
              </River>

              <River imageTextRatio="60:40">
                <River.Visual aria-hidden="true">
                  <a
                    href="https://docs.github.com/en/copilot/github-copilot-enterprise/copilot-pull-request-summaries/about-copilot-pull-request-summaries"
                    tabIndex={-1}
                    aria-hidden="true"
                    {...analyticsEvent({
                      action: 'pr_docs',
                      tag: 'video',
                      context: 'documentation',
                      location: 'features',
                    })}
                  >
                    <AutoPlayVideo
                      src="/images/modules/site/copilot/features-river-3.mp4"
                      poster="/images/modules/site/copilot/features-river-3-poster.webp"
                      width="708"
                      height="472"
                      className="d-none d-md-block hide-reduced-motion"
                      aria-label="Video showing GitHub Copilot adding a summary to a pull request"
                    />
                    <AutoPlayVideo
                      src="/images/modules/site/copilot/features-river-3-sm.mp4"
                      poster="/images/modules/site/copilot/features-river-3-poster-sm.webp"
                      width="350"
                      height="290"
                      className="d-block d-md-none hide-reduced-motion"
                      aria-label="Video showing GitHub Copilot adding a summary to a pull request"
                    />
                    <Image
                      src="/images/modules/site/copilot/features-river-3.webp"
                      alt="GitHub Copilot adding a summary to a pull request"
                      width="708"
                      height="472"
                      className="hide-no-pref-motion"
                    />
                  </a>
                </River.Visual>
                <River.Content>
                  <Heading as="h3">
                    <Label color="purple-red" className="lp-Label--inRiver label-purple-green">
                      Available for Copilot Enterprise
                    </Label>
                    Pull requests that tell a story.
                  </Heading>
                  <Text as="p" variant="muted" className="lp-River-text">
                    GitHub Copilot keeps track of your work, suggests descriptions, and helps reviewers reason about
                    your changes.
                  </Text>
                  <Link
                    href="https://docs.github.com/en/copilot/github-copilot-enterprise/copilot-pull-request-summaries/about-copilot-pull-request-summaries"
                    {...analyticsEvent({
                      action: 'pr_docs',
                      tag: 'link',
                      context: 'pull_requests',
                      location: 'features',
                    })}
                  >
                    Read the docs
                  </Link>
                </River.Content>
              </River>

              <River imageTextRatio="60:40" style={{paddingBottom: '0'}}>
                <River.Visual aria-hidden="true">
                  <a href="https://github.com/marketplace?type=apps&copilot_app=true" tabIndex={-1} aria-hidden="true">
                    <AutoPlayVideo
                      src="/images/modules/site/copilot/features-river-4.mp4"
                      poster="/images/modules/site/copilot/features-river-4-poster.webp"
                      width="708"
                      height="472"
                      className="d-none d-md-block hide-reduced-motion"
                      aria-label="Video showing GitHub Copilot chat with a list of extensions"
                    />
                    <AutoPlayVideo
                      src="/images/modules/site/copilot/features-river-4-sm.mp4"
                      poster="/images/modules/site/copilot/features-river-4-poster-sm.webp"
                      width="350"
                      height="290"
                      className="d-block d-md-none hide-reduced-motion"
                      aria-label="Video showing GitHub Copilot chat with a list of extensions"
                    />
                    <Image
                      src="/images/modules/site/copilot/features-river-4.webp"
                      alt="GitHub Copilot chat showing a list of extensions"
                      width="708"
                      height="472"
                      loading="lazy"
                      className="hide-no-pref-motion"
                    />
                  </a>
                </River.Visual>
                <River.Content>
                  <Heading as="h3">
                    <Label color="purple-red" className="lp-Label--inRiver label-purple-green">
                      Limited Beta
                    </Label>
                    Your favorite tools have entered the chat.
                  </Heading>
                  <Text as="p" variant="muted" className="lp-River-text">
                    Check log errors, create feature flags, deploy apps to the cloud. Add capabilities to GitHub Copilot
                    with an ecosystem of extensions from third-party tools and services.
                  </Text>
                  <Link
                    href="https://github.com/marketplace?type=apps&copilot_app=true"
                    {...analyticsEvent({action: 'extensions', tag: 'link', context: 'tools', location: 'features'})}
                  >
                    Explore GitHub Copilot Extensions
                  </Link>
                </River.Content>
              </River>
            </Grid.Column>

            {/* Spacer */}
            <Box paddingBlockStart={{narrow: 96, regular: 128}} aria-hidden={true} />

            <Grid.Column span={12}>
              <Bento className="Bento Bento--raised">
                <Bento.Item
                  columnSpan={12}
                  rowSpan={{xsmall: 8, small: 6, medium: 5, large: 5}}
                  className="position-relative"
                >
                  <Bento.Visual>
                    <Image
                      as="picture"
                      src="/images/modules/site/copilot/features-bento-5.webp"
                      className="position-absolute top-0 left-0 width-100 height-100 lp-Features-bento-5-image"
                      sources={[
                        {
                          srcset: '/images/modules/site/copilot/features-bento-5-sm.webp',
                          media: '(max-width: 767px)',
                        },
                        {
                          srcset: '/images/modules/site/copilot/features-bento-5.webp',
                          media: '(min-width: 768px)',
                        },
                      ]}
                      alt=""
                    />
                  </Bento.Visual>
                  <Bento.Content
                    padding={{xsmall: 'normal', xlarge: 'spacious'}}
                    className="lp-Features-bento-5-content position-relative"
                  >
                    <Bento.Heading as="h3" size="5" weight="semibold">
                      <Label className="lp-Label--inBento">Coming soon as an add-on</Label>
                      Prefer bespoke? Fine-tune a private, custom model that suggests code based on the best practices
                      and patterns in your repositories.
                    </Bento.Heading>
                  </Bento.Content>
                </Bento.Item>

                <Bento.Item
                  columnSpan={{xsmall: 12, medium: 7}}
                  rowSpan={{xsmall: 5, medium: 5, large: 5, xlarge: 6}}
                  visualAsBackground
                >
                  <Bento.Content padding={{xsmall: 'normal', xlarge: 'spacious'}} verticalAlign="start">
                    <Bento.Heading as="h3" size="4" weight="semibold">
                      Ask for assistance right in your terminal.
                    </Bento.Heading>
                    <Link
                      href="https://docs.github.com/copilot/github-copilot-in-the-cli"
                      size="large"
                      variant="default"
                      {...analyticsEvent({action: 'cli_docs', tag: 'link', context: 'terminal', location: 'features'})}
                    >
                      Try Copilot in the CLI
                    </Link>
                  </Bento.Content>
                  <Bento.Visual position="0% 50%">
                    <Image
                      src="/images/modules/site/copilot/features-bento-1-cli-ga.webp"
                      alt="Screenshot of GitHub Copilot CLI in a terminal"
                      width="724"
                      height="620"
                      className="lp-Features-bento-1-visual object-pos-left-bottom"
                    />
                  </Bento.Visual>
                </Bento.Item>

                <Bento.Item
                  columnSpan={{xsmall: 12, medium: 5}}
                  rowSpan={{xsmall: 5, medium: 5, large: 5, xlarge: 6}}
                  className="Bento-item"
                >
                  <Bento.Content padding={{xsmall: 'normal', xlarge: 'spacious'}} horizontalAlign="center">
                    <Bento.Heading as="h3" size="4" weight="semibold">
                      Keep flying with your favorite editor.
                    </Bento.Heading>
                  </Bento.Content>
                  <Bento.Visual
                    padding={{xsmall: 'normal', xlarge: 'spacious'}}
                    fillMedia={false}
                    className="lp-Features-editorContainer"
                  >
                    <Button
                      as="a"
                      href="https://marketplace.visualstudio.com/items?itemName=GitHub.copilot"
                      hasArrow={false}
                      className="lp-Features-editorButton"
                      {...analyticsEvent({action: 'vscode', tag: 'icon', context: 'editors', location: 'features'})}
                    >
                      <Image
                        src="/images/modules/site/copilot/features-bento-2-vscode.svg"
                        alt=""
                        width="90"
                        height="90"
                      />
                      <Text as="div" size="200" weight="normal">
                        VS Code
                      </Text>
                    </Button>

                    <Button
                      as="a"
                      href="https://docs.github.com/copilot/getting-started-with-github-copilot?tool=vimneovim"
                      hasArrow={false}
                      className="lp-Features-editorButton"
                      {...analyticsEvent({action: 'neovim', tag: 'icon', context: 'editors', location: 'features'})}
                    >
                      <Image
                        src="/images/modules/site/copilot/features-bento-2-neovim.svg"
                        alt=""
                        width="90"
                        height="90"
                      />
                      <Text as="div" size="200" weight="normal">
                        Neovim
                      </Text>
                    </Button>

                    <Button
                      as="a"
                      href="https://marketplace.visualstudio.com/items?itemName=GitHub.copilotvs"
                      hasArrow={false}
                      className="lp-Features-editorButton"
                      {...analyticsEvent({action: 'vs', tag: 'icon', context: 'editors', location: 'features'})}
                    >
                      <Image
                        src="/images/modules/site/copilot/features-bento-2-visualstudio.svg"
                        alt=""
                        width="90"
                        height="90"
                      />
                      <Text as="div" size="200" weight="normal">
                        Visual Studio
                      </Text>
                    </Button>

                    <Button
                      as="a"
                      href="https://plugins.jetbrains.com/plugin/17718-github-copilot"
                      hasArrow={false}
                      className="lp-Features-editorButton"
                      {...analyticsEvent({action: 'jetbrains', tag: 'icon', context: 'editors', location: 'features'})}
                    >
                      <Image
                        src="/images/modules/site/copilot/features-bento-2-jetbrains.svg"
                        alt=""
                        width="90"
                        height="90"
                      />
                      <Text as="div" size="200" weight="normal">
                        JetBrains IDEs
                      </Text>
                    </Button>
                  </Bento.Visual>
                </Bento.Item>

                <Bento.Item
                  columnSpan={{xsmall: 12, medium: 5, large: 5, xlarge: 5}}
                  rowSpan={{xsmall: 4, small: 4, medium: 4, xlarge: 5}}
                  className="Bento-item"
                >
                  <Bento.Content
                    horizontalAlign={{xsmall: 'center', large: 'start'}}
                    padding={{xsmall: 'normal', xlarge: 'spacious'}}
                    leadingVisual={<DeviceMobileIcon />}
                    className="lp-Features-mobile"
                  >
                    <Bento.Heading as="h3" size="4" weight="semibold" className="lp-Features-mobileText">
                      Now Available: Chat with your favorite AI pair programmer on the go.
                    </Bento.Heading>
                  </Bento.Content>
                  <Bento.Visual
                    padding={{xsmall: 'normal', xlarge: 'spacious'}}
                    fillMedia={false}
                    horizontalAlign="center"
                    verticalAlign="end"
                    style={{columnGap: '24px', flexWrap: 'wrap'}}
                  >
                    <a
                      href="https://play.google.com/store/apps/details?id=com.github.android"
                      {...analyticsEvent({
                        action: 'play_store',
                        tag: 'button',
                        context: 'mobile_apps',
                        location: 'features',
                      })}
                    >
                      <Image
                        src="/images/modules/site/copilot/features-bento-4-google.png"
                        alt="Google Play Store logo"
                        width="180"
                        height="53"
                        style={{display: 'block'}}
                      />
                    </a>
                    <a
                      href="https://apps.apple.com/app/github/id1477376905?ls=1"
                      {...analyticsEvent({
                        action: 'app_store',
                        tag: 'button',
                        context: 'mobile_apps',
                        location: 'features',
                      })}
                    >
                      <Image
                        src="/images/modules/site/copilot/features-bento-4-apple.png"
                        alt="Apple App Store logo"
                        width="179"
                        height="53"
                        style={{display: 'block'}}
                      />
                    </a>
                  </Bento.Visual>
                </Bento.Item>

                <Bento.Item
                  columnSpan={{xsmall: 12, medium: 7, large: 7, xlarge: 7}}
                  rowSpan={{xsmall: 4, small: 3, medium: 4, xlarge: 5}}
                >
                  <Bento.Visual position="25% 0%">
                    <Image
                      src="/images/modules/site/copilot/features-bento-3-chat-ga.webp"
                      alt="A phone showing GitHub Copilot in GitHub Mobile"
                      width="724"
                      height="560"
                    />
                  </Bento.Visual>
                </Bento.Item>
              </Bento>
            </Grid.Column>
          </Grid>
        </section>

        <section id="pricing" className="lp-Section lp-Section--pricing" ref={sectionPricingRef}>
          <Image
            as="picture"
            src="/images/modules/site/copilot/pricing-gradient.jpg"
            className="position-absolute top-0 left-0 width-100 height-100"
            sources={[
              {
                srcset: '/images/modules/site/copilot/pricing-gradient-sm.jpg',
                media: '(max-width: 767px)',
              },
              {
                srcset: '/images/modules/site/copilot/pricing-gradient.jpg',
                media: '(min-width: 768px) and (max-width: 1279px)',
              },
              {
                srcset: '/images/modules/site/copilot/pricing-gradient-lg.jpg',
                media: '(min-width: 1280px)',
              },
            ]}
            alt=""
          />
          <PricingCards
            copilotSignupPath={
              loginVariant === 'login' || loginVariant === undefined ? copilotSignupPath : variantCopilotSignupPath
            }
            copilotForBusinessSignupPath={copilotForBusinessSignupPath}
            copilotContactSalesPath={copilotContactSalesPath}
          />
        </section>

        <section className="lp-Section pt-0 pb-0">
          <PricingTable
            copilotSignupPath={copilotSignupPath}
            copilotForBusinessSignupPath={copilotForBusinessSignupPath}
            copilotContactSalesPath={copilotContactSalesPath}
          />
        </section>

        <section id="resources" className="lp-Section lp-Section--compact">
          <Grid className="lp-Section-container--centerUntilMedium lp-Grid--noRowGap">
            <Grid.Column span={12}>
              <SectionIntro fullWidth className="lp-SectionIntro">
                <SectionIntro.Heading size="3">Get the most out of GitHub Copilot.</SectionIntro.Heading>
              </SectionIntro>

              <Stack
                direction={{narrow: 'vertical', regular: 'horizontal', wide: 'horizontal'}}
                gap="normal"
                padding="none"
              >
                <div className="lp-Resources-card">
                  <Card
                    ctaText="Explore GitHub Expert Services"
                    href="https://github.com/services/"
                    {...analyticsEvent({
                      action: 'services',
                      tag: 'link',
                      context: 'consulting_card',
                      location: 'additional_resources',
                    })}
                  >
                    <Card.Icon icon={<PeopleIcon />} color="purple" hasBackground />
                    <Card.Heading>Hands-on consulting, guided workshops, and training.</Card.Heading>
                    <Card.Description>
                      Insights, best practices, and knowledge to help you adopt GitHub quickly and efficiently.
                    </Card.Description>
                  </Card>
                </div>

                <div className="lp-Resources-card">
                  <Card
                    ctaText="Read customer stories"
                    href="https://github.com/customer-stories"
                    {...analyticsEvent({
                      action: 'stories',
                      tag: 'link',
                      context: 'meet_companies_card',
                      location: 'additional_resources',
                    })}
                  >
                    <Card.Icon icon={<BookIcon />} color="purple" hasBackground />
                    <Card.Heading>Meet the companies who build with GitHub.</Card.Heading>
                    <Card.Description>
                      Leading organizations choose GitHub to plan, build, secure and ship software.
                    </Card.Description>
                  </Card>
                </div>

                <div className="lp-Resources-card">
                  <Card
                    ctaText="Read blog"
                    href="https://github.blog/"
                    {...analyticsEvent({
                      action: 'blog',
                      tag: 'link',
                      context: 'latest_trends_card',
                      location: 'additional_resources',
                    })}
                  >
                    <Card.Icon icon={<BookIcon />} color="purple" hasBackground />
                    <Card.Heading>Keep up with the latest on GitHub and trends in AI.</Card.Heading>
                    <Card.Description>
                      Check out the GitHub blog for tips, technical guides, best practices, and more.
                    </Card.Description>
                  </Card>
                </div>
              </Stack>
            </Grid.Column>
          </Grid>
        </section>

        {/* FAQGroup content is managed through Contentful: */}
        {isFeatureCopilotPage(page) && (
          <section id="faq" className="lp-Section lp-Section--level-1">
            <Grid>
              <Grid.Column span={12} className="lp-FAQs">
                <ContentfulFaqGroup component={page.fields.template.fields.faqGroup} />
              </Grid.Column>
            </Grid>
          </section>
        )}

        <section id="footnotes" className="lp-Section lp-Section--level-1" style={{paddingTop: '0'}}>
          <Grid className="lp-Grid--noRowGap">
            <Grid.Column span={12}>
              <OrderedList>
                <OrderedList.Item className="lp-Footnotes-item">
                  <a
                    className="lp-Link--inline"
                    href="https://docs.github.com/en/enterprise-cloud@latest/authentication/authenticating-with-saml-single-sign-on/about-authentication-with-saml-single-sign-on"
                  >
                    Authentication with SAML single sign-on (SSO)
                  </a>{' '}
                  available for organizations using GitHub Enterprise Cloud.
                </OrderedList.Item>
              </OrderedList>
            </Grid.Column>
          </Grid>
        </section>
      </ThemeProvider>
    </>
  )
}

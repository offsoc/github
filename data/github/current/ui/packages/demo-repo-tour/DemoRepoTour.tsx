// Some documentations, gotchas, etc: https://github.com/github/flywheel/discussions/185
//
// See how this was used in flywheel: https://github.com/github/github/pull/306013
//
// Pay special attention to:
//  * DemoRepoProps Ruby class. Used for generating the list of steps passed to the component
//  * app/views/comments/_title.html.erb which shows how to use the js classes and `flywheel-return-to-tour` component
//    for keyboard accessibile navigation
import {Link, Octicon, Text, Heading, Button, Box, Label, useResizeObserver} from '@primer/react'
import {testIdProps} from '@github-ui/test-id-props'
import {CheckIcon, CheckCircleFillIcon, CircleIcon, ChevronDownIcon} from '@primer/octicons-react'
import {useNavigate} from '@github-ui/use-navigate'
import {useClickAnalytics} from '@github-ui/use-analytics'
import {AnalyticsProvider} from '@github-ui/analytics-provider'
import {useLocalStorage} from '@github-ui/use-safe-storage/local-storage'
import {useEffect, useState, useCallback, useRef} from 'react'
import {type SafeHTMLString, SafeHTMLText} from '@github-ui/safe-html'
import styled, {keyframes} from 'styled-components'

const BottomPulseAnimation = keyframes`
    0% {
      transform: scale(1);
      opacity: .2;
    }
    50% {
      transform: scale(4);
      opacity: .2;
    }
    100% {
      transform: scale(4);
      opacity: 0;
    }
}
`

const TopPulseAnimation = keyframes`
    0% {
      transform: scale(1);
      opacity: .5;
    }
    50% {
      opacity: .5;
      transform: scale(3);
    }
    100% {
      transform: scale(4);
      opacity: 0;
    }
}
`

const TopPulse = styled.circle`
  animation: ${TopPulseAnimation} 2s infinite;
  transform-origin: center center;
  fill: var(--display-green-bgColor-muted, var(--color-scale-green-2));
  animation-timing-function: linear;
`

const BottomPulse = styled.circle`
  animation: ${BottomPulseAnimation} 2s infinite;
  transform-origin: center center;
  fill: var(--display-green-bgColor-muted, var(--color-scale-green-2));
`

export interface DemoRepoTourProps {
  tour_steps: TourStep[]
  upgrade_cta_path: string
  referral_organization_id: number | null
  repository_name: string
}

export interface TourStep {
  title: string
  description: string
  key: string
  path: string
  called_out_element_css_class: string | null
}

export function DemoRepoTour(props: DemoRepoTourProps) {
  return (
    // To use the `useAnalytics` package the function/component must be wrapped in an `AnalyticsProvider`.
    // The wrapping must be done around the component or else the component will fail to load. So
    // we have this simple function that wraps the main tour UI in an `AnalyticsProvider`.
    <AnalyticsProvider appName={'flywheel_demo_repo_tour'} category="" metadata={{}}>
      <DemoRepoTourContent {...props} />
    </AnalyticsProvider>
  )
}

function DemoRepoTourContent(props: DemoRepoTourProps) {
  const visitedStepsKey = `demo-tour-visited-steps-${props.repository_name}`
  const calloutOffsetWidth = 50
  const upgradeCtaPath = props.upgrade_cta_path
  const referralOrganizationId = `${props.referral_organization_id}`
  const [TourCalloutStyles, setTourCalloutStyles] = useState({top: 0, left: 0, display: 'none'})
  const [visitedSteps, setVisitedSteps] = useLocalStorage<string[]>(visitedStepsKey, [])
  const [currentStepKey, setCurrentStepKey] = useState<string | null>()
  const [isMinimized, setIsMinimized] = useLocalStorage<boolean>('demo-tour-is-minimized', false)
  const navigate = useNavigate()
  const {sendClickAnalyticsEvent} = useClickAnalytics()
  const smallScreenMarginPercent = 3
  const smallScreenWidthPercent = 100 - smallScreenMarginPercent * 2
  const TourWrapper = useRef<HTMLDivElement | null>(null)

  const recordTourStepVisited = useCallback(
    (step_key: string, newStepKeys: string[]) => {
      sendClickAnalyticsEvent({
        category: 'flywheel_repo_tour_step_clicks',
        referral_organization_id: referralOrganizationId,
        action: `${step_key}_clicked`,
      })

      // If all tour steps have now been visited
      if (newStepKeys.length === props.tour_steps.length) {
        sendClickAnalyticsEvent({
          category: 'flywheel_repo_tour_completions',
          referral_organization_id: referralOrganizationId,
          action: 'final_step_clicked',
        })
      }
    },
    [props.tour_steps.length, referralOrganizationId, sendClickAnalyticsEvent],
  )

  const setupCallout = useCallback((selectedTourStep: TourStep) => {
    const calledOutElement = document.querySelector(`.${selectedTourStep.called_out_element_css_class}`) as HTMLElement

    if (calledOutElement) {
      // Must use getBoundingClientRect() because offsetTop/Left is relative to the parent's position and we need
      // the absolute position
      const boundingRect = calledOutElement.getBoundingClientRect()

      const isOutsideViewport = boundingRect.bottom > window.innerHeight
      if (isOutsideViewport) {
        calledOutElement.scrollIntoView({behavior: 'smooth'})
      }
      setTourCalloutStyles({
        // Must add window scroll since the bounding rect is relative to the viewport
        top: boundingRect.y + window.scrollY + boundingRect.height / 2, // center the callout vertically
        left: boundingRect.x + window.scrollX - calloutOffsetWidth,
        display: 'block',
      })
    } else {
      setTourCalloutStyles(previous => ({...previous, display: 'none'}))
    }
  }, [])

  // Return focus to the Tour UI when a keyboard user clicks a `<flywheel-return-to-tour>` link
  useEffect(() => {
    const handleReturnToTour = () => {
      if (TourWrapper.current) {
        TourWrapper.current.focus()
      }
    }

    document.addEventListener('return-to-flywheel-tour', handleReturnToTour)

    return () => {
      document.removeEventListener('return-to-flywheel-tour', handleReturnToTour)
    }
  }, [])

  useEffect(() => {
    // We need to set the visited tour steps in a separate effect otherwise
    // there are race conditions between setting the current tour step and updating
    // visited tour steps. So this effect runs *after* the current tour step is set.
    if (currentStepKey) {
      if (!visitedSteps.includes(currentStepKey)) {
        const newTourStepKeys = [...visitedSteps, currentStepKey]
        recordTourStepVisited(currentStepKey, newTourStepKeys)
        setVisitedSteps(newTourStepKeys)
      }
    }
  }, [currentStepKey, visitedSteps, recordTourStepVisited, setVisitedSteps])

  useEffect(() => {
    // React won't let us use `window` outside of `useEffect`. We also can't update a variable outside the scope
    // of `useEffect` without `useRef` or `useState`. So in the effect we check the current path and set the current
    // tour step if it matches the path.
    //
    // It is possible we could clean this up when this `useLocation` bug is fixed:
    //   https://github.com/github/web-systems/issues/1683
    const setupCurrentTourStep = () => {
      const selectedTourStep = props.tour_steps.find(tourStep => {
        return tourStep.path === window.location.pathname
      })

      if (selectedTourStep) {
        setCurrentStepKey(selectedTourStep.key)
        setupCallout(selectedTourStep)
      } else if (visitedSteps.length > 0) {
        // If some tour steps have been visited, but we're not currently on the
        // page for one of the tour steps, then don't show a selected tour step.
        setCurrentStepKey(null)
        setTourCalloutStyles(previous => ({...previous, display: 'none'}))
      }
    }

    setupCurrentTourStep()

    document.addEventListener('turbo:load', () => {
      setupCurrentTourStep()
    })
  }, [props.tour_steps, setupCallout, visitedSteps])

  // If the window is resized we need to reposition the callout
  useResizeObserver(() => {
    const selectedTourStep = props.tour_steps.find(tourStep => tourStep.key === currentStepKey)
    if (!selectedTourStep) return
    setupCallout(selectedTourStep)
  })

  return (
    <>
      <Box
        className="rounded"
        ref={TourWrapper}
        id="flywheel-github-team-tour"
        tabIndex={-1}
        sx={{
          bg: 'canvas.default',
          position: 'fixed',
          width: [`${smallScreenWidthPercent}%`, '450px'],
          bottom: 0,
          right: 0,
          boxShadow: 'shadow.large',
          border: '1px solid',
          borderColor: 'border.default',
          m: [`${smallScreenMarginPercent}%`, 5],
          overflow: 'hidden',
          zIndex: 100,
        }}
      >
        <div style={{backgroundImage: 'linear-gradient(to left, #79C0FF, #56D364)', height: '4px', width: '100%'}} />
        <Box sx={{display: ['none', 'block']}}>
          {!isMinimized && <TourChecklist />}
          {isMinimized && <MinimizedTourBox />}
        </Box>
        <SmallScreenNotice />
      </Box>
      <TourCallout />
    </>
  )

  function TourCallout() {
    const display = isMinimized ? 'none' : TourCalloutStyles.display
    return (
      <Box
        sx={{
          display,
          position: 'absolute',
          zIndex: 99,
          pointerEvents: 'none',
          // Center the callout vertically
          transform: 'translate(0, -50%)',
          top: `${TourCalloutStyles.top}px`,
          left: `${TourCalloutStyles.left}px`,
          color: 'accent.emphasis',
          mt: 1,
        }}
      >
        <PulsingOrb />
      </Box>
    )
  }

  function PulsingOrb() {
    return (
      <svg
        viewBox="0 0 90 90"
        fill="var(--display-green-bgColor-emphasis, var(--color-scale-green-5))"
        height="70"
        width="70"
        aria-hidden="true"
        style={{pointerEvents: 'none'}}
      >
        <BottomPulse cx="50%" cy="50%" r="10" />
        <TopPulse cx="50%" cy="50%" r="10" />
        <circle cx="50%" cy="50%" r="9" />
      </svg>
    )
  }

  function TourChecklist() {
    return (
      <>
        <Box sx={{p: 3}} {...testIdProps('tour-checklist')}>
          <Heading sx={{fontSize: 2, mb: 0, display: 'flex', justifyContent: 'space-between'}} as="h2">
            <span style={{display: 'flex', alignItems: 'center'}}>
              GitHub Team feature tour{' '}
              <Label variant="success" sx={{mx: 2}}>
                Alpha
              </Label>
              <Link
                href="https://gh.io/github-team-demo-feedback"
                target="_blank"
                sx={{fontWeight: 'normal', fontSize: 0}}
                underline
              >
                Feedback
              </Link>
            </span>
            <Button
              onClick={() => setIsMinimized(true)}
              variant="invisible"
              size="small"
              {...testIdProps('minimize-tour-button')}
            >
              <Octicon aria-label="Minimize feature tour" icon={ChevronDownIcon} sx={{color: 'fg.muted'}} />
            </Button>
          </Heading>
          <Heading sx={{fontSize: 1, mb: 3, color: 'fg.muted', fontWeight: 'normal'}} as="h3">
            Explore advanced collaboration features for growing teams
          </Heading>
          <ol className="list-style-none" aria-label="List of features in the demo repo tour">
            {props.tour_steps.map((step, index) => (
              <TourListItem key={step.key} step={step} nextStepKey={props.tour_steps[index + 1]?.key} />
            ))}
          </ol>
        </Box>
        <ReadyToUpgradeComponent />
      </>
    )
  }

  function MinimizedTourBox() {
    return (
      <Box sx={{p: 3}} {...testIdProps('minimized-tour')}>
        <Heading sx={{fontSize: 2, mb: 2}} as="h2">
          GitHub Team feature tour
        </Heading>
        <Text as="p" sx={{color: 'fg.muted', mb: 3}}>
          Take a tour of the top features you get when you upgrade to a team plan. Try out the advanced GitHub Team
          features available in both public and private repositories.
        </Text>
        <Button
          variant="primary"
          autoFocus
          onClick={() => setIsMinimized(false)}
          {...testIdProps('resume-tour-button')}
        >
          Resume tour
        </Button>
      </Box>
    )
  }

  function SmallScreenNotice() {
    return (
      <Box sx={{display: ['block', 'none']}}>
        <Box sx={{p: 3}}>
          <Heading sx={{fontSize: 2, mb: 2}} as="h2">
            GitHub Team feature tour is available on larger screens
          </Heading>
          <Text as="p" sx={{color: 'fg.muted', mb: 3}}>
            Previewing GitHub team features is not available on mobile.
          </Text>
        </Box>
        <ReadyToUpgradeComponent />
      </Box>
    )
  }

  function ReadyToUpgradeComponent() {
    return (
      <Box sx={{bg: 'canvas.subtle', p: 3, borderTop: '1px solid', borderColor: 'border.default'}}>
        {!isTourCompleted() && <InitialCallToAction />}
        {isTourCompleted() && <ExpandedCallToAction />}
      </Box>
    )
  }

  function InitialCallToAction() {
    return (
      <Text sx={{color: 'fg.subtle'}}>
        Ready to upgrade your organization?{' '}
        <Link href={upgradeCtaPath} onClick={recordClickedUpradeCTA} inline>
          Upgrade to GitHub Team
        </Link>
      </Text>
    )
  }

  // When all tour steps have been visited we show an expanded final call to action
  function ExpandedCallToAction() {
    return (
      <span>
        <Heading sx={{fontSize: 1, mb: 3}} as="h3">
          In addition,{' '}
          <Link href="https://github.com/pricing" target="_blank" inline>
            GitHub Team
          </Link>{' '}
          includes:
        </Heading>

        <ul className="list-style-none">
          <CallToActionListItem message="3,000 GitHub Actions minutes per month" />
          <CallToActionListItem message="Code owners" />
          <CallToActionListItem message="Scheduled reminders" />
          <CallToActionListItem message="Wikis, GitHub Pages, and more" />
        </ul>

        <Button as="a" href={upgradeCtaPath} variant="primary" sx={{mt: 2}} onClick={recordClickedUpradeCTA}>
          Upgrade to GitHub Team
        </Button>
        <Link as="button" sx={{fontWeight: 'bold', ml: 3}} onClick={restartTour} underline>
          Restart tour
        </Link>
      </span>
    )
  }

  function recordClickedUpradeCTA() {
    sendClickAnalyticsEvent({
      category: 'flwheel_repo_tour_cta',
      referral_organization_id: referralOrganizationId,
      action: 'upgrade_cta_clicked',
    })
  }

  function restartTour() {
    sendClickAnalyticsEvent({
      category: 'flwyheel_repo_tour_restarts',
      referral_organization_id: referralOrganizationId,
      action: 'restart_tour_clicked',
    })

    const firstKey = props.tour_steps[0]!.key
    localStorage.removeItem(visitedStepsKey)
    visitTourStep(firstKey)
  }

  function CallToActionListItem({message}: {message: string}) {
    return (
      <li>
        <Box sx={{display: 'flex', mb: 0, color: 'fg.subtle'}}>
          <Box sx={{height: '18px', mr: 2, display: 'flex', alignItems: 'center'}}>
            <Octicon aria-label="To do" icon={CheckIcon} sx={{color: 'fg.subtle'}} />
          </Box>
          <p>{message}</p>
        </Box>
      </li>
    )
  }

  function isTourCompleted() {
    return visitedSteps.length >= props.tour_steps.length
  }

  function TourListItem({step, nextStepKey: nextTourStepKey}: {step: TourStep; nextStepKey?: string}) {
    const {key, title, description} = step
    const selected = currentStepKey === key
    const checked = visitedSteps.includes(key)

    return (
      <li>
        <Box sx={{display: 'flex', mb: 0}} key={key} {...testIdProps(`tour-step-${key}`)}>
          <Link
            as="button"
            sx={{height: '24px', mr: 2, display: 'flex', alignItems: 'center'}}
            aria-label={`Visit tour feature: ${title}`}
            onClick={() => visitTourStep(key)}
          >
            <TourCheckIcon checked={checked} stepTitle={title} />
          </Link>
          <div>
            <Text as="p" sx={{fontWeight: 'bold'}}>
              <Link
                as="button"
                muted
                sx={{color: selected ? 'fg.default' : 'fg.muted'}}
                onClick={() => visitTourStep(key)}
              >
                {title}
              </Link>
            </Text>
            {selected && (
              <Box sx={{mb: 3}}>
                <SafeHTMLText html={description as SafeHTMLString} as="p" sx={{color: 'fg.muted'}} />
                <Link
                  as="button"
                  sx={{
                    position: 'absolute',
                    left: '-10000px',
                    top: 'auto',
                    width: '1px',
                    height: '1px',
                    overflow: 'hidden',
                    ':focus': {
                      position: 'static',
                      width: 'auto',
                      height: 'auto',
                    },
                  }}
                  onClick={() => focusOnCalledOutSection(step)}
                >
                  Focus &apos;{title}&apos; on the page
                </Link>
                {nextTourStepKey && (
                  <Button
                    size="small"
                    aria-label="View next feature in the tour"
                    onClick={() => visitTourStep(nextTourStepKey)}
                    {...testIdProps('next-button')}
                  >
                    Next
                  </Button>
                )}
              </Box>
            )}
          </div>
        </Box>
      </li>
    )
  }

  function focusOnCalledOutSection(step: TourStep) {
    // Unhide accessibility skip link
    const returnToTourElements = document.querySelectorAll<HTMLElement>('.js-flywheel-return-to-tour')

    for (const element of returnToTourElements) {
      element.hidden = false
    }

    const calledOutElement = document.querySelector(`.${step.called_out_element_css_class}`) as HTMLElement
    if (calledOutElement) {
      // Make sure the element is focusable
      !calledOutElement.hasAttribute('tabindex') && calledOutElement.setAttribute('tabindex', '-1')
      calledOutElement.focus()
    }
  }

  function TourCheckIcon({checked, stepTitle}: {checked: boolean; stepTitle: string}): JSX.Element {
    if (checked === true) {
      return <Octicon aria-label={`Completed: ${stepTitle}`} icon={CheckCircleFillIcon} sx={{color: 'success.fg'}} />
    } else {
      return <Octicon aria-label={`To do: ${stepTitle}`} icon={CircleIcon} sx={{color: 'fg.subtle'}} />
    }
  }

  function visitTourStep(key: string) {
    const currentStep = props.tour_steps.find(tourStep => tourStep.key === key)
    navigate(currentStep?.path || '')
  }
}

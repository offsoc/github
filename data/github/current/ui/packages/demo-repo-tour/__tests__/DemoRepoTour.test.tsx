import {within, fireEvent, screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {DemoRepoTour, type TourStep} from '../DemoRepoTour'
import {getDemoRepoTourProps} from '../test-utils/mock-data'
import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'

const navigateFn = jest.fn()
jest.mock('@github-ui/use-navigate', () => {
  return {
    useNavigate: () => navigateFn,
  }
})

const visitedStepsKey = 'demo-tour-visited-steps-fake-repo'

beforeEach(() => {
  localStorage.clear()
})

beforeEach(navigateFn.mockClear)

test('Tour shows the correct step based on the current path and marks it as visited', () => {
  const props = getDemoRepoTourProps()
  const tourSteps = props.tour_steps
  mockPath(tourSteps[0]!.path)
  expect(localStorage.getItem(visitedStepsKey)).toBeNull()

  render(<DemoRepoTour {...props} />)

  expect(screen.getByTestId('tour-checklist')).toBeInTheDocument()
  expect(getStep(tourSteps[0]!)).toHaveTextContent(props.tour_steps[0]!.description)
  expect(getStep(tourSteps[1]!)).not.toHaveTextContent(props.tour_steps[1]!.description)
  // Check that we save the step was visited
  expect(JSON.parse(localStorage.getItem(visitedStepsKey)!)).toEqual([props.tour_steps[0]!.key])
  // Make sure we recorded the step was visited
  const referralOrganizationId = `${props.referral_organization_id}`
  expectAnalyticsEvents({
    type: 'analytics.click',
    data: {
      category: 'flywheel_repo_tour_step_clicks',
      referral_organization_id: referralOrganizationId,
      action: `${props.tour_steps[0]!.key}_clicked`,
    },
  })
})

test('Can click "Next" to go to the next step if there is a next step', () => {
  const props = getDemoRepoTourProps()
  const tourSteps = props.tour_steps
  mockPath(tourSteps[0]!.path)

  render(<DemoRepoTour {...props} />)

  fireEvent.click(within(getStep(tourSteps[0]!)).getByTestId('next-button'))
  expectToHaveVisited(tourSteps[1]!.path)
})

test('"Next" is not shown if on the last step', () => {
  const props = getDemoRepoTourProps()
  const tourSteps = props.tour_steps
  const lastStep = tourSteps[tourSteps.length - 1]!
  mockPath(lastStep.path) // Go to last step

  render(<DemoRepoTour {...props} />)

  expect(within(getStep(lastStep)).queryByTestId('next-button')).not.toBeInTheDocument()
})

test('"Send tour completion event if visiting the last step', () => {
  const props = getDemoRepoTourProps()
  const tourSteps = props.tour_steps
  // Set that we visited just the first step
  localStorage.setItem(visitedStepsKey, JSON.stringify([tourSteps[0]!.key]))
  // And we are now visiting the final step
  mockPath(tourSteps[1]!.path)

  render(<DemoRepoTour {...props} />)

  const referralOrganizationId = `${props.referral_organization_id}`
  expectAnalyticsEvents(
    {
      type: 'analytics.click',
      data: {
        category: 'flywheel_repo_tour_step_clicks',
        referral_organization_id: referralOrganizationId,
        action: `${props.tour_steps[1]!.key}_clicked`,
      },
    },
    {
      type: 'analytics.click',
      data: {
        category: 'flywheel_repo_tour_completions',
        referral_organization_id: referralOrganizationId,
        action: 'final_step_clicked',
      },
    },
  )
})

test('Tour can be minimized and resumed', () => {
  const props = getDemoRepoTourProps()
  mockPath(props.tour_steps[0]!.path) // Need to have started the tour for the minimize button to show up
  render(<DemoRepoTour {...props} />)

  fireEvent.click(screen.getByTestId('minimize-tour-button'))
  expect(screen.queryByTestId('tour-checklist')).not.toBeInTheDocument()
  expect(screen.getByTestId('minimized-tour')).toBeInTheDocument()

  fireEvent.click(screen.getByTestId('resume-tour-button'))
  expect(screen.getByTestId('tour-checklist')).toBeInTheDocument()
  expect(screen.queryByTestId('minimized-tour')).not.toBeInTheDocument()
})

function getStep(step: TourStep) {
  return screen.getByTestId(`tour-step-${step.key}`)
}

function mockPath(path: string) {
  navigateFn.mockImplementationOnce(() => path)
  Object.defineProperty(window, 'location', {
    get() {
      return {pathname: path}
    },
  })
}

function expectToHaveVisited(path: string) {
  expect(navigateFn).toHaveBeenCalledWith(path)
}

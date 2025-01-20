import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'

import {GitHubHostedRunners, type GitHubHostedRunnersProps} from '../components/GitHubHostedRunners'
import {useRunners} from '../hooks/use-runners'
import {getRunnersPayload} from '../test-utils/mock-data'

jest.mock('../hooks/use-runners', () => ({
  useRunners: jest.fn(),
}))

// Mock the following properties to avoid focus errors for ListView
beforeAll(() => {
  Object.defineProperties(HTMLElement.prototype, {
    offsetHeight: {get: () => 42},
    offsetWidth: {get: () => 42},
    getClientRects: {get: () => () => [42]},
    offsetParent: {get: () => true},
  })
})

function getGitHubHostedRunnersProps(): GitHubHostedRunnersProps {
  return {
    fetchRunnersBasePath: '/github/hub/actions/runners',
    setUpRunnersLink: '/organizations/github/settings/actions/runners',
  }
}

function renderGitHubHostedRunners(props: GitHubHostedRunnersProps) {
  render(<GitHubHostedRunners {...props} />)
}

test('Renders GitHubHostedRunners', () => {
  ;(useRunners as jest.Mock).mockImplementation(() => ({
    runnersResponse: getRunnersPayload('github-hosted'),
    isLoading: false,
    error: false,
  }))

  renderGitHubHostedRunners(getGitHubHostedRunnersProps())

  expect(screen.getByTestId('github-hosted-runners')).toBeInTheDocument()
  expect(screen.getByTestId('github-hosted-runners')).toHaveAttribute('data-hpc')
})

test('Renders LargerRunnerListItem when showLargerRunnerBanner is true', () => {
  ;(useRunners as jest.Mock).mockImplementation(() => ({
    runnersResponse: {...getRunnersPayload('github-hosted'), showLargerRunnerBanner: true},
    isLoading: false,
    error: false,
  }))

  renderGitHubHostedRunners(getGitHubHostedRunnersProps())

  expect(screen.getByTestId('larger-runner-list-item')).toBeInTheDocument()
})

test('Does not render LargerRunnerListItem when showLargerRunnerBanner is false', () => {
  ;(useRunners as jest.Mock).mockImplementation(() => ({
    runnersResponse: {...getRunnersPayload('github-hosted'), showLargerRunnerBanner: false},
    isLoading: false,
    error: false,
  }))

  renderGitHubHostedRunners(getGitHubHostedRunnersProps())

  expect(screen.queryByTestId('larger-runner-list-item')).not.toBeInTheDocument()
})

test('Renders "Standard GitHub-hosted runners" item when hasHostedRunnerGroup is true', () => {
  ;(useRunners as jest.Mock).mockImplementation(() => ({
    runnersResponse: {...getRunnersPayload('github-hosted'), hasHostedRunnerGroup: true},
    isLoading: false,
    error: false,
  }))

  renderGitHubHostedRunners(getGitHubHostedRunnersProps())

  expect(screen.getByTestId('hosted-runners-list-item')).toBeInTheDocument()
})

test('Does not render "Standard GitHub-hosted runners" when hasHostedRunnerGroup is false', () => {
  ;(useRunners as jest.Mock).mockImplementation(() => ({
    runnersResponse: {...getRunnersPayload('github-hosted'), hasHostedRunnerGroup: false},
    isLoading: false,
    error: false,
  }))

  renderGitHubHostedRunners(getGitHubHostedRunnersProps())

  expect(screen.queryByTestId('hosted-runners-list-item')).not.toBeInTheDocument()
})

test('Renders EmptyState when there is no hosted runner group, no larger runner banner, and no runners', () => {
  ;(useRunners as jest.Mock).mockImplementation(() => ({
    runnersResponse: {largerRunners: [], hasHostedRunnerGroup: false, showLargerRunnerBanner: false},
    isLoading: false,
    error: false,
  }))

  renderGitHubHostedRunners(getGitHubHostedRunnersProps())

  expect(screen.getByTestId('empty-state')).toBeInTheDocument()
})

test('Does not render EmptyState when there is a hosted runner group', () => {
  ;(useRunners as jest.Mock).mockImplementation(() => ({
    runnersResponse: {largerRunners: [], hasHostedRunnerGroup: true, showLargerRunnerBanner: false},
    isLoading: false,
    error: false,
  }))

  renderGitHubHostedRunners(getGitHubHostedRunnersProps())

  expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument()
})

test('Does not render EmptyState when showLargerRunnerBanner is true', () => {
  ;(useRunners as jest.Mock).mockImplementation(() => ({
    runnersResponse: {largerRunners: [], hasHostedRunnerGroup: false, showLargerRunnerBanner: true},
    isLoading: false,
    error: false,
  }))

  renderGitHubHostedRunners(getGitHubHostedRunnersProps())

  expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument()
})

test('Does not render EmptyState when there are runners', () => {
  ;(useRunners as jest.Mock).mockImplementation(() => ({
    runnersResponse: getRunnersPayload('github-hosted'),
    isLoading: false,
    error: false,
  }))

  renderGitHubHostedRunners(getGitHubHostedRunnersProps())

  expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument()
})

test('Renders loading state when isLoading is true', () => {
  ;(useRunners as jest.Mock).mockImplementation(() => ({
    runnersResponse: undefined,
    isLoading: true,
    error: false,
  }))

  renderGitHubHostedRunners(getGitHubHostedRunnersProps())

  expect(screen.getByTestId('skeleton-list')).toBeInTheDocument()
})

import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'

import {SelfHostedRunners, type SelfHostedRunnersProps} from '../components/SelfHostedRunners'
import {useRunners} from '../hooks/use-runners'
import {getRunnersPayload} from '../test-utils/mock-data'

jest.mock('../hooks/use-runners', () => ({
  useRunners: jest.fn(),
}))

function getSelfHostedRunnersProps(): SelfHostedRunnersProps {
  return {
    fetchRunnersBasePath: '/github/hub/actions/runners',
    setUpRunnersLink: '/organizations/github/settings/actions/runners',
  }
}

function renderSelfHostedRunners(props: SelfHostedRunnersProps) {
  render(<SelfHostedRunners {...props} />)
}

test('Renders SelfHostedRunners', () => {
  ;(useRunners as jest.Mock)
    .mockImplementationOnce(() => ({
      runnersResponse: getRunnersPayload('repo-self-hosted'),
      isLoading: false,
      error: false,
    }))
    .mockImplementationOnce(() => ({
      runnersResponse: getRunnersPayload('shared-runners'),
      isLoading: false,
      error: false,
    }))
    .mockImplementationOnce(() => ({
      runnersResponse: getRunnersPayload('scale-sets'),
      isLoading: false,
      error: false,
    }))

  renderSelfHostedRunners(getSelfHostedRunnersProps())

  expect(screen.getByTestId('self-hosted-runners')).toBeInTheDocument()
  expect(screen.getByTestId('self-hosted-runners')).toHaveAttribute('data-hpc')
})

test('Renders EmptyState when there are and no runners', () => {
  ;(useRunners as jest.Mock)
    .mockImplementationOnce(() => ({
      runnersResponse: {runners: [], total: 0},
      isLoading: false,
      error: false,
    }))
    .mockImplementationOnce(() => ({
      runnersResponse: {runners: [], total: 0},
      isLoading: false,
      error: false,
    }))
    .mockImplementationOnce(() => ({
      runnersResponse: {runners: [], total: 0},
      isLoading: false,
      error: false,
    }))

  renderSelfHostedRunners(getSelfHostedRunnersProps())

  expect(screen.getByTestId('empty-state')).toBeInTheDocument()
})

test('Does not render EmptyState when there are repo self-hosted runners', () => {
  ;(useRunners as jest.Mock)
    .mockImplementationOnce(() => ({
      runnersResponse: getRunnersPayload('repo-self-hosted'),
      isLoading: false,
      error: false,
    }))
    .mockImplementationOnce(() => ({
      runnersResponse: {runners: [], total: 0},
      isLoading: false,
      error: false,
    }))
    .mockImplementationOnce(() => ({
      runnersResponse: {runners: [], total: 0},
      isLoading: false,
      error: false,
    }))

  renderSelfHostedRunners(getSelfHostedRunnersProps())

  expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument()
})

test('Does not render EmptyState when there are shared runners', () => {
  ;(useRunners as jest.Mock)
    .mockImplementationOnce(() => ({
      runnersResponse: {runners: [], total: 0},
      isLoading: false,
      error: false,
    }))
    .mockImplementationOnce(() => ({
      runnersResponse: getRunnersPayload('shared-runners'),
      isLoading: false,
      error: false,
    }))
    .mockImplementationOnce(() => ({
      runnersResponse: {runners: [], total: 0},
      isLoading: false,
      error: false,
    }))

  renderSelfHostedRunners(getSelfHostedRunnersProps())

  expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument()
})

test('Does not render EmptyState when there are scale sets', () => {
  ;(useRunners as jest.Mock)
    .mockImplementationOnce(() => ({
      runnersResponse: {runners: [], total: 0},
      isLoading: false,
      error: false,
    }))
    .mockImplementationOnce(() => ({
      runnersResponse: {runners: [], total: 0},
      isLoading: false,
      error: false,
    }))
    .mockImplementationOnce(() => ({
      runnersResponse: getRunnersPayload('scale-sets'),
      isLoading: false,
      error: false,
    }))

  renderSelfHostedRunners(getSelfHostedRunnersProps())

  expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument()
})

test('Renders loading state when isLoading is true', () => {
  ;(useRunners as jest.Mock).mockImplementation(() => ({
    runnersResponse: undefined,
    isLoading: true,
    error: false,
  }))

  renderSelfHostedRunners(getSelfHostedRunnersProps())

  expect(screen.getByTestId('skeleton-list')).toBeInTheDocument()
})

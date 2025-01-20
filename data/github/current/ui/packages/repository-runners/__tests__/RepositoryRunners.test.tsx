import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'

import {RepositoryRunners} from '../RepositoryRunners'
import {getRunnersPayload, getRepositoryRunnersProps} from '../test-utils/mock-data'
import {useRunners} from '../hooks/use-runners'

jest.mock('../hooks/use-runners', () => ({
  useRunners: jest.fn(),
}))

test('Renders GitHubHostedRunners when selectedTab is github-hosted', () => {
  ;(useRunners as jest.Mock).mockImplementationOnce(() => ({
    runnersResponse: getRunnersPayload('github-hosted'),
    isLoading: false,
    error: false,
  }))

  render(<RepositoryRunners {...getRepositoryRunnersProps()} selectedTab="github-hosted" />)

  expect(screen.getByTestId('github-hosted-runners')).toBeInTheDocument()
  expect(screen.getByTestId('github-hosted-runners')).toHaveAttribute('data-hpc')
})

test('Renders SelfHostedRunners when selectedTab is self-hosted', () => {
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

  render(<RepositoryRunners {...getRepositoryRunnersProps()} selectedTab="self-hosted" />)

  expect(screen.getByTestId('self-hosted-runners')).toBeInTheDocument()
  expect(screen.getByTestId('self-hosted-runners')).toHaveAttribute('data-hpc')
})

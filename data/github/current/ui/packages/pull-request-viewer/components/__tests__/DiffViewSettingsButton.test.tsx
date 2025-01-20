import {render} from '@github-ui/react-core/test-utils'
import {act, screen} from '@testing-library/react'
import {graphql, useLazyLoadQuery} from 'react-relay'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import PullRequestsAppWrapper from '../../test-utils/PullRequestsAppWrapper'
import {buildPullRequest} from '../../test-utils/query-data'
import DiffViewSettingsButton from '../DiffViewSettingsButton'
import type {DiffViewSettingsButtonTestQuery} from './__generated__/DiffViewSettingsButtonTestQuery.graphql'

interface TestComponentProps {
  environment: ReturnType<typeof createMockEnvironment>
  pullRequestId?: string
}

function TestComponent({environment, pullRequestId = 'PR_kwAEAg'}: TestComponentProps) {
  const DiffViewSettingsButtonWithRelayQuery = () => {
    const data = useLazyLoadQuery<DiffViewSettingsButtonTestQuery>(
      graphql`
        query DiffViewSettingsButtonTestQuery($pullRequestId: ID!) @relay_test_operation {
          pullRequest: node(id: $pullRequestId) {
            ... on PullRequest {
              ...DiffViewSettingsButton_pullRequest
            }
          }
          viewer {
            ...DiffViewSettingsButton_user
          }
        }
      `,
      {
        pullRequestId,
      },
    )

    if (data.pullRequest) {
      return <DiffViewSettingsButton pullRequest={data.pullRequest} user={data.viewer} />
    }
    return null
  }

  return (
    <PullRequestsAppWrapper environment={environment} pullRequestId={pullRequestId}>
      <DiffViewSettingsButtonWithRelayQuery />
    </PullRequestsAppWrapper>
  )
}

describe('diff view settings', () => {
  test('shows the diff view settings button', async () => {
    const environment = createMockEnvironment()
    render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest()
          },
        }),
      )
    })

    expect(screen.getByLabelText('Diff view settings')).toBeInTheDocument()
  })

  test('can open and close the diff view settings button', async () => {
    const environment = createMockEnvironment()
    render(<TestComponent environment={environment} />)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          PullRequest() {
            return buildPullRequest()
          },
        }),
      )
    })

    // Open menu
    const settingsGearButton = screen.getByLabelText('Diff view settings')
    act(() => {
      settingsGearButton.click()
    })

    expect(settingsGearButton.getAttribute('aria-expanded')).toEqual('true')
    expect(settingsGearButton.getAttribute('aria-haspopup')).toEqual('true')
    expect(screen.getByText('Unified')).toBeInTheDocument()
    expect(screen.getByText('Split')).toBeInTheDocument()
    expect(screen.getByText('Hide whitespace')).toBeInTheDocument()

    // Close menu
    act(() => {
      settingsGearButton.click()
    })

    expect(settingsGearButton.getAttribute('aria-expanded')).toEqual('false')
    expect(settingsGearButton.getAttribute('aria-haspopup')).toEqual('true')
    expect(screen.queryByText('Unified')).not.toBeInTheDocument()
    expect(screen.queryByText('Split')).not.toBeInTheDocument()
    expect(screen.queryByText('Hide whitespace')).not.toBeInTheDocument()
  })
})

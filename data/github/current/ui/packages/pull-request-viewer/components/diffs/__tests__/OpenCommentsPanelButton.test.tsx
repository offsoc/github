import {ensurePreviousActiveDialogIsClosed} from '@github-ui/conversations/ensure-previous-active-dialog-is-closed'
import {render} from '@github-ui/react-core/test-utils'
import {act, screen} from '@testing-library/react'
import {graphql, useLazyLoadQuery} from 'react-relay'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import {PullRequestMarkersDialogContextProvider} from '../../../contexts/PullRequestMarkersContext'
import PullRequestsAppWrapper from '../../../test-utils/PullRequestsAppWrapper'
import {OpenCommentsPanelButton} from '../OpenCommentsPanelButton'
import type {OpenCommentsPanelButtonTestQuery} from './__generated__/OpenCommentsPanelButtonTestQuery.graphql'

jest.mock('@github-ui/conversations/ensure-previous-active-dialog-is-closed')
const ensurePreviousActiveDialogIsClosedMock = jest.mocked(ensurePreviousActiveDialogIsClosed)

function TestComponent({environment}: {environment: ReturnType<typeof createMockEnvironment>}) {
  const pullRequestId = 'PR_123abc'

  const OpenAnnotaionsPanelButtonWithRelayQuery = () => {
    const data = useLazyLoadQuery<OpenCommentsPanelButtonTestQuery>(
      graphql`
        query OpenCommentsPanelButtonTestQuery($pullRequestId: ID!) @relay_test_operation {
          pullRequest: node(id: $pullRequestId) {
            ... on PullRequest {
              ...OpenCommentsPanelButton_pullRequest
            }
          }
        }
      `,
      {
        pullRequestId,
      },
    )

    if (data.pullRequest) {
      return <OpenCommentsPanelButton pullRequest={data.pullRequest} />
    }
    return null
  }

  return (
    <PullRequestsAppWrapper environment={environment} pullRequestId={pullRequestId}>
      <PullRequestMarkersDialogContextProvider
        annotationMap={{}}
        diffAnnotations={[]}
        filteredFiles={new Set()}
        setGlobalMarkerNavigationState={jest.fn()}
        threads={[]}
      >
        <OpenAnnotaionsPanelButtonWithRelayQuery />
      </PullRequestMarkersDialogContextProvider>
    </PullRequestsAppWrapper>
  )
}

test('ensures that previous active dialog is closed when clicked', async () => {
  const environment = createMockEnvironment()
  const {user} = render(<TestComponent environment={environment} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () =>
    environment.mock.resolveMostRecentOperation(operation => MockPayloadGenerator.generate(operation)),
  )

  await user.click(screen.getByRole('button', {name: 'Open comments sidesheet'}))
  expect(ensurePreviousActiveDialogIsClosedMock).toHaveBeenCalled()
})

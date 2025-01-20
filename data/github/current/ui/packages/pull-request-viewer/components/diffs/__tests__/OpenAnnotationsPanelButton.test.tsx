import {type DiffAnnotation, DiffAnnotationLevels} from '@github-ui/conversations'
import {ensurePreviousActiveDialogIsClosed} from '@github-ui/conversations/ensure-previous-active-dialog-is-closed'
import {render} from '@github-ui/react-core/test-utils'
import {act, screen} from '@testing-library/react'
import {graphql, useLazyLoadQuery} from 'react-relay'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import {PullRequestMarkersDialogContextProvider} from '../../../contexts/PullRequestMarkersContext'
import PullRequestsAppWrapper from '../../../test-utils/PullRequestsAppWrapper'
import {OpenAnnotationsPanelButton} from '../OpenAnnotationsPanelButton'
import type {OpenAnnotationsPanelButtonTestQuery} from './__generated__/OpenAnnotationsPanelButtonTestQuery.graphql'

jest.mock('@github-ui/conversations/ensure-previous-active-dialog-is-closed')
const ensurePreviousActiveDialogIsClosedMock = jest.mocked(ensurePreviousActiveDialogIsClosed)

const mockAnnotation = {
  id: '1234',
  __id: '1234',
  annotationLevel: DiffAnnotationLevels.Failure,
  databaseId: Math.floor(Math.random() * 1000),
  checkRun: {
    name: 'enterprise-lint-schema',
    detailsUrl: 'http://github.localhost/monalisa/smile/actions/runs/1/job/1',
  },
  checkSuite: {
    name: 'github-lint',
    app: {
      name: 'octobot',
      logoUrl: 'http://alambic.github.localhost/avatars/u/3',
    },
  },
  location: {
    start: {
      line: 1,
    },
    end: {
      line: 2,
    },
  },
  rawDetails: null,
  message: 'breaks implementation',
  path: 'README.md',
  pathDigest: 'test-path-digest',
  title: 'Failure on file',
}

function TestComponent({
  environment,
  annotations = [],
}: {
  environment: ReturnType<typeof createMockEnvironment>
  annotations?: DiffAnnotation[]
}) {
  const pullRequestId = 'PR_123abc'

  const filteredFiles = new Set(annotations.map(a => a.pathDigest))

  const OpenAnnotaionsPanelButtonWithRelayQuery = () => {
    const data = useLazyLoadQuery<OpenAnnotationsPanelButtonTestQuery>(
      graphql`
        query OpenAnnotationsPanelButtonTestQuery($pullRequestId: ID!) @relay_test_operation {
          pullRequest: node(id: $pullRequestId) {
            ... on PullRequest {
              ...OpenAnnotationsPanelButton_pullRequest
            }
          }
        }
      `,
      {
        pullRequestId,
      },
    )

    if (data.pullRequest) {
      return <OpenAnnotationsPanelButton pullRequest={data.pullRequest} />
    }
    return null
  }

  return (
    <PullRequestsAppWrapper environment={environment} pullRequestId={pullRequestId}>
      <PullRequestMarkersDialogContextProvider
        annotationMap={{}}
        diffAnnotations={annotations}
        filteredFiles={filteredFiles}
        setGlobalMarkerNavigationState={jest.fn()}
        threads={[]}
      >
        <OpenAnnotaionsPanelButtonWithRelayQuery />
      </PullRequestMarkersDialogContextProvider>
    </PullRequestsAppWrapper>
  )
}

test('renders if there is at least 1 annotation', async () => {
  const environment = createMockEnvironment()
  render(<TestComponent annotations={[mockAnnotation]} environment={environment} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () =>
    environment.mock.resolveMostRecentOperation(operation => MockPayloadGenerator.generate(operation)),
  )

  expect(screen.getByRole('button', {name: 'Open annotations side panel'})).toBeVisible()
})

test('does not render if there is no annotations', async () => {
  const environment = createMockEnvironment()
  render(<TestComponent annotations={[]} environment={environment} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () =>
    environment.mock.resolveMostRecentOperation(operation => MockPayloadGenerator.generate(operation)),
  )

  expect(screen.queryByRole('button', {name: 'Open annotations side panel'})).toBeNull()
})

test('ensures that previous active dialog is closed when clicked', async () => {
  const environment = createMockEnvironment()
  const {user} = render(<TestComponent annotations={[mockAnnotation]} environment={environment} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () =>
    environment.mock.resolveMostRecentOperation(operation => MockPayloadGenerator.generate(operation)),
  )

  await user.click(screen.getByRole('button', {name: 'Open annotations side panel'}))
  expect(ensurePreviousActiveDialogIsClosedMock).toHaveBeenCalled()
})

import {render} from '@github-ui/react-core/test-utils'
import {act, screen} from '@testing-library/react'
import {graphql, useLazyLoadQuery} from 'react-relay'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import PullRequestsAppWrapper from '../../../test-utils/PullRequestsAppWrapper'
import {buildPullRequest} from '../../../test-utils/query-data'
import {HeaderBranchInfo} from '../HeaderBranchInfo'
import type {HeaderBranchInfoTestQuery} from './__generated__/HeaderBranchInfoTestQuery.graphql'

interface TestComponentProps {
  environment: ReturnType<typeof createMockEnvironment>
  onSelectBaseBranch?: (newBranch: string) => void
  pullRequestId?: string
}

function TestComponent({
  environment,
  onSelectBaseBranch = () => false,
  pullRequestId = 'PR_kwAEAg',
}: TestComponentProps) {
  const HeaderBranchInfoWithRelayQuery = () => {
    const data = useLazyLoadQuery<HeaderBranchInfoTestQuery>(
      graphql`
        query HeaderBranchInfoTestQuery($pullRequestId: ID!) @relay_test_operation {
          pullRequest: node(id: $pullRequestId) {
            ... on PullRequest {
              ...HeaderBranchInfo_pullRequest
            }
          }
        }
      `,
      {
        pullRequestId,
      },
    )

    if (data.pullRequest) {
      return (
        <HeaderBranchInfo
          isEditing={false}
          pullRequest={data.pullRequest}
          refListCacheKey=""
          selectedBaseBranch="main"
          onSelectBaseBranch={onSelectBaseBranch}
        />
      )
    }

    return null
  }

  return (
    <PullRequestsAppWrapper environment={environment} pullRequestId={pullRequestId}>
      <HeaderBranchInfoWithRelayQuery />
    </PullRequestsAppWrapper>
  )
}

test('renders header with links to the branches involved', async () => {
  const environment = createMockEnvironment()
  render(<TestComponent environment={environment} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({state: 'OPEN'})
        },
      }),
    )
  })

  await screen.findByText('main')

  const mainElement = screen.getByRole('link', {name: 'main'})

  const branchElement = screen.getByRole('link', {name: /update-packages-and-readme-ref/})

  expect(mainElement).toHaveAttribute('href', '/monalisa/smile')

  expect(branchElement).toHaveAttribute('href', '/monalisa/smile/tree/update-packages-and-readme-ref')
})

test('renders even if base ref is null because the base ref was deleted', async () => {
  const environment = createMockEnvironment()
  render(<TestComponent environment={environment} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({state: 'OPEN', baseRef: null})
        },
      }),
    )
  })

  await screen.findByText('main')

  const mainElement = screen.getByRole('link', {name: 'main'})

  const branchElement = screen.getByRole('link', {name: /update-packages-and-readme-ref/})

  expect(mainElement).toHaveAttribute('href', '/monalisa/smile')

  expect(branchElement).toHaveAttribute('href', '/monalisa/smile/tree/update-packages-and-readme-ref')
})

test('renders base and head repo owners if PR if from a fork', async () => {
  const environment = createMockEnvironment()
  render(<TestComponent environment={environment} />)

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        PullRequest() {
          return buildPullRequest({
            state: 'OPEN',
            headRepository: {
              name: 'newRepo',
              owner: {
                login: 'github',
              },
              isFork: true,
            },
          })
        },
      }),
    )
  })

  const baseBranchName = await screen.findByText('monalisa:main')
  expect(baseBranchName).toBeInTheDocument()
  const headBranchName = await screen.findByText('github:update-packages-and-readme-ref')
  expect(headBranchName).toBeInTheDocument()
})

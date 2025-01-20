import {LazyPullRequestAndBranchPicker} from '../components/PullRequestAndBranchPicker'
import {noop} from '@github-ui/noop'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {buildPullRequest} from '../test-utils/PullRequestPickerHelpers'
import {buildBranch} from '../test-utils/BranchPickerHelpers'
import {fireEvent, screen} from '@testing-library/react'
import type {BranchPickerSearchBranchesQuery} from '../components/__generated__/BranchPickerSearchBranchesQuery.graphql'
import {renderRelay} from '@github-ui/relay-test-utils'
import {mockRelayId} from '@github-ui/relay-test-utils/RelayComponents'
import type {PullRequestPickerSearchQuery} from '../components/__generated__/PullRequestPickerSearchQuery.graphql'

const setupEnvironment = () => {
  const pullRequests = [
    buildPullRequest({id: 'PR_id1', number: 13371, state: 'OPEN', title: 'Open Pull Request'}),
    buildPullRequest({id: 'PR_id2', number: 13372, state: 'CLOSED', title: 'Closed Pull Request'}),
    buildPullRequest({id: 'CLASSIC_id1', number: 13375, state: 'OPEN', title: 'Classic Pull Request'}),
  ]

  renderRelay<{branchesQuery: BranchPickerSearchBranchesQuery; pullRequestsQuery: PullRequestPickerSearchQuery}>(
    () => (
      <LazyPullRequestAndBranchPicker
        onSelectionChange={noop}
        shortcutsEnabled={false}
        initialSelectedPrs={[]}
        initialSelectedBranches={[]}
        repoNameWithOwner="owner/repo"
      />
    ),
    {
      relay: {
        queries: {
          branchesQuery: {
            type: 'lazy',
          },
          pullRequestsQuery: {
            type: 'lazy',
          },
        },
        mockResolvers: {
          Repository: () => ({
            id: mockRelayId(),
            refs: {edges: [{node: buildBranch({id: 'REF_id1', name: 'branch1'})}]},
          }),
          Query: () => ({
            commenters: {
              nodes: [],
            },
            author: {
              nodes: pullRequests,
            },
            mentions: {
              nodes: [],
            },
            assignee: {
              nodes: [],
            },
            open: {
              nodes: [],
            },
          }),
        },
      },
      wrapper: Wrapper,
    },
  )
}

test('renders branches and pull requests', async () => {
  setupEnvironment()

  const button = await screen.findByRole('button')
  expect(button).toHaveTextContent('Select a pull request')
  fireEvent.click(button)

  expect(await screen.findAllByRole('option')).toHaveLength(4)
})

test('renders classic pull request title', async () => {
  setupEnvironment()

  const button = await screen.findByRole('button')
  expect(button).toHaveTextContent('Select a pull request')
  fireEvent.click(button)

  expect(await screen.findAllByRole('option')).toHaveLength(4)

  const options = await screen.findAllByRole('option')

  expect(options[2]).toHaveTextContent('Classic Pull Request')
})

test('renders non-classic pull request title', async () => {
  setupEnvironment()

  const button = await screen.findByRole('button')
  expect(button).toHaveTextContent('Select a pull request')
  fireEvent.click(button)

  expect(await screen.findAllByRole('option')).toHaveLength(4)

  const options = await screen.findAllByRole('option')

  expect(options[0]).toHaveTextContent('Open Pull Request')
})

test('renders branch name', async () => {
  setupEnvironment()

  const button = await screen.findByRole('button')
  expect(button).toHaveTextContent('Select a pull request')
  fireEvent.click(button)

  expect(await screen.findAllByRole('option')).toHaveLength(4)

  const options = await screen.findAllByRole('option')

  expect(options[3]).toHaveTextContent('branch1')
})

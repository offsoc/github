import {screen} from '@testing-library/react'
import {graphql} from 'react-relay'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {LinkedPullRequestsInternal} from '../LinkedPullRequests'
import type {
  LinkedPullRequests$data,
  LinkedPullRequests$key,
  PullRequestState,
} from '../__generated__/LinkedPullRequests.graphql'
import type {LinkedPullRequestsTestQuery} from './__generated__/LinkedPullRequestsTestQuery.graphql'
import {renderRelay} from '@github-ui/relay-test-utils'
import {LABELS} from '../../../constants/labels'

const setup = (linkedPRs: LinkedPullRequests$data) => {
  return renderRelay<{linkedPullRequestsQuery: LinkedPullRequestsTestQuery}>(
    ({queryData}) => (
      <LinkedPullRequestsInternal
        issueData={queryData.linkedPullRequestsQuery.repository?.issue as LinkedPullRequests$key}
        isSticky={false}
      />
    ),
    {
      relay: {
        queries: {
          linkedPullRequestsQuery: {
            type: 'fragment',
            query: graphql`
              query LinkedPullRequestsTestQuery {
                repository(owner: "owner", name: "repo") {
                  issue(number: 33) {
                    ...LinkedPullRequests
                  }
                }
              }
            `,
            variables: {},
          },
        },
        mockResolvers: {
          Issue() {
            return {
              ...linkedPRs,
            }
          },
        },
      },
      wrapper: Wrapper,
    },
  )
}

const buildPullRequest = (
  number: number,
  state: PullRequestState,
  id?: string,
  owner?: string,
  name?: string,
  isDraft?: boolean,
) => {
  return {
    id: id || 'PR_1',
    number,
    state,
    url: '',
    isDraft: isDraft ?? false,
    repository: {
      name: name ?? 'repo',
      owner: {
        login: owner ?? 'owner',
      },
      nameWithOwner: owner && name ? `${owner}/${name}` : 'owner/repo',
    },
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const queryResult = (edges: any) => {
  return {
    id: 'I_5',
    repository: {
      nameWithOwner: 'owner/repo',
    },
    linkedPullRequests: {
      nodes: edges,
    },
    ' $fragmentType': 'LinkedPullRequests' as LinkedPullRequests$data[' $fragmentType'],
  }
}

describe('open pull requests', () => {
  const openLinkedPR = buildPullRequest(1, 'OPEN', '1')
  const openLinkedPR2 = buildPullRequest(2, 'OPEN', '2')
  const openLinkedPR3 = buildPullRequest(3, 'OPEN', '3')
  const draftLinkedPR5 = buildPullRequest(5, 'OPEN', '5', undefined, undefined, true)
  const externalOpenedLinkedPR = buildPullRequest(6, 'OPEN', '6', 'external', 'repo')
  const externalOpenedLinkedPR2 = buildPullRequest(7, 'OPEN', '7', 'external', 'repo')

  test('shows open linked pull request', async () => {
    setup(queryResult([openLinkedPR]))

    expect(screen.getByLabelText('Open')).toBeInTheDocument()
    expect(screen.queryByLabelText('Merged')).not.toBeInTheDocument()
    expect(screen.getByText('#1')).toBeInTheDocument()

    expect(screen.getByRole('link', {name: 'Open #1'})).toBeInTheDocument()
  })

  test('shows up to 2 open linked pull request', async () => {
    setup(queryResult([openLinkedPR, openLinkedPR2]))

    expect(screen.getByLabelText('Open')).toBeInTheDocument()
    expect(screen.queryByLabelText('Merged')).not.toBeInTheDocument()
    expect(screen.getByText('#1')).toBeInTheDocument()
    expect(screen.getByText('#2')).toBeInTheDocument()

    expect(screen.getByRole('link', {name: 'Open #2'})).toBeInTheDocument()
    // No icon is expected for the second PR (they also do not appear in order)
    expect(screen.getByRole('link', {name: '#1'})).toBeInTheDocument()
  })

  test('shows up to 2 linked pull request in different states', async () => {
    setup(queryResult([openLinkedPR, draftLinkedPR5]))

    expect(screen.getByLabelText('Open')).toBeInTheDocument()
    expect(screen.getByLabelText('Draft')).toBeInTheDocument()
    expect(screen.queryByLabelText('Merged')).not.toBeInTheDocument()
    expect(screen.getByText('#1')).toBeInTheDocument()
    expect(screen.getByText('#5')).toBeInTheDocument()

    expect(screen.getByRole('link', {name: 'Open #1'})).toBeInTheDocument()
    expect(screen.getByRole('link', {name: 'Draft #5'})).toBeInTheDocument()
  })

  test('shows 2 external linked pull requests in condensed state', async () => {
    const {user} = setup(queryResult([externalOpenedLinkedPR, externalOpenedLinkedPR2]))

    expect(screen.getByLabelText('Open')).toBeInTheDocument()
    expect(screen.queryByLabelText('Merged')).not.toBeInTheDocument()
    expect(screen.getByText('external/repo')).toBeInTheDocument()
    expect(screen.getByText('#6')).toBeInTheDocument()
    expect(screen.getByText('+1')).toBeInTheDocument()
    const pullsButton = screen.getByLabelText('Linked pull requests')

    await user.click(pullsButton)
    expect(screen.getAllByLabelText('Open')).toHaveLength(3) // Pill + 2 menuitems
    expect(screen.getByRole('menuitem', {name: 'external/repo #6'})).toBeInTheDocument()
    expect(screen.getByRole('menuitem', {name: 'external/repo #7'})).toBeInTheDocument()
  })

  test('shows internal and external open linked pull requests', async () => {
    setup(queryResult([openLinkedPR, externalOpenedLinkedPR]))

    expect(screen.getByLabelText('Open')).toBeInTheDocument()
    expect(screen.queryByLabelText('Merged')).not.toBeInTheDocument()
    expect(screen.getByText('#1')).toBeInTheDocument()

    expect(screen.getByText('external/repo')).toBeInTheDocument()
    expect(screen.getByText('#6')).toBeInTheDocument()

    expect(screen.getByRole('link', {name: 'Open #1'})).toBeInTheDocument()
    expect(screen.getByRole('link', {name: 'external/repo #6'})).toBeInTheDocument()
  })

  test('shows more than 2 multiple open linked pull request in condensed state', async () => {
    const {user} = setup(queryResult([openLinkedPR, openLinkedPR2, openLinkedPR3, draftLinkedPR5]))
    const pullsButton = screen.getByLabelText('Linked pull requests')
    expect(pullsButton).toBeInTheDocument()

    expect(screen.getByLabelText('Open')).toBeInTheDocument()
    expect(screen.queryByLabelText('Draft')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Merged')).not.toBeInTheDocument()

    expect(screen.getByText('#3')).toBeInTheDocument()
    expect(screen.getByText('+3')).toBeInTheDocument()
    expect(screen.queryByText('#5')).not.toBeInTheDocument()

    await user.click(pullsButton)

    expect(screen.getAllByText('#3')).toHaveLength(2)
    expect(screen.getAllByLabelText('Open')).toHaveLength(4) // Pill + 3 menuitems
    expect(screen.getByLabelText('Draft')).toBeInTheDocument()
    expect(screen.getByText('#1')).toBeInTheDocument()
    expect(screen.getByText('#2')).toBeInTheDocument()
    expect(screen.getByText('#5')).toBeInTheDocument()

    expect(screen.getByRole('menuitem', {name: '#1'})).toBeInTheDocument()
    expect(screen.getByRole('menuitem', {name: '#2'})).toBeInTheDocument()
    expect(screen.getByRole('menuitem', {name: '#3'})).toBeInTheDocument()
    expect(screen.getByRole('menuitem', {name: '#5'})).toBeInTheDocument()
  })

  test('shows multiple external open linked pull requests', async () => {
    const {user} = setup(queryResult([openLinkedPR, externalOpenedLinkedPR, externalOpenedLinkedPR2]))
    const pullsButton = screen.getByLabelText('Linked pull requests')

    expect(screen.getByLabelText('Open')).toBeInTheDocument()
    expect(screen.queryByLabelText('Merged')).not.toBeInTheDocument()
    expect(screen.getByText('#1')).toBeInTheDocument()
    expect(screen.getByText('+2')).toBeInTheDocument()
    await user.click(pullsButton)

    expect(screen.getAllByLabelText('Open')).toHaveLength(4) // Pill + 3 menuitems
    expect(screen.queryByLabelText('Merged')).not.toBeInTheDocument()
    expect(screen.getAllByText('#1')).toHaveLength(2) // Pill + menuitem
    expect(screen.getByRole('menuitem', {name: 'external/repo #6'})).toBeInTheDocument()
    expect(screen.getByRole('menuitem', {name: 'external/repo #7'})).toBeInTheDocument()
  })
})

describe('merged linked pull requests', () => {
  const mergedLinkedPR = buildPullRequest(8, 'MERGED', '8')
  const mergedLinkedPR2 = buildPullRequest(9, 'MERGED', '9')
  const mergedLinkedPR3 = buildPullRequest(10, 'MERGED', '10')
  const externalMergedLinkedPR = buildPullRequest(12, 'MERGED', '12', 'external', 'repo')
  const externalMergedLinkedPR2 = buildPullRequest(13, 'MERGED', '13', 'external', 'repo')

  test('shows merged linked pull request', async () => {
    setup(queryResult([mergedLinkedPR]))

    expect(screen.getByLabelText('Merged')).toBeInTheDocument()
    expect(screen.queryByLabelText('Open')).not.toBeInTheDocument()
    expect(screen.getByText('#8')).toBeInTheDocument()

    expect(screen.getByRole('link', {name: 'Merged #8'})).toBeInTheDocument()
  })

  test('shows up to 2 multiple merged linked pull request', async () => {
    setup(queryResult([mergedLinkedPR, mergedLinkedPR2]))

    expect(screen.getByLabelText('Merged')).toBeInTheDocument()
    expect(screen.queryByLabelText('Open')).not.toBeInTheDocument()
    expect(screen.getByText('#8')).toBeInTheDocument()
    expect(screen.getByText('#9')).toBeInTheDocument()

    expect(screen.getByRole('link', {name: 'Merged #9'})).toBeInTheDocument()
    expect(screen.getByRole('link', {name: '#8'})).toBeInTheDocument()
  })

  test('shows more than 2 multiple merged linked pull request in condensed state', async () => {
    const {user} = setup(queryResult([mergedLinkedPR, mergedLinkedPR2, mergedLinkedPR3]))
    const pullsButton = screen.getByLabelText('Linked pull requests')
    expect(pullsButton).toBeInTheDocument()

    expect(screen.getByText('#10')).toBeInTheDocument()
    expect(screen.getByText('+2')).toBeInTheDocument()
    expect(screen.getByLabelText('Merged')).toBeInTheDocument()
    await user.click(pullsButton)

    expect(screen.getAllByLabelText('Merged')).toHaveLength(4) // Pill + 3 menuitems
    expect(screen.queryByLabelText('Open')).not.toBeInTheDocument()
    expect(screen.getByText('#8')).toBeInTheDocument()
    expect(screen.getByText('#9')).toBeInTheDocument()
    expect(screen.getAllByText('#10')).toHaveLength(2)
  })

  test('shows external merged linked pull request', async () => {
    setup(queryResult([externalMergedLinkedPR]))

    expect(screen.getByLabelText('Merged')).toBeInTheDocument()
    expect(screen.queryByLabelText('Open')).not.toBeInTheDocument()
    expect(screen.getByText('external/repo')).toBeInTheDocument()
    expect(screen.getByText('#12')).toBeInTheDocument()

    expect(screen.getByRole('link', {name: 'Merged external/repo #12'})).toBeInTheDocument()
  })

  test('shows multiple external merged linked pull request in condensed state', async () => {
    const {user} = setup(queryResult([externalMergedLinkedPR, externalMergedLinkedPR2]))
    const pullsButton = screen.getByLabelText('Linked pull requests')
    expect(pullsButton).toBeInTheDocument()

    expect(screen.getByLabelText('Merged')).toBeInTheDocument()
    expect(screen.getByText('external/repo')).toBeInTheDocument()
    expect(screen.getByText('#12')).toBeInTheDocument()
    expect(screen.getByText('+1')).toBeInTheDocument()
    await user.click(pullsButton)

    expect(screen.queryByLabelText('Open')).not.toBeInTheDocument()
    expect(screen.getByRole('menuitem', {name: 'external/repo #12'})).toBeInTheDocument()
    expect(screen.getByRole('menuitem', {name: 'external/repo #13'})).toBeInTheDocument()
  })
})

test('shows both open and merged linked pull requests', async () => {
  const openLinkedPR = buildPullRequest(1, 'OPEN', '1')
  const mergedLinkedPR = buildPullRequest(8, 'MERGED', '8')

  setup(queryResult([openLinkedPR, mergedLinkedPR]))

  expect(screen.getByLabelText('Merged')).toBeInTheDocument()
  expect(screen.getByLabelText('Open')).toBeInTheDocument()
  expect(screen.getByText('#1')).toBeInTheDocument()
  expect(screen.getByText('#8')).toBeInTheDocument()

  expect(screen.getByRole('link', {name: 'Open #1'})).toBeInTheDocument()
  expect(screen.getByRole('link', {name: 'Merged #8'})).toBeInTheDocument()
})

test('shows nothing if there are no linked pull requests', async () => {
  setup(queryResult([]))

  expect(screen.queryByLabelText('Merged')).not.toBeInTheDocument()
  expect(screen.queryByLabelText('Open')).not.toBeInTheDocument()
})

test('condensed state with only open PRs does not show title', async () => {
  const externalOpenedLinkedPR = buildPullRequest(1, 'OPEN', '1', 'external', 'repo')
  const externalOpenedLinkedPR2 = buildPullRequest(2, 'OPEN', '2', 'external', 'repo')

  const {user} = setup(queryResult([externalOpenedLinkedPR, externalOpenedLinkedPR2]))
  const pullsButton = screen.getByLabelText('Linked pull requests')
  await user.click(pullsButton)

  expect(screen.queryByText(LABELS.openPrs)).not.toBeInTheDocument()
})

test('condensed state with only closed PRs does not show title', async () => {
  const externalClosedLinkedPR = buildPullRequest(1, 'MERGED', '1', 'external', 'repo')
  const externalClosedLinkedPR2 = buildPullRequest(2, 'MERGED', '2', 'external', 'repo')

  const {user} = setup(queryResult([externalClosedLinkedPR, externalClosedLinkedPR2]))
  const pullsButton = screen.getByLabelText('Linked pull requests')
  await user.click(pullsButton)

  expect(screen.queryByText(LABELS.mergedPrs)).not.toBeInTheDocument()
})

test('condensed state with both open and closed PRs shows titles', async () => {
  const externalOpenedLinkedPR = buildPullRequest(1, 'OPEN', '1', 'external', 'repo')
  const externalClosedLinkedPR = buildPullRequest(2, 'MERGED', '2', 'external', 'repo')

  const {user} = setup(queryResult([externalClosedLinkedPR, externalOpenedLinkedPR]))

  const pullsButton = screen.getByLabelText('Linked pull requests')
  await user.click(pullsButton)

  expect(screen.getByText(LABELS.openPrs)).toBeInTheDocument()
  expect(screen.getByText(LABELS.mergedPrs)).toBeInTheDocument()
})

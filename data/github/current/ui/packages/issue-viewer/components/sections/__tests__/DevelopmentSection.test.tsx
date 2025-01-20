import {Wrapper} from '@github-ui/react-core/test-utils'
import {screen, within} from '@testing-library/react'
import {graphql} from 'react-relay'

import {DevelopmentSection} from '../development-section/DevelopmentSection'
import {TEST_IDS} from '../../../constants/test-ids'
import {LABELS} from '../../../constants/labels'
import {renderRelay} from '@github-ui/relay-test-utils'
import type {DevelopmentSectionTestQuery} from './__generated__/DevelopmentSectionTestQuery.graphql'
import type {DevelopmentPickerQuery} from '../development-section/__generated__/DevelopmentPickerQuery.graphql'
import type {RelayMockProps} from '@github-ui/relay-test-utils/RelayTestFactories'

const DevelopmentSectionGraphqlTestQuery = graphql`
  query DevelopmentSectionTestQuery($owner: String!, $repo: String!, $number: Int!) @relay_test_operation {
    repository(owner: $owner, name: $repo) {
      issue(number: $number) {
        ...DevelopmentSectionFragment
      }
    }
  }
`

type DevelopmentSectionQueries = {
  developmentSectionQuery: DevelopmentSectionTestQuery
  developmentPickerQuery: DevelopmentPickerQuery
}
const developmentSectionRelayMock: RelayMockProps<DevelopmentSectionQueries> = {
  queries: {
    developmentSectionQuery: {
      type: 'fragment',
      query: DevelopmentSectionGraphqlTestQuery,
      variables: {
        owner: 'owner',
        repo: 'repo',
        number: 1,
      },
    },
    developmentPickerQuery: {
      type: 'lazy',
    },
  },
}

test('renders 3 linked pull requests and 2 linked branches', async () => {
  renderRelay<DevelopmentSectionQueries>(
    ({queryData}) => (
      <DevelopmentSection issue={queryData.developmentSectionQuery.repository!.issue!} shortcutEnabled={false} />
    ),
    {
      relay: {
        ...developmentSectionRelayMock,
        mockResolvers: {
          Issue: () => ({
            linkedBranches: {
              nodes: Array(2).fill(undefined),
            },
            closedByPullRequestsReferences: {
              nodes: Array(3).fill(undefined),
            },
          }),
        },
      },
      wrapper: Wrapper,
    },
  )

  // Find the pull requests and linked branches
  const pullRequests = await screen.findByTestId(TEST_IDS.linkedPullRequestContainer)
  expect(within(pullRequests).getAllByRole('listitem').length).toBe(5)
})

describe('Button conditional rendering for permissions', () => {
  test('renders no buttons without permissions', async () => {
    renderRelay<DevelopmentSectionQueries>(
      ({queryData}) => (
        <DevelopmentSection issue={queryData.developmentSectionQuery.repository!.issue!} shortcutEnabled={false} />
      ),
      {
        relay: {
          ...developmentSectionRelayMock,
          mockResolvers: {
            Issue: () => ({
              linkedBranches: {
                nodes: [],
              },
              closedByPullRequestsReferences: {
                nodes: [],
              },
              viewerCanUpdateNext: false,
            }),
          },
        },
        wrapper: Wrapper,
      },
    )

    expect(screen.queryByText('Create a branch')).not.toBeInTheDocument()
    expect(screen.getByText(LABELS.emptySections.development)).toBeInTheDocument()
  })

  test('renders edit button if edit permitted and the data is loaded', () => {
    renderRelay<DevelopmentSectionQueries>(
      ({queryData}) => (
        <DevelopmentSection issue={queryData.developmentSectionQuery.repository!.issue!} shortcutEnabled={false} />
      ),
      {
        relay: {
          ...developmentSectionRelayMock,
          mockResolvers: {
            Issue: () => ({
              linkedBranches: {
                nodes: [],
              },
              closedByPullRequestsReferences: {
                nodes: [],
              },
              viewerCanUpdateNext: true,
            }),
          },
        },
        wrapper: Wrapper,
      },
    )

    expect(screen.getByText('Create a branch')).toBeInTheDocument()
    expect(screen.queryByText(LABELS.emptySections.development)).not.toBeInTheDocument()
  })
})

test('opens last active picker with single key shortcuts', async () => {
  const {user} = renderRelay<DevelopmentSectionQueries>(
    ({queryData}) => (
      <DevelopmentSection issue={queryData.developmentSectionQuery.repository!.issue!} shortcutEnabled />
    ),
    {
      relay: {
        ...developmentSectionRelayMock,
        mockResolvers: {
          Issue: () => ({
            viewerCanUpdateNext: true,
          }),
        },
      },
      wrapper: Wrapper,
    },
  )

  const repoPickerDescription = 'Select a repository to search for branches and pull requests'
  const pullsPickerBackButtonLabel = 'Return to repository picker'

  // Expect pulls/branches picker to be open after pressing 'd'
  await user.keyboard('d')

  expect(
    screen.queryByLabelText(repoPickerDescription, {
      exact: false,
    }),
  ).not.toBeInTheDocument()

  const repoPickerBackButton = screen.getByLabelText(pullsPickerBackButtonLabel)
  expect(repoPickerBackButton).toBeInTheDocument()

  // Change to the repo picker
  await user.click(repoPickerBackButton)
  await user.keyboard('Escape')

  // Expect repo picker to be open after pressing 'd'
  await user.keyboard('d')
  expect(screen.queryByLabelText(pullsPickerBackButtonLabel)).not.toBeInTheDocument()
  expect(screen.getByText(repoPickerDescription, {exact: false})).toBeInTheDocument()
})

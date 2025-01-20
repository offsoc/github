import {screen} from '@testing-library/react'
import {renderRelay} from '@github-ui/relay-test-utils'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {graphql} from 'relay-runtime'
import type {MockResolverContext} from 'relay-test-utils/lib/RelayMockPayloadGenerator'
import type {TrackedByTestQuery} from './__generated__/TrackedByTestQuery.graphql'
import {TrackedBy} from '../TrackedBy'

const trackedByQuery = graphql`
  query TrackedByTestQuery($issueId: ID!) @relay_test_operation {
    node(id: $issueId) {
      ... on Issue {
        ...TrackedByFragment
      }
    }
  }
`

function setup(url: string, numberOfTrackingIssues: number, isSmall: boolean) {
  const trackingIssues = Array.from({length: numberOfTrackingIssues}, (_, i) => ({
    number: i + 1,
    url: `url${i + 1}`,
    stateReason: 'COMPLETED',
    id: `tracking${i + 1}`,
  }))

  renderRelay<{
    trackedByQuery: TrackedByTestQuery
  }>(
    ({queryData}) => (
      <TrackedBy url={url} isSmall={isSmall} trackedByKey={queryData['trackedByQuery'].node ?? undefined} />
    ),
    {
      relay: {
        queries: {
          trackedByQuery: {
            type: 'fragment',
            query: trackedByQuery,
            variables: {
              issueId: 'issueId',
            },
          },
        },
        mockResolvers: {
          Issue(context: MockResolverContext) {
            if (context.path?.length === 1) {
              return {
                id: 'trackedIssue',
                trackedInIssues: {
                  nodes: trackingIssues,
                  totalCount: numberOfTrackingIssues,
                },
              }
            }
          },
        },
      },
      wrapper: Wrapper,
    },
  )
}

test('Renders tracked by a single issue', async () => {
  setup('ISSUE_URL', 1, false)

  const text = screen.getByText(/tracked by/i)
  expect(text).toBeInTheDocument()
  expect(text.getAttribute('data-hovercard-url')).toBe('ISSUE_URL/tracked_in/hovercard/')

  const link = screen.getByRole('link', {
    name: /#1/i,
  })
  expect(link).toBeInTheDocument()
})

test('Renders tracked by multiple issues', async () => {
  setup('ISSUE_URL', 2, false)

  const text = screen.getByText(/tracked by 2 issues/i)
  expect(text).toBeInTheDocument()
  expect(text.getAttribute('data-hovercard-url')).toBe('ISSUE_URL/tracked_in/hovercard/')
})

test('isSmall -- Renders tracked by a single issue', async () => {
  setup('ISSUE_URL', 1, true)

  const text = screen.getByText(/tracked by/i)
  expect(text).toBeInTheDocument()
  expect(text.getAttribute('data-hovercard-url')).toBe(null)

  const link = screen.getByRole('link', {
    name: /#1/i,
  })
  expect(link).toBeInTheDocument()
})

test('isSmall -- Renders tracked by multiple issues', async () => {
  setup('ISSUE_URL', 2, true)

  const text = screen.getByText(/tracked by 2 issues/i)
  expect(text).toBeInTheDocument()
  expect(text.getAttribute('data-hovercard-url')).toBe(null)
})

import {graphql} from 'relay-runtime'
import {screen} from '@testing-library/react'
import {Wrapper} from '@github-ui/react-core/test-utils'

import {renderRelay} from '@github-ui/relay-test-utils'
import {PinnedIssues} from '../PinnedIssues'
import type {PinnedIssuesTestQuery} from './__generated__/PinnedIssuesTestQuery.graphql'

describe('PinnedIssues', () => {
  it('render issues', () => {
    setup()

    expect(screen.getByText('Issue 1')).toBeInTheDocument()
    expect(screen.getByText('Issue 2')).toBeInTheDocument()
    expect(screen.getByText('Issue 3')).toBeInTheDocument()
  })

  it('issues can be reordered when viewerCanPinnedIssues is true and there is more than one issue', () => {
    setup()

    expect(screen.getByLabelText(/Move Issue 1/)).toBeVisible()
    expect(screen.getByLabelText(/Move Issue 2/)).toBeVisible()
    expect(screen.getByLabelText(/Move Issue 3/)).toBeVisible()
  })

  it('issues cannot be reordered when viewerCanPinnedIssues is false and there is more than one issue', () => {
    setup(3, false)

    expect(screen.queryByLabelText(/Move Issue 1/)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Move Issue 2/)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Move Issue 3/)).not.toBeInTheDocument()
  })

  it('issues cannot be reordered when viewerCanPinnedIssues is true and there is only one issue', () => {
    setup(1, true)

    expect(screen.queryByTestId('sortable-trigger-container')).toHaveClass('v-hidden')
  })

  it('issues cannot be reordered when viewerCanPinnedIssues is false and there is only one issue', () => {
    setup(1, false)

    expect(screen.queryByLabelText(/Move Issue 1/)).not.toBeInTheDocument()
  })
})

function setup(issueCount = 3, viewerCanPinIssues: boolean = true) {
  const nodes: Array<{issue: {title: string; titleHTML: string; state: string; createdAt: string}}> = []
  for (let i = 1; i <= issueCount; i++) {
    nodes.push({
      issue: {
        title: `Issue ${i}`,
        titleHTML: `Issue ${i}`,
        state: 'OPEN',
        createdAt: '2021-11-28T17:08:33.000Z',
      },
    })
  }

  return renderRelay<{pinnedIssuesQuery: PinnedIssuesTestQuery}>(
    ({queryData}) => <PinnedIssues repository={queryData.pinnedIssuesQuery.node!} />,
    {
      relay: {
        queries: {
          pinnedIssuesQuery: {
            type: 'fragment',
            query: graphql`
              query PinnedIssuesTestQuery @relay_test_operation {
                node(id: "pinnedIssue") {
                  ... on Repository {
                    ...PinnedIssues
                  }
                }
              }
            `,
            variables: {},
          },
        },
        mockResolvers: {
          Repository() {
            return {
              viewerCanPinIssues,
              pinnedIssues: {
                nodes,
              },
            }
          },
        },
      },
      wrapper: Wrapper,
    },
  )
}

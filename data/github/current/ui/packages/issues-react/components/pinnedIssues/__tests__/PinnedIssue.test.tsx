import {graphql} from 'relay-runtime'
import {act, screen} from '@testing-library/react'
import {Wrapper} from '@github-ui/react-core/test-utils'

import {renderRelay} from '@github-ui/relay-test-utils'
import {PinnedIssue} from '../PinnedIssue'
import {DragAndDrop} from '@github-ui/drag-and-drop'
import {noop} from '@github-ui/noop'
import type {PinnedIssueTestQuery} from './__generated__/PinnedIssueTestQuery.graphql'

describe('PinnedIssue', () => {
  it('render title', () => {
    setup()

    expect(screen.getByText(/Test Issue HTML/)).toBeInTheDocument()
    expect(screen.getByLabelText(/View Test Issue/)).toBeInTheDocument()
  })

  it('has link to issue url', () => {
    setup()

    const link = screen.getByRole('link', {name: /View Test Issue/})
    expect(link).toBeInTheDocument()
    expect(link.getAttribute('href')).toBe('https://github.com/monalisa/smile/123')
  })

  it('render number', () => {
    setup()

    expect(screen.getByText(/#123/)).toBeInTheDocument()
  })

  it('render author', () => {
    setup()

    expect(screen.getByText(/opened/)).toBeInTheDocument()
    expect(screen.getByText(/monalisa/)).toBeInTheDocument()
  })

  it('render comments count', () => {
    setup()

    expect(screen.getByText(/29/)).toBeInTheDocument()
  })

  it('render open state', () => {
    setup({state: 'OPEN'})

    expect(screen.getByLabelText(/Status: Open/)).toBeInTheDocument()
  })

  it('render closed state', () => {
    setup({state: 'CLOSED'})

    expect(screen.getByLabelText(/Status: Closed/)).toBeInTheDocument()
  })

  it('render issue number date', () => {
    const {container} = setup()

    // eslint-disable-next-line testing-library/no-node-access
    expect(container.querySelector('relative-time')?.getAttribute('datetime')).toBe('2021-11-28T17:08:33.000Z')
  })

  it('render options when viewer has permission', () => {
    setup({repository: {viewerCanPinIssues: true}})

    expect(screen.getByLabelText('Pinned issue options')).toBeInTheDocument()
  })

  it('do not render options when viewer has no permission', () => {
    setup({repository: {viewerCanPinIssues: false}})

    expect(screen.queryByLabelText('Pinned issue options')).not.toBeInTheDocument()
  })

  it('render unpin button in options', () => {
    setup({repository: {viewerCanPinIssues: true}})

    const moreOption = screen.getByLabelText('Pinned issue options')

    act(() => moreOption.click())
    expect(screen.getByLabelText('Unpin issue #123, Test issue', {exact: false})).toBeInTheDocument()
  })

  it('render user profile', () => {
    setup()

    expect(screen.getByRole('link', {name: /monalisa/})).toBeInTheDocument()
    expect(screen.getByLabelText('View monalisa profile', {exact: false})).toBeInTheDocument()
  })
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setup(overrides: any = {}) {
  return renderRelay<{pinnedIssuesQuery: PinnedIssueTestQuery}>(
    ({queryData}) => (
      <DragAndDrop
        items={[]}
        onDrop={noop}
        renderOverlay={() => <PinnedIssue issue={queryData.pinnedIssuesQuery.node!} />}
      >
        <PinnedIssue issue={queryData.pinnedIssuesQuery.node!} />
      </DragAndDrop>
    ),
    {
      relay: {
        queries: {
          pinnedIssuesQuery: {
            type: 'fragment',
            query: graphql`
              query PinnedIssueTestQuery @relay_test_operation {
                node(id: "pinnedIssue") {
                  ... on Issue {
                    ...PinnedIssueIssue
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
              title: 'Test Issue',
              titleHTML: 'Test Issue HTML',
              url: 'https://github.com/monalisa/smile/123',
              number: 123,
              createdAt: '2021-11-28T17:08:33Z',
              author: {
                login: 'monalisa',
              },
              totalCommentsCount: 29,
              ...overrides,
            }
          },
        },
      },
      wrapper: Wrapper,
    },
  )
}

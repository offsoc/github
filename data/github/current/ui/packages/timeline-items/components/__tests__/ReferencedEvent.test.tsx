import {graphql} from 'relay-runtime'
import {renderRelay} from '@github-ui/relay-test-utils'
import {screen} from '@testing-library/react'
import {ReferencedEvent} from '../ReferencedEvent'
import type {ReferencedEventTestQuery} from './__generated__/ReferencedEventTestQuery.graphql'
import type {ReferencedEventTestTwoNodesQuery} from './__generated__/ReferencedEventTestTwoNodesQuery.graphql'

test('Renders single event', () => {
  renderRelay<{query: ReferencedEventTestQuery}>(
    ({queryData}) => <ReferencedEvent queryRef={queryData.query.node!} issueUrl="test" viewer="monalisa" />,
    {
      relay: {
        queries: {
          query: {
            type: 'fragment',
            query: graphql`
              query ReferencedEventTestQuery @relay_test_operation {
                node(id: "node-id") {
                  ... on ReferencedEvent {
                    ...ReferencedEvent
                  }
                }
              }
            `,
            variables: {},
          },
        },
        mockResolvers: {
          Node() {
            return {
              createdAt: '2024-01-01T00:00:00Z',
              actor: {
                login: 'monalisa',
              },
              commit: {
                messageHeadlineHTML: 'commit message1',
                abbreviatedOid: 'oid1',
              },
            }
          },
        },
      },
    },
  )

  expect(screen.getByText('monalisa')).toBeInTheDocument()
  expect(screen.getByText('added a commit that references this issue')).toBeInTheDocument()

  expect(screen.getByText('oid1')).toBeInTheDocument()
  expect(screen.getByText('commit message1')).toBeInTheDocument()
})

test('Renders rolled up events', () => {
  renderRelay<{query: ReferencedEventTestTwoNodesQuery}>(
    ({queryData}) => (
      <ReferencedEvent
        queryRef={queryData.query.node1!}
        rollupGroup={{ReferencedEvent: [queryData.query.node1!, queryData.query.node2!]}}
        issueUrl="test"
        viewer="monalisa"
      />
    ),
    {
      relay: {
        queries: {
          query: {
            type: 'fragment',
            query: graphql`
              query ReferencedEventTestTwoNodesQuery @relay_test_operation {
                node1: node(id: "node-id1") {
                  ... on ReferencedEvent {
                    ...ReferencedEvent
                  }
                }
                node2: node(id: "node-id2") {
                  ... on ReferencedEvent {
                    ...ReferencedEvent
                  }
                }
              }
            `,
            variables: {},
          },
        },
        mockResolvers: {
          Node(id) {
            if (id?.path?.[0] === 'node1') {
              return {
                createdAt: '2024-01-01T00:00:00Z',
                actor: {
                  login: 'monalisa',
                },
                commit: {
                  messageHeadlineHTML: 'commit message1',
                  abbreviatedOid: 'oid1',
                },
              }
            } else if (id?.path?.[0] === 'node2') {
              return {
                createdAt: '2024-01-01T00:00:00Z',
                actor: {
                  login: 'monalisa',
                },
                commit: {
                  messageHeadlineHTML: 'commit message2',
                  abbreviatedOid: 'oid2',
                },
              }
            } else {
              throw new Error('Unknown node id')
            }
          },
        },
      },
    },
  )

  expect(screen.getByText('monalisa')).toBeInTheDocument()
  expect(screen.getByText('added 2 commits that reference this issue')).toBeInTheDocument()

  expect(screen.getByText('oid1')).toBeInTheDocument()
  expect(screen.getByText('commit message1')).toBeInTheDocument()
})

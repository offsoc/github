import {CrossReferencedEvent} from '../CrossReferencedEvent'
import {graphql} from 'relay-runtime'
import type {CrossReferencedEventTestQuery} from './__generated__/CrossReferencedEventTestQuery.graphql'
import {renderRelay} from '@github-ui/relay-test-utils'
import {screen} from '@testing-library/react'
import type {CrossReferencedEventTestTwoNodesQuery} from './__generated__/CrossReferencedEventTestTwoNodesQuery.graphql'

test('Renders single event', () => {
  setup()

  expect(screen.getByText('monalisa')).toBeInTheDocument()
  expect(screen.getByText('issue title')).toBeInTheDocument()
})

test('Renders issue number when source and target are in the same repository', () => {
  setup()

  expect(screen.getByText('monalisa')).toBeInTheDocument()
  expect(screen.getByText('#123')).toBeInTheDocument()
})

test('Renders repository nwo when source and target are in different repositories', () => {
  setup({
    target: {
      repository: {
        id: '222',
      },
    },
  })

  expect(screen.getByText('monalisa')).toBeInTheDocument()
  expect(screen.getByText('github/smile#123')).toBeInTheDocument()

  const lock = screen.queryByRole('tooltip', {name: 'Only people who can see github/smile will see this reference.'})
  expect(lock).not.toBeInTheDocument()
})

test('Renders lock when source and target are in different repositories and source is private', () => {
  setup({
    target: {
      repository: {
        id: '222',
      },
    },
    innerSource: {
      repository: {
        id: '111',
        owner: {
          login: 'github',
        },
        name: 'smile',
        isPrivate: true,
      },
      number: 123,
    },
  })

  expect(screen.getByText('monalisa')).toBeInTheDocument()
  expect(screen.getByText('github/smile#123')).toBeInTheDocument()

  const lock = screen.queryByRole('tooltip', {name: 'Only people who can see github/smile will see this reference.'})
  expect(lock).toBeInTheDocument()
})

test('Doesnt render lock when source and target are in different repositories and source is not private', () => {
  setup({
    target: {
      repository: {
        id: '222',
      },
    },
    innerSource: {
      repository: {
        id: '111',
        owner: {
          login: 'github',
        },
        name: 'smile',
        isPrivate: false,
      },
      number: 123,
    },
  })

  expect(screen.getByText('monalisa')).toBeInTheDocument()
  expect(screen.getByText('github/smile#123')).toBeInTheDocument()

  const lock = screen.queryByRole('tooltip', {name: 'Only people who can see github/smile will see this reference.'})
  expect(lock).not.toBeInTheDocument()
})

test('Renders rolled up events', () => {
  renderRelay<{query: CrossReferencedEventTestTwoNodesQuery}>(
    ({queryData}) => (
      <CrossReferencedEvent
        queryRef={{createdAt: '2020-01-01T04:00:00Z', ...queryData.query.node1!}}
        rollupGroup={{
          CrossReferencedEvent: [
            {createdAt: '2022-01-01T12:00:00Z', ...queryData.query.node1!},
            {createdAt: '2021-01-01T00:00:00Z', ...queryData.query.node2!},
          ],
        }}
        issueUrl="test"
      />
    ),
    {
      relay: {
        queries: {
          query: {
            type: 'fragment',
            query: graphql`
              query CrossReferencedEventTestTwoNodesQuery @relay_test_operation {
                node1: node(id: "node-id1") {
                  ... on CrossReferencedEvent {
                    ...CrossReferencedEvent
                  }
                }
                node2: node(id: "node-id2") {
                  ... on CrossReferencedEvent {
                    ...CrossReferencedEvent
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
                actor: {
                  login: 'monalisa',
                },
                innerSource: {
                  issueTitleHTML: 'title1',
                },
              }
            } else if (id?.path?.[0] === 'node2') {
              return {
                actor: {
                  login: 'monalisa',
                },
                innerSource: {
                  issueTitleHTML: 'title2',
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

  expect(screen.getByText('title1')).toBeInTheDocument()
  expect(screen.getByText('title2')).toBeInTheDocument()

  const relativeTime = screen.getByRole('link', {name: 'on Jan 1, 2022'})
  // eslint-disable-next-line testing-library/no-node-access
  const children = relativeTime.children
  expect(children.length).toBe(1)
  expect(children[0]?.attributes.getNamedItem('datetime')?.value).toBe('2022-01-01T12:00:00.000Z')
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setup(resolverOverrides: any = {}) {
  renderRelay<{query: CrossReferencedEventTestQuery}>(
    ({queryData}) => <CrossReferencedEvent queryRef={queryData.query.node!} issueUrl="test" />,
    {
      relay: {
        queries: {
          query: {
            type: 'fragment',
            query: graphql`
              query CrossReferencedEventTestQuery @relay_test_operation {
                node(id: "node-id") {
                  ... on CrossReferencedEvent {
                    ...CrossReferencedEvent
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
              actor: {
                login: 'monalisa',
              },
              innerSource: {
                issueTitleHTML: 'issue title',
                number: 123,
                repository: {
                  id: '111',
                  owner: {
                    login: 'github',
                  },
                  name: 'smile',
                },
              },
              target: {
                repository: {
                  id: '111',
                },
              },
              ...resolverOverrides,
            }
          },
        },
      },
    },
  )
}

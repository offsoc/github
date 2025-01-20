import {Wrapper} from '@github-ui/react-core/test-utils'
import {renderRelay} from '@github-ui/relay-test-utils'
import {act, screen, within} from '@testing-library/react'
import {graphql} from 'relay-runtime'
import {MockPayloadGenerator} from 'relay-test-utils'

import {ReactionViewer} from '../ReactionViewer'
import type {ReactionViewerTestQuery} from './__generated__/ReactionViewerTestQuery.graphql'

const setup = ({subjectId, locked}: {subjectId?: string; locked?: boolean}) => {
  const {relayMockEnvironment} = renderRelay<{query: ReactionViewerTestQuery}>(
    ({queryData}) => (
      <ReactionViewer subjectId={subjectId || 'subject'} locked={locked} reactionGroups={queryData.query.node!} />
    ),
    {
      relay: {
        queries: {
          query: {
            type: 'fragment',
            query: graphql`
              query ReactionViewerTestQuery @relay_test_operation {
                node(id: "reactable-node-id") {
                  ...ReactionViewerGroups
                }
              }
            `,
            variables: {},
          },
        },
        mockResolvers: {
          Node() {
            return {
              reactionGroups: [
                {
                  content: 'HEART',
                  reactors: {
                    nodes: [
                      {
                        login: 'user1',
                        id: 'user1',
                      },
                      {
                        login: 'user2',
                        id: 'user2',
                      },
                      {
                        login: 'user3',
                        id: 'user3',
                      },
                    ],
                    totalCount: 3,
                  },
                  viewerHasReacted: true,
                },
                {
                  content: 'EYES',
                  reactors: {
                    nodes: [
                      {
                        login: 'user2',
                        id: 'user2',
                      },
                    ],
                    totalCount: 1,
                  },
                  viewerHasReacted: false,
                },
                {
                  content: 'THUMBS_UP',
                  reactors: {
                    nodes: [],
                    totalCount: 0,
                  },
                  viewerHasReacted: false,
                },
                {
                  content: 'THUMBS_DOWN',
                  reactors: {
                    nodes: [],
                    totalCount: 0,
                  },
                  viewerHasReacted: false,
                },
              ],
            }
          },
        },
      },
      wrapper: Wrapper,
    },
  )

  return {environment: relayMockEnvironment}
}

describe('ReactionViewer', () => {
  it('Renders reaction viewer', () => {
    setup({})

    const toolbar = screen.getByRole('toolbar')
    expect(toolbar).toBeInTheDocument()

    const reactions = within(toolbar).getAllByRole('tooltip')

    expect(reactions).toHaveLength(2)
    expect(reactions[0]).toHaveTextContent('❤️')
    expect(reactions[0]).toHaveTextContent('3')
    expect(reactions[0]?.getAttribute('aria-label')).toEqual('user1, user2 and user3')
    expect(reactions[1]).toHaveTextContent('👀')
    expect(reactions[1]).toHaveTextContent('1')
    expect(reactions[1]?.getAttribute('aria-label')).toEqual('user2')
  })

  it('Opens menu and add reaction', () => {
    const {environment} = setup({})

    const toolbar = screen.getByRole('toolbar')
    expect(toolbar).toBeInTheDocument()

    const reactionsMenuButton = screen.getByRole('button', {
      name: /all reactions/i,
    })

    expect(reactionsMenuButton).toBeInTheDocument()
    act(() => reactionsMenuButton.click())

    const reactionsMenu = screen.getByRole('menu')
    expect(reactionsMenu).toBeInTheDocument()

    const thumbsUp = within(reactionsMenu).getByText(/👍/i)
    expect(thumbsUp).toBeInTheDocument()

    act(() => thumbsUp.click())
    // Clicking a reaction should close the menu
    expect(reactionsMenu).not.toBeInTheDocument()

    environment.mock.resolveMostRecentOperation(operation => {
      expect(operation.fragment.node.name).toEqual('addReactionMutation')
      return MockPayloadGenerator.generate(operation, {})
    })
  })

  it('Opens menu and remove reaction', () => {
    const {environment} = setup({})

    const toolbar = screen.getByRole('toolbar')
    expect(toolbar).toBeInTheDocument()

    const reactionsMenuButton = screen.getByRole('button', {
      name: /all reactions/i,
    })

    expect(reactionsMenuButton).toBeInTheDocument()
    act(() => reactionsMenuButton.click())

    const reactionsMenu = screen.getByRole('menu')
    expect(reactionsMenu).toBeInTheDocument()

    const thumbsUp = within(reactionsMenu).getByText(/❤️/i)
    expect(thumbsUp).toBeInTheDocument()

    act(() => thumbsUp.click())
    // Clicking a reaction should close the menu
    expect(reactionsMenu).not.toBeInTheDocument()

    environment.mock.resolveMostRecentOperation(operation => {
      expect(operation.fragment.node.name).toEqual('removeReactionMutation')
      return MockPayloadGenerator.generate(operation, {})
    })
  })
})

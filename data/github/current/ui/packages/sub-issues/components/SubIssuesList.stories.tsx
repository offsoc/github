import type {Meta} from '@storybook/react'
import {expect} from '@storybook/jest'
import {userEvent, within} from '@storybook/test'
import {relayDecorator, type RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import {graphql} from 'react-relay'
import {SubIssuesList} from './SubIssuesList'
import type {SubIssuesListStoryQuery} from './__generated__/SubIssuesListStoryQuery.graphql'
import {SubIssueStateProvider} from './SubIssueStateContext'
import {waitFor} from '@testing-library/react'
import {dragStart, dragEnd, dragMove} from '@github-ui/drag-and-drop/test-utils'

const meta = {
  title: 'Apps/Sub Issues',
  component: SubIssuesList,
  parameters: {
    a11y: {
      config: {
        // Disable role=presentation axe rule on anchor tag
        rules: [
          {id: 'aria-allowed-role', enabled: false},
          {id: 'presentation-role-conflict', enabled: false},
        ],
      },
    },
  },
} satisfies Meta<typeof SubIssuesList>

export default meta

type Queries = {subIssuesListStoryQuery: SubIssuesListStoryQuery}

const ISSUES_COUNT = 4

let count = 0

const SubIssuesListStoryQuery = graphql`
  query SubIssuesListStoryQuery @relay_test_operation {
    node(id: "I_abc123") {
      ... on Issue {
        ...SubIssuesList
      }
    }
    viewer {
      ...SubIssuesListViewViewer
    }
  }
`

export const SubIssuesListKeyboardExample = {
  decorators: [
    relayDecorator<typeof SubIssuesList, Queries>,
    Story => (
      <SubIssueStateProvider>
        <Story />
      </SubIssueStateProvider>
    ),
  ],
  parameters: {
    enabledFeatures: [],
    relay: {
      queries: {
        subIssuesListStoryQuery: {
          type: 'fragment',
          query: SubIssuesListStoryQuery,
          variables: {},
        },
      },
      mockResolvers: {
        User({path}) {
          if (path?.includes('viewer')) {
            return {
              isEmployee: true,
            }
          }
        },
        Issue({path}) {
          if (path?.includes('subIssues')) {
            // Reset so the count doesn't go > ISSUES_COUNT unexpectedly when a user reruns the Storybook
            // Interaction tests
            if (count === ISSUES_COUNT) {
              count = 0
            }
            const currentCount = count++
            const isCompleted = currentCount % 2 === 0
            return {
              titleHTML: `Child ${currentCount}`,
              number: currentCount + 1,
              state: isCompleted ? 'CLOSED' : 'OPEN',
              isReadByViewer: true,
              labels: {
                nodes: [
                  {
                    name: 'documentation',
                    color: '0075ca',
                  },
                  {
                    name: 'enhancement',
                    color: 'a2eeef',
                  },
                ],
              },
              subIssues: {
                nodes: [
                  {
                    titleHTML: `Child ${count}.1`,
                    state: 'OPEN',
                  },
                  {
                    titleHTML: `Child ${count}.2`,
                    state: 'CLOSED',
                  },
                ],
              },
              subIssuesSummary: {
                total: 2,
                completed: isCompleted ? 2 : 1,
                percentCompleted: isCompleted ? 100 : 50,
              },
              assignees: {
                totalCount: 2,
                edges: [
                  {node: {login: 'monalisa', avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4'}},
                  {node: {login: 'octocat', avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4'}},
                ],
              },
              closedByPullRequestsReferences: 2,
            }
          }
          return {
            subIssues: {
              nodes: Array.from({length: ISSUES_COUNT}, () => ({})),
            },
            subIssuesSummary: {
              total: ISSUES_COUNT,
              completed: 2,
              percentCompleted: 50,
            },
          }
        },
      },
      mapStoryArgs: ({queryData: {subIssuesListStoryQuery}}) => ({
        issueKey: subIssuesListStoryQuery.node!,
        viewerKey: subIssuesListStoryQuery.viewer,
      }),
    },
  },
  play: async ({context}) => {
    const {canvasElement, step} = context
    const canvas = within(canvasElement)

    await step('dismiss keyboard specific instructions modal', async () => {
      const itemsLocator = canvas.getAllByTestId('sortable-item')

      const keyboardTrigger = within(itemsLocator[0]!).getByRole('treeitem')
      keyboardTrigger?.focus()
      await userEvent.keyboard(' ') // start drag

      const keyboardSpecificInstructionsModal = canvas.queryByRole('dialog', {name: 'How to move objects via keyboard'})
      if (keyboardSpecificInstructionsModal) {
        const hideCheckbox = within(keyboardSpecificInstructionsModal).getByRole('checkbox')
        await userEvent.click(hideCheckbox)

        await userEvent.keyboard('{Tab}') // focus close button
        await userEvent.keyboard(' ') // close modal
      }
      await userEvent.keyboard('{Escape}') // end drag
    })

    await step('should drag and drop item when pressing the space key', async () => {
      let itemsLocator = canvas.getAllByTestId('sortable-item')

      let itemTexts = itemsLocator.map(item => within(item).getByTestId('listitem-title-link').textContent)
      await expect(itemTexts[0]).toEqual('Child 0 #1')
      await expect(itemTexts[1]).toEqual('Child 1 #2')
      await expect(itemTexts[2]).toEqual('Child 2 #3')

      const keyboardTrigger = within(itemsLocator[0]!).getByRole('treeitem')
      keyboardTrigger?.focus()
      await userEvent.keyboard(' ') // start drag
      await userEvent.keyboard('{ArrowDown}') // move item one down
      await userEvent.keyboard(' ') // end drag drag

      itemsLocator = canvas.getAllByTestId('sortable-item')
      itemTexts = itemsLocator.map(item => within(item).getByTestId('listitem-title-link').textContent)
      await waitFor(() => expect(itemTexts[0]).toEqual('Child 1 #2'))
      await expect(itemTexts[1]).toEqual('Child 0 #1')
      await expect(itemTexts[2]).toEqual('Child 2 #3')
    })

    await step('should cancel drag and revert to original state when pressing escape', async () => {
      const itemsLocator = canvas.getAllByTestId('sortable-item')

      const keyboardTrigger = within(itemsLocator[0]!).getByRole('treeitem')
      keyboardTrigger?.focus()
      await userEvent.keyboard(' ') // start drag
      await userEvent.keyboard('{ArrowDown}') // move item one down
      await userEvent.keyboard('{Escape}') // end drag drag

      const itemTexts = itemsLocator.map(item => within(item).getByTestId('listitem-title-link').textContent)
      await expect(itemTexts[0]).toEqual('Child 1 #2')
      await expect(itemTexts[1]).toEqual('Child 0 #1')
      await expect(itemTexts[2]).toEqual('Child 2 #3')
    })
  },
} satisfies RelayStoryObj<typeof SubIssuesList, Queries>

export const SubIssuesListMouseExample = {
  decorators: [
    relayDecorator<typeof SubIssuesList, Queries>,
    Story => (
      <SubIssueStateProvider>
        <Story />
      </SubIssueStateProvider>
    ),
  ],
  parameters: {
    enabledFeatures: ['nested_list_view_dnd'],
    relay: {
      queries: {
        subIssuesListStoryQuery: {
          type: 'fragment',
          query: SubIssuesListStoryQuery,
          variables: {},
        },
      },
      mockResolvers: {
        User({path}) {
          if (path?.includes('viewer')) {
            return {
              isEmployee: true,
            }
          }
        },
        Issue({path}) {
          if (path?.includes('subIssues')) {
            // Reset so the count doesn't go > ISSUES_COUNT unexpectedly when a user reruns the Storybook
            // Interaction tests
            if (count === ISSUES_COUNT) {
              count = 0
            }
            const currentCount = count++
            const isCompleted = currentCount % 2 === 0
            return {
              titleHTML: `Child ${currentCount}`,
              number: currentCount + 1,
              state: isCompleted ? 'CLOSED' : 'OPEN',
              isReadByViewer: true,
              labels: {
                nodes: [
                  {
                    name: 'documentation',
                    color: '0075ca',
                  },
                  {
                    name: 'enhancement',
                    color: 'a2eeef',
                  },
                ],
              },
              subIssues: {
                nodes: [
                  {
                    titleHTML: `Child ${count}.1`,
                    state: 'OPEN',
                  },
                  {
                    titleHTML: `Child ${count}.2`,
                    state: 'CLOSED',
                  },
                ],
              },
              subIssuesSummary: {
                total: 2,
                completed: isCompleted ? 2 : 1,
                percentCompleted: isCompleted ? 100 : 50,
              },
              assignees: {
                totalCount: 2,
                edges: [
                  {node: {login: 'monalisa', avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4'}},
                  {node: {login: 'octocat', avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4'}},
                ],
              },
              closedByPullRequestsReferences: 2,
            }
          }
          return {
            subIssues: {
              nodes: Array.from({length: ISSUES_COUNT}, () => ({})),
            },
            subIssuesSummary: {
              total: ISSUES_COUNT,
              completed: 2,
              percentCompleted: 50,
            },
          }
        },
      },
      mapStoryArgs: ({queryData: {subIssuesListStoryQuery}}) => ({
        issueKey: subIssuesListStoryQuery.node!,
        viewerKey: subIssuesListStoryQuery.viewer,
      }),
    },
  },
  play: async ({context}) => {
    const {canvasElement, step} = context
    const canvas = within(canvasElement)

    await step('should drag and drop item with mouse', async () => {
      let itemsLocator = canvas.getAllByTestId('sortable-item')

      const firstTrigger = within(itemsLocator[0]!).getByTestId('sortable-mouse-trigger')
      // const secondTrigger = within(itemsLocator[1]!).getByTestId('sortable-mouse-trigger')
      const {currentPosition, mouseStep} = await dragStart({element: firstTrigger, delta: {x: 0, y: 40}})
      const moveCurrentPosition = await dragMove(firstTrigger, currentPosition, mouseStep)
      await dragEnd(firstTrigger, moveCurrentPosition)

      itemsLocator = canvas.getAllByTestId('sortable-item')
      const itemTexts = itemsLocator.map(item => within(item).getByTestId('listitem-title-link').textContent)
      await expect(itemTexts[0]).toEqual('Child 1 #2')
      await expect(itemTexts[1]).toEqual('Child 0 #1')
      await expect(itemTexts[2]).toEqual('Child 2 #3')
    })
  },
} satisfies RelayStoryObj<typeof SubIssuesList, Queries>

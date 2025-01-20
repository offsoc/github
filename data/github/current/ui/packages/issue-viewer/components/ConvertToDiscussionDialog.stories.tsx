import type {Meta} from '@storybook/react'
import {ConvertToDiscussionDialog, type ConvertToDiscussionDialogPropsInternal} from './ConvertToDiscussionDialog'
import {relayDecorator, type RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import {noop} from '@github-ui/noop'
import type {ConvertToDiscussionDialogQuery} from './__generated__/ConvertToDiscussionDialogQuery.graphql'

type ConvertToDiscussionDialogQueries = {
  convertToDiscussionDialogQuery: ConvertToDiscussionDialogQuery
}

const meta: Meta<typeof ConvertToDiscussionDialog> = {
  title: 'IssueViewer/ConvertToDiscussionDialog',
  component: ConvertToDiscussionDialog,
}

export default meta

const defaultArgs: Partial<ConvertToDiscussionDialogPropsInternal> = {
  owner: 'monalisa',
  repository: 'smile',
  issueId: 'I_xyz',
  onClose: noop,
}

export const Example = {
  decorators: [relayDecorator<typeof ConvertToDiscussionDialog, ConvertToDiscussionDialogQueries>],
  parameters: {
    relay: {
      queries: {
        convertToDiscussionDialogQuery: {
          type: 'lazy',
        },
      },
      mockResolvers: {
        Issue(_ctx, id) {
          return {
            title: `My issue title ${id()}`,
            number: 33,
            comments: {totalCount: 1},
            reactions: {totalCount: 1},
            tasklistBlocks: {totalCount: 1},
            assignees: {totalCount: 1},
            projectsNext: {totalCount: 1},
            projectCards: {totalCount: 1},
            milestone: null,
          }
        },
        DiscussionCategoryConnection() {
          return {
            edges: [
              {node: {id: 'DIC_1', name: 'Announcements'}},
              {node: {id: 'DIC_2', name: 'General'}},
              {node: {id: 'DIC_3', name: 'Ideas'}},
            ],
          }
        },
      },
      mapStoryArgs: () => ({
        ...defaultArgs,
      }),
    },
  },
} satisfies RelayStoryObj<typeof ConvertToDiscussionDialog, ConvertToDiscussionDialogQueries>

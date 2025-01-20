import type {WebCommitInfo} from '@github-ui/code-view-types'
import type {Meta} from '@storybook/react'

import {WebCommitDialog, type WebCommitDialogProps} from '../WebCommitDialog'

const meta = {
  title: 'Recipes/WebCommitDialog',
  component: WebCommitDialog,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    dialogState: {
      control: {
        type: 'select',
        options: ['closed', 'pending', 'saving', 'saved'],
      },
    },
    webCommitInfo: {
      control: {
        type: 'object',
      },
    },
    // all the types defined below
    onSave: {action: 'onSave'},
    setDialogState: {action: 'setDialogState'},
    setMessage: {action: 'setMessage'},
    setDescription: {action: 'setDescription'},
    setAuthorEmail: {action: 'setAuthorEmail'},
    message: {control: {type: 'text'}},
    description: {control: {type: 'text'}},
    isQuickPull: {control: {type: 'boolean'}},
    helpUrl: {control: {type: 'text'}},
    refName: {control: {type: 'text'}},
  },
} satisfies Meta<typeof WebCommitDialog>

export default meta

const testWebCommitInfo: WebCommitInfo = {
  authorEmails: ['test1@test.com', 'test2@test.com'],
  canCommitStatus: 'allowed',
  commitOid: '',
  dcoSignoffEnabled: false,
  defaultEmail: 'test2@test.com',
  defaultNewBranchName: 'patch-1',
  forkedRepo: undefined,
  lockedOnMigration: false,
  pr: '',
  repoHeadEmpty: false,
  saveUrl: 'testUrl',
  shouldFork: false,
  shouldUpdate: false,
  suggestionsUrlEmoji: '',
  suggestionsUrlIssue: '',
  suggestionsUrlMention: '',
}

const defaultArgs: Partial<WebCommitDialogProps> = {
  helpUrl: 'https://example.com',
  refName: 'main',
  dialogState: 'closed',
  webCommitInfo: testWebCommitInfo,
  onSave: () => {},
  setDialogState: () => {},
  message: 'message',
  setMessage: () => {},
  description: 'description',
  setDescription: () => {},
  isQuickPull: false,
  setAuthorEmail: () => {},
}

export const WebCommitDialogExample = {
  args: {
    ...defaultArgs,
  },
  render: (args: WebCommitDialogProps) => <WebCommitDialog {...args} />,
}

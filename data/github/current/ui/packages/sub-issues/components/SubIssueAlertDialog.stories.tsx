import {noop} from '@github-ui/noop'
import {SubIssueAlertDialog, type SubIssueAlertDialogProps} from './SubIssueAlertDialog'
import type {Meta} from '@storybook/react'

const meta = {
  title: 'Apps/Sub Issues',
  component: SubIssueAlertDialog,
} satisfies Meta<typeof SubIssueAlertDialog>

export default meta

const args = {
  title: 'Are you sure?',
  children: 'This action cannot be undone.',
  onClose: noop,
} satisfies SubIssueAlertDialogProps

export const SubIssueAlertDialogExample = {args}

import type {Meta} from '@storybook/react'
import {ActionMenuSelector, type ActionMenuSelectorProps} from '../ActionMenuSelector'

const orderedStatuses: string[] = ['all', 'pass', 'fail', 'bypass']

const ruleStatuses: Record<string, string> = {
  all: 'All statuses',
  pass: 'Pass',
  fail: 'Fail',
  bypass: 'Bypass',
}

const meta = {
  title: 'ReposComponents/ActionMenuSelector',
  component: ActionMenuSelector,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof ActionMenuSelector>

export default meta

const defaultArgs: Partial<ActionMenuSelectorProps<string>> = {
  currentSelection: 'all',
  orderedValues: orderedStatuses,
  displayValues: ruleStatuses,
  onSelect: () => null,
}

export const ActionMenuSelectorExample = {
  args: {
    ...defaultArgs,
  },
  render: (args: ActionMenuSelectorProps<string>) => <ActionMenuSelector {...args} />,
}

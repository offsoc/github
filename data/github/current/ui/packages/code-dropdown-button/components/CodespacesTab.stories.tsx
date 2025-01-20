import type {Meta} from '@storybook/react'
import {CodespacesTab, type CodespacesTabProps} from './CodespacesTab'
import {testCodeButtonPayload} from '../__tests__/test-helpers'

const meta = {
  title: 'Recipes/CodespacesTab',
  component: CodespacesTab,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    isLoggedIn: {control: 'boolean', defaultValue: false},
  },
} satisfies Meta<typeof CodespacesTab>

export default meta

const defaultArgs: CodespacesTabProps = {
  ...testCodeButtonPayload.codespaces,
}

export const CodespacesTabExample = {
  args: {
    ...defaultArgs,
  },
  render: (args: CodespacesTabProps) => <CodespacesTab {...args} />,
}

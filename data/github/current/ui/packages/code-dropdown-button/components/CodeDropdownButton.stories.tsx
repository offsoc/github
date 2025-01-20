import type {Meta} from '@storybook/react'
import {CodeDropdownButton, type CodeDropdownButtonProps} from './CodeDropdownButton'
import {testCodeButtonPayload} from '../__tests__/test-helpers'
import {LocalTab} from './LocalTab'
import {CopilotTab} from './CopilotTab'
import {CodespacesTab} from './CodespacesTab'
import {Wrapper} from '@github-ui/react-core/test-utils'

const meta = {
  title: 'Recipes/CodeDropdownButton',
  component: CodeDropdownButton,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    primary: {control: 'boolean', defaultValue: false},
  },
} satisfies Meta<typeof CodeDropdownButton>

export default meta

const defaultArgs: CodeDropdownButtonProps = {
  primary: false,
  showCodespacesTab: false,
  showCopilotTab: false,
  isEnterprise: false,
  localTab: <LocalTab {...testCodeButtonPayload.local} />,
  copilotTab: <CopilotTab {...testCodeButtonPayload.copilot} />,
  codespacesTab: <CodespacesTab {...testCodeButtonPayload.codespaces} />,
}

export const LocalOnly = {
  args: defaultArgs,
  render: (args: CodeDropdownButtonProps) => (
    <Wrapper appPayload={{helpUrl: ''}}>
      <CodeDropdownButton {...args} />
    </Wrapper>
  ),
}

export const CodespacesEnabled = {
  args: {
    ...defaultArgs,
    codespacesEnabled: true,
  },
  render: (args: CodeDropdownButtonProps) => (
    <Wrapper appPayload={{helpUrl: ''}}>
      <CodeDropdownButton {...args} />
    </Wrapper>
  ),
}

export const CopilotEnabled = {
  args: {
    ...defaultArgs,
    copilotEnabled: true,
  },
  render: (args: CodeDropdownButtonProps) => (
    <Wrapper appPayload={{helpUrl: ''}}>
      <CodeDropdownButton {...args} />
    </Wrapper>
  ),
}

export const IsPrimary = {
  args: {
    ...defaultArgs,
    primary: true,
  },
  render: (args: CodeDropdownButtonProps) => (
    <Wrapper appPayload={{helpUrl: ''}}>
      <CodeDropdownButton {...args} />
    </Wrapper>
  ),
}

export const isEnterprise = {
  args: {
    ...defaultArgs,
    isEnterprise: true,
  },
  render: (args: CodeDropdownButtonProps) => (
    <Wrapper appPayload={{helpUrl: ''}}>
      <CodeDropdownButton {...args} />
    </Wrapper>
  ),
}

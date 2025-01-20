import type {Meta} from '@storybook/react'
import {CopyToClipboardButton} from '.'
import type {CopyToClipboardButtonProps} from './CopyToClipboardButton'

const meta = {
  title: 'Utilities/CopyToClipboard',
  component: CopyToClipboardButton,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    textToCopy: {control: 'text', defaultValue: 'Hello, Storybook!'},
  },
} satisfies Meta<typeof CopyToClipboardButton>

export default meta

const defaultArgs: Partial<CopyToClipboardButtonProps> = {
  textToCopy: 'Hello, Storybook!',
}

export const Default = {
  args: {
    ...defaultArgs,
  },
  render: (args: CopyToClipboardButtonProps) => <CopyToClipboardButton {...args} />,
}

export const WithPortalTooltip = {
  args: {
    ...defaultArgs,
    hasPortalTooltip: true,
  },
  render: (args: CopyToClipboardButtonProps) => <CopyToClipboardButton {...args} />,
}

export const WithAccessibleButton = {
  args: {
    ...defaultArgs,
    accessibleButton: true,
  },
  render: (args: CopyToClipboardButtonProps) => <CopyToClipboardButton {...args} />,
}

export const avoidStyledComponent = {
  args: {
    ...defaultArgs,
    avoidStyledComponent: true,
  },
  render: (args: CopyToClipboardButtonProps) => <CopyToClipboardButton {...args} />,
}

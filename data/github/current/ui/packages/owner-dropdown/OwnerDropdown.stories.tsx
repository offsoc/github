import type {Meta} from '@storybook/react'
import {OwnerDropdown, type OwnerDropdownProps} from './OwnerDropdown'

const meta = {
  title: 'OwnerDropdown',
  component: OwnerDropdown,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {},
} satisfies Meta<typeof OwnerDropdown>

export default meta

const owners = [
  {
    name: 'octocat',
    avatarUrl: `https://avatars.githubusercontent.com/u/octocat`,
    disabled: false,
    customDisabledMessage: null,
    isOrganization: false,
  },
  {
    name: 'monalisa',
    avatarUrl: `https://avatars.githubusercontent.com/u/monalisa`,
    disabled: false,
    customDisabledMessage: null,
    isOrganization: false,
  },
]

const defaultArgs: Partial<OwnerDropdownProps> = {
  initialOwnerItems: owners,
  selectedOwner: owners[0],
  onOwnerChange: () => {},
}

export const OwnerDropdownExample = {
  args: {
    ...defaultArgs,
  },
  render: (args: OwnerDropdownProps) => <OwnerDropdown {...args} />,
}

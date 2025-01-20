import type {Meta} from '@storybook/react'
import {UserSelector, type UserSelectorProps} from './UserSelector'
import {defaultUsersState} from './test-utils/mock-data'

const meta = {
  title: 'UserSelector',
  component: UserSelector,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof UserSelector>

export default meta

const defaultArgs: Partial<UserSelectorProps> = {
  defaultText: 'All users',
  usersState: defaultUsersState,
  currentUser: undefined,
}

export const UserSelectorExample = {
  args: {
    ...defaultArgs,
  },
  render: (args: UserSelectorProps) => <UserSelector {...args} />,
}

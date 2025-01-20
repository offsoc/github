import type {Meta} from '@storybook/react'
import {BypassList, type BypassListProps} from './BypassList'
import {OrgAdminBypassMode} from '../../bypass-actors-types'
import {getBypassActor} from '../../test-utils/mock-data'
import {ORGANIZATION_ADMIN_ROLE} from '../../helpers/constants'

const meta = {
  title: 'Recipes/BypassActors/BypassList',
  component: BypassList,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    readOnly: {control: 'boolean', defaultValue: false},
    isBypassModeEnabled: {control: 'boolean', defaultValue: false},
    orgAdminBypassMode: {
      control: 'radio',
      options: [OrgAdminBypassMode.OrgBypassAny, OrgAdminBypassMode.OrgBypassPRsOnly],
    },
  },
} satisfies Meta<typeof BypassList>

export default meta

const defaultArgs: Partial<BypassListProps> = {
  readOnly: false,
  isBypassModeEnabled: false,
  removeBypassActor: () => null,
  updateBypassActor: () => null,
  enabledBypassActors: [],
  baseAvatarUrl: 'https://avatars.githubusercontent.com',
}

export const BypassListExample = {
  args: {
    ...defaultArgs,
    enabledBypassActors: [getBypassActor(1, 'Team'), getBypassActor(2, 'Team'), ORGANIZATION_ADMIN_ROLE],
  },
  render: (args: BypassListProps) => (
    <ul>
      <BypassList {...args} />
    </ul>
  ),
}

import type {Meta} from '@storybook/react'
import {noop} from '@github-ui/noop'
import {OrganizationPickerBase} from './OrganizationPicker'
import {buildOrganization} from '../test-utils/OrganizationPickerHelpers'

type OrganizationPickerBaseProps = React.ComponentProps<typeof OrganizationPickerBase>

const organizations = [
  buildOrganization({id: 'id1', name: 'organization1'}),
  buildOrganization({id: 'id2', name: 'organization2'}),
  buildOrganization({id: 'id3', name: 'organization3'}),
]

const meta = {
  title: 'ItemPicker/OrganizationPicker',
  component: OrganizationPickerBase,
} satisfies Meta<OrganizationPickerBaseProps>

export default meta

const args = {
  items: organizations,
  onFilter: noop,
  onSelectionChange: noop,
} satisfies OrganizationPickerBaseProps

export const Example = {args}

export const WithSelection = {
  args: {...args, initialSelectedItem: organizations[1]},
}

import type {Meta} from '@storybook/react'
import {OrgSelector, type OrgSelectorProps} from './OrgSelector'

const meta = {
  title: 'Recipes/OrgSelector',
  component: OrgSelector,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {},
} satisfies Meta<typeof OrgSelector>

export default meta

const defaultArgs: Partial<OrgSelectorProps> = {
  baseAvatarUrl: '',
  selectedOrgs: [],
  selectOrg: () => {},
  removeOrg: () => {},
  orgLoader: async () => {
    return await [
      {id: 0, nodeId: '0', name: 'Org 0'},
      {id: 1, nodeId: '1', name: 'Org 1'},
      {id: 2, nodeId: '2', name: 'Org 2'},
      {id: 3, nodeId: '3', name: 'Org 3'},
      {id: 4, nodeId: '4', name: 'Org 4'},
    ]
  },
}

export const OrgSelectorExample = {
  args: {
    ...defaultArgs,
  },
  render: (args: OrgSelectorProps) => <OrgSelector {...args} />,
}

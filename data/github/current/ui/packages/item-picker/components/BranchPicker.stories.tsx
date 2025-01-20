import type {Meta} from '@storybook/react'
import {noop} from '@github-ui/noop'
import {BranchPickerBase} from './BranchPicker'
import {buildBranch} from '../test-utils/BranchPickerHelpers'

type BranchPickerBaseProps = React.ComponentProps<typeof BranchPickerBase>

const branches = [
  buildBranch({id: 'id1', name: 'branch1'}),
  buildBranch({id: 'id2', name: 'branch2'}),
  buildBranch({id: 'id3', name: 'branch3'}),
]

const meta = {
  title: 'ItemPicker/BranchPicker',
  component: BranchPickerBase,
} satisfies Meta<BranchPickerBaseProps>

export default meta

const args = {
  items: branches,
  onFilter: noop,
  onSelectionChange: noop,
  defaultBranchId: 'id1',
} satisfies BranchPickerBaseProps

export const Example = {args}

export const WithSelection = {
  args: {...args, initialSelectedItem: branches[1]},
}

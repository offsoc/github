import type {Meta} from '@storybook/react'
import {FixedSizeVirtualList} from './FixedSizeVirtualList'

type FixedSizeVirtualListProps = React.ComponentProps<typeof FixedSizeVirtualList<string>>

const args = {
  items: ['one', 'two', 'three'],
  itemHeight: 20,
  renderItem: (item: string) => <div>{item}</div>,
  makeKey: (item: string) => item,
} satisfies FixedSizeVirtualListProps

const meta = {
  title: 'ReposComponents/RefSelector/FixedSizeVirtualList',
  component: FixedSizeVirtualList,
} satisfies Meta<typeof FixedSizeVirtualList>

export default meta

export const Example = {args}

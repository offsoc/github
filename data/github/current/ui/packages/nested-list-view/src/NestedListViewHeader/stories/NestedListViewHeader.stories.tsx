import type {Meta, StoryObj} from '@storybook/react'

import {PropertiesProvider} from '../../context/PropertiesContext'
import {SelectionProvider} from '../../context/SelectionContext'
import {TitleProvider} from '../../context/TitleContext'
import {SampleListViewHeaderWithActions} from '../../stories/helpers'
import styles from '../../stories/stories.module.css'
import {NestedListViewHeader, type NestedListViewHeaderProps} from '../NestedListViewHeader'

type HeaderWithActionsProps = {containerWidth?: number} & NestedListViewHeaderProps

const meta: Meta<HeaderWithActionsProps> = {
  title: 'Recipes/NestedListView/NestedListViewHeader',
  component: NestedListViewHeader,
  args: {
    containerWidth: 600,
  },
  argTypes: {
    containerWidth: {
      control: {type: 'number', step: 25, min: 0},
      description:
        'The width in pixels of the container for the ListView.Metadata, to easily see action bar overflow menu behavior.',
    },
  },
}

export default meta
type Story = StoryObj<typeof NestedListViewHeader>

export const Example: Story = {
  render: ({containerWidth, ...args}: HeaderWithActionsProps) => (
    <div
      className={styles.headerBorder}
      style={{
        width: typeof containerWidth === 'number' ? `${containerWidth}px` : 'auto',
      }}
    >
      <SampleListViewHeaderWithActions {...args} />
    </div>
  ),
  decorators: [
    Story => (
      <PropertiesProvider>
        <TitleProvider title="List view with metadata">
          <SelectionProvider isSelectable selectedCount={5} countOnPage={20} totalCount={123}>
            <Story />
          </SelectionProvider>
        </TitleProvider>
      </PropertiesProvider>
    ),
  ],
}

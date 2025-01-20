import type {Meta, StoryObj} from '@storybook/react'

import {ListViewDensityToggle} from '../DensityToggle'
import {IdProvider} from '../IdContext'
import {ListViewMetadata, type ListViewMetadataProps} from '../Metadata'
import {MultiPageSelectionProvider} from '../MultiPageSelectionContext'
import {SelectionProvider} from '../SelectionContext'
import {TitleProvider} from '../TitleContext'
import {VariantProvider} from '../VariantContext'
import {SampleListViewMetadataWithActions} from './helpers'
import styles from './Metadata.stories.module.css'

type MetadataWithActionsProps = {containerWidth?: number} & ListViewMetadataProps

const meta: Meta<MetadataWithActionsProps> = {
  title: 'Recipes/ListView/Subcomponents/ListViewMetadata',
  component: ListViewMetadata,
  args: {
    densityToggle: <ListViewDensityToggle />,
    containerWidth: 600,
  },
  argTypes: {
    containerWidth: {
      control: {type: 'number', step: 25, min: 0},
      description:
        'The width in pixels of the container for the ListViewMetadata, to easily see action bar overflow menu behavior.',
    },
  },
}

export default meta
type Story = StoryObj<MetadataWithActionsProps>

export const Example: Story = {
  render: ({containerWidth, ...args}: MetadataWithActionsProps) => (
    <IdProvider>
      <TitleProvider title="List view with metadata">
        <VariantProvider variant="compact">
          <SelectionProvider isSelectable selectedCount={5} countOnPage={20} totalCount={123}>
            <MultiPageSelectionProvider>
              <div
                style={{width: typeof containerWidth === 'number' ? `${containerWidth}px` : 'auto'}}
                className={styles.container}
              >
                <SampleListViewMetadataWithActions {...args} />
              </div>
            </MultiPageSelectionProvider>
          </SelectionProvider>
        </VariantProvider>
      </TitleProvider>
    </IdProvider>
  ),
}
Example.storyName = 'ListViewMetadata'

import type {Meta, StoryObj} from '@storybook/react'

import {Variants} from '../../constants'
import {ListView} from '../../ListView/ListView'
import {
  Comments,
  generateDescription,
  generateLabels,
  generateStatusIcon,
  Labels,
  SampleListItemActionBar,
} from '../../ListView/stories/helpers'
import type {VariantType} from '../../ListView/VariantContext'
import {ListItemDescription} from '../Description'
import {ListItemLeadingContent} from '../LeadingContent'
import {ListItemLeadingVisual} from '../LeadingVisual'
import {ListItem, type ListItemProps} from '../ListItem'
import {ListItemMainContent} from '../MainContent'
import {ListItemMetadata} from '../Metadata'
import {ListItemTitle} from '../Title'

type ListItemWithArgs = ListItemProps & {variant: VariantType}

const meta: Meta<ListItemWithArgs> = {
  title: 'Recipes/ListView/_ListItem',
  component: ListItem,
  args: {
    variant: 'default',
  },
  argTypes: {
    variant: {
      description: 'Type of ListView variant. Controls the width and height of the list and its contents',
      options: Variants,
      control: 'radio',
    },
  },
}

export default meta
type Story = StoryObj<ListItemWithArgs>

export const Example: Story = {
  render: ({variant, ...args}: ListItemWithArgs) => (
    <ListView variant={variant} totalCount={1} title="ListItem story" titleHeaderTag="h3">
      <ListItem
        {...args}
        title={
          <ListItemTitle
            value="Updates to velocity of the ship and alien movements to directly support the new engine"
            href="#"
          />
        }
        metadata={
          <>
            <ListItemMetadata>
              <Labels items={generateLabels(1)} />
            </ListItemMetadata>
            <ListItemMetadata>
              <Comments count={2} />
            </ListItemMetadata>
          </>
        }
        secondaryActions={<SampleListItemActionBar />}
      >
        <ListItemLeadingContent>
          <ListItemLeadingVisual {...generateStatusIcon('Issues')} newActivity={true} />
        </ListItemLeadingContent>

        <ListItemMainContent>
          <ListItemDescription>{generateDescription('Combo')}</ListItemDescription>
        </ListItemMainContent>
      </ListItem>
    </ListView>
  ),
}

import type {Meta, StoryObj} from '@storybook/react'

import {NestedListView} from '../../NestedListView'
import {
  Comments,
  generateDescription,
  generateLabels,
  generateStatusIcon,
  Labels,
  SampleNestedListItemActionBar,
} from '../../stories/helpers'
import {NestedListItemDescription} from '../Description'
import {NestedListItemLeadingContent} from '../LeadingContent'
import {NestedListItemLeadingVisual} from '../LeadingVisual'
import {NestedListItemMainContent} from '../MainContent'
import {NestedListItemMetadata, type NestedListItemMetadataProps} from '../Metadata'
import {NestedListItem} from '../NestedListItem'
import {NestedListItemTitle} from '../Title'

const meta: Meta<NestedListItemMetadataProps> = {
  title: 'Recipes/NestedListView/NestedListItem/Metadata',
  component: NestedListItemMetadata,
  parameters: {
    a11y: {
      config: {
        // Disable role=presentation axe rule on anchor tag
        rules: [
          {id: 'aria-allowed-role', enabled: false},
          {id: 'presentation-role-conflict', enabled: false},
        ],
      },
    },
  },
}

export default meta
type Story = StoryObj<NestedListItemMetadataProps>

export const Example: Story = {
  render: () => {
    const subItems = [
      <NestedListItem
        key={0}
        title={
          <NestedListItemTitle
            value="Updates to velocity of the ship and alien movements to directly support the new engine"
            href="#"
          />
        }
        metadata={
          <>
            <NestedListItemMetadata>
              <Labels items={generateLabels(1)} />
            </NestedListItemMetadata>
            <NestedListItemMetadata>
              <Comments count={2} />
            </NestedListItemMetadata>
          </>
        }
        secondaryActions={<SampleNestedListItemActionBar />}
      >
        <NestedListItemLeadingContent>
          <NestedListItemLeadingVisual {...generateStatusIcon('Issues')} newActivity={true} />
        </NestedListItemLeadingContent>

        <NestedListItemMainContent>
          <NestedListItemDescription>{generateDescription('Combo')}</NestedListItemDescription>
        </NestedListItemMainContent>
      </NestedListItem>,
      <NestedListItem
        key={1}
        title={
          <NestedListItemTitle
            value="Updates to velocity of the ship and alien movements to directly support the new engine"
            href="#"
          />
        }
        metadata={
          <>
            <NestedListItemMetadata>
              <Labels items={generateLabels(1)} />
            </NestedListItemMetadata>
            <NestedListItemMetadata>
              <Comments count={2} />
            </NestedListItemMetadata>
          </>
        }
        secondaryActions={<SampleNestedListItemActionBar />}
      />,
    ]

    return (
      <NestedListView title="Storybook metadata">
        <NestedListItem
          title={
            <NestedListItemTitle
              value="Updates to velocity of the ship and alien movements to directly support the new engine"
              href="#"
            />
          }
          metadata={
            <>
              <NestedListItemMetadata>
                <Labels items={generateLabels(1)} />
              </NestedListItemMetadata>
              <NestedListItemMetadata>
                <Comments count={2} />
              </NestedListItemMetadata>
            </>
          }
          secondaryActions={<SampleNestedListItemActionBar />}
          subItems={subItems}
        />
      </NestedListView>
    )
  },
}

Example.storyName = 'Metadata'

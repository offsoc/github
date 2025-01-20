import {noop} from '@github-ui/noop'
import {Dialog} from '@primer/react/experimental'
import type {Meta, StoryObj} from '@storybook/react'
import {useState} from 'react'

import {NestedListViewCompletionPill} from '../../CompletionPill'
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
import {NestedListItemMetadata} from '../Metadata'
import {NestedListItem, type NestedListItemProps} from '../NestedListItem'
import {NestedListItemTitle} from '../Title'

const meta: Meta<NestedListItemProps> = {
  title: 'Recipes/NestedListView/NestedListItem',
  component: NestedListItem,
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
type Story = StoryObj<NestedListItemProps>

export const Example: Story = {
  render: function Render({...args}: NestedListItemProps) {
    const [dialogVisible, setDialogVisible] = useState(false)

    const subItems = [
      <NestedListItem
        key={0}
        {...args}
        onSelect={noop}
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
          <NestedListItemLeadingVisual {...generateStatusIcon('Issues')} />
        </NestedListItemLeadingContent>

        <NestedListItemMainContent>
          <NestedListItemDescription>{generateDescription('Combo')}</NestedListItemDescription>
        </NestedListItemMainContent>
      </NestedListItem>,
      <NestedListItem
        key={1}
        {...args}
        title={
          <NestedListItemTitle
            value="Updates to velocity of the ship and alien movements to directly support the new engine"
            href="#"
          />
        }
        onSelect={noop}
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
        subItems={[
          <NestedListItem
            key={0}
            {...args}
            title={
              <NestedListItemTitle
                value="Updates to velocity of the ship and alien movements to directly support the new engine"
                href="#"
              />
            }
            onSelect={noop}
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
              <NestedListItemLeadingVisual {...generateStatusIcon('Issues')} />
            </NestedListItemLeadingContent>

            <NestedListItemMainContent>
              <NestedListItemDescription>{generateDescription('Combo')}</NestedListItemDescription>
            </NestedListItemMainContent>
          </NestedListItem>,
          <NestedListItem
            key={2}
            {...args}
            title={
              <NestedListItemTitle
                value="Updates to velocity of the ship and alien movements to directly support the new engine"
                href="#"
              />
            }
            onSelect={noop}
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
            subItems={[
              <NestedListItem
                key={3}
                {...args}
                title={
                  <NestedListItemTitle
                    value="Updates to velocity of the ship and alien movements to directly support the new engine"
                    href="#"
                  />
                }
                onSelect={noop}
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
                  <NestedListItemLeadingVisual {...generateStatusIcon('Issues')} />
                </NestedListItemLeadingContent>

                <NestedListItemMainContent>
                  <NestedListItemDescription>{generateDescription('Combo')}</NestedListItemDescription>
                </NestedListItemMainContent>
              </NestedListItem>,
            ]}
          >
            <NestedListItemLeadingContent>
              <NestedListItemLeadingVisual {...generateStatusIcon('Issues')} />
            </NestedListItemLeadingContent>

            <NestedListItemMainContent>
              <NestedListItemDescription>{generateDescription('Combo')}</NestedListItemDescription>
            </NestedListItemMainContent>
          </NestedListItem>,
        ]}
      />,
    ]

    return (
      <>
        <NestedListView title="nested list item story">
          <NestedListItem
            {...args}
            title={
              <NestedListItemTitle
                value="Updates to velocity of the ship and alien movements to directly support the new engine"
                href="#"
              />
            }
            onSelect={noop}
            metadata={
              <>
                <NestedListItemMetadata>
                  <NestedListViewCompletionPill progress={{total: 10, completed: 5, percentCompleted: 50}} />
                </NestedListItemMetadata>
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
        {dialogVisible && (
          <Dialog onClose={() => setDialogVisible(false)} title="Manage item">
            This is where the consumer would render secondary actions to manage the current item
          </Dialog>
        )}
      </>
    )
  },
}

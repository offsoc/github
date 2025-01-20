import {noop} from '@github-ui/noop'
import type {Meta, StoryObj} from '@storybook/react'
import {type PropsWithChildren, type ReactElement, useEffect, useState} from 'react'

import {NestedListItemMetadata} from '../NestedListItem/Metadata'
import {NestedListItem, type NestedListItemProps} from '../NestedListItem/NestedListItem'
import {NestedListItemTitle} from '../NestedListItem/Title'
import {NestedListView} from '../NestedListView'
import {Comments, generateLabels, Labels, SampleNestedListItemActionBar} from '../stories/helpers'

const meta: Meta<NestedListItemProps> = {
  title: 'Recipes/NestedListView/Features',
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

function SlowComponent({children}: PropsWithChildren) {
  const startTime = performance.now()
  while (performance.now() - startTime < 1000) {
    // Do nothing for 1 sec per item to emulate extremely slow code
  }

  return <>{children}</>
}

function ErrorComponent({error}: {error: string}) {
  useEffect(() => {
    if (error) {
      throw new Error(error)
    }
  }, [error])

  return <></>
}

export const NestedListItemLoadingSubItems: Story = {
  name: 'Loading SubItems',
  render: ({...args}: NestedListItemProps) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [subItems, setSubItems] = useState<Array<ReactElement<typeof NestedListItem>>>([])
    const items = [] as Array<ReactElement<typeof NestedListItem>>
    const loadSubItems = () => {
      for (let i = 0; i < 3; i++) {
        items.push(
          <SlowComponent>
            <NestedListItem key={i} title={<NestedListItemTitle value={`my sub item ${i}`} />} />
          </SlowComponent>,
        )
      }
      setSubItems(items)
    }

    return (
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
                <Labels items={generateLabels(1)} />
              </NestedListItemMetadata>
              <NestedListItemMetadata>
                <Comments count={2} />
              </NestedListItemMetadata>
            </>
          }
          secondaryActions={<SampleNestedListItemActionBar />}
          subItemsCount={3}
          loadSubItems={loadSubItems}
          subItems={subItems.length > 0 ? subItems : undefined}
        />
      </NestedListView>
    )
  },
}

export const NestedListItemLoadingSubItemsError: Story = {
  name: 'Loading SubItems Error',
  render: ({...args}: NestedListItemProps) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [loaded, setLoaded] = useState(false)

    return (
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
                <Labels items={generateLabels(1)} />
              </NestedListItemMetadata>
              <NestedListItemMetadata>
                <Comments count={2} />
              </NestedListItemMetadata>
            </>
          }
          secondaryActions={<SampleNestedListItemActionBar />}
          subItemsCount={3}
          loadSubItems={() => {
            setLoaded(true)
          }}
          subItems={loaded ? [<ErrorComponent key="error" error="This is an intentional error" />] : undefined}
        />
        <NestedListItem
          {...args}
          title={<NestedListItemTitle value='Add a new "Alien" type to the game' href="#" />}
          onSelect={noop}
          metadata={
            <>
              <NestedListItemMetadata>
                <Labels items={generateLabels(2)} />
              </NestedListItemMetadata>
              <NestedListItemMetadata>
                <Comments count={10} />
              </NestedListItemMetadata>
            </>
          }
          secondaryActions={<SampleNestedListItemActionBar />}
          subItemsCount={3}
          subItems={[
            <NestedListItem
              key="0"
              {...args}
              title={<NestedListItemTitle value="Add Alien sound effects" href="#" />}
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
              subItemsCount={3}
              loadSubItems={() => {
                setLoaded(true)
              }}
              subItems={loaded ? [<ErrorComponent key="error" error="This is an intentional error" />] : undefined}
            />,
          ]}
        />
      </NestedListView>
    )
  },
}

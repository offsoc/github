import {render} from '@github-ui/react-core/test-utils'
import {testIdProps} from '@github-ui/test-id-props'
import {ActionList, Label, Link} from '@primer/react'

import {NestedListItemActionBar} from '../NestedListItem/ActionBar'
import {NestedListItemMetadata} from '../NestedListItem/Metadata'
import {NestedListItem} from '../NestedListItem/NestedListItem'
import {NestedListItemTitle} from '../NestedListItem/Title'
import {NestedListView, type NestedListViewProps} from '../NestedListView'
import styles from './tests.module.css'

type RenderNestedListViewProps = Omit<NestedListViewProps, 'title'> & {
  title?: NestedListViewProps['title']
  totalCount: number
  Wrapper?: React.FC<{children?: React.ReactNode}>
}

export function renderNestedListView({totalCount = 3, Wrapper, ...args}: RenderNestedListViewProps) {
  const itemIds = Array.from({length: totalCount}, (_, i) => i + 1)

  const NestedListItems = () => {
    return (
      <>
        {itemIds.map(itemId => (
          <NestedListItem
            key={itemId}
            title={<NestedListItemTitle value={`List Item ${itemId}`} />}
            metadata={
              <NestedListItemMetadata className={styles.metadata}>
                <Link href="foo" {...testIdProps('test-label-1')}>
                  <Label>Foo Label</Label>
                </Link>
                <Link href="bluey" {...testIdProps('test-label-2')}>
                  <Label>Bluey Label</Label>
                </Link>
                <Link href="bingo" {...testIdProps('test-label-3')}>
                  <Label>Bingo Label</Label>
                </Link>
              </NestedListItemMetadata>
            }
            secondaryActions={
              <NestedListItemActionBar
                label="action-bar"
                staticMenuActions={[
                  {
                    key: 'secondaryActionItem',
                    render: () => (
                      <ActionList.Item {...testIdProps('test-secondary-action-1')}>
                        Secondary Action Item
                      </ActionList.Item>
                    ),
                  },
                ]}
              />
            }
          />
        ))}
      </>
    )
  }

  const ListView = (
    <NestedListView title="My test list" {...args}>
      <NestedListItems />
    </NestedListView>
  )

  if (Wrapper) {
    return render(<Wrapper>{ListView}</Wrapper>)
  }

  return render(ListView)
}

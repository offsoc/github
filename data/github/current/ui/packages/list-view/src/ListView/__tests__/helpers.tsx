import {render} from '@github-ui/react-core/test-utils'
import {testIdProps} from '@github-ui/test-id-props'
import {ActionList, Label, Link} from '@primer/react'
import type {PropsWithChildren} from 'react'

import {ListItemActionBar} from '../../ListItem/ActionBar'
import {ListItem} from '../../ListItem/ListItem'
import {ListItemMetadata} from '../../ListItem/Metadata'
import {ListItemTitle} from '../../ListItem/Title'
import type {OptionalKey} from '../../types'
import {ListView, type ListViewProps} from '../ListView'
import {ListViewNote, type ListViewNoteProps} from '../Note'
import type {VariantType} from '../VariantContext'

type RenderListViewNoteProps = ListViewNoteProps & {listVariant?: VariantType}

// Since we use `strict` option in `iterateFocusableElements` to check focusable elements,
// we need to mock these properties that Jest does not populate
beforeAll(() => {
  try {
    Object.defineProperties(HTMLElement.prototype, {
      offsetHeight: {get: () => 42},
      offsetWidth: {get: () => 42},
      getClientRects: {get: () => () => [42]},
      offsetParent: {
        get() {
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          for (let element = this; element; element = element.parentNode) {
            if (element.style?.display?.toLowerCase() === 'none') {
              return null
            }
          }

          if (this.style?.position?.toLowerCase() === 'fixed') {
            return null
          }

          if (this.tagName.toLowerCase() in ['html', 'body']) {
            return null
          }

          return this.parentNode
        },
      },
    })
  } catch {
    // ignore
  }
})

export function renderListViewNote({listVariant, children, ...props}: PropsWithChildren<RenderListViewNoteProps>) {
  return render(
    <ListView title="Test list" variant={listVariant}>
      <ListViewNote {...props}>{children}</ListViewNote>
    </ListView>,
  )
}

const defaultTitle = 'Test list'
const defaultTotalCount = 3

type RenderListViewProps = OptionalKey<ListViewProps, 'title'> & {
  includeItemActionBars?: boolean[]
  includeItemTitleLinks?: boolean[]
  Wrapper?: React.FC<{children?: React.ReactNode}>
}

export function renderListView(
  {
    title = defaultTitle,
    totalCount = defaultTotalCount,
    includeItemActionBars,
    includeItemTitleLinks,
    Wrapper,
    ...props
  }: RenderListViewProps = {
    title: defaultTitle,
    totalCount: defaultTotalCount,
  },
) {
  const itemIds = Array.from({length: totalCount}, (_, i) => i + 1)
  if (typeof includeItemActionBars === 'undefined') {
    includeItemActionBars = Array.from({length: totalCount}, (_, i) => i % 2 === 0) // even items have an action bar
  }

  const ListItems = () => {
    return (
      <>
        {itemIds.map((itemId, index) => (
          <ListItem
            key={itemId}
            title={<ListItemTitle href={includeItemTitleLinks ? '#' : undefined} value={`Item ${itemId}`} />}
            metadata={
              <ListItemMetadata variant="primary">
                <Link href="foo" {...testIdProps('test-label-1')}>
                  <Label>Foo Label</Label>
                </Link>
                <Link href="bluey" {...testIdProps('test-label-2')}>
                  <Label>Bluey Label</Label>
                </Link>
                <Link href="bingo" {...testIdProps('test-label-3')}>
                  <Label>Bingo Label</Label>
                </Link>
              </ListItemMetadata>
            }
            secondaryActions={
              includeItemActionBars[index] ? (
                <ListItemActionBar
                  label="action-bar"
                  staticMenuActions={[
                    {
                      key: 'hello',
                      render: () => <ActionList.Item>1</ActionList.Item>,
                    },
                  ]}
                />
              ) : undefined
            }
          />
        ))}
      </>
    )
  }

  const listView = (
    <ListView totalCount={totalCount} title={title} {...props}>
      <ListItems />
    </ListView>
  )

  return Wrapper ? render(<Wrapper>{listView}</Wrapper>) : render(listView)
}

import {LabelToken} from '@github-ui/label-token'
import {testIdProps} from '@github-ui/test-id-props'
import {HeartIcon} from '@primer/octicons-react'
import {ActionList as PrimerActionList, Link} from '@primer/react'
import {screen, within} from '@testing-library/react'

import {ListItemActionBar} from '../ActionBar'
import {ListItemDescription} from '../Description'
import {ListItemDescriptionItem} from '../DescriptionItem'
import {ListItemLeadingContent} from '../LeadingContent'
import {ListItemLeadingVisual} from '../LeadingVisual'
import {ListItemMainContent} from '../MainContent'
import {ListItemMetadata} from '../Metadata'
import {ListItemTitle} from '../Title'
import {ListItemTrailingBadge} from '../TrailingBadge'
import {renderListItem} from './helpers'

it('manages focus items in the expected order without selection enabled', async () => {
  const {user} = renderListItem({
    title: (
      <ListItemTitle
        value="hello world"
        {...testIdProps('list-view-test-title')}
        data-test
        href="title-link"
        trailingBadges={[
          <ListItemTrailingBadge key={0} title="yolo">
            <Link href="/trailing-badge" {...testIdProps('trailing-badge')}>
              <LabelToken text={'label token'} key={0} fillColor="#000000" />
            </Link>{' '}
          </ListItemTrailingBadge>,
        ]}
      />
    ),
    secondaryActions: (
      <ListItemActionBar
        anchorIcon={HeartIcon}
        staticMenuActions={[
          {
            key: 'first',
            render: () => <PrimerActionList.Item>please choose me</PrimerActionList.Item>,
          },
        ]}
      />
    ),
    metadata: <ListItemMetadata>some extra info</ListItemMetadata>,
    children: (
      <>
        <ListItemLeadingContent>
          <ListItemLeadingVisual description="an icon of love" />
        </ListItemLeadingContent>
        <ListItemMainContent>
          <ListItemDescription>
            <ListItemDescriptionItem>other content</ListItemDescriptionItem>
          </ListItemDescription>
        </ListItemMainContent>
      </>
    ),
  })

  const item = screen.getByRole('listitem', {
    name: 'hello world: an icon of love. other content. More information available below.',
  })

  const title = within(item).getByTestId('listitem-title-link')

  const trailingBadge = within(item).getByTestId('trailing-badge')
  const menuAnchor = within(item).getByTestId('overflow-menu-anchor')

  item.focus()
  await user.tab()
  expect(title).toHaveFocus()

  await user.tab()
  expect(trailingBadge).toHaveFocus()

  await user.tab()
  expect(menuAnchor).toHaveFocus()

  await user.tab({shift: true})
  expect(trailingBadge).toHaveFocus()

  await user.tab({shift: true})
  expect(title).toHaveFocus()
})

it('manages focus items in the expected order without a trailing badge', async () => {
  const {user} = renderListItem({
    isSelectable: true,
    title: <ListItemTitle value="hello world" {...testIdProps('listview-test-title')} data-test href="title-link" />,
    secondaryActions: (
      <ListItemActionBar
        anchorIcon={HeartIcon}
        staticMenuActions={[
          {
            key: 'first',
            render: () => <PrimerActionList.Item>please choose me</PrimerActionList.Item>,
          },
        ]}
      />
    ),
    metadata: <ListItemMetadata>some extra info</ListItemMetadata>,
    children: (
      <>
        <ListItemLeadingContent>
          <ListItemLeadingVisual description="an icon of love" />
        </ListItemLeadingContent>
        <ListItemMainContent>
          <ListItemDescription>
            <ListItemDescriptionItem>other content</ListItemDescriptionItem>
          </ListItemDescription>
        </ListItemMainContent>
      </>
    ),
  })

  const item = screen.getByRole('listitem', {
    name: 'hello world: an icon of love. other content. More information available below.',
  })

  const title = within(item).getByTestId('listitem-title-link')

  const selectionInput = within(item).getByTestId('list-view-item-selection-input')
  const menuAnchor = within(item).getByTestId('overflow-menu-anchor')

  item.focus()
  await user.tab()
  expect(title).toHaveFocus()

  await user.tab()
  expect(selectionInput).toHaveFocus()

  await user.tab()
  expect(menuAnchor).toHaveFocus()

  await user.tab({shift: true})
  expect(selectionInput).toHaveFocus()

  await user.tab({shift: true})
  expect(title).toHaveFocus()
})

it('manages focus items in the expected order with one trailing badge', async () => {
  const {user} = renderListItem({
    isSelectable: true,
    title: (
      <ListItemTitle
        value="hello world"
        {...testIdProps('list-view-test-title')}
        data-test
        href="title-link"
        trailingBadges={[
          <ListItemTrailingBadge key={0} title="yolo">
            <Link href="/trailing-badge" {...testIdProps('trailing-badge')}>
              <LabelToken text={'label token'} key={0} fillColor="#000000" />
            </Link>{' '}
          </ListItemTrailingBadge>,
        ]}
      />
    ),
    secondaryActions: (
      <ListItemActionBar
        anchorIcon={HeartIcon}
        staticMenuActions={[
          {
            key: 'first',
            render: () => <PrimerActionList.Item>please choose me</PrimerActionList.Item>,
          },
        ]}
      />
    ),
    metadata: <ListItemMetadata>some extra info</ListItemMetadata>,
    children: (
      <>
        <ListItemLeadingContent>
          <ListItemLeadingVisual description="an icon of love" />
        </ListItemLeadingContent>
        <ListItemMainContent>
          <ListItemDescription>
            <ListItemDescriptionItem>other content</ListItemDescriptionItem>
          </ListItemDescription>
        </ListItemMainContent>
      </>
    ),
  })

  const item = screen.getByRole('listitem', {
    name: 'hello world: an icon of love. other content. More information available below.',
  })

  const title = within(item).getByTestId('listitem-title-link')
  const trailingBadge = within(item).getByTestId('trailing-badge')

  const selectionInput = within(item).getByTestId('list-view-item-selection-input')
  const menuAnchor = within(item).getByTestId('overflow-menu-anchor')

  item.focus()
  await user.tab()
  expect(title).toHaveFocus()

  await user.tab()
  expect(selectionInput).toHaveFocus()

  await user.tab()
  expect(trailingBadge).toHaveFocus()

  await user.tab()
  expect(menuAnchor).toHaveFocus()

  await user.tab({shift: true})
  expect(trailingBadge).toHaveFocus()

  await user.tab({shift: true})
  expect(selectionInput).toHaveFocus()

  await user.tab({shift: true})
  expect(title).toHaveFocus()
})

it('manages focus items in the expected order with multiple trailing badges', async () => {
  const {user} = renderListItem({
    isSelectable: true,
    title: (
      <ListItemTitle
        value="hello world"
        {...testIdProps('list-view-test-title')}
        data-test
        href="title-link"
        trailingBadges={[
          <ListItemTrailingBadge key={0} title="foo">
            <Link href="/trailing-badge-1" {...testIdProps('trailing-badge-1')}>
              <LabelToken text={'label token 1'} key={0} fillColor="#000000" />
            </Link>{' '}
          </ListItemTrailingBadge>,
          <ListItemTrailingBadge key={1} title="bar">
            <Link href="/trailing-badge-2" {...testIdProps('trailing-badge-2')}>
              <LabelToken text={'label token 2'} key={1} fillColor="#000000" />
            </Link>{' '}
          </ListItemTrailingBadge>,
        ]}
      />
    ),
    secondaryActions: (
      <ListItemActionBar
        anchorIcon={HeartIcon}
        staticMenuActions={[
          {
            key: 'first',
            render: () => <PrimerActionList.Item>please choose me</PrimerActionList.Item>,
          },
        ]}
      />
    ),
    metadata: <ListItemMetadata>some extra info</ListItemMetadata>,
    children: (
      <>
        <ListItemLeadingContent>
          <ListItemLeadingVisual description="an icon of love" />
        </ListItemLeadingContent>
        <ListItemMainContent>
          <ListItemDescription>
            <ListItemDescriptionItem>other content</ListItemDescriptionItem>
          </ListItemDescription>
        </ListItemMainContent>
      </>
    ),
  })

  const item = screen.getByRole('listitem', {
    name: 'hello world: an icon of love. other content. More information available below.',
  })

  const title = within(item).getByTestId('listitem-title-link')
  const trailingBadge1 = within(item).getByTestId('trailing-badge-1')
  const trailingBadge2 = within(item).getByTestId('trailing-badge-2')

  const selectionInput = within(item).getByTestId('list-view-item-selection-input')
  const menuAnchor = within(item).getByTestId('overflow-menu-anchor')

  item.focus()
  await user.tab()
  expect(title).toHaveFocus()

  await user.tab()
  expect(selectionInput).toHaveFocus()

  await user.tab()
  expect(trailingBadge1).toHaveFocus()

  await user.tab()
  expect(trailingBadge2).toHaveFocus()

  await user.tab()
  expect(menuAnchor).toHaveFocus()

  await user.tab({shift: true})
  expect(trailingBadge2).toHaveFocus()

  await user.tab({shift: true})
  expect(trailingBadge1).toHaveFocus()

  await user.tab({shift: true})
  expect(selectionInput).toHaveFocus()

  await user.tab({shift: true})
  expect(title).toHaveFocus()
})

import {screen, within} from '@testing-library/react'

import {ListViewDensityToggle} from '../DensityToggle'
import {ListViewMetadata} from '../Metadata'
import {renderListView} from './helpers'

it('uses list role', () => {
  renderListView()
  const root = screen.queryByRole('list')

  expect(root).toBeInTheDocument()
})

it('uses title in screen reader-only header with specified level', () => {
  renderListView({title: 'My fancy list', titleHeaderTag: 'h3'})
  const root = screen.getByRole('heading', {level: 3})

  expect(root.textContent).toBe('My fancy list')
  expect(root.classList).toContain('sr-only')
})

it('uses listitem role', () => {
  renderListView({totalCount: 3})

  const items = screen.queryAllByRole('listitem')
  expect(items).toHaveLength(3)
})

it('metadata element is outside the ul element', async () => {
  renderListView({metadata: <ListViewMetadata densityToggle={<ListViewDensityToggle />} />})

  const metadata = await screen.findByTestId('list-view-metadata')
  expect(metadata).toBeTruthy()

  const list = await screen.findByTestId('list-view-items')
  expect(list).toBeTruthy()

  expect(within(list).queryByTestId('list-view-metadata')).toBeNull()
})

it('includes Select All container within metadata element', async () => {
  renderListView({isSelectable: true, metadata: <ListViewMetadata />})
  const metadata = await screen.findByTestId('list-view-metadata')
  expect(metadata).toBeInTheDocument()

  const selectAllContainer = await screen.findByTestId('list-view-select-all-container')
  expect(selectAllContainer).toBeInTheDocument()

  expect(within(metadata).getByTestId('list-view-select-all-container')).toBeInTheDocument()
})

it('selects all items when Select All checkbox is clicked', async () => {
  const onToggleSelectAll = jest.fn()
  const {user} = renderListView({
    isSelectable: true,
    metadata: <ListViewMetadata onToggleSelectAll={onToggleSelectAll} />,
  })
  const selectAllContainer = await screen.findByTestId('list-view-select-all-container')
  const selectAllCheckbox = within(selectAllContainer).getByRole('checkbox')
  expect(selectAllCheckbox).toBeInTheDocument()
  expect(selectAllCheckbox).not.toBeChecked()

  await user.click(selectAllCheckbox)
  expect(onToggleSelectAll).toHaveBeenCalledWith(true)
})

it('includes Announcement container within metadata element', async () => {
  renderListView({
    metadata: <ListViewMetadata assistiveAnnouncement="Announcement for the list" />,
  })

  const metadata = await screen.findByTestId('list-view-metadata')
  expect(metadata).toBeInTheDocument()

  const announcementContainer = await within(metadata).findByTestId('list-view-announcement-container')
  expect(announcementContainer).toBeInTheDocument()

  expect(announcementContainer).toHaveTextContent('Announcement for the list')
  expect(announcementContainer).toHaveClass('sr-only')
})

it('listView title defaults to h2 and ListItem title defaults to h3 when no titleHeaderTag passed to ListView', () => {
  renderListView({title: 'My fancy list'})

  // Defaults to h2
  const listViewTitle = screen.getByRole('heading', {level: 2})
  expect(listViewTitle.textContent).toBe('My fancy list')
  expect(listViewTitle.classList).toContain('sr-only')

  // Defaults to h3
  const listItemTitles = screen.getAllByRole('heading', {level: 3})
  let index = 1
  for (const title of listItemTitles) {
    expect(title.textContent).toBe(`Item ${index}`)
    expect(title.classList).toContain('markdown-title')
    index++
  }
})

it('displays provided titleHeaderTag', () => {
  renderListView({title: 'My fancy list', titleHeaderTag: 'h5'})

  const listViewTitle = screen.getByRole('heading', {level: 5})
  expect(listViewTitle.textContent).toBe('My fancy list')
  expect(listViewTitle.classList).toContain('sr-only')

  // ListItem title is one level heading lower
  const listItemTitles = screen.getAllByRole('heading', {level: 6})
  let index = 1
  for (const title of listItemTitles) {
    expect(title.textContent).toBe(`Item ${index}`)
    expect(title.classList).toContain('markdown-title')
    index++
  }
})

it('still renders action bar container for list item without its own action bar, if any other list item has an action bar', () => {
  renderListView({totalCount: 2, includeItemActionBars: [true, false]})

  const items = screen.getAllByRole('listitem')
  expect(items).toHaveLength(2)
  const firstItemActionBarContainer = within(items[0]!).getByTestId('list-view-item-action-bar-container')
  expect(firstItemActionBarContainer).not.toBeNull()
  expect(within(firstItemActionBarContainer).getByTestId('overflow-menu-anchor')).not.toBeNull()
  const secondItemActionBarContainer = within(items[1]!).getByTestId('list-view-item-action-bar-container')
  expect(secondItemActionBarContainer).not.toBeNull()
  expect(within(secondItemActionBarContainer).queryByRole('button')).toBeNull()
})

it('does not render action bar container for a list item when no list items have an action bar', () => {
  renderListView({totalCount: 2, includeItemActionBars: [false, false]})

  const items = screen.getAllByRole('listitem')
  expect(items).toHaveLength(2)
  expect(within(items[0]!).queryByTestId('list-view-item-action-bar-container')).toBeNull()
  expect(within(items[1]!).queryByTestId('list-view-item-action-bar-container')).toBeNull()
})

it('default heading tags when there is a metadata title', () => {
  renderListView({metadata: <ListViewMetadata title="hello" />})

  const listViewTitle = screen.getByTestId('list-view-title')
  expect(listViewTitle.tagName).toEqual('H2')

  const metadataTitle = screen.getByTestId('list-view-header-title')
  expect(metadataTitle).toBeTruthy()
  expect(metadataTitle.tagName).toEqual('H3')

  const items = screen.getAllByRole('listitem')
  expect(items).toHaveLength(3)
  expect(within(items[0]!).getByRole('heading').tagName).toEqual('H4')
})

it('renders filter section', () => {
  renderListView({metadata: <ListViewMetadata sectionFilters={<div>Filter section</div>} />})

  const filterSection = screen.getByText('Filter section')
  expect(filterSection).toBeTruthy()
})

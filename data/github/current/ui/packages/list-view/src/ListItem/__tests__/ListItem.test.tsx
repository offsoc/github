import {HeartIcon} from '@primer/octicons-react'
import {ActionList as PrimerActionList} from '@primer/react'
import {screen, within} from '@testing-library/react'

import {ListItemActionBar} from '../ActionBar'
import {ListItemDescription} from '../Description'
import {ListItemDescriptionItem} from '../DescriptionItem'
import {ListItemLeadingBadge} from '../LeadingBadge'
import {ListItemLeadingContent} from '../LeadingContent'
import {ListItemLeadingVisual} from '../LeadingVisual'
import {ListItemMainContent} from '../MainContent'
import {ListItemMetadata} from '../Metadata'
import {ListItemTitle} from '../Title'
import {ListItemTrailingBadge} from '../TrailingBadge'
import {defaultTitle, renderListItem} from './helpers'

describe('aria-label', () => {
  it('renders aria-label', () => {
    renderListItem()

    const item = screen.getByRole('listitem')
    expect(item).toHaveAccessibleName(`${defaultTitle}.`)
  })

  it('renders selected aria-label if selected', () => {
    renderListItem({isSelectable: true, isSelected: true})

    const item = screen.getByRole('listitem')
    expect(item).toHaveAccessibleName(`Selected. ${defaultTitle}.`)
  })

  it('renders aria-label with badges', () => {
    const title = 'wave your hands in the air'
    const leadingBadge = 'wildcats everywhere'
    const trailingBadge = 'thats the way we do it'
    renderListItem({
      title: (
        <ListItemTitle
          value={title}
          leadingBadge={<ListItemLeadingBadge title={leadingBadge} />}
          trailingBadges={[<ListItemTrailingBadge key={0} title={trailingBadge} />]}
        />
      ),
    })

    const item = screen.getByRole('listitem')
    // Trailing badge should not show up in the aria-label
    expect(item).toHaveAccessibleName(`${leadingBadge}: ${title}.`)
  })

  it('renders aria-label with status', () => {
    const status = 'an icon of love'
    renderListItem({
      children: (
        <ListItemLeadingContent>
          <ListItemLeadingVisual description={status} />
        </ListItemLeadingContent>
      ),
    })

    const item = screen.getByRole('listitem')
    expect(item).toHaveAccessibleName(`${defaultTitle}: ${status}.`)
  })

  it('renders aria-labels when a new activity is present', () => {
    const status = 'an icon of love'
    renderListItem({
      children: (
        <ListItemLeadingContent>
          <ListItemLeadingVisual description={status} newActivity={true} />
        </ListItemLeadingContent>
      ),
    })

    const item = screen.getByRole('listitem')
    expect(item).toHaveAccessibleName(`${defaultTitle}: ${status}. New activity.`)
    expect(within(item).getByTestId('list-view-item-unread-indicator')).toHaveTextContent('New activity.')
  })

  it('renders aria-label with description', () => {
    const description = ' other content '
    renderListItem({
      children: (
        <ListItemMainContent>
          <ListItemDescription>
            <ListItemDescriptionItem>{description}</ListItemDescriptionItem>
          </ListItemDescription>
        </ListItemMainContent>
      ),
    })

    const item = screen.getByRole('listitem')
    expect(item).toHaveAccessibleName(`${defaultTitle}. other content.`)
  })

  it('aria-label reflects when secondary actions are included', () => {
    renderListItem({
      secondaryActions: <p>hello</p>,
    })

    const item = screen.getByRole('listitem')
    expect(item).toHaveAccessibleName(/(More information available below.)$/)
  })

  it('aria-label reflects when metadata is included', () => {
    renderListItem({
      metadata: <p>hello</p>,
    })

    const item = screen.getByRole('listitem')
    expect(item).toHaveAccessibleName(/(More information available below.)$/)
  })

  it('aria-label reflects when secondary actions and metadata are included', () => {
    renderListItem({
      secondaryActions: <p>hello</p>,
      metadata: <p>hello</p>,
    })

    const item = screen.getByRole('listitem')
    expect(item).toHaveAccessibleName(/(More information available below.)$/)
  })

  it('renders aria-label with leadingBadge, title, trailingBadge, status, description, metadata, actions, and newActivity', () => {
    const badge = 'before title'
    const title = 'all in this together'
    const status = 'an icon of love'
    const description = 'other content'
    renderListItem({
      title: (
        <ListItemTitle
          value={title}
          leadingBadge={<ListItemLeadingBadge title={badge} />}
          trailingBadges={[<ListItemTrailingBadge key={0} title={badge} />]}
        />
      ),
      secondaryActions: <p>hello</p>,
      metadata: <p>hello</p>,
      children: (
        <>
          <ListItemLeadingContent>
            <ListItemLeadingVisual description="an icon of love" newActivity={true} />
          </ListItemLeadingContent>
          <ListItemMainContent>
            <ListItemDescription>
              <ListItemDescriptionItem>{description}</ListItemDescriptionItem>
            </ListItemDescription>
          </ListItemMainContent>
        </>
      ),
    })

    const item = screen.getByRole('listitem')
    // badge should not show up in the aria-label
    expect(item).toHaveAccessibleName(
      `${badge}: ${title}: ${status}. ${description}. New activity. More information available below.`,
    )
  })
})

it('renders title without extra children', () => {
  renderListItem({title: <ListItemTitle value="Hello world" />})

  const item = screen.getByRole('listitem', {name: 'Hello world.'})
  expect(item).toBeInTheDocument()
  expect(within(item).getByRole('heading', {level: 3})).toHaveTextContent('Hello world')
})

it('renders with external styles', () => {
  const gridTemplateAreas = `"selection status primary metadata actions"
                          "selection status main-content metadata actions"`

  renderListItem({
    style: {
      color: 'blue',
      gridTemplateRows: 'auto auto',
      gridTemplateAreas,
      gridTemplateColumns: 'min-content min-content minmax(7em, auto) minmax(0, max-content) min-content',
    },
  })

  const item = screen.getByRole('listitem', {name: `${defaultTitle}.`})
  expect(item).toBeInTheDocument()
  expect(item).toHaveStyle('color: blue')
  expect(item).toHaveStyle('grid-template-rows: auto auto')
  expect(item).toHaveStyle(`grid-template-areas: ${gridTemplateAreas}`)
})

it('renders a trailing badge within the List Item', () => {
  const badge = 'trailing badge'
  renderListItem({
    title: <ListItemTitle value={defaultTitle} trailingBadges={[<ListItemTrailingBadge key={0} title={badge} />]} />,
  })

  const item = screen.getByRole('listitem', {name: `${defaultTitle}.`})
  expect(within(item).getByTestId('list-view-item-trailing-badge')).toHaveTextContent('trailing badge')
})

it('renders with a leading visual', () => {
  renderListItem({
    children: (
      <ListItemLeadingContent>
        <ListItemLeadingVisual icon={HeartIcon} color="sponsors.fg" description="Status: Love" />
      </ListItemLeadingContent>
    ),
  })

  const item = screen.getByRole('listitem', {name: `${defaultTitle}: Status: Love.`})
  const leadingVisual = within(item).getByTestId('list-view-leading-visual')
  expect(within(leadingVisual).getByRole('img', {hidden: true})).not.toBeNull()
  expect(within(leadingVisual).getByTestId('leading-visual-text-description')).toHaveTextContent('Status: Love')
})

it('renders with main content', () => {
  renderListItem({
    children: (
      <ListItemMainContent>
        <p>Some words of wisdom</p>
      </ListItemMainContent>
    ),
  })

  const item = screen.getByRole('listitem', {name: `${defaultTitle}.`})
  expect(within(item).getByRole('paragraph')).toHaveTextContent('Some words of wisdom')
})

it('renders with an action bar', async () => {
  const {user} = renderListItem({
    secondaryActions: (
      <ListItemActionBar
        label="actions"
        anchorIcon={HeartIcon}
        staticMenuActions={[
          {
            key: 'first',
            render: () => <PrimerActionList.Item>Firstly</PrimerActionList.Item>,
          },
          {
            key: 'second',
            render: () => <PrimerActionList.Item>Secondly</PrimerActionList.Item>,
          },
        ]}
      />
    ),
  })

  const item = screen.getByRole('listitem', {name: `${defaultTitle}. More information available below.`})
  const actionBarToggle = within(item).getByRole('button', {name: 'More actions'})
  expect(within(actionBarToggle).getByRole('img', {hidden: true})).toHaveClass('octicon-heart')
  expect(screen.queryByRole('menu')).toBeNull()

  await user.click(actionBarToggle) // open list item action menu

  const actionBar = screen.getByRole('menu')
  const menuItems = within(actionBar).getAllByRole('menuitem')
  expect(menuItems).toHaveLength(2)
  expect(menuItems[0]).toHaveTextContent('Firstly')
  expect(menuItems[1]).toHaveTextContent('Secondly')
})

it('renders with a description', () => {
  renderListItem({
    children: (
      <ListItemDescription>
        <p>A very rainy day</p>
      </ListItemDescription>
    ),
  })

  const item = screen.getByRole('listitem', {name: `${defaultTitle}.`})
  expect(within(item).getByRole('paragraph')).toHaveTextContent('A very rainy day')
})

it('renders with metadata passed as a single element', () => {
  renderListItem({
    metadata: (
      <>
        <ListItemMetadata variant="primary">
          <span>bug</span>
          <span>duplicate</span>
        </ListItemMetadata>
        <ListItemMetadata alignment="right">1 week ago</ListItemMetadata>
      </>
    ),
  })

  const item = screen.getByRole('listitem', {name: `${defaultTitle}. More information available below.`})
  const metadataContainer = within(item).getByTestId('list-view-item-metadata')
  const metadataItems = within(metadataContainer).getAllByTestId('list-view-item-metadata-item')
  expect(metadataItems).toHaveLength(2)
  expect(metadataItems[0]).toHaveTextContent('bugduplicate')
  expect(metadataItems[1]).toHaveTextContent('1 week ago')
})

it('renders with an array of metadata', () => {
  renderListItem({
    metadata: [
      <ListItemMetadata key="1" variant="primary">
        <span>bug</span>
        <span>duplicate</span>
      </ListItemMetadata>,
      <ListItemMetadata key="2" alignment="right">
        1 week ago
      </ListItemMetadata>,
    ],
  })

  const item = screen.getByRole('listitem', {name: `${defaultTitle}. More information available below.`})
  const metadataContainer = within(item).getByTestId('list-view-item-metadata')
  const metadataItems = within(metadataContainer).getAllByTestId('list-view-item-metadata-item')
  expect(metadataItems).toHaveLength(2)
  expect(metadataItems[0]).toHaveTextContent('bugduplicate')
  expect(metadataItems[1]).toHaveTextContent('1 week ago')
})

it('renders children in expected order for best user experience with assistive technology', () => {
  renderListItem({
    isSelectable: true,
    title: <ListItemTitle value="hello world" />,
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

  // eslint-disable-next-line testing-library/no-node-access
  const itemChildren = Array.from(item.children)

  const title = within(item).getByTestId('list-view-item-title-container')
  const selection = within(item).getByTestId('list-view-item-selection')
  const leadingContent = within(item).getByTestId('list-view-item-leading-content')
  const mainContent = within(item).getByTestId('list-view-item-main-content')
  const metadata = within(item).getByTestId('list-view-item-metadata')
  const actionBar = within(item).getByTestId('list-view-item-action-bar-container')

  const expectedChildren = [
    title, // most important piece of content for the item, so want it first
    selection, // primary action for the item
    leadingContent,
    mainContent,
    metadata, // secondary information about the item
    actionBar, // secondary actions for the item
  ]
  expect(itemChildren.length).toBe(expectedChildren.length) // ensure no other elements are in there
  for (let i = 0; i < itemChildren.length; i++) {
    expect(itemChildren[i]).toBe(expectedChildren[i]) // ensure the child is where we expect it to be
  }
})

it('when a list item has focus on its children, hitting Esc returns focus to the parent list item', async () => {
  const {user} = renderListItem({title: <ListItemTitle value="hello world" href="#" />})

  const item = screen.getByRole('listitem', {name: 'hello world.'})
  const focusableTitleLink = screen.getByRole('link', {name: 'hello world'})
  focusableTitleLink.focus()

  expect(focusableTitleLink).toHaveFocus()
  await user.keyboard('{Escape}')
  expect(item).toHaveFocus()
})

it('when a list item has focus on its children, hitting enter triggers title action', async () => {
  const {user} = renderListItem({title: <ListItemTitle value="hello world" href="#" />})

  const focusableTitleLink = screen.getByRole('link', {name: 'hello world'})
  focusableTitleLink.focus()

  expect(focusableTitleLink).toHaveFocus()
  await user.keyboard('{Enter}')
  expect(window.location.href).toBe('http://localhost/#')
})

it('when a list item has focus on its children, hitting space triggers selection action', async () => {
  const onSelect = jest.fn()
  const {user} = renderListItem({
    isActive: true,
    isSelectable: true,
    onSelect,
    title: <ListItemTitle value="hello world" />,
  })

  await user.keyboard(' ')
  expect(onSelect).toHaveBeenCalledTimes(1)
})

it('should focus on the list item if nothing is focused when isActive prop is true', () => {
  renderListItem({isActive: true, title: <ListItemTitle value={defaultTitle} />})

  const item = screen.getByRole('listitem', {name: `${defaultTitle}.`})
  expect(item).toHaveFocus()
})

import {render} from '@github-ui/react-core/test-utils'
import type {SafeHTMLString} from '@github-ui/safe-html'
import {screen, within} from '@testing-library/react'

import {ListView} from '../../ListView/ListView'
import type {VariantType} from '../../ListView/VariantContext'
import {ListItemLeadingBadge} from '../LeadingBadge'
import {ListItem} from '../ListItem'
import {ListItemTitle, type ListItemTitleProps} from '../Title'

it('applies custom styling for an anchor title inside a container', () => {
  renderTitle({
    value: 'My list item',
    listVariant: 'compact',
    href: '#',
    anchorStyle: {backgroundColor: '#ff00ff'},
    headingStyle: {color: 'rosybrown'},
    containerStyle: {color: 'palevioletred'},
    children: <>foo</>,
  })

  const container = screen.getByTestId('list-view-item-title-container')
  expect(container).toHaveStyle('color: palevioletred') // custom container style
  const header = within(container).getByRole('heading')
  expect(header).toHaveStyle('color: rosybrown') // custom header style
  const link = within(header).getByRole('link')
  expect(link).toHaveStyle('background-color: #ff00ff') // custom anchor style
})

it('renders leading badge ahead of title text', () => {
  renderTitle({value: 'A fun item', leadingBadge: <ListItemLeadingBadge title="Hello world" />})

  const titleContainer = screen.getByTestId('list-view-item-title-container')
  expect(titleContainer).toHaveTextContent('Hello world: A fun item')
})

it('keyboard "Enter" navigate to a ListItem titles link destination, if present', async () => {
  const mockOnClick = jest.fn()
  const {user} = renderTitle({
    value: 'A linkable title',
    onClick: mockOnClick,
  })
  const item = screen.getByRole('listitem')
  item.focus()
  const header = within(item).getByRole('heading')
  expect(header).toHaveAccessibleName('A linkable title')
  const link = within(header).getByTestId('listitem-title-link')
  expect(link).toHaveTextContent('A linkable title')

  await user.keyboard('[Enter]')
  expect(mockOnClick).toHaveBeenCalledTimes(1)
})

it('renders a static title from a markdownValue', () => {
  const value = 'Merge pull request #2 from repos/monalisa-patch'
  const markdownValue =
    'Merge pull request&nbsp;<a class="issue-link js-issue-link" data-hovercard-type="pull_request" href="#">#2</a>&nbsp;from repos/monalisa-patch' as SafeHTMLString

  renderTitle({value, markdownValue})

  const titleContainer = screen.getByTestId('list-view-item-title-container')
  const header = within(titleContainer).getByRole('heading')

  expect(header).toHaveAccessibleName('Merge pull request #2 from repos/monalisa-patch')

  const link = within(header).getByRole('link')
  expect(link).toHaveTextContent('#2')
})

it('renders a title from a markdownValue with links', () => {
  const value = 'Merge pull request #2 from repos/monalisa-patch'
  const markdownValue =
    '<a href="/abc">Merge pull request</a>&nbsp;<a data-hovercard-type="pull_request" href="#">#2</a>&nbsp;<a href="/abc">from repos/monalisa-patch</a>' as SafeHTMLString

  renderTitle({value, markdownValue})

  const titleContainer = screen.getByTestId('list-view-item-title-container')
  const header = within(titleContainer).getByRole('heading')

  expect(header).toHaveAccessibleName('Merge pull request #2 from repos/monalisa-patch')

  const links = within(header).getAllByRole('link')
  expect(links).toHaveLength(3)

  expect(links[0]).toHaveTextContent('Merge pull request')
  expect(links[1]).toHaveTextContent('#2')
  expect(links[2]).toHaveTextContent('from repos/monalisa-patch')

  // verify that we've avoided nested links - need to check parent of parent since SafeHTMLText wraps out values in a span first
  // eslint-disable-next-line testing-library/no-node-access
  expect(links[0]?.parentNode?.parentNode).toBe(header)
  // eslint-disable-next-line testing-library/no-node-access
  expect(links[1]?.parentNode?.parentNode).toBe(header)
  // eslint-disable-next-line testing-library/no-node-access
  expect(links[2]?.parentNode?.parentNode).toBe(header)
})

it('renders a title from a markdown value with server-escaped markdown', () => {
  const value = 'Redirect /<spaceID> to /<spaceId>/<currentWeek>'
  const markdownValue = 'Redirect /&lt;spaceID&gt; to /&lt;spaceId&gt;/&lt;currentWeek&gt;' as SafeHTMLString

  renderTitle({value, markdownValue})

  const titleContainer = screen.getByTestId('list-view-item-title-container')
  const header = within(titleContainer).getByRole('heading')

  expect(header).toHaveAccessibleName('Redirect /<spaceID> to /<spaceId>/<currentWeek>')
  expect(header).toHaveTextContent('Redirect /<spaceID> to /<spaceId>/<currentWeek>')
})

type RenderTitleProps = {value?: string; listVariant?: VariantType} & Omit<ListItemTitleProps, 'value'>

function renderTitle({value = 'My list item', listVariant, ...props}: RenderTitleProps) {
  return render(
    <ListView title="Sample list" variant={listVariant}>
      <ListItem title={<ListItemTitle value={value} {...props} />} />
    </ListView>,
  )
}

it('renders a target when provided', () => {
  renderTitle({
    value: 'My link',
    href: '#',
    target: '_blank',
  })

  const container = screen.getByTestId('list-view-item-title-container')
  const header = within(container).getByRole('heading')
  const link = within(header).getByRole('link')
  expect(link).toHaveAttribute('target', '_blank')
})

it('opens links in a new tab if ctrl or cmd key are pressed', async () => {
  window.open = jest.fn()
  const mockOnClick = jest.fn()
  const {user} = renderTitle({
    value: 'A linkable title',
    href: '#',
    target: '_blank',
    onClick: mockOnClick,
  })

  const item = screen.getByRole('listitem')
  item.focus()

  await user.keyboard('{Meta>}[Enter]{/Meta}')
  expect(mockOnClick).not.toHaveBeenCalled()
  expect(window.open).toHaveBeenCalledTimes(1)

  await user.keyboard('{Control>}[Enter]{/Control}')
  expect(mockOnClick).not.toHaveBeenCalled()
  expect(window.open).toHaveBeenCalledTimes(2)

  await user.keyboard('[Enter]')
  expect(mockOnClick).toHaveBeenCalledTimes(1)
  expect(window.open).toHaveBeenCalledTimes(2)
})

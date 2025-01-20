import {render} from '@github-ui/react-core/test-utils'
import {act, screen, within} from '@testing-library/react'

import {NestedListView} from '../../NestedListView'
import {NestedListItemLeadingBadge} from '../LeadingBadge'
import {NestedListItem} from '../NestedListItem'
import {NestedListItemTitle, type NestedListItemTitleProps} from '../Title'

describe('NestedListItemTitle', () => {
  it('merges custom, default, and variant styling for an anchor title inside a container', () => {
    renderTitle({
      value: 'My list item',
      href: '#',
      anchorSx: {backgroundColor: '#ff00ff'},
      containerSx: {color: 'palevioletred'},
      children: <>foo</>,
    })

    const container = screen.getByTestId('nested-list-view-item-primary-container')
    expect(container).toHaveStyle('color: palevioletred') // custom container style
    const link = within(container).getByRole('presentation')
    expect(link).toHaveStyle('background-color: #ff00ff') // custom anchor style
  })

  it('renders leading badge ahead of title text', () => {
    renderTitle({value: 'A fun item', leadingBadge: <NestedListItemLeadingBadge title="Hello world" />})

    const titleContainer = screen.getByTestId('nested-list-view-item-primary-container')
    expect(titleContainer).toHaveTextContent('Hello world: A fun item')
  })

  it('keyboard "Enter" navigate to a ListItem titles link destination, if present', async () => {
    const mockOnClick = jest.fn()
    const {user} = renderTitle({
      value: 'A linkable title',
      onClick: mockOnClick,
    })
    const item = screen.getByRole('treeitem')
    act(() => {
      item.focus()
    })
    expect(item).toHaveAccessibleName('A linkable title. Press Control, Shift, U for more actions.')

    const link = within(item).getByTestId('listitem-title-link')
    expect(link).toHaveTextContent('A linkable title')

    await user.keyboard('[Enter]')
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('sets the aria-label to friendly text', () => {
    renderTitle({
      value: 'A linkable <code>title</code> <span>with some HTML</span>',
    })
    const item = screen.getByRole('treeitem')
    act(() => {
      item.focus()
    })
    expect(item).toHaveAccessibleName('A linkable title with some HTML. Press Control, Shift, U for more actions.')

    const link = within(item).getByTestId('listitem-title-link')
    expect(link).toContainHTML('A linkable <code>title</code> <span>with some HTML</span>')
  })
})

type RenderTitleProps = {value?: string} & Omit<NestedListItemTitleProps, 'value'>

function renderTitle({value = 'My list item', ...props}: RenderTitleProps) {
  return render(
    <NestedListView title="Sample list">
      <NestedListItem title={<NestedListItemTitle value={value} {...props} />} />
    </NestedListView>,
  )
}

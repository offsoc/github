import {render} from '@github-ui/react-core/test-utils'
import {act, screen} from '@testing-library/react'

import {NestedListItem} from '../NestedListItem/NestedListItem'
import {NestedListItemTitle} from '../NestedListItem/Title'
import {NestedListView} from '../NestedListView'

describe('NestedListView', () => {
  it('hides the nesting indicator lines', async () => {
    const {container, user} = render(
      <NestedListView title="list">
        <NestedListItem
          title={
            <NestedListItemTitle
              value="Updates to velocity of the ship and alien movements to directly support the new engine"
              href="#"
            />
          }
          subItems={[<NestedListItem key="1" title={<NestedListItemTitle value="Update ship velocity" href="#" />} />]}
        />
      </NestedListView>,
    )

    const topItem = screen.getByRole('treeitem')
    act(() => {
      topItem.focus()
    })
    await user.keyboard('{ArrowRight}')

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const nestingIndicator = container.querySelector('.PRIVATE_TreeView-item-level-line')

    // This doesn't assert that the indicator isn't visible (which would be fragile), instead it just ensures that if
    // the class name changes, we update our code correspondingly. This is important since we are accessing a
    // 'private' class name here that comes with no guarantee of stability.
    expect(nestingIndicator).toBeInTheDocument()
  })
})

import {render} from '@github-ui/react-core/test-utils'

import {ListView, type ListViewProps} from '../../ListView/ListView'
import {ListItem, type ListItemProps} from '../ListItem'
import {ListItemTitle} from '../Title'

type RenderListItemProps = Omit<ListItemProps, 'title'> & {
  title?: ListItemProps['title']
  isSelectable?: ListViewProps['isSelectable']
  variant?: ListViewProps['variant']
}

// Mock the following properties to avoid focus errors for ListView
beforeAll(() => {
  Object.defineProperties(HTMLElement.prototype, {
    offsetHeight: {get: () => 42},
    offsetWidth: {get: () => 42},
    getClientRects: {get: () => () => [42]},
    offsetParent: {get: () => true},
  })
})

export const defaultTitle = 'My item title'

export function renderListItem(
  {title = <ListItemTitle value={defaultTitle} />, isSelectable, variant, ...args}: RenderListItemProps = {
    title: <ListItemTitle value={defaultTitle} />,
  },
) {
  return render(
    <ListView title="My test list" isSelectable={isSelectable} variant={variant}>
      <ListItem title={title} {...args} />
    </ListView>,
  )
}

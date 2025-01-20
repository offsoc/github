import {noop} from '@github-ui/noop'
import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'
import {useEffect} from 'react'

import {NestedListView, type NestedListViewProps} from '../../NestedListView'
import {type NestedListItemSelectionContextProps, NestedListItemSelectionProvider} from '../context/SelectionContext'
import {NestedListItemTitleProvider, useNestedListItemTitle} from '../context/TitleContext'
import {NestedListItemSelection} from '../Selection'

describe('NestedListItemSelection', () => {
  it('renders an unchecked checkbox when not selected', () => {
    renderSelection({isSelected: false, title: 'Hello world'})

    const checkbox = screen.getByRole('checkbox', {name: 'Select: Hello world'})
    expect(checkbox).not.toBeChecked()
  })

  it('renders a checked checkbox when selected', () => {
    renderSelection({isSelected: true, title: 'Hello world'})

    const checkbox = screen.getByRole('checkbox', {name: 'Select: Hello world'})
    expect(checkbox).toBeChecked()
  })

  it('renders nothing when isSelectable=false', () => {
    renderSelection({isSelectable: false})
    expect(screen.queryByRole('checkbox')).toBeNull()
    expect(screen.queryByTestId('list-view-item-selection')).not.toBeInTheDocument()
  })

  it('renders nothing when isReadOnly=true', () => {
    renderSelection({isSelectable: true, isReadOnly: true})
    expect(screen.queryByRole('checkbox')).toBeNull()
    expect(screen.queryByTestId('list-view-item-selection')).not.toBeInTheDocument()
  })

  it('fires given onSelect handler when checking checkbox', async () => {
    const onSelect = jest.fn()

    const {user} = renderSelection({isSelected: false, onSelect})

    expect(onSelect).not.toHaveBeenCalled()

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('fires given onSelect handler when unchecking checkbox', async () => {
    const onSelect = jest.fn()

    const {user} = renderSelection({isSelected: true, onSelect})

    expect(onSelect).not.toHaveBeenCalled()

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    expect(onSelect).toHaveBeenCalledTimes(1)
  })
})

type RenderSelectionProps = {
  isSelected?: NestedListItemSelectionContextProps['isSelected']
  isReadOnly?: NestedListViewProps['isReadOnly']
  onSelect?: NestedListItemSelectionContextProps['onSelect']
  isSelectable?: NestedListViewProps['isSelectable']
  title?: string
}

function renderSelection({
  isSelected = false,
  isReadOnly = false,
  onSelect = noop,
  isSelectable = true,
  title = 'My list item',
}: RenderSelectionProps = {}) {
  return render(
    <NestedListView title="Selection test list" isSelectable={isSelectable} isReadOnly={isReadOnly}>
      <li>
        <NestedListItemTitleProvider>
          <NestedListItemSelectionProvider value={{isSelected, onSelect}}>
            <TestSelection title={title} />
          </NestedListItemSelectionProvider>
        </NestedListItemTitleProvider>
      </li>
    </NestedListView>,
  )
}

function TestSelection({title}: {title: string}) {
  const {setTitle} = useNestedListItemTitle()
  useEffect(() => setTitle(title), [setTitle, title])
  return <NestedListItemSelection />
}

import {noop} from '@github-ui/noop'
import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'
import {useEffect} from 'react'

import {defaultVariant} from '../../constants'
import {ListView, type ListViewProps} from '../../ListView/ListView'
import {ListItemSelection} from '../Selection'
import {type SelectionContextProps, SelectionProvider} from '../SelectionContext'
import {TitleProvider, useListItemTitle} from '../TitleContext'

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

it('has a larger top margin when variant=default', () => {
  renderSelection({variant: 'default'})

  const checkbox = screen.getByRole('checkbox')
  expect(checkbox).toHaveStyle('margin-top: 14px')
})

it('has a smaller top margin when variant=compact', () => {
  renderSelection({variant: 'compact'})

  const checkbox = screen.getByRole('checkbox')
  expect(checkbox).toHaveStyle('margin-top: 10px')
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

type RenderSelectionProps = {
  isSelected?: SelectionContextProps['isSelected']
  onSelect?: SelectionContextProps['onSelect']
  isSelectable?: ListViewProps['isSelectable']
  variant?: ListViewProps['variant']
  title?: string
}

function renderSelection({
  isSelected = false,
  onSelect = noop,
  isSelectable = true,
  variant = defaultVariant,
  title = 'My list item',
}: RenderSelectionProps = {}) {
  return render(
    <ListView title="Selection test list" variant={variant} isSelectable={isSelectable}>
      <li>
        <TitleProvider>
          <SelectionProvider value={{isSelected, onSelect}}>
            <TestSelection title={title} />
          </SelectionProvider>
        </TitleProvider>
      </li>
    </ListView>,
  )
}

function TestSelection({title}: {title: string}) {
  const {setTitle} = useListItemTitle()
  useEffect(() => setTitle(title), [setTitle, title])
  return <ListItemSelection />
}

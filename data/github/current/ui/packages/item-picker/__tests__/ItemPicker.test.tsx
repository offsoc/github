import {useState} from 'react'
import {ItemPicker} from '../components/ItemPicker'
import {noop} from '@github-ui/noop'
import {fireEvent, render, screen} from '@testing-library/react'
import {Wrapper} from '@github-ui/react-core/test-utils'
// eslint-disable-next-line no-restricted-imports
import userEvent from 'user-event-13'

const defaultItems = ['item1', 'item2', 'item3']

const TestItemPicker = () => {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const handleSelectionChange = (items: string[]) => {
    setSelectedItems(items)
  }

  const handlePickerClose = () => {
    setIsPickerOpen(false)
  }

  return (
    <ItemPicker
      items={defaultItems}
      initialSelectedItems={selectedItems}
      openHotkey="a"
      placeholderText="Select item"
      selectionVariant="multiple"
      loading={false}
      groups={[]}
      renderAnchor={anchorProps => <button {...anchorProps}>Open Item Picker</button>}
      getItemKey={item => item}
      convertToItemProps={item => {
        return {
          id: item,
          text: item,
          source: item,
        }
      }}
      onSelectionChange={handleSelectionChange}
      onClose={handlePickerClose}
      triggerOpen={isPickerOpen}
      filterItems={noop}
    />
  )
}

test('renders the items correctly after opening the picker', () => {
  render(<TestItemPicker />, {wrapper: Wrapper})

  const openButton = screen.getByRole('button', {name: 'Open Item Picker'})
  fireEvent.click(openButton)

  const options = screen.getAllByRole('option')
  expect(options).toHaveLength(3)

  expect(options[0]).toHaveTextContent('item1')
  expect(options[1]).toHaveTextContent('item2')
  expect(options[2]).toHaveTextContent('item3')
})

test('pressing space while on a selected should toggle the selection', () => {
  render(<TestItemPicker />, {wrapper: Wrapper})

  const openButton = screen.getByRole('button', {name: 'Open Item Picker'})
  fireEvent.click(openButton)

  const options = screen.getAllByRole('option')
  expect(options).toHaveLength(3)

  userEvent.keyboard('{arrowdown}')

  // We use the 2nd option, since a key down press will go to the 2nd option given the first one is already indirectly
  // activated. This is the primer behaviour.
  expect(options[1]).toHaveAttribute('data-is-active-descendant', 'activated-directly')

  userEvent.keyboard('{space}')
  expect(options[1]).toHaveAttribute('aria-selected', 'true')

  // Press space again to deselect the first option
  userEvent.keyboard('{space}')
  // Assert selection status
  expect(options[1]).toHaveAttribute('aria-selected', 'false')
})

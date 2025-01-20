import {RadioActionList} from '../RadioActionList'
import {act, screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'

const onChange = jest.fn()

const items = [
  {id: '1', name: 'Item 1'},
  {id: '2', name: 'Item 2'},
  {id: '3', name: 'Item 3', description: 'Clickable'},
]

interface ComponentProps {
  selectedId?: string
}

function Component({selectedId}: ComponentProps) {
  return (
    <RadioActionList name="selectTest" onChange={onChange} groupLabel="Test" selectedId={selectedId} items={items} />
  )
}

afterEach(() => {
  onChange.mockClear()
})

it('shows the radio list', () => {
  render(<Component />)

  expect(screen.getByLabelText('Item 1')).toBeVisible()
  expect(screen.getByLabelText('Item 2')).toBeVisible()
  expect(screen.getByLabelText('Item 3')).toBeVisible()
})

it('can initialised without a selected option', () => {
  render(<Component />)

  expect(screen.getByLabelText('Item 1')).not.toBeChecked()
})

it('can initialised with the selected option', () => {
  render(<Component selectedId="1" />)

  expect(screen.getByLabelText('Item 1')).toBeChecked()
})

it('calls onChange when clicking on the label', () => {
  render(<Component />)

  act(() => {
    screen.getByLabelText('Item 2').click()
  })

  expect(onChange).toHaveBeenCalledWith('2')
})

it('calls onChange when clicking on the action list item', () => {
  render(<Component />)

  act(() => {
    screen.getByText('Clickable').click()
  })

  expect(onChange).toHaveBeenCalledWith('3')
})

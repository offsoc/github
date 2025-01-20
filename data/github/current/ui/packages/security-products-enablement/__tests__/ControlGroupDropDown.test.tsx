import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import ControlGroupDropDown from '../components/ControlGroupDropDown'

describe('ControlGroupDropDown', () => {
  it('renders', async () => {
    const props = {
      title: 'Hello, world!',
      options: [
        {name: 'First option', id: 'first', selected: true},
        {name: 'Second option', id: 'second', selected: false},
      ],
      onSelect: () => {},
      testId: 'my-test-id',
    }
    const {user} = render(<ControlGroupDropDown {...props} />)

    // Title is rendered:
    expect(screen.getByText('Hello, world!')).toBeInTheDocument()

    // Selected item is rendered:
    expect(screen.getByText('First option')).toBeInTheDocument()

    // TestID is present on the component:
    const button = screen.getByTestId('my-test-id-button')
    expect(button).toBeInTheDocument()
    await user.click(button)

    // TestIDs are generated for each item based off of testId prop and option ID:
    expect(screen.getByTestId('my-test-id-item-first')).toBeInTheDocument()
    expect(screen.getByTestId('my-test-id-item-second')).toBeInTheDocument()
  })

  it('does not require a testId argument', async () => {
    const props = {
      title: 'Hello, world!',
      options: [
        {name: 'First option', id: 'first', selected: true},
        {name: 'Second option', id: 'second', selected: false},
      ],
      onSelect: () => {},
    }
    const {user} = render(<ControlGroupDropDown {...props} />)

    // Title is rendered:
    expect(screen.getByText('Hello, world!')).toBeInTheDocument()

    // Selected item is rendered:
    expect(screen.getByText('First option')).toBeInTheDocument()

    // TestID is present on the component:
    const button = screen.getByTestId('control-group-drop-down-button')
    expect(button).toBeInTheDocument()
    await user.click(button)

    // TestIDs are generated for each item based off of testId prop and option ID:
    expect(screen.getByTestId('control-group-drop-down-item-first')).toBeInTheDocument()
    expect(screen.getByTestId('control-group-drop-down-item-second')).toBeInTheDocument()
  })

  it('calls onSelect when an item is selected', async () => {
    const onSelect = jest.fn()
    const props = {
      title: 'Select me',
      options: [
        {name: 'Selected', id: 'selected', selected: true},
        {name: 'Not selected', id: 'not-selected', selected: false},
      ],
      onSelect,
      testId: 'test-id',
    }
    const {user} = render(<ControlGroupDropDown {...props} />)

    // Click the button to make the dropdown appear:
    await user.click(screen.getByTestId('test-id-button'))

    // Click the item to call the onSelect function:
    await user.click(screen.getByTestId('test-id-item-not-selected'))
    expect(onSelect).toHaveBeenCalled()
  })
})

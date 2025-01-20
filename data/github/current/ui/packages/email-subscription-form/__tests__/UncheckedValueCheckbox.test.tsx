import UncheckedValueCheckbox from '../UncheckedValueCheckbox'
import {render} from '@github-ui/react-core/test-utils'
import {screen, fireEvent} from '@testing-library/react'

describe('UncheckedValueCheckbox component', () => {
  test.skip('Real input is controlled by checkbox', () => {
    const mockOnChange = jest.fn(() => {})
    const props = {value: 'blue', label: 'My checkbox', name: 'my_form_attr', onChange: mockOnChange}

    render(<UncheckedValueCheckbox {...props} />)

    const checkboxControl = screen.getByLabelText('My checkbox')
    const realInput = screen.getByTestId('realInput')

    expect(checkboxControl).not.toBeChecked()

    expect(checkboxControl.getAttribute('name')).toBe('')
    expect(realInput.getAttribute('name')).toBe('my_form_attr')
    expect(realInput).toHaveValue('0')

    fireEvent.click(checkboxControl)
    expect(checkboxControl).toBeChecked()
    expect(realInput).toHaveValue('blue')
    expect(mockOnChange).toHaveBeenCalled()

    fireEvent.click(checkboxControl)
    expect(checkboxControl).not.toBeChecked()
    expect(realInput).toHaveValue('0')
  })

  test.skip('uncheckedValue prop', () => {
    const mockOnChange = jest.fn(() => {})
    const props = {
      value: 'blue',
      uncheckedValue: 'red',
      label: 'My checkbox',
      name: 'my_form_attr',
      onChange: mockOnChange,
    }

    render(<UncheckedValueCheckbox {...props} />)

    const checkboxControl = screen.getByLabelText('My checkbox')
    const realInput = screen.getByTestId('realInput')

    expect(checkboxControl).not.toBeChecked()
    expect(realInput).toHaveValue('red')

    fireEvent.click(checkboxControl)
    expect(checkboxControl).toBeChecked()
    expect(realInput).toHaveValue('blue')
  })

  test('defaultChecked prop', () => {
    const mockOnChange = jest.fn(() => {})

    const props = {
      value: 'blue',
      uncheckedValue: 'red',
      label: 'My checkbox',
      name: 'my_form_attr',
      onChange: mockOnChange,
      defaultChecked: true,
    }

    render(<UncheckedValueCheckbox {...props} />)

    const checkboxControl = screen.getByLabelText('My checkbox')
    const realInput = screen.getByTestId('realInput')

    expect(checkboxControl).toBeChecked()
    expect(realInput).toHaveValue('blue')

    fireEvent.click(checkboxControl)
    expect(checkboxControl).not.toBeChecked()
    expect(realInput).toHaveValue('red')
  })
})

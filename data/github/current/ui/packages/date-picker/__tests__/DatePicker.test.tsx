import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {DatePicker} from '../date-picker'

const setDate = '2023-12-04T12:00:00Z'
const setSecondDate = '2023-12-05T12:00:00Z'

beforeAll(() => {
  jest.useFakeTimers().setSystemTime(new Date(setDate))
})

afterAll(() => {
  jest.useRealTimers()
})

describe('Single with button as trigger', () => {
  it('renders Single Date Picker', async () => {
    const {user} = render(<DatePicker variant="single" value={new Date(setDate)} />)
    const button = screen.getByRole('button', {name: 'Open date picker (currently selected: Dec 4)'})
    expect(button).toBeInTheDocument()

    await user.click(button)

    const panel = screen.getByRole('dialog', {name: 'Date Picker'})
    expect(panel).toBeInTheDocument()
  })

  it('opens DatePicker dialog with ArrowDown key', async () => {
    const {user} = render(<DatePicker variant="single" value={new Date(setDate)} />)
    const button = screen.getByRole('button', {name: 'Open date picker (currently selected: Dec 4)'})
    expect(button).toBeInTheDocument()

    await user.tab()
    expect(button).toHaveFocus()
    await user.keyboard('{ArrowDown}')

    const panel = screen.getByRole('dialog', {name: 'Date Picker'})
    expect(panel).toBeInTheDocument()
  })

  it('closes DatePicker dialog if trigger clicked when already open', async () => {
    const {user} = render(<DatePicker variant="single" value={new Date(setDate)} />)
    const button = screen.getByRole('button', {name: 'Open date picker (currently selected: Dec 4)'})
    expect(button).toBeInTheDocument()

    await user.click(button)
    const panel = screen.queryByRole('dialog', {name: 'Date Picker'})
    expect(panel).toBeInTheDocument()

    await user.click(button)
    expect(panel).not.toBeInTheDocument()
  })

  it('can select a date with Enter', async () => {
    const {user} = render(<DatePicker open variant="single" value={new Date(setDate)} />)

    await user.tab()
    await user.tab()
    expect(screen.getByTestId('day-12/04/2023')).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{ArrowDown}')
    expect(screen.getByTestId('day-12/11/2023')).toHaveFocus()
    await user.keyboard('{enter}')
    expect(screen.getByTestId('anchor-button')).toHaveTextContent('Dec 11')
  })

  it('can select a date with Space', async () => {
    const {user} = render(<DatePicker open variant="single" value={new Date(setDate)} />)

    await user.tab()
    await user.tab()
    expect(screen.getByTestId('day-12/04/2023')).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{ArrowDown}')
    expect(screen.getByTestId('day-12/11/2023')).toHaveFocus()
    await user.keyboard(' ')
    expect(screen.getByTestId('anchor-button')).toHaveTextContent('Dec 11')
  })

  it('uses the first date if array of dates is passed in', () => {
    render(
      // @ts-expect-error - Testing parser when invalid date format passed in
      <DatePicker variant="single" value={[new Date(setDate), new Date(setSecondDate)]} />,
    )

    const button = screen.getByRole('button', {name: 'Open date picker (currently selected: Dec 4)'})
    expect(button).toBeInTheDocument()
  })

  it('uses the `from` date if range of dates is passed in', () => {
    render(
      // @ts-expect-error - Testing parser when invalid date format passed in
      <DatePicker variant="single" value={{from: new Date(setDate), to: new Date(setSecondDate)}} />,
    )

    const button = screen.getByRole('button', {name: 'Open date picker (currently selected: Dec 4)'})
    expect(button).toBeInTheDocument()
  })

  it('moves to next day when right arrow key pressed', async () => {
    const {user} = render(<DatePicker open variant="single" value={new Date(setDate)} />)

    await user.tab()
    await user.tab()
    expect(screen.getByTestId('day-12/04/2023')).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{ArrowRight}')
    expect(screen.getByTestId('day-12/05/2023')).toHaveFocus()
  })

  it('moves to next Monday if date is a Friday, weekends are disabled, and right arrow key pressed', async () => {
    const setFridayDate = '2023-12-01T12:00:00Z'
    const {user} = render(<DatePicker open variant="single" disableWeekends={true} value={new Date(setFridayDate)} />)

    await user.tab()
    await user.tab()
    expect(screen.getByTestId('day-12/01/2023')).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{ArrowRight}')
    expect(screen.getByTestId('day-12/04/2023')).toHaveFocus()
  })

  it('moves to previous day when left arrow key pressed', async () => {
    const {user} = render(<DatePicker open variant="single" value={new Date(setDate)} />)

    await user.tab()
    await user.tab()
    expect(screen.getByTestId('day-12/04/2023')).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{ArrowLeft}')
    expect(screen.getByTestId('day-12/03/2023')).toHaveFocus()
  })

  it('moves to previous Friday if date is a Monday, weekends are disabled, and left arrow key pressed', async () => {
    const {user} = render(<DatePicker open variant="single" disableWeekends={true} value={new Date(setDate)} />)

    await user.tab()
    await user.tab()
    expect(screen.getByTestId('day-12/04/2023')).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{ArrowLeft}')
    expect(screen.getByTestId('day-12/01/2023')).toHaveFocus()
  })

  it('moves to previous week when up arrow key pressed', async () => {
    const setDateToDec11 = '2023-12-11T12:00:00Z'
    const {user} = render(<DatePicker open variant="single" value={new Date(setDateToDec11)} />)

    await user.tab()
    await user.tab()
    expect(screen.getByTestId('day-12/11/2023')).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{ArrowUp}')
    expect(screen.getByTestId('day-12/04/2023')).toHaveFocus()
  })

  it('moves to beginning of week when Home pressed', async () => {
    const setToWednesday = '2023-12-06T12:00:00Z'
    const {user} = render(<DatePicker open variant="single" value={new Date(setToWednesday)} />)

    await user.tab()
    await user.tab()
    expect(screen.getByTestId('day-12/06/2023')).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{Home}')
    expect(screen.getByTestId('day-12/03/2023')).toHaveFocus()
  })

  it('moves to end of week when End pressed', async () => {
    const {user} = render(<DatePicker open variant="single" value={new Date(setDate)} />)

    await user.tab()
    await user.tab()
    expect(screen.getByTestId('day-12/04/2023')).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{End}')
    expect(screen.getByTestId('day-12/09/2023')).toHaveFocus()
  })

  it('moves to previous month when PageUp pressed', async () => {
    const {user} = render(<DatePicker open variant="single" value={new Date(setDate)} />)

    await user.tab()
    await user.tab()
    expect(screen.getByTestId('day-12/04/2023')).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{PageUp}')
    expect(screen.getByTestId('day-11/04/2023')).toHaveFocus()
  })

  it('moves to next month when PageDown pressed', async () => {
    const {user} = render(<DatePicker open variant="single" value={new Date(setDate)} />)

    await user.tab()
    await user.tab()
    expect(screen.getByTestId('day-12/04/2023')).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{PageDown}')
    expect(screen.getByTestId('day-01/04/2024')).toHaveFocus()
  })

  it('renders overlay with text input', () => {
    render(<DatePicker open confirmation={true} variant="single" value={new Date(setDate)} />)
    const textInput = screen.getByRole('textbox', {name: 'Selected date'})
    expect(textInput).toBeInTheDocument()
  })

  it('confirms with user before canceling unsaved changes and saves changes when `Save` button pressed', async () => {
    const {user} = render(
      <DatePicker open confirmation={true} confirmUnsavedClose={true} variant="single" value={new Date(setDate)} />,
    )
    const differentDateElement = screen.getByRole('gridcell', {name: 'Tuesday, December 5'})
    expect(differentDateElement).toBeInTheDocument()

    await user.click(differentDateElement)
    await user.keyboard('{Escape}')
    const confirmationDialog = screen.getByRole('alertdialog', {name: 'Save Changes?'})
    expect(confirmationDialog).toBeInTheDocument()

    const saveButton = screen.getByRole('button', {name: 'Save'})
    expect(saveButton).toHaveFocus()
    await user.keyboard('{Enter}')

    const anchorButton = screen.getByRole('button', {name: 'Open date picker (currently selected: Dec 5)'})
    expect(anchorButton).toBeInTheDocument()
  })

  it('confirms with user before canceling unsaved changes and clears them when Escape pressed', async () => {
    const {user} = render(
      <DatePicker open confirmation={true} confirmUnsavedClose={true} variant="single" value={new Date(setDate)} />,
    )
    const differentDateElement = screen.getByRole('gridcell', {name: 'Tuesday, December 5'})
    expect(differentDateElement).toBeInTheDocument()

    await user.click(differentDateElement)
    await user.keyboard('{Escape}')
    const confirmationDialog = screen.getByRole('alertdialog', {name: 'Save Changes?'})
    expect(confirmationDialog).toBeInTheDocument()

    await user.keyboard('{Escape}')

    const anchorButton = screen.getByRole('button', {name: 'Open date picker (currently selected: Dec 4)'})
    expect(anchorButton).toBeInTheDocument()
  })

  it('clears selection when clear button pressed', async () => {
    const {user} = render(
      <DatePicker open minDate={new Date(setDate)} variant="single" value={new Date(setDate)} showClearButton={true} />,
    )

    const triggerButton = screen.getByRole('button', {name: 'Open date picker (currently selected: Dec 4)'})
    const clearButton = screen.getByRole('button', {name: 'Clear selected date'})
    expect(triggerButton).toBeInTheDocument()
    expect(clearButton).toBeInTheDocument()

    await user.click(clearButton)
    expect(triggerButton).toHaveTextContent('Choose Date...')
  })

  it('applies selection when apply button exists and is pressed', async () => {
    const {user} = render(<DatePicker open variant="single" value={new Date(setDate)} confirmation={true} />)

    const applyButton = screen.getByRole('button', {name: 'Apply selection and close'})
    expect(applyButton).toBeInTheDocument()
    expect(applyButton).toBeDisabled()

    await user.click(screen.getByRole('gridcell', {name: 'Tuesday, December 5'}))
    expect(applyButton).not.toBeDisabled()
    await user.click(applyButton)
    expect(screen.getByRole('button', {name: 'Open date picker (currently selected: Dec 5)'})).toBeInTheDocument()
  })

  it('shows dates for the next month when right arrow button is pressed', async () => {
    const {user} = render(<DatePicker open variant="single" value={new Date(setDate)} />)
    const nextMonthButton = screen.getByRole('button', {name: 'Go to next month'})
    expect(nextMonthButton).toBeInTheDocument()
    const dialog = screen.getByTestId('month')
    expect(dialog).toHaveTextContent('December 2023')

    await user.click(nextMonthButton)
    expect(dialog).toHaveTextContent('January 2024')
  })

  it('shows dates for the previous month when left arrow button is pressed', async () => {
    const {user} = render(<DatePicker open variant="single" value={new Date(setDate)} />)
    const previousMonthButton = screen.getByRole('button', {name: 'Go to previous month'})
    expect(previousMonthButton).toBeInTheDocument()
    const dialog = screen.getByTestId('month')
    expect(dialog).toHaveTextContent('December 2023')

    await user.click(previousMonthButton)
    expect(dialog).toHaveTextContent('November 2023')
  })

  it('should change month and year from select menus when compressedHeader is true', async () => {
    const {user} = render(<DatePicker open compressedHeader={true} variant="single" value={new Date(setDate)} />)

    const monthDropdown = screen.getByRole('combobox', {name: 'Go to month'})
    const yearDropdown = screen.getByRole('combobox', {name: 'Go to year'})
    expect(monthDropdown).toBeInTheDocument()
    expect(yearDropdown).toBeInTheDocument()

    await user.selectOptions(monthDropdown, 'Nov')
    await user.selectOptions(yearDropdown, '2022')
    expect(screen.getByTestId('month')).toHaveTextContent('November 2022')
  })

  it('should disable dates that are before minDate', () => {
    render(<DatePicker open minDate={new Date(setDate)} variant="single" value={new Date(setDate)} />)

    const enabledDate = screen.getByRole('gridcell', {name: 'Tuesday, December 5'})
    expect(enabledDate).toHaveAttribute('aria-disabled', 'false')
    const disabledDate = screen.getByRole('gridcell', {name: 'Sunday, December 3'})
    expect(disabledDate).toHaveAttribute('aria-disabled', 'true')
  })

  it('should disable dates that are after maxDate', () => {
    render(<DatePicker open maxDate={new Date(setDate)} variant="single" value={new Date(setDate)} />)

    const disabledDate = screen.getByRole('gridcell', {name: 'Sunday, December 3'})
    expect(disabledDate).toHaveAttribute('aria-disabled', 'false')
    const enabledDate = screen.getByRole('gridcell', {name: 'Tuesday, December 5'})
    expect(enabledDate).toHaveAttribute('aria-disabled', 'true')
  })
})

describe('Single with input as trigger', () => {
  it('keeps date value if valid date is typed and user moves focus from input', async () => {
    const {user} = render(
      <div>
        <DatePicker anchor="input" variant="single" value={new Date(setDate)} />
        <a href="https://www.github.com">Fake link to move focus to</a>
      </div>,
    )
    const textInput = screen.getByRole('textbox')
    expect(textInput).toBeInTheDocument()

    await user.click(textInput)
    await user.keyboard('{Backspace}3')
    expect(textInput).toHaveValue('Dec 3')
    await user.tab()

    expect(textInput).toHaveValue('Dec 3')
  })

  it('resets date value if invalid date is typed and user moves focus from input', async () => {
    const {user} = render(
      <div>
        <DatePicker anchor="input" variant="single" value={new Date(setDate)} />
        <a href="https://www.github.com">Fake link to move focus to</a>
      </div>,
    )
    const textInput = screen.getByRole('textbox')
    expect(textInput).toBeInTheDocument()

    await user.type(textInput, '3')
    expect(textInput).toHaveValue('Dec 43')
    expect(textInput).toHaveAttribute('aria-invalid', 'true')
    await user.tab()

    expect(textInput).toHaveValue('Dec 4')
  })

  it('resets date value if date is before minDate and user moves focus from input', async () => {
    const {user} = render(
      <div>
        <DatePicker anchor="input" variant="single" minDate={new Date(setDate)} value={new Date(setDate)} />
        <a href="https://www.github.com">Fake link to move focus to</a>
      </div>,
    )
    const textInput = screen.getByRole('textbox')
    expect(textInput).toBeInTheDocument()

    await user.click(textInput)
    await user.keyboard('{Backspace}3')
    expect(textInput).toHaveValue('Dec 3')
    await user.tab()

    expect(textInput).toHaveValue('Dec 4')
  })

  it('resets date value if date is after maxDate and user moves focus from input', async () => {
    const {user} = render(
      <div>
        <DatePicker anchor="input" variant="single" maxDate={new Date(setDate)} value={new Date(setDate)} />
        <a href="https://www.github.com">Fake link to move focus to</a>
      </div>,
    )
    const textInput = screen.getByRole('textbox')
    expect(textInput).toBeInTheDocument()

    await user.click(textInput)
    await user.keyboard('{Backspace}5')
    expect(textInput).toHaveValue('Dec 5')
    await user.tab()

    expect(textInput).toHaveValue('Dec 4')
  })

  it('resets date value if date is on a weekend, weekends are disabled, and user moves focus from input', async () => {
    const {user} = render(
      <div>
        <DatePicker anchor="input" variant="single" disableWeekends={true} value={new Date(setDate)} />
        <a href="https://www.github.com">Fake link to move focus to</a>
      </div>,
    )
    const textInput = screen.getByRole('textbox')
    expect(textInput).toBeInTheDocument()

    await user.click(textInput)
    await user.keyboard('{Backspace}3')
    expect(textInput).toHaveValue('Dec 3')
    await user.tab()

    expect(textInput).toHaveValue('Dec 4')
  })
})

describe('Multi with trigger as button', () => {
  it('renders Multi Date Picker', async () => {
    const {user} = render(<DatePicker variant="multi" value={[]} />)
    const button = screen.getByTestId('anchor-button')
    expect(button).toBeInTheDocument()

    await user.click(button)

    const panel = screen.getByTestId('datepicker-panel')
    expect(panel).toBeInTheDocument()
  })

  it('uses the single date if array of dates is not passed in', () => {
    render(
      // @ts-expect-error - Testing parser when invalid date format passed in
      <DatePicker variant="multi" value={new Date(setDate)} />,
    )

    const button = screen.getByRole('button', {name: 'Open date picker (currently selected: Dec 4)'})
    expect(button).toBeInTheDocument()
  })

  it('returns placeholder if empty array passed in', () => {
    render(<DatePicker variant="multi" value={[]} />)

    const button = screen.getByRole('button', {name: 'Open date picker (currently selected: Choose Date...)'})
    expect(button).toBeInTheDocument()
  })

  it('uses `to` and `from` dates if range is passed in', () => {
    // @ts-expect-error - Testing parser when invalid date format passed in
    render(<DatePicker variant="multi" value={{from: new Date(setDate), to: new Date(setSecondDate)}} />)

    const button = screen.getByRole('button', {name: 'Open date picker (currently selected: Dec 4, Dec 5)'})
    expect(button).toBeInTheDocument()
  })

  it('sets focus on previous button when panel is opened', () => {
    render(<DatePicker open variant="multi" value={[]} />)

    expect(screen.getByTestId('previous-button')).toHaveFocus()
  })

  it('focuses on today if no value is set', async () => {
    const {user} = render(<DatePicker open variant="multi" value={[]} />)

    await user.tab()
    expect(screen.getByTestId('next-button')).toHaveFocus()

    await user.tab()
    expect(screen.getByTestId('day-12/04/2023')).toHaveFocus()
  })

  it('can select multiple dates with keyboard', async () => {
    const {user} = render(<DatePicker open variant="multi" value={[]} />)

    await user.tab()
    await user.tab()
    await user.keyboard('{Enter}')
    expect(screen.getByTestId('day-12/04/2023')).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{ArrowDown}')
    const newDate = screen.getByTestId('day-12/11/2023')
    expect(newDate).toHaveFocus()
    expect(newDate).toHaveAttribute('aria-selected', 'false')
    await user.keyboard('{Control>}[Enter]{/Control}')
    expect(newDate).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{ArrowDown}')
    const newDate2 = screen.getByTestId('day-12/18/2023')
    expect(newDate2).toHaveFocus()
    expect(newDate2).toHaveAttribute('aria-selected', 'false')
    await user.keyboard('{Control>} {/Control}')
    expect(newDate).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{Escape}')
    expect(screen.getByTestId('anchor-button')).toHaveTextContent('Dec 4, Dec 11, Dec 18')
  })

  it('can select range of single dates with keyboard', async () => {
    const {user} = render(<DatePicker open variant="multi" value={[]} />)

    await user.tab()
    await user.tab()
    await user.keyboard('{Enter}')
    expect(screen.getByTestId('day-12/04/2023')).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{ArrowDown}')
    const newDate = screen.getByTestId('day-12/11/2023')
    expect(newDate).toHaveFocus()
    expect(newDate).toHaveAttribute('aria-selected', 'false')
    await user.keyboard('{Shift>}[Enter]{/Shift}')
    expect(newDate).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{Escape}')
    expect(screen.getByTestId('anchor-button')).toHaveTextContent('8 Selected')
  })
})

describe('Multi with trigger as input', () => {
  it('keeps date value if valid date is typed and user moves focus from input', async () => {
    const {user} = render(
      <div>
        <DatePicker anchor="input" variant="multi" value={[new Date(setDate), new Date(setSecondDate)]} />
        <a href="https://www.github.com">Fake link to move focus to</a>
      </div>,
    )
    const textInput = screen.getByRole('textbox')
    expect(textInput).toBeInTheDocument()
    expect(screen.getByText('Dec 4')).toBeInTheDocument()
    expect(screen.getByText('Dec 5')).toBeInTheDocument()

    await user.click(textInput)
    await user.keyboard('Dec 6')
    await user.keyboard('{Enter}')
    await user.tab()

    expect(screen.getByText('Dec 6')).toBeInTheDocument()
  })

  it('does not allow invalid dates when user moves focus from input', async () => {
    const {user} = render(
      <div>
        <DatePicker anchor="input" variant="multi" value={[new Date(setDate), new Date(setSecondDate)]} />
        <a href="https://www.github.com">Fake link to move focus to</a>
      </div>,
    )
    const textInput = screen.getByRole('textbox')
    expect(textInput).toBeInTheDocument()
    expect(screen.getByText('Dec 4')).toBeInTheDocument()
    expect(screen.getByText('Dec 5')).toBeInTheDocument()

    await user.click(textInput)
    await user.keyboard('Dec 42')
    await user.keyboard('{Enter}')
    await user.tab()

    expect(screen.getByText('Dec 4')).toBeInTheDocument()
    expect(screen.getByText('Dec 5')).toBeInTheDocument()
    expect(screen.queryByText('Dec 42')).not.toBeInTheDocument()
  })

  it('removes a token if backspace is pressed', async () => {
    const {user} = render(
      <div>
        <DatePicker anchor="input" variant="multi" value={[new Date(setDate), new Date(setSecondDate)]} />
        <a href="https://www.github.com">Fake link to move focus to</a>
      </div>,
    )
    const textInput = screen.getByRole('textbox')
    expect(textInput).toBeInTheDocument()
    expect(screen.getByText('Dec 4')).toBeInTheDocument()
    expect(screen.getByText('Dec 5')).toBeInTheDocument()

    await user.click(textInput)
    await user.keyboard('{Backspace}')

    expect(screen.getByText('Dec 4')).toBeInTheDocument()
    expect(screen.queryByText('Dec 5')).not.toBeInTheDocument()
  })
})

describe('Range with trigger as button', () => {
  it('selects range of dates when variant is range', async () => {
    const {user} = render(<DatePicker variant="range" value={null} />)
    const triggerButton = screen.getByRole('button', {name: 'Open date picker (currently selected: Choose Date...)'})
    expect(triggerButton).toBeInTheDocument()

    await user.click(triggerButton)

    const startDate = screen.getByRole('gridcell', {name: 'Tuesday, December 5'})
    const endDate = screen.getByRole('gridcell', {name: 'Tuesday, December 12'})

    await user.click(startDate)
    await user.click(endDate)

    expect(
      screen.getByRole('button', {name: 'Open date picker (currently selected: Dec 5 - Dec 12)'}),
    ).toBeInTheDocument()
  })

  it('corrects new selected range when values are selected in opposite order', async () => {
    const {user} = render(
      <DatePicker open variant="range" value={{from: new Date(setDate), to: new Date(setSecondDate)}} />,
    )
    expect(
      screen.getByRole('button', {name: 'Open date picker (currently selected: Dec 4 - Dec 5)'}),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('gridcell', {name: 'Tuesday, December 12'}))
    await user.click(screen.getByRole('gridcell', {name: 'Wednesday, December 6'}))

    expect(
      screen.getByRole('button', {name: 'Open date picker (currently selected: Dec 6 - Dec 12)'}),
    ).toBeInTheDocument()
  })

  it('displays one date as first date if only one is passed in', () => {
    // @ts-expect-error - Testing parser when invalid date format passed in
    render(<DatePicker variant="range" value={new Date(setDate)} />)

    const button = screen.getByRole('button', {name: 'Open date picker (currently selected: Dec 4 - )'})
    expect(button).toBeInTheDocument()
  })

  it('displays dates as range if an array of dates is passed in', () => {
    // @ts-expect-error - Testing parser when invalid date format passed in
    render(<DatePicker variant="range" value={[new Date(setDate), new Date(setSecondDate)]} />)

    const button = screen.getByRole('button', {name: 'Open date picker (currently selected: Dec 4 - Dec 5)'})
    expect(button).toBeInTheDocument()
  })
})

describe('Range with trigger as input', () => {
  it('renders two text inputs', () => {
    render(<DatePicker anchor="input" variant="range" value={null} />)
    const startTextInput = screen.getByRole('textbox', {name: 'Start date'})
    const endTextInput = screen.getByRole('textbox', {name: 'End date'})

    expect(startTextInput).toBeInTheDocument()
    expect(endTextInput).toBeInTheDocument()
  })

  it('removes invalid dates from text inputs, keeps valid dates', async () => {
    const {user} = render(
      <div>
        <DatePicker anchor="input" variant="range" value={null} />
        <a href="https://www.github.com">Fake link to move focus to</a>
      </div>,
    )
    const startTextInput = screen.getByRole('textbox', {name: 'Start date'})
    const endTextInput = screen.getByRole('textbox', {name: 'End date'})

    await user.click(startTextInput)
    await user.keyboard('dddd')
    await user.tab()

    expect(startTextInput).toHaveValue('')

    await user.click(endTextInput)
    await user.keyboard('Dec 2')
    await user.tab()

    expect(endTextInput).toHaveValue('Dec 2')
  })
})

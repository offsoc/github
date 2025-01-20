import {DatePicker} from '@github-ui/date-picker'
import {ThemeProvider} from '@primer/react'
import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

let user: ReturnType<(typeof userEvent)['setup']>

describe('DatePicker', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2021-12-26 12:00:00').getTime())
    user = userEvent.setup({advanceTimers: jest.advanceTimersByTime})
  })

  const wrapper: React.ComponentType<React.PropsWithChildren<unknown>> = ({children}) => {
    return <ThemeProvider>{children}</ThemeProvider>
  }

  it('can change the date and receive callback', async () => {
    const onChange = jest.fn()

    render(<DatePicker variant="single" onChange={onChange} value={new Date()} />, {wrapper})
    await user.click(screen.getByTestId('anchor-button'))

    // choose a date two days after the current day
    const element = await waitFor(() => screen.findByTestId('day-12/28/2021'))

    await user.click(element)

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0]).toEqual(new Date(2021, 11, 28))
  })

  it('omitting variant will still receive callback on date change', async () => {
    const onChange = jest.fn()

    render(<DatePicker onChange={onChange} value={new Date()} />, {wrapper})

    await user.click(screen.getByTestId('anchor-button'))

    // choose a date four days after the current day
    const element = await waitFor(() => screen.findByTestId('day-12/30/2021'))

    await user.click(element)

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0]).toEqual(new Date(2021, 11, 30))
  })

  it('should focus on selected date when tabbing', async () => {
    const onChange = jest.fn()

    render(<DatePicker onChange={onChange} value={new Date(2021, 11, 28)} />, {wrapper})
    await user.click(screen.getByTestId('anchor-button'))

    expect(await screen.findByTestId('previous-button')).toHaveFocus()
    await user.keyboard('{Tab}')
    expect(await screen.findByTestId('next-button')).toHaveFocus()
    await user.keyboard('{Tab}')
    expect(await screen.findByTestId('day-12/28/2021')).toHaveFocus()
  })

  it('should focus on today when tabbing and no date is eet', async () => {
    const onChange = jest.fn()

    render(<DatePicker onChange={onChange} value={null} />, {wrapper})
    await user.click(screen.getByTestId('anchor-button'))

    expect(await screen.findByTestId('previous-button')).toHaveFocus()
    await user.keyboard('{Tab}')
    expect(await screen.findByTestId('next-button')).toHaveFocus()
    await user.keyboard('{Tab}')
    expect(await screen.findByTestId('day-12/26/2021')).toHaveFocus()
  })

  it('should focus on date input when input is enabled', async () => {
    const onChange = jest.fn()

    render(<DatePicker onChange={onChange} value={null} showInputs confirmation />, {wrapper})

    await user.click(screen.getByTestId('anchor-button'))

    expect(await screen.findByLabelText('Selected date')).toHaveFocus()
  })

  it('should not display clear button by default', async () => {
    const onChange = jest.fn()

    render(<DatePicker onChange={onChange} value={new Date()} />, {wrapper})

    await user.click(screen.getByTestId('anchor-button'))

    expect(screen.queryByText('Clear')).not.toBeInTheDocument()
  })

  it('should remove date when clear button is clicked', async () => {
    const onChange = jest.fn()

    render(<DatePicker onChange={onChange} value={new Date()} showClearButton />, {wrapper})
    await user.click(screen.getByTestId('anchor-button'))

    // choose a date four days after the current day
    const element = await waitFor(() => screen.findByTestId('day-12/30/2021'))
    await user.click(element)
    await user.click(screen.getByTestId('anchor-button'))

    // clear the selected date
    const clearButton = await waitFor(() => screen.findByText('Clear'))
    await user.click(clearButton)

    expect(onChange).toHaveBeenCalledTimes(2)
    expect(onChange.mock.calls[1][0]).toEqual(null)
    expect(screen.getByTestId('anchor-button')).toHaveTextContent('Choose Date...')

    await user.click(screen.getByTestId('anchor-button'))
    expect(element).toHaveAttribute('aria-selected', 'false')
  })
})

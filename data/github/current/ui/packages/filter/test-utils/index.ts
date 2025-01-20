import {act, fireEvent, screen} from '@testing-library/react'

export const setupExpectedAsyncErrorHandler = () => {
  jest.spyOn(console, 'error').mockImplementation((message: string) => {
    // * Because Filter is asynchronous, there are console errors that are thrown, but expected. This will rethrow
    // * any errors that are not related to the async nature of the component.
    if (!message.includes?.('wrapped in act(')) {
      // eslint-disable-next-line no-console
      console.warn(message)
    }
  })
}

export async function updateFilterValue(key: string, value: string = '') {
  jest.useFakeTimers()

  const input = screen.getByRole('combobox')
  input.focus()

  fireEvent.change(input, {target: {value: `${key}${key && value ? ':' : ''}${value}`}})

  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    jest.runAllTimers()
  })
}

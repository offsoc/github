import {within} from '@storybook/test'

export const getSuggestions = (canvas: ReturnType<typeof within>) => {
  return within(canvas.getByTestId('filter-results'))
    .getAllByRole('option')
    .map(suggestion => suggestion.textContent)
}

export const getActiveSuggestion = (canvas: ReturnType<typeof within>) => {
  return within(canvas.getByTestId('filter-results'))
    .getAllByRole('option')
    .find(suggestion => suggestion.getAttribute('aria-selected') === 'true')
}

export const moveCursor = (canvas: ReturnType<typeof within>, index: number) => {
  const input: HTMLInputElement = canvas.getByRole('combobox')
  input.setSelectionRange(index, index)
}

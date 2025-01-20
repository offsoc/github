import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {customColumnFactory} from '../../factories/columns/custom-column-factory'
import {systemColumnFactory} from '../../factories/columns/system-column-factory'
import {mockUseHasColumnData} from '../../mocks/hooks/use-has-column-data'
import {setupTableView} from '../../test-app-wrapper'

// Forgo debounced update to query parameters when typing in the filer bar, which currently falls outside of the focus
// for this test. Using jest.useFakeTimers and jest.advanceTimersByTime does not work well when rendered inside of the AppContext,
// which involves many timer interactions.
jest.mock('lodash-es/debounce', () =>
  jest.fn(fn => {
    fn.cancel = jest.fn()
    fn.flush = jest.fn()
    return fn
  }),
)

// Mock unneeded async operations not required for this test to prevent memory leaks.
jest.mock('../../../client/state-providers/repositories/use-repositories')
jest.mock('../../../client/state-providers/suggestions/use-fetch-suggested-assignees')

describe('Filter bar combobox tests', () => {
  beforeEach(() => {
    mockUseHasColumnData()
  })

  async function renderFilterBar() {
    const columns = [
      systemColumnFactory.title().build(),
      systemColumnFactory.status({optionNames: ['Todo', 'In progress', 'Done']}).build(), // status
      customColumnFactory.singleSelect({optionNames: ['One', 'Two', 'Three']}).build({name: 'Stage'}), // stage
    ]

    const {Table} = setupTableView({columns})
    render(<Table />)
    await userEvent.click(await screen.findByTestId('filter-bar-input'))
  }

  function getFilterInput(): HTMLInputElement {
    return screen.getByTestId('filter-bar-input')
  }

  function findSuggestionsList() {
    return screen.findByTestId('search-suggestions-box')
  }

  async function activateSearch(input: HTMLInputElement) {
    await userEvent.type(input, 's')
  }

  function expectAriaClosed(input: HTMLInputElement) {
    expect(input.getAttribute('aria-expanded')).toBe('false')
    expect(input.getAttribute('aria-activedescendant')).toBe(null)
  }

  function expectAriaExpanded(input: HTMLInputElement) {
    expect(input.getAttribute('aria-expanded')).toBe('true')
  }

  function expectOptionSelected(text: string, expectedOptionId: string, input: HTMLInputElement) {
    const option = screen.getByTestId(expectedOptionId)
    expect(option).toHaveTextContent(text)
    expect(option).toHaveAttribute('aria-selected', 'true')
    expect(input.getAttribute('aria-activedescendant')).toEqual(expectedOptionId)
  }

  it('should set aria-expanded "true" after typing in the input, preselect the first option, and indicate result count', async () => {
    await renderFilterBar()

    const input = getFilterInput()
    expectAriaClosed(input)

    await userEvent.type(input, 's')

    await findSuggestionsList()

    expectAriaExpanded(input)
    expectOptionSelected('status:', 'search-suggestions-item-Status', input)
    expect(screen.getByTestId('search-suggestions-box-feedback')).toHaveTextContent('2 results')
  })

  it('should ensure that aria-controls on the input matches listbox id', async () => {
    await renderFilterBar()
    const input = getFilterInput()
    const ariaControls = input.getAttribute('aria-controls')

    await activateSearch(input)

    const list = await findSuggestionsList()
    expect(list).toHaveAttribute('id', ariaControls)
  })

  it('should update aria-activedescendant when the arrow keys are used to navigate the list', async () => {
    await renderFilterBar()
    const input = getFilterInput()

    await activateSearch(input)

    await findSuggestionsList()

    await userEvent.keyboard('{arrowdown}')
    expectOptionSelected('stage:', 'search-suggestions-item-Stage', input)

    await userEvent.keyboard('{arrowup}')
    expectOptionSelected('status:', 'search-suggestions-item-Status', input)
  })

  it('should remove aria-activedescendant and set aria-expanded="false" after closing the filter menu', async () => {
    await renderFilterBar()
    const input = getFilterInput()

    await activateSearch(input)

    await findSuggestionsList()
    await userEvent.keyboard('{escape}')
    await userEvent.keyboard('{arrowdown}')

    expect(screen.queryByTestId('search-suggestions-box')).not.toBeInTheDocument()
    expectAriaClosed(input)
  })
})

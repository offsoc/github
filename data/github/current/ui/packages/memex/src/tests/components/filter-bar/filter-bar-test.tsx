import {render, screen, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {useEnabledFeatures} from '../../../client/hooks/use-enabled-features'
import {Resources} from '../../../client/strings'
import {customColumnFactory} from '../../factories/columns/custom-column-factory'
import {systemColumnFactory} from '../../factories/columns/system-column-factory'
import {mockUseHasColumnData} from '../../mocks/hooks/use-has-column-data'
import {asMockHook} from '../../mocks/stub-utilities'
import {setupTableView} from '../../test-app-wrapper'

// Forgo debounced update to query parameters when typing in the filter bar, which currently falls outside of the focus
// for this test. Using jest.useFakeTimers and jest.advanceTimersByTime does not work well when rendered inside of the AppContext,
// which involves many timer interactions.
jest.mock('lodash-es/debounce', () =>
  jest.fn(fn => {
    fn.cancel = jest.fn()
    fn.flush = jest.fn()
    return fn
  }),
)

jest.mock('../../../client/hooks/use-enabled-features')

describe('Filter bar', () => {
  beforeEach(() => {
    mockUseHasColumnData()
    asMockHook(useEnabledFeatures).mockReturnValue({
      memex_table_without_limits: true,
      issue_types: true,
    })
  })

  function renderViewWithFilter() {
    const columns = [
      systemColumnFactory.title().build(),
      systemColumnFactory.assignees().build(),
      systemColumnFactory.status({optionNames: ['Todo', 'In progress', 'Done']}).build(),
      systemColumnFactory.labels().build(),
      systemColumnFactory.linkedPullRequests().build(),
      systemColumnFactory.repository().build(),
      systemColumnFactory.reviewers().build(),
      systemColumnFactory.milestone().build(),
      systemColumnFactory.issueType().build(),
      customColumnFactory.date().build({name: 'Date'}),
      customColumnFactory
        .iteration({
          configuration: {
            startDay: 1,
            duration: 7,
            iterations: [{startDate: '2022-07-07', title: 'Sprint 1', titleHtml: 'Sprint 1', duration: 7, id: '1'}],
            completedIterations: [],
          },
        })
        .build({name: 'Iteration'}),
      customColumnFactory.number().build({name: 'Number'}),
      customColumnFactory.singleSelect({optionNames: ['One', 'Two', 'Three']}).build({name: 'Single select'}),
      customColumnFactory.text().build({name: 'Text'}),
    ]

    const {Table} = setupTableView({columns})
    render(<Table />)
  }

  function getInput() {
    return screen.getByPlaceholderText(Resources.filterByKeyboardOrByField)
  }

  async function getSuggestions() {
    try {
      return await within(screen.getByTestId('filter-bar-component')).findAllByRole('option')
    } catch (_e) {
      return []
    }
  }

  function getSuggestionsDropdown() {
    return screen.getByLabelText('Suggestions')
  }

  async function getSuggestionWithLabel(label: string | RegExp) {
    const suggestionsDropdown = getSuggestionsDropdown()
    try {
      return await within(suggestionsDropdown).findAllByLabelText(label)
    } catch (_e) {
      return []
    }
  }

  it('shows suggestions on input focus', async () => {
    renderViewWithFilter()
    const input = getInput()
    await userEvent.click(input)
    const suggestions = await getSuggestions()

    expect(suggestions.length).toBe(12)
  })

  it('shows suggestion for No filter', async () => {
    renderViewWithFilter()
    const input = getInput()
    await userEvent.type(input, 'no')
    const noSuggestion = await getSuggestionWithLabel(/^No/)

    expect(noSuggestion.length).toBe(1)
  })

  it('shows suggestions for No filter values', async () => {
    renderViewWithFilter()
    const input = getInput()
    await userEvent.type(input, 'no:')
    const statusSuggestion = await getSuggestionWithLabel(/^Status/)
    const suggestions = await getSuggestions()

    expect(statusSuggestion.length).toBe(1)
    expect(suggestions.length).toBe(9)
  })

  it('shows suggestions for Has filter values', async () => {
    renderViewWithFilter()
    const input = getInput()
    await userEvent.type(input, 'has:')
    const statusSuggestion = await getSuggestionWithLabel(/^Status/)
    const suggestions = await getSuggestions()

    expect(statusSuggestion.length).toBe(1)
    expect(suggestions.length).toBe(9)
  })

  it('shows suggestion for Is filter', async () => {
    renderViewWithFilter()
    const input = getInput()
    await userEvent.type(input, 'is')
    const isSuggestion = await getSuggestionWithLabel(/^Is/)

    expect(isSuggestion.length).toBe(1)
  })

  it('shows suggestions for the Reason filter', async () => {
    renderViewWithFilter()
    const input = getInput()
    await userEvent.type(input, 'reason:')

    const completedSuggestion = await getSuggestionWithLabel(/^Completed/)
    const notPlannedSuggestion = await getSuggestionWithLabel(/^Not planned/)
    const reopenedSuggestion = await getSuggestionWithLabel(/^Reopened/)
    const suggestions = await getSuggestions()

    expect(completedSuggestion.length).toBe(1)
    expect(notPlannedSuggestion.length).toBe(1)
    expect(reopenedSuggestion.length).toBe(1)
    expect(suggestions.length).toBe(3)
  })

  it('shows suggestions for the Updated filter', async () => {
    renderViewWithFilter()
    const input = getInput()
    await userEvent.type(input, 'updated:')

    const todaySuggestion = await getSuggestionWithLabel(/^Today/)
    expect(todaySuggestion.length).toBe(1)
  })

  it('does not show suggestion for State filter', async () => {
    renderViewWithFilter()
    const input = getInput()
    await userEvent.click(input)
    let stateSuggestion = await getSuggestionWithLabel(/^State/)

    expect(stateSuggestion.length).toBe(0)

    await userEvent.type(input, 'state')
    stateSuggestion = await getSuggestionWithLabel(/^State/)

    expect(stateSuggestion.length).toBe(0)
  })

  it('includes State filter values in suggestions for Is filter values (legacy functionality)', async () => {
    renderViewWithFilter()
    const input = getInput()
    await userEvent.type(input, 'is:')
    const typeSuggestion = await getSuggestionWithLabel(/^Issue/)
    const stateSuggestion = await getSuggestionWithLabel(/^Open/)
    const suggestions = await getSuggestions()

    expect(typeSuggestion.length).toBe(1)
    expect(stateSuggestion.length).toBe(1)
    // Open, Closed, Draft, Merged, Pull Request, Issue
    expect(suggestions.length).toBe(6)
  })

  it('supports custom Date fields', async () => {
    renderViewWithFilter()
    const input = getInput()
    await userEvent.type(input, 'date')
    const dateSuggestion = await getSuggestionWithLabel(/^Date/)

    expect(dateSuggestion.length).toBe(1)
  })

  it('supports custom Iteration fields', async () => {
    renderViewWithFilter()
    const input = getInput()
    await userEvent.type(input, 'iteration')
    const iterationSuggestion = await getSuggestionWithLabel(/^Iteration/)

    expect(iterationSuggestion.length).toBe(1)

    await userEvent.click(iterationSuggestion[0])
    const optionSuggestion = await getSuggestionWithLabel(/^Sprint/)
    const suggestions = await getSuggestions()

    expect(optionSuggestion.length).toBe(1)
    expect(suggestions.length).toBe(1)
  })

  it('supports custom Number fields', async () => {
    renderViewWithFilter()
    const input = getInput()
    await userEvent.type(input, 'number')
    const numberSuggestion = await getSuggestionWithLabel(/^Number/)

    expect(numberSuggestion.length).toBe(1)
  })

  it('supports custom Single Select fields', async () => {
    renderViewWithFilter()
    const input = getInput()
    await userEvent.type(input, 'single-select')
    const singleSelectSuggestion = await getSuggestionWithLabel(/^Single/)

    expect(singleSelectSuggestion.length).toBe(1)

    await userEvent.click(singleSelectSuggestion[0])
    const optionSuggestion = await getSuggestionWithLabel(/^One/)
    const suggestions = await getSuggestions()

    expect(optionSuggestion.length).toBe(1)
    expect(suggestions.length).toBe(3)
  })

  it('supports custom Text fields', async () => {
    renderViewWithFilter()
    const input = getInput()
    await userEvent.type(input, 'text')
    const textSuggestion = await getSuggestionWithLabel(/^Text/)

    expect(textSuggestion.length).toBe(1)
  })

  it('supports Type field', async () => {
    renderViewWithFilter()
    const input = getInput()
    await userEvent.type(input, 'type')
    const typeSuggestion = await getSuggestionWithLabel(/^Type/)

    expect(typeSuggestion.length).toBe(1)
  })

  it('does not include issue or pull request in Type suggestions', async () => {
    renderViewWithFilter()
    const input = getInput()
    await userEvent.type(input, 'type')
    const typeSuggestion = await getSuggestionWithLabel(/^Type/)
    await userEvent.click(typeSuggestion[0])

    expect(await getSuggestionWithLabel(/^Issue/)).toHaveLength(0)
    expect(await getSuggestionWithLabel(/^Pull Request/)).toHaveLength(0)
  })
})

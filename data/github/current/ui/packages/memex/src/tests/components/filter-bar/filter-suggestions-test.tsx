import {render, screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {ItemType} from '../../../client/api/memex-items/item-type'
import {useEnabledFeatures} from '../../../client/hooks/use-enabled-features'
import {useHasColumnData} from '../../../client/state-providers/columns/use-has-column-data'
import {columnValueFactory} from '../../factories/column-values/column-value-factory'
import {customColumnFactory} from '../../factories/columns/custom-column-factory'
import {systemColumnFactory} from '../../factories/columns/system-column-factory'
import {draftIssueFactory} from '../../factories/memex-items/draft-issue-factory'
import {asMockHook} from '../../mocks/stub-utilities'
import {setupBoardFilterBar} from '../../test-app-wrapper'
import {findFilterInput} from '../project-view/project-view-test-helper'

jest.mock('../../../client/hooks/use-enabled-features')

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

/**
 * There isn't much value in trying to determine the picker's position
 * in a jsdom environment and without mocking out this hook, whenever we
 * try to render a picker (like in the omnibar), we go into an infinite rendering
 * loop due to no actual implementation in `getBoundingClientRect`
 */
jest.mock('../../../client/components/common/picker-list', () => ({
  ...jest.requireActual('../../../client/components/common/picker-list'),
  useAdjustPickerPosition: () => ({
    adjustPickerPosition: jest.fn(),
  }),
}))

/**
 * Without mocking this hook we will issue an additional server call because the
 * data that we have for our items does not line up with the columns that are defined for the
 * test. This additional server call is async and will respond _after_ the test has completed,
 * causing noise in the test console when we try to `setState` outside of an `act` block.
 *
 * We could try to always make sure that our column values line up with our columns, to prevent
 * this call; however, since this behavior isn't really what we're focused on testing in
 * this test suite, we instead just mock out the hook entirely.
 */
jest.mock('../../../client/state-providers/columns/use-has-column-data')

async function expectNoSuggestions() {
  // TODO: Remove this wait, because it is unnecessarily slowing down the tests.
  // Unfortunately, there is no visible indicator that the filter suggestions are processing/loading
  // so the most robust solution is to just wait a short time.
  await new Promise(resolve => setTimeout(resolve, 250))
  expect(screen.queryByRole('listbox', {name: 'Results'})).toBeNull()
}

async function expectSuggestions(expected: Array<string>): Promise<void> {
  if (expected.length === 0) {
    await expectNoSuggestions()
  } else {
    let listbox: HTMLElement | null = null

    await waitFor(() => {
      listbox = screen.queryByRole('listbox', {name: 'Results'})
      expect(listbox).not.toBeNull()
    })

    await waitFor(() => {
      const options = within(listbox as HTMLElement).getAllByRole('option')
      const suggestions = options.map(option => option.textContent)
      expect(suggestions).toEqual(expected)
    })
  }
}

const setFilter = async (filter: string) => {
  const filterInput = await findFilterInput()
  await userEvent.clear(filterInput)
  if (filter) {
    await userEvent.type(filterInput, filter)
  }
}

const originalRAF = window.requestAnimationFrame

describe('filter suggestions', () => {
  beforeAll(() => {
    asMockHook(useHasColumnData).mockReturnValue({hasColumnData: () => true})
    asMockHook(useEnabledFeatures).mockReturnValue({
      issue_types: false,
    })

    Object.defineProperty(window, 'requestAnimationFrame', {
      writable: true,
      value: (callback: () => FrameRequestCallback) => callback(),
    })
  })

  afterAll(() => {
    Object.defineProperty(window, 'requestAnimationFrame', {
      writable: true,
      value: originalRAF,
    })
  })

  const columns = [
    systemColumnFactory.title().build(),
    systemColumnFactory.status({optionNames: ['Todo', 'In progress', 'Done']}).build(),
    systemColumnFactory.repository().build(),
    customColumnFactory.singleSelect({optionNames: ['One', 'Two', 'Three']}).build({name: 'Stage'}),
    customColumnFactory.number().build({name: 'Estimate'}),
    customColumnFactory.date().build({name: 'Date'}),
    customColumnFactory.singleSelect({optionNames: ['Epic 🌋', 'Task ✍️', 'Bug 🐛']}).build({name: 'type'}),
  ]

  const renderFilterBar = (props: Parameters<typeof setupBoardFilterBar>[0] = {}) => {
    const {FilterBar} = setupBoardFilterBar({columns, ...props})
    render(<FilterBar />)
  }

  it('does not show suggestions when no input is entered', async () => {
    renderFilterBar()
    await setFilter('')
    await expectNoSuggestions()
  })

  it('shows field suggestions when cursor is at the end of some text', async () => {
    renderFilterBar()
    await setFilter('s')
    await expectSuggestions(['status:', 'stage:'])
    await setFilter('status')
    await expectSuggestions(['status:'])
  })

  it('shows field suggestions when cursor is at the end of some text and already has filters', async () => {
    renderFilterBar()
    await setFilter('status:done s')
    await expectSuggestions(['status:', 'stage:'])
  })

  it('does not show suggestions when cursor is right after a filter', async () => {
    renderFilterBar()
    await setFilter('status:done')
    await expectNoSuggestions()
    await setFilter('status:done    ')
    await expectNoSuggestions()
  })

  it('shows field and qualifier suggestions when cursor is after a hyphen', async () => {
    renderFilterBar()
    await setFilter('-')
    await expectSuggestions([
      'status:',
      'repo:',
      'stage:',
      'estimate:',
      'date:',
      'type:',
      'is:',
      'no:',
      'has:',
      'reason:',
      'last updated:',
      'updated:',
    ])
    await setFilter('-s')
    await expectSuggestions(['status:', 'stage:'])
  })

  it('shows field and qualifier suggestions when cursor is after a hyphen and already has filters', async () => {
    renderFilterBar()
    await setFilter('status:done -')
    await expectSuggestions([
      'status:',
      'repo:',
      'stage:',
      'estimate:',
      'date:',
      'type:',
      'is:',
      'no:',
      'has:',
      'reason:',
      'last updated:',
      'updated:',
    ])
    await setFilter('status:done -s')
    await expectSuggestions(['status:', 'stage:'])
  })

  it('shows field suggestions when cursor is after a `no:` qualifier', async () => {
    renderFilterBar()
    await setFilter('no:')
    await expectSuggestions(['status', 'repo', 'stage', 'estimate', 'date', 'type'])
  })

  it('shows field suggestions when cursor is after a `no:` qualifier and already has filters', async () => {
    renderFilterBar()
    await setFilter('status:done no:')
    await expectSuggestions(['status', 'repo', 'stage', 'estimate', 'date', 'type'])
  })

  it('shows state suggestions when cursor is after `is:` qualifier', async () => {
    renderFilterBar()
    await setFilter('is:')
    await expectSuggestions(['open', 'closed', 'merged', 'draft', 'issue', 'pr'])
  })

  it('shows value suggestions when cursor is after a colon at the end of text', async () => {
    renderFilterBar({
      items: [
        draftIssueFactory.build({
          memexProjectColumnValues: [
            columnValueFactory.title('item 1', ItemType.DraftIssue).build(),
            columnValueFactory.status('Todo', columns).build(),
          ],
        }),
        draftIssueFactory.build({
          memexProjectColumnValues: [
            columnValueFactory.title('item 2', ItemType.DraftIssue).build(),
            columnValueFactory.status('Done', columns).build(),
          ],
        }),
      ],
    })
    await setFilter('status:')

    await expectSuggestions(['Has status', 'No status', 'Exclude status', 'Todo', 'In progress', 'Done'])
  })

  it('shows value suggestions inside of value list', async () => {
    renderFilterBar({
      items: [
        draftIssueFactory.build({
          memexProjectColumnValues: [
            columnValueFactory.title('item 1', ItemType.DraftIssue).build(),
            columnValueFactory.status('Todo', columns).build(),
          ],
        }),
        draftIssueFactory.build({
          memexProjectColumnValues: [
            columnValueFactory.title('item 2', ItemType.DraftIssue).build(),
            columnValueFactory.status('Done', columns).build(),
          ],
        }),
      ],
    })

    await setFilter('status:Todo,')
    await expectSuggestions(['In progress', 'Done'])
    await setFilter('status:Todo,d')
    await expectSuggestions(['Done'])
  })

  it('shows value suggestions after quotes', async () => {
    renderFilterBar({
      items: [
        draftIssueFactory.build({
          memexProjectColumnValues: [
            columnValueFactory.title('item 1', ItemType.DraftIssue).build(),
            columnValueFactory.status('Todo', columns).build(),
          ],
        }),
        draftIssueFactory.build({
          memexProjectColumnValues: [
            columnValueFactory.title('item 2', ItemType.DraftIssue).build(),
            columnValueFactory.status('Done', columns).build(),
          ],
        }),
      ],
    })

    await setFilter("status:'")
    await expectSuggestions(['Has status', 'No status', 'Exclude status', 'Todo', 'In progress', 'Done'])

    await setFilter('status:"')
    await expectSuggestions(['Has status', 'No status', 'Exclude status', 'Todo', 'In progress', 'Done'])
  })

  it('shows value suggestions when cursor is after `last-updated:` qualifier', async () => {
    renderFilterBar()
    await setFilter('last-updated:')
    await expectSuggestions(['7days', '14days', '21days'])
  })

  it('shows value suggestions when the previous value contains a colon', async () => {
    renderFilterBar()
    await setFilter('status:Done,"to:do",')
    await expectSuggestions(['Todo', 'In progress'])
  })

  it('does not show value suggestions when cursor is after a colon with nothing before it', async () => {
    renderFilterBar({
      items: [
        draftIssueFactory.build({
          memexProjectColumnValues: [
            columnValueFactory.title('item 1', ItemType.DraftIssue).build(),
            columnValueFactory.status('Todo', columns).build(),
          ],
        }),
        draftIssueFactory.build({
          memexProjectColumnValues: [
            columnValueFactory.title('item 2', ItemType.DraftIssue).build(),
            columnValueFactory.status('Done', columns).build(),
          ],
        }),
      ],
    })
    await setFilter(':')

    await expectNoSuggestions()
  })

  it('does not show exclude/null/present filters when inside a value list (OR)', async () => {
    renderFilterBar({
      items: [
        draftIssueFactory.build({
          memexProjectColumnValues: [
            columnValueFactory.title('item 1', ItemType.DraftIssue).build(),
            columnValueFactory.status('Todo', columns).build(),
          ],
        }),
        draftIssueFactory.build({
          memexProjectColumnValues: [
            columnValueFactory.title('item 2', ItemType.DraftIssue).build(),
            columnValueFactory.status('Done', columns).build(),
          ],
        }),
      ],
    })

    await setFilter('status:')
    await expectSuggestions(['Has status', 'No status', 'Exclude status', 'Todo', 'In progress', 'Done'])
    await setFilter('status:x,')
    await expectSuggestions(['Todo', 'In progress', 'Done'])
  })

  it('does not show value suggestions for a field that cannot be compared', async () => {
    renderFilterBar()
    await setFilter('status:>')
    await expectNoSuggestions()
  })

  // Even when issue_types FF is enabled,
  // issue_type filter suggestions should not be shown outside of auto-add workflow.
  describe('issue_types enabled and user has a `type` column already present', () => {
    beforeEach(() => {
      asMockHook(useEnabledFeatures).mockReturnValue({
        issue_types: true,
      })
    })

    it('only shows `type` suggestion once', async () => {
      renderFilterBar()
      await setFilter('-')
      await expectSuggestions([
        'status:',
        'repo:',
        'stage:',
        'estimate:',
        'date:',
        'type:',
        'is:',
        'no:',
        'has:',
        'reason:',
        'last updated:',
        'updated:',
      ])
    })

    it('only shows value suggestions for user-owned type column when cursor is after `type:` qualifier', async () => {
      renderFilterBar()
      await setFilter('type:')
      await expectSuggestions(['Has type', 'No type', 'Exclude type', 'Epic 🌋', 'Task ✍️', 'Bug 🐛'])
    })
  })

  describe('issue_types disabled and user has a `type` column already present', () => {
    beforeEach(() => {
      asMockHook(useEnabledFeatures).mockReturnValue({
        issue_types: false,
      })
    })

    it('only shows `type` suggestion once', async () => {
      renderFilterBar()
      await setFilter('-')
      await expectSuggestions([
        'status:',
        'repo:',
        'stage:',
        'estimate:',
        'date:',
        'type:',
        'is:',
        'no:',
        'has:',
        'reason:',
        'last updated:',
        'updated:',
      ])
    })

    it('only shows value suggestions for user-owned type column when cursor is after `type:` qualifier', async () => {
      renderFilterBar()
      await setFilter('type:')
      await expectSuggestions(['Has type', 'No type', 'Exclude type', 'Epic 🌋', 'Task ✍️', 'Bug 🐛'])
    })
  })

  describe('comparisons', () => {
    describe('numeric field', () => {
      const items = [
        draftIssueFactory.build({
          memexProjectColumnValues: [
            columnValueFactory.title('item 1', ItemType.DraftIssue).build(),
            columnValueFactory.number(3, 'Estimate', columns).build(),
          ],
        }),
        draftIssueFactory.build({
          memexProjectColumnValues: [
            columnValueFactory.title('item 1', ItemType.DraftIssue).build(),
            columnValueFactory.number(5, 'Estimate', columns).build(),
          ],
        }),
        draftIssueFactory.build({
          memexProjectColumnValues: [
            columnValueFactory.title('item 1', ItemType.DraftIssue).build(),
            columnValueFactory.number(1, 'Estimate', columns).build(),
          ],
        }),
        draftIssueFactory.build({
          memexProjectColumnValues: [
            columnValueFactory.title('item 1', ItemType.DraftIssue).build(),
            columnValueFactory.number(10, 'Estimate', columns).build(),
          ],
        }),
      ]
      it('shows value suggestions for a numeric field after a colon', async () => {
        renderFilterBar({items})
        await setFilter('estimate:')
        await expectSuggestions(['Has estimate', 'No estimate', 'Exclude estimate', '1', '3', '5', '10'])
      })

      it('shows numeric value suggestions after a greater than (>) operator', async () => {
        renderFilterBar({items})
        await setFilter('estimate:>')
        await expectSuggestions(['1', '3', '5', '10'])
      })
      it('shows numeric value suggestions after a greater than or equal (>=) operator', async () => {
        renderFilterBar({items})
        await setFilter('estimate:>=')
        await expectSuggestions(['1', '3', '5', '10'])
      })
      it('shows numeric value suggestions after a less than (<) operator', async () => {
        renderFilterBar({items})
        await setFilter('estimate:<')
        await expectSuggestions(['1', '3', '5', '10'])
      })
      it('shows numeric value suggestions after a less than or equal (<=) operator', async () => {
        renderFilterBar({items})
        await setFilter('estimate:<=')
        await expectSuggestions(['1', '3', '5', '10'])
      })
      describe('range operator', () => {
        it('shows numeric value suggestions after a range (..) operator', async () => {
          renderFilterBar({items})
          await setFilter('estimate:..')
          await expectSuggestions(['1', '3', '5', '10'])
        })
        it('shows all numeric value suggestions after a range (..) operator starting with *', async () => {
          renderFilterBar({items})
          await setFilter('estimate:*..')
          await expectSuggestions(['1', '3', '5', '10'])
        })

        it('shows numeric value suggestions after a range (..) operator greater than a specified number', async () => {
          renderFilterBar({items})
          await setFilter('estimate:1..')
          await expectSuggestions(['3', '5', '10'])
        })
      })
    })

    describe('date field', () => {
      const items = [
        draftIssueFactory.build({
          memexProjectColumnValues: [
            columnValueFactory.title('item 1', ItemType.DraftIssue).build(),
            columnValueFactory.date('2022-01-03', 'Date', columns).build(),
          ],
        }),
        draftIssueFactory.build({
          memexProjectColumnValues: [
            columnValueFactory.title('item 1', ItemType.DraftIssue).build(),
            columnValueFactory.date('2022-01-01', 'Date', columns).build(),
          ],
        }),
        draftIssueFactory.build({
          memexProjectColumnValues: [
            columnValueFactory.title('item 1', ItemType.DraftIssue).build(),
            columnValueFactory.date('2022-06-04', 'Date', columns).build(),
          ],
        }),
        draftIssueFactory.build({
          memexProjectColumnValues: [
            columnValueFactory.title('item 1', ItemType.DraftIssue).build(),
            columnValueFactory.date('2022-07-08', 'Date', columns).build(),
          ],
        }),
      ]
      it('shows value suggestions for a date field after a colon', async () => {
        renderFilterBar({items})
        await setFilter('date:')
        await expectSuggestions([
          '@today',
          'Has date',
          'No date',
          'Exclude date',
          'Jan 1, 2022',
          'Jan 3, 2022',
          'Jun 4, 2022',
          'Jul 8, 2022',
        ])
      })

      it('shows date value suggestions after a greater than (>) operator', async () => {
        renderFilterBar({items})
        await setFilter('date:>')
        await expectSuggestions(['@today', 'Jan 1, 2022', 'Jan 3, 2022', 'Jun 4, 2022', 'Jul 8, 2022'])
      })
      it('shows date value suggestions after a greater than or equal (>=) operator', async () => {
        renderFilterBar({items})
        await setFilter('date:>=')
        await expectSuggestions(['@today', 'Jan 1, 2022', 'Jan 3, 2022', 'Jun 4, 2022', 'Jul 8, 2022'])
      })
      it('shows date value suggestions after a less than (<) operator', async () => {
        renderFilterBar({items})
        await setFilter('date:<')
        await expectSuggestions(['@today', 'Jan 1, 2022', 'Jan 3, 2022', 'Jun 4, 2022', 'Jul 8, 2022'])
      })
      it('shows date value suggestions after a less than or equal (<=) operator', async () => {
        renderFilterBar({items})
        await setFilter('date:<=')
        await expectSuggestions(['@today', 'Jan 1, 2022', 'Jan 3, 2022', 'Jun 4, 2022', 'Jul 8, 2022'])
      })
      describe('ranger operator', () => {
        it('shows date value suggestions after a range (..) operator', async () => {
          renderFilterBar({items})
          await setFilter('date:..')
          await expectSuggestions(['@today', 'Jan 1, 2022', 'Jan 3, 2022', 'Jun 4, 2022', 'Jul 8, 2022'])
        })

        it('shows all date value suggestions after a range (..) operator starting with *', async () => {
          renderFilterBar({items})
          await setFilter('date:*..')
          await expectSuggestions(['@today', 'Jan 1, 2022', 'Jan 3, 2022', 'Jun 4, 2022', 'Jul 8, 2022'])
        })

        it('shows date value suggestions after a range (..) operator starting after a specified date', async () => {
          renderFilterBar({items})
          await setFilter('date:"2022-06-01"..')
          await expectSuggestions(['@today', 'Jan 1, 2022', 'Jan 3, 2022', 'Jun 4, 2022', 'Jul 8, 2022'])
        })
      })
    })
  })
})

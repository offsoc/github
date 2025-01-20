import {expect} from '@playwright/test'
import {isMatch, parseISO} from 'date-fns'

import {Resources} from '../../../../client/strings'
import {test} from '../../../fixtures/test-extended'
import {_} from '../../../helpers/dom/selectors'
import {
  expectGroupHasRows,
  groupMustNotExist,
  isGroupedBy,
  isNotGroupedBy,
  isSortedBy,
} from '../../../helpers/table/assertions'
import {
  dragGroupedRow,
  getSelectMenu,
  selectOption,
  setCellToFocusMode,
  sortByColumnName,
  toggleGroupBy,
} from '../../../helpers/table/interactions'
import {
  cellEditorTestId,
  cellTestId,
  getCellMode,
  getGroupSubtitleDatesInTable,
  getGroupSubtitlesInTable,
  getTableColumnId,
  getTableRowWithinGroup,
} from '../../../helpers/table/selectors'
import {CellMode} from '../../../types/table'

const IterationColumnId = '20'
const IterationField = 'Iteration'

test.describe('Group By Iteration', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('appWithIterationsField', {
      viewType: 'table',
    })
  })

  test('it groups items assigned to completed iterations correctly', async ({page}) => {
    const columnId = await getTableColumnId(page, 'Iteration')
    const CELL_SELECTOR = _(cellTestId(3, 'Iteration'))
    // No Stage grouping to begin with
    await isNotGroupedBy(page, IterationField, IterationColumnId)

    // Set the cell to focus mode
    await setCellToFocusMode(page, CELL_SELECTOR)
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.FOCUSED)

    // Type in the filter bar of the select menu to find the completed iteration
    await page.keyboard.type('Iteration 1')
    expect(await getCellMode(page, CELL_SELECTOR)).toBe(CellMode.EDITING)

    // Assign the completed iteration to that item
    const menu = await getSelectMenu(page, _(cellEditorTestId(3, columnId.toString())))
    await selectOption(menu, 'Iteration 1')

    // Turn on Iteration grouping.
    await toggleGroupBy(page, IterationField)

    await isGroupedBy(page, IterationField, `${IterationField} 1`) // ensure the completed group appears
  })

  test('it allows group by for iteration field', async ({page}) => {
    // No Stage grouping to begin with
    await isNotGroupedBy(page, IterationField, IterationColumnId)

    // Turn on Iteration grouping.
    await toggleGroupBy(page, IterationField)

    await isGroupedBy(page, IterationField, `${IterationField} 4`)

    // Turn off Iteration grouping.
    await toggleGroupBy(page, IterationField)

    await isNotGroupedBy(page, IterationField, IterationColumnId)
  })

  test("it displays the correct date format in a group's header", async ({page}) => {
    const expectedFormat = 'MMM dd'
    const expectedFormatWithYear = 'MMM dd, yyyy'

    await toggleGroupBy(page, IterationField)

    const groupDurationList = (await getGroupSubtitlesInTable(page)).reduce(
      (groupDurationAcc, dateStr) => (!dateStr ? groupDurationAcc : [...groupDurationAcc, dateStr.split(' - ')]),
      new Array<string>(),
    )

    for (const [start, end] of groupDurationList) {
      expect(isMatch(start, expectedFormat) || isMatch(start, expectedFormatWithYear)).toBeTruthy()
      expect(isMatch(end, expectedFormat) || isMatch(end, expectedFormatWithYear)).toBeTruthy()
    }
  })

  test('it should render groups in asc order by default based on the iteration start date', async ({page}) => {
    await toggleGroupBy(page, IterationField)

    // Retrieve start dates
    const startDateList = (await getGroupSubtitleDatesInTable(page)).reduce(
      (startDateAcc, dateStr) => (!dateStr ? startDateAcc : [...startDateAcc, dateStr.startDate]),
      new Array<string>(),
    )

    // validate list is in ascending order by default
    // we compare pairs, therefore, skip the last iteration by subtracting 1 to the size
    // of the collection, to prevent an out of bounds comparison
    for (let i = 0; i < startDateList.length - 1; ++i) {
      const startDateA = parseISO(new Date(startDateList[i]).toISOString())
      const startDateB = parseISO(new Date(startDateList[i + 1]).toISOString())

      expect(startDateA.getTime()).toBeLessThan(startDateB.getTime())
    }
  })

  test('user can sort groups in desc order based on start date', async ({page}) => {
    await toggleGroupBy(page, IterationField)

    // groups are initially sorted in ascending order
    const expectedDescOrder = (await getGroupSubtitlesInTable(page)).reverse()

    await sortByColumnName(page, IterationField, Resources.tableHeaderContextMenu.sortDescending)
    await isSortedBy(page, '20')

    const target = page.getByTestId('group-name-subtitle')
    const values = await target.allTextContents()

    expect(values).toEqual(expectedDescOrder)
  })

  test('user can sort groups in asc order based on start date', async ({page}) => {
    await toggleGroupBy(page, IterationField)

    // groups are initially sorted by start date in ascending order
    const expectedAscOrder = await getGroupSubtitlesInTable(page)

    // 1st sort in descending order
    await sortByColumnName(page, IterationField, Resources.tableHeaderContextMenu.sortDescending)
    // sort by ascending order
    await sortByColumnName(page, IterationField)
    await isSortedBy(page, '20')

    const target = page.getByTestId('group-name-subtitle')
    const values = await target.allTextContents()

    expect(values).toEqual(expectedAscOrder)
  })
})

test.describe('Group By Iteration', () => {
  test('it hides empty groups for which there are no items', async ({page, memex, browserName}) => {
    // this test fails on firefox - ubuntu, which is the same for `table-group-by-drag-and-drop-spec`
    // this can also be validated by page.screenshot where DnD works in other browsers except firefox
    // for reference we tried suggestions from: https://github.com/microsoft/playwright/issues/1094,
    test.fixme(browserName === 'firefox', 'cannot Group by drag and drop with Playwright in firefox')

    await memex.navigateToStory('appWithIterationsField', {
      viewType: 'table',
    })

    const targetGroup = `${IterationField} 5`

    await toggleGroupBy(page, IterationField)

    // The Iteration should have at least 1 row
    await expectGroupHasRows(page, targetGroup, 1)

    const firstRow = await getTableRowWithinGroup(page, targetGroup, 0)

    const differentGroup = `Iteration 4`

    // Drag the row to another group
    const targetRow = await getTableRowWithinGroup(page, differentGroup, 0)
    await dragGroupedRow(page, firstRow, targetRow)

    await groupMustNotExist(page, targetGroup)
  })
})

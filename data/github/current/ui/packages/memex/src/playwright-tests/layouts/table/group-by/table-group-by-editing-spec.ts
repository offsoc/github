import {expect} from '@playwright/test'

import {test} from '../../../fixtures/test-extended'
import {todayString} from '../../../helpers/dates'
import {mustFind, waitForSelectorCount} from '../../../helpers/dom/assertions'
import {_} from '../../../helpers/dom/selectors'
import {expectGroupHasRows, groupMustNotExist, isGroupedBy} from '../../../helpers/table/assertions'
import {
  getSelectMenu,
  selectOption,
  setCellToEditMode,
  setCellToFocusMode,
  toggleGroupBy,
} from '../../../helpers/table/interactions'
import {
  cellEditorTestId,
  cellTestId,
  getGroupNamesInTable,
  getTableIndexForRowInGroup,
} from '../../../helpers/table/selectors'
import {testPlatformMeta} from '../../../helpers/utils'

const EXTENDED_TIMEOUT = 10_000

test.describe('editing table when grouped', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'table',
    })
  })

  test('changing the value of an item in the grouped by field does not ungroup the table', async ({page}) => {
    await toggleGroupBy(page, 'Status')
    await isGroupedBy(page, 'Status', 'Done')

    // Change the value of a grouped field.
    const firstRowIndex = await getTableIndexForRowInGroup(page, 'Done', 0)
    await setCellToEditMode(page, _(cellTestId(firstRowIndex, 'Status')))
    const menu = await getSelectMenu(page, _(cellEditorTestId(firstRowIndex, 'Status')))
    await selectOption(menu, 'Ready')

    // Make sure the table is still grouped.
    await isGroupedBy(page, 'Status', 'Done')
  })

  test('updating a grouped single-select cell moves the row to the right existing group', async ({page}) => {
    await toggleGroupBy(page, 'Status')

    await expectGroupHasRows(page, 'Backlog', 2)
    await groupMustNotExist(page, 'In Progress')

    // Select a cell whose value is "Backlog"
    const firstRowIndex = await getTableIndexForRowInGroup(page, 'Backlog', 0)
    const cellSelector = _(cellTestId(firstRowIndex, 'Status'))
    expect(await page.textContent(cellSelector)).toEqual('Backlog')

    // Update that cell to have a value of "In Progress"
    await setCellToEditMode(page, cellSelector)
    const menu = await getSelectMenu(page, _(cellEditorTestId(firstRowIndex, 'Status')))
    await selectOption(menu, 'In Progress')

    // Make sure the grouped row counts have changed appropriately
    await expectGroupHasRows(page, 'Backlog', 1)
    await expectGroupHasRows(page, 'In Progress', 1)
  })

  test('clearing a grouped single-select cell moves the row to the default group', async ({page}) => {
    await toggleGroupBy(page, 'Status')

    await expectGroupHasRows(page, 'Backlog', 2)
    await expectGroupHasRows(page, 'No Status', 3)

    // Select a cell whose value is "Backlog"
    const firstRowIndex = await getTableIndexForRowInGroup(page, 'Backlog', 0)
    const cellSelector = _(cellTestId(firstRowIndex, 'Status'))
    expect(await page.textContent(cellSelector)).toEqual('Backlog')

    // Update that cell to have a value of "In Progress"
    await setCellToFocusMode(page, cellSelector)
    await page.keyboard.press('Backspace')

    // Make sure the grouped row counts have changed appropriately
    await expectGroupHasRows(page, 'Backlog', 1)
    await expectGroupHasRows(page, 'No Status', 4)
  })

  test('editing a grouped text cell can move the row between existing groups', async ({page}) => {
    await toggleGroupBy(page, 'Team')

    const groupId = 'Novelty Aardvarks'

    await expectGroupHasRows(page, 'Design Systems', 1)
    await expectGroupHasRows(page, groupId, 2)

    // Select a cell whose value is "Novelty Aardvarks"
    const firstRowIndex = await getTableIndexForRowInGroup(page, groupId, 0)
    const cellSelector = _(cellTestId(firstRowIndex, 'Team'))
    expect(await page.textContent(cellSelector)).toEqual('Novelty Aardvarks')

    // Update that cell to have a value of "Design Systems"
    await setCellToEditMode(page, cellSelector)
    await page.keyboard.press(`${testPlatformMeta}+a`)
    await page.keyboard.press('Backspace')
    await page.keyboard.insertText('Design Systems')
    await page.keyboard.press('Enter')

    // Make sure the grouped row counts have changed appropriately
    await expectGroupHasRows(page, 'Design Systems', 2)
    await expectGroupHasRows(page, 'Novelty Aardvarks', 1)
  })

  test('editing a grouped text cell removes an existing group if necessary', async ({page}) => {
    await toggleGroupBy(page, 'Team')

    const groupId = 'Design Systems'

    // To begin with, we have three groups, and "Design Systems" has only one row in it.
    expect(await getGroupNamesInTable(page)).toStrictEqual(['Design Systems', 'Novelty Aardvarks', 'No Team'])
    await expectGroupHasRows(page, groupId, 1)

    // Select a cell whose value is "Design Systems"
    const firstRowIndex = await getTableIndexForRowInGroup(page, groupId, 0)
    const cellSelector = _(cellTestId(firstRowIndex, 'Team'))
    await expect(page.locator(cellSelector)).toHaveText('Design Systems')

    // Clear that cell.
    await setCellToFocusMode(page, cellSelector)
    await page.keyboard.press('Backspace')

    await waitForSelectorCount(page, _('group-name'), 2)

    // Now the "Design Systems" group should be gone.
    expect(await getGroupNamesInTable(page)).toStrictEqual(['Novelty Aardvarks', 'No Team'])
  })

  test('editing a grouped text cell creates a new group if necessary', async ({page}) => {
    await toggleGroupBy(page, 'Team')

    await expectGroupHasRows(page, 'Novelty Aardvarks', 2)
    await groupMustNotExist(page, 'Cybercats')

    const groupId = 'Novelty Aardvarks'

    // Select a cell whose value is "Novelty Aardvarks"
    const firstRowIndex = await getTableIndexForRowInGroup(page, groupId, 0)
    const cellSelector = _(cellTestId(firstRowIndex, 'Team'))
    await expect(page.locator(cellSelector)).toHaveText('Novelty Aardvarks')

    // Update that cell to have a value of "Cybercats"
    await setCellToEditMode(page, cellSelector)
    await page.keyboard.press(`${testPlatformMeta}+a`)
    await page.keyboard.press('Backspace')
    await page.keyboard.insertText('Cybercats')
    await page.keyboard.press('Enter')

    // Make sure the grouped row counts have changed appropriately
    await expectGroupHasRows(page, 'Novelty Aardvarks', 1)
    await expectGroupHasRows(page, 'Cybercats', 1)

    // Make sure the new group was added in alphabetical order
    expect(await getGroupNamesInTable(page)).toStrictEqual([
      'Cybercats',
      'Design Systems',
      'Novelty Aardvarks',
      'No Team',
    ])
  })

  test('editing a grouped text cell can move from the default group to a group with a value', async ({page}) => {
    await toggleGroupBy(page, 'Team')

    await expectGroupHasRows(page, 'Design Systems', 1)
    await expectGroupHasRows(page, 'No Team', 5)

    // Select a cell that doesn't have a value.
    const firstRowIndex = await getTableIndexForRowInGroup(page, 'No Team', 0)
    const cellSelector = _(cellTestId(firstRowIndex, 'Team'))
    await expect(page.locator(cellSelector)).toHaveText('')

    // Update that cell to have a value of "Design Systems"
    await setCellToEditMode(page, cellSelector)
    await page.keyboard.press(`${testPlatformMeta}+a`)
    await page.keyboard.press('Backspace')
    await page.keyboard.insertText('Design Systems')
    await page.keyboard.press('Enter')

    // Make sure the grouped row counts have changed appropriately
    await expectGroupHasRows(page, 'Design Systems', 2)
    await expectGroupHasRows(page, 'No Team', 4)
  })

  test('clearing a grouped text cell moves the row to the default group', async ({page}) => {
    await toggleGroupBy(page, 'Team')

    await expectGroupHasRows(page, 'Novelty Aardvarks', 2)
    await expectGroupHasRows(page, 'No Team', 5)

    const groupId = `Novelty Aardvarks`

    // Select a cell whose value is "Novelty Aardvarks"
    const rowIndex = await getTableIndexForRowInGroup(page, groupId, 1)
    const cellSelector = _(cellTestId(rowIndex, 'Team'))
    await expect(page.locator(cellSelector)).toHaveText('Novelty Aardvarks')

    // Clear the cell.
    await setCellToFocusMode(page, cellSelector)
    await page.keyboard.press('Backspace')

    // Make sure the grouped row counts have changed appropriately
    await expectGroupHasRows(page, 'Novelty Aardvarks', 1)
    await expectGroupHasRows(page, 'No Team', 6)
  })

  test('editing a grouped number cell can move the row existing groups', async ({page}) => {
    await toggleGroupBy(page, 'Estimate')

    await expectGroupHasRows(page, '3', 1)
    await expectGroupHasRows(page, '10', 2)

    const groupId = '10'

    // Select a cell whose value is 10
    const firstRowIndex = await getTableIndexForRowInGroup(page, groupId, 0)
    const cellSelector = _(cellTestId(firstRowIndex, 'Estimate'))
    await expect(page.locator(cellSelector)).toHaveText('10')

    // Update that cell to have a value of 3
    await setCellToEditMode(page, cellSelector)
    await page.keyboard.press(`${testPlatformMeta}+a`)
    await page.keyboard.press('Backspace')
    await page.keyboard.insertText('3')
    await page.keyboard.press('Enter')

    // Make sure the grouped row counts have changed appropriately
    await expectGroupHasRows(page, '3', 2)
    await expectGroupHasRows(page, '10', 1)
  })

  test('editing a grouped number cell creates a new group if necessary', async ({page}) => {
    await toggleGroupBy(page, 'Estimate')

    await expectGroupHasRows(page, '10', 2)
    await groupMustNotExist(page, '2')

    // Select a cell whose value is 10
    const rowIndex = await getTableIndexForRowInGroup(page, '10', 1)
    const cellSelector = _(cellTestId(rowIndex, 'Estimate'))
    await expect(page.locator(cellSelector)).toHaveText('10')

    // Update that cell to have a value of 20
    await setCellToEditMode(page, cellSelector)
    await page.keyboard.press(`${testPlatformMeta}+a`)
    await page.keyboard.press('Backspace')
    await page.keyboard.insertText('2')
    await page.keyboard.press('Enter')

    // Make sure the grouped row counts have changed appropriately
    await expectGroupHasRows(page, '10', 1)
    await expectGroupHasRows(page, '2', 1)

    // Make sure the new group was added in numerical order
    expect(await getGroupNamesInTable(page)).toStrictEqual(['1', '2', '3', '10', 'No Estimate'])
  })

  test('editing a grouped number cell removes an existing group if necessary', async ({page}) => {
    await toggleGroupBy(page, 'Estimate')

    // To begin with, we have three groups, and "3" has only one row in it.
    expect(await getGroupNamesInTable(page)).toStrictEqual(['1', '3', '10', 'No Estimate'])
    await expectGroupHasRows(page, '3', 1)

    // Select a cell whose value is 3
    const rowIndex = await getTableIndexForRowInGroup(page, '3', 0)
    const cellSelector = _(cellTestId(rowIndex, 'Estimate'))
    await expect(page.locator(cellSelector)).toHaveText('3')

    // Clear that cell.
    await setCellToFocusMode(page, cellSelector)
    await page.keyboard.press('Backspace')

    await waitForSelectorCount(page, _('group-name'), 3)

    // Now the "3" group should be gone.
    expect(await getGroupNamesInTable(page)).toStrictEqual(['1', '10', 'No Estimate'])
  })

  test('editing a grouped number cell can move from the default group to a group with a value', async ({page}) => {
    await toggleGroupBy(page, 'Estimate')

    await expectGroupHasRows(page, '3', 1)
    await expectGroupHasRows(page, 'No Estimate', 4)

    // Select a cell that doesn't have a value.
    const firstRowIndex = await getTableIndexForRowInGroup(page, 'No Estimate', 0)
    const cellSelector = _(cellTestId(firstRowIndex, 'Estimate'))
    await expect(page.locator(cellSelector)).toHaveText('')

    // Update that cell to have a value of 3
    await setCellToEditMode(page, cellSelector)
    await page.keyboard.press(`${testPlatformMeta}+a`)
    await page.keyboard.press('Backspace')
    await page.keyboard.insertText('3')
    await page.keyboard.press('Enter')

    // Make sure the grouped row counts have changed appropriately
    await expectGroupHasRows(page, '3', 2)
    await expectGroupHasRows(page, 'No Estimate', 3)
  })

  test('clearing a grouped number cell moves the row to the default group', async ({page}) => {
    await toggleGroupBy(page, 'Estimate')

    await expectGroupHasRows(page, '10', 2)
    await expectGroupHasRows(page, 'No Estimate', 4)

    // Select a cell whose value is 10
    const firstRowIndex = await getTableIndexForRowInGroup(page, '10', 0)
    const cellSelector = _(cellTestId(firstRowIndex, 'Estimate'))
    await expect(page.locator(cellSelector)).toHaveText('10')

    // Clear the cell.
    await setCellToFocusMode(page, cellSelector)
    await page.keyboard.press('Backspace')

    // Make sure the grouped row counts have changed appropriately
    await expectGroupHasRows(page, '10', 1)
    await expectGroupHasRows(page, 'No Estimate', 5)
  })

  test('clearing a grouped date cell moves the row to the default group', async ({page}) => {
    await toggleGroupBy(page, 'Due Date')

    await expectGroupHasRows(page, todayString, 2)
    await expectGroupHasRows(page, 'No Due Date', 5)

    // Select a cell whose value is today
    const firstRowIndex = await getTableIndexForRowInGroup(page, todayString, 0)
    const cellSelector = _(cellTestId(firstRowIndex, 'Due Date'))
    expect(await page.textContent(cellSelector)).toEqual(todayString)

    // Clear the cell.
    await setCellToFocusMode(page, cellSelector)
    await page.keyboard.press('Backspace')

    // Make sure the grouped row counts have changed appropriately
    await expectGroupHasRows(page, todayString, 1)
    await expectGroupHasRows(page, 'No Due Date', 6)
  })
})

test.describe('adding items while grouped by', () => {
  test('loads repository suggestions in grouped by omnibars', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'table',
      groupedBy: {columnId: 'Status'},
    })

    const inProgressSection = await mustFind(page, _('table-group-footer-Backlog'))
    const inProgressOmnibar = await mustFind(inProgressSection, _('repo-searcher-input'))
    await inProgressOmnibar.focus()

    await page.keyboard.type('#')

    await waitForSelectorCount(page, _('repo-searcher-item'), 8, EXTENDED_TIMEOUT)
  })
})

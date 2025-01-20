/**
 * This subset of GroupBy integration tests deals with Adding items
 *
 * It currently fails on some browsers in CI, so we've extracted to a separate file
 * to skip until we have time to fix them
 *
 */
import {expect} from '@playwright/test'

import {test} from '../../../fixtures/test-extended'
import {todayString} from '../../../helpers/dates'
import {groupContainsRows, mustFind, mustNotFind, waitForSelectorCount} from '../../../helpers/dom/assertions'
import {hasDOMFocus} from '../../../helpers/dom/interactions'
import {_} from '../../../helpers/dom/selectors'
import {groupMustNotExist, isGroupedBy, isNotGroupedBy} from '../../../helpers/table/assertions'
import {
  addDraftItem,
  focusOnFooterForGroup,
  getSelectMenu,
  setCellToEditMode,
  toggleGroupBy,
} from '../../../helpers/table/interactions'
import {
  cellEditorTestId,
  cellTestId,
  getCellMode,
  getFooterInputForGroup,
  getTableIndexForRowInGroup,
} from '../../../helpers/table/selectors'
import {CellMode} from '../../../types/table'

test.describe('Add new item to group', () => {
  test('creating a new option inline on a grouped single-select cell moves the row to the newly create group', async ({
    page,
    memex,
  }) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'table',
    })
    await toggleGroupBy(page, 'Status')

    await groupContainsRows(page, 'Backlog', 2)
    await groupMustNotExist(page, 'Icebox')

    // Select a cell whose value is "Backlog"
    const backlogRowIndex = await getTableIndexForRowInGroup(page, 'Backlog', 0)
    const cellSelector = _(cellTestId(backlogRowIndex, 'Status'))
    await expect(page.locator(cellSelector)).toHaveText('Backlog')

    // Give the cell a newly created "Icebox" value inline
    await setCellToEditMode(page, cellSelector)
    await getSelectMenu(page, _(cellEditorTestId(backlogRowIndex, 'Status')))
    await page.keyboard.insertText('Icebox')
    await waitForSelectorCount(page, _('add-column-option'), 1)
    const createButton = await mustFind(page, _('add-column-option'))
    await createButton.click()
    await memex.editOptionDialog.SAVE_BUTTON.click()
    await mustNotFind(page, _('add-column-option'))

    // Make sure the grouped row counts have changed appropriately
    await groupContainsRows(page, 'Backlog', 1)
    await groupContainsRows(page, 'Icebox', 1)
  })

  test.describe('grouped by Status field', () => {
    const FieldName = 'Status'

    test.beforeEach(async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'table',
      })

      await isNotGroupedBy(page, FieldName, 'No Status')
      await toggleGroupBy(page, FieldName)
      await isGroupedBy(page, FieldName, 'No Status')
    })

    test('can add draft item to group', async ({page, memex}) => {
      const initialRowCount = 2
      await groupContainsRows(page, 'Backlog', initialRowCount)

      await focusOnFooterForGroup(page, memex, 'Backlog')
      await addDraftItem(page, 'hello world')

      await groupContainsRows(page, 'Backlog', initialRowCount + 1)

      // expect the new item to have the matching status cell value
      const newRowIndex = await getTableIndexForRowInGroup(page, 'Backlog', initialRowCount)
      const cellSelector = _(cellTestId(newRowIndex, FieldName))
      await expect(page.locator(cellSelector)).toHaveText('Backlog')
    })

    test('pressing Tab adds the item to the table and focuses second column', async ({page, memex}) => {
      const initialRowCount = 2
      await groupContainsRows(page, 'Backlog', initialRowCount)

      await focusOnFooterForGroup(page, memex, 'Backlog')
      await addDraftItem(page, 'hello world', 'Tab')

      await groupContainsRows(page, 'Backlog', initialRowCount + 1)

      // expect the new item to have the matching status cell value
      const newRowIndex = await getTableIndexForRowInGroup(page, 'Backlog', initialRowCount)
      const cellSelector = _(cellTestId(newRowIndex, FieldName))
      await expect(page.locator(cellSelector)).toHaveText('Backlog')

      expect(await getCellMode(page, _(cellTestId(newRowIndex, 'Assignees')))).toBe(CellMode.FOCUSED)
    })

    test('can add draft item to default group', async ({page, memex}) => {
      const initialRowCount = 3
      await groupContainsRows(page, 'No Status', initialRowCount)

      await focusOnFooterForGroup(page, memex, 'No Status')
      await addDraftItem(page, 'hello world')

      await groupContainsRows(page, 'No Status', initialRowCount + 1)

      // assert the new item does not have a value set
      const newRowIndex = await getTableIndexForRowInGroup(page, 'No Status', initialRowCount)
      const cellSelector = _(cellTestId(newRowIndex, FieldName))
      await expect(page.locator(cellSelector)).toHaveText('')
    })
  })

  test.describe('grouped by number field', () => {
    const FieldName = 'Estimate'

    test.beforeEach(async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'table',
      })

      await toggleGroupBy(page, FieldName)

      // Make sure grouping indicators appear.
      await isGroupedBy(page, FieldName, 'No Estimate')
    })

    test('can add draft item to group', async ({page, memex}) => {
      const initialRowCount = 1
      const groupName = '1'

      await groupContainsRows(page, groupName, initialRowCount)

      await focusOnFooterForGroup(page, memex, groupName)
      await addDraftItem(page, 'another item')

      await groupContainsRows(page, groupName, initialRowCount + 1)

      // assert the new item has a value set
      const newRowIndex = await getTableIndexForRowInGroup(page, groupName, initialRowCount)
      const cellSelector = _(cellTestId(newRowIndex, FieldName))
      await expect(page.locator(cellSelector)).toHaveText('1')
    })

    test('can add draft item to default group', async ({page, memex}) => {
      const initialRowCount = 4
      const groupName = 'No Estimate'

      await groupContainsRows(page, groupName, initialRowCount)

      await focusOnFooterForGroup(page, memex, groupName)
      await addDraftItem(page, 'another item')

      await groupContainsRows(page, groupName, initialRowCount + 1)

      // assert the new item does not have a value set
      const newRowIndex = await getTableIndexForRowInGroup(page, groupName, initialRowCount)
      const cellSelector = _(cellTestId(newRowIndex, FieldName))
      await expect(page.locator(cellSelector)).toHaveText('')
    })
  })

  test.describe('grouped by text field', () => {
    const FieldName = 'Team'

    test.beforeEach(async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'table',
      })

      await toggleGroupBy(page, FieldName)
      await isGroupedBy(page, FieldName, 'No Team')
    })

    test('can add draft item to group', async ({page, memex}) => {
      const initialRowCount = 2
      const groupName = 'Novelty Aardvarks'

      await groupContainsRows(page, groupName, initialRowCount)

      await focusOnFooterForGroup(page, memex, groupName)
      await addDraftItem(page, 'New Person')

      await groupContainsRows(page, groupName, initialRowCount + 1)

      // assert the new item has a value set
      const newRowIndex = await getTableIndexForRowInGroup(page, groupName, initialRowCount)
      const cellSelector = _(cellTestId(newRowIndex, FieldName))
      await expect(page.locator(cellSelector)).toHaveText('Novelty Aardvarks')
    })

    test('can add draft item to default group', async ({page, memex}) => {
      const initialRowCount = 5
      const groupName = 'No Team'

      await groupContainsRows(page, groupName, initialRowCount)

      await focusOnFooterForGroup(page, memex, groupName)
      await addDraftItem(page, 'Someone else')

      await groupContainsRows(page, groupName, initialRowCount + 1)

      const newRowIndex = await getTableIndexForRowInGroup(page, groupName, initialRowCount)
      const cellSelector = _(cellTestId(newRowIndex, FieldName))
      await expect(page.locator(cellSelector)).toHaveText('')
    })
  })

  test.describe('grouped by date field', () => {
    const FieldName = 'Due Date'

    test.beforeEach(async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'table',
      })

      await toggleGroupBy(page, FieldName)

      // Make sure grouping indicators appear.
      await isGroupedBy(page, FieldName, 'No Due Date')
    })

    test('can add draft item to group', async ({page, memex}) => {
      const initialRowCount = 2
      const groupName = todayString

      await groupContainsRows(page, groupName, initialRowCount)

      await focusOnFooterForGroup(page, memex, groupName)
      await addDraftItem(page, 'New Issue')

      await groupContainsRows(page, groupName, initialRowCount + 1)

      const newRowIndex = await getTableIndexForRowInGroup(page, groupName, initialRowCount)
      const cellSelector = _(cellTestId(newRowIndex, FieldName))
      await expect(page.locator(cellSelector)).toHaveText(todayString)
    })

    test('can add draft item to default group', async ({page, memex}) => {
      const initialRowCount = 5
      const groupName = 'No Due Date'

      await groupContainsRows(page, groupName, initialRowCount)

      await focusOnFooterForGroup(page, memex, groupName)
      await addDraftItem(page, 'To Do')

      await groupContainsRows(page, groupName, initialRowCount + 1)

      const newRowIndex = await getTableIndexForRowInGroup(page, groupName, initialRowCount)
      const cellSelector = _(cellTestId(newRowIndex, FieldName))
      await expect(page.locator(cellSelector)).toHaveText('')
    })
  })

  test.describe('grouped by custom single select field', () => {
    const FieldName = 'Aardvarks'

    test.beforeEach(async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithCustomItems', {
        viewType: 'table',
      })

      await toggleGroupBy(page, FieldName)

      // Make sure grouping indicators appear.
      await isGroupedBy(page, FieldName, 'No Aardvarks')
    })

    test('can add draft item to group', async ({page, memex}) => {
      const initialRowCount = 1
      const groupName = 'Aric'

      await groupContainsRows(page, groupName, initialRowCount)

      await focusOnFooterForGroup(page, memex, groupName)
      await addDraftItem(page, 'New Issue')

      await groupContainsRows(page, groupName, initialRowCount + 1)

      const newRowIndex = await getTableIndexForRowInGroup(page, groupName, initialRowCount)
      const cellSelector = _(cellTestId(newRowIndex, FieldName))
      await expect(page.locator(cellSelector)).toHaveText('Aric')
    })

    test('can add draft item to default group', async ({page, memex}) => {
      const initialRowCount = 1
      const groupName = 'No Aardvarks'

      await groupContainsRows(page, groupName, initialRowCount)

      await focusOnFooterForGroup(page, memex, groupName)
      await addDraftItem(page, 'To Do')

      await groupContainsRows(page, groupName, initialRowCount + 1)

      const newRowIndex = await getTableIndexForRowInGroup(page, groupName, initialRowCount)
      const cellSelector = _(cellTestId(newRowIndex, FieldName))
      await expect(page.locator(cellSelector)).toHaveText('')
    })
  })

  test.describe('keyboard navigation', () => {
    const FieldName = 'Status'

    test.beforeEach(async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'table',
      })

      await isNotGroupedBy(page, FieldName, 'No Status')
      await toggleGroupBy(page, FieldName)
      await isGroupedBy(page, FieldName, 'No Status')
    })

    test('can navigate from the last group footer completely out of the table', async ({page, memex}) => {
      await focusOnFooterForGroup(page, memex, 'No Status')

      //verify document.activeElement is a child of the table-root element
      await memex.tableView.expectContainsFocus(true)

      await page.keyboard.press('Tab')

      const noStatusFooter = await getFooterInputForGroup(page, 'No Status')
      expect(await hasDOMFocus(page, noStatusFooter)).toBe(false)

      //verify document.activeElement is not a child of the table-root element
      await memex.tableView.expectContainsFocus(false)
    })
  })

  test.describe('nefarious tests', () => {
    test('handles multiple grouping attempts', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'table',
      })

      // first, group by Estimate
      await isNotGroupedBy(page, 'Estimate', 'No Estimate')
      await toggleGroupBy(page, 'Estimate')
      await isGroupedBy(page, 'Estimate', 'No Estimate')

      // then group by Team
      await isNotGroupedBy(page, 'Team', 'No Team')
      await toggleGroupBy(page, 'Team')
      await isGroupedBy(page, 'Team', 'No Team')

      // now add a new row to the group
      const initialRowCount = 2
      const groupName = 'Novelty Aardvarks'

      await groupContainsRows(page, groupName, initialRowCount)

      await focusOnFooterForGroup(page, memex, groupName)
      await addDraftItem(page, 'New Person')

      await groupContainsRows(page, groupName, initialRowCount + 1)

      const newRowIndex = await getTableIndexForRowInGroup(page, groupName, initialRowCount)
      const cellSelector = _(cellTestId(newRowIndex, 'Team'))
      await expect(page.locator(cellSelector)).toHaveText('Novelty Aardvarks')
    })
  })
})

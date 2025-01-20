import {expect} from '@playwright/test'

import {Resources} from '../../../client/strings'
import {test} from '../../fixtures/test-extended'
import {dragTo, mustGetCenter} from '../../helpers/dom/interactions'
import {
  expectColumnHeaderName,
  expectColumnToBeHidden,
  isGroupedBy,
  isNotGroupedBy,
  waitForRowCount,
} from '../../helpers/table/assertions'
import {
  getColumnHeaderMenuOption,
  getColumnMenuTrigger,
  openColumnVisibilityMenu,
  toggleGroupBy,
} from '../../helpers/table/interactions'
import {
  getColumnVisibilityMenuOption,
  getColumnVisibilityMenuOptions,
  getGroupNamesInTable,
  getTableCellText,
  getTableColumn,
  getTableColumnHeaderName,
  getTableRow,
} from '../../helpers/table/selectors'

test.describe('Column manipulation', () => {
  test('a user-defined column can be hidden when the column action menu is opened via click', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
    // To begin with, we have 16 columns (15 data columns and the "add new field" column).
    await expect(page.getByRole('columnheader')).toHaveCount(16)

    const menuTrigger = await getColumnMenuTrigger(page, 'Stage')

    // Open the menu.
    await menuTrigger.click()

    const hideColumnOption = getColumnHeaderMenuOption(page, 'Stage', 'Hide field')
    await hideColumnOption.click()

    // We should now have one less column.
    await expect(page.getByRole('columnheader')).toHaveCount(15)

    // Confirm that we've hidden the relevant column name.
    await expectColumnToBeHidden(page, 'Stage')
  })

  test('a user-defined groupedBy column can be hidden when via column action menu', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')

    await toggleGroupBy(page, 'Stage')
    await isGroupedBy(page, 'Stage', 'Closed')

    const menuTrigger = await getColumnMenuTrigger(page, 'Stage')

    // Open the menu.
    await menuTrigger.click()

    const hideColumnOption = getColumnHeaderMenuOption(page, 'Stage', 'Hide field')
    await hideColumnOption.click()

    // Confirm that we've hidden the relevant column name.
    await expectColumnToBeHidden(page, 'Stage')

    // Confirm that grouping is preserved
    expect(await getGroupNamesInTable(page)).toEqual(['Up Next', 'Closed', 'No Stage'])
  })

  test("a column's position can be moved with a drag and drop operation", async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')

    const firstColumnName = await getTableColumnHeaderName(page, 0)
    const secondColumnName = await getTableColumnHeaderName(page, 1)

    const initialFirstColumn = await getTableColumn(page, 0)
    const initialSecondColumn = await getTableColumn(page, 1)

    const {x, y} = await mustGetCenter(initialSecondColumn)
    await dragTo(page, initialFirstColumn, {x: x + 10, y})

    // Now column names should be swapped with their original values
    await expectColumnHeaderName(page, 0, secondColumnName)
    await expectColumnHeaderName(page, 1, firstColumnName)
  })

  test("a column's position cannot be moved if user does not have write permissions", async ({page, memex}) => {
    // navigating to readonly project
    await memex.navigateToStory('integrationTestsInReadonlyMode')

    const firstColumnName = await getTableColumnHeaderName(page, 0)
    const secondColumnName = await getTableColumnHeaderName(page, 1)

    const initialFirstColumn = await getTableColumn(page, 0)
    const initialSecondColumn = await getTableColumn(page, 1)

    const {x, y} = await mustGetCenter(initialSecondColumn)
    await dragTo(page, initialFirstColumn, {x: x + 10, y})

    // Columns should be in their original position
    await expectColumnHeaderName(page, 0, firstColumnName)
    await expectColumnHeaderName(page, 1, secondColumnName)
  })

  test('an ascending sort on a column can be applied and then cleared', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsEmpty')

    await memex.sharedInteractions.focusOmnibarInEmptyProjectOnPageLoad()

    // Add three draft issues.
    await page.keyboard.insertText('cherry')
    await page.keyboard.press('Enter')
    await waitForRowCount(page, 1)
    // temp hack because adding on a new page too fast can break something
    await page.waitForTimeout(500)

    await page.keyboard.insertText('banana')
    await page.keyboard.press('Enter')
    await waitForRowCount(page, 2)

    await page.keyboard.insertText('apple')
    await page.keyboard.press('Enter')
    await waitForRowCount(page, 3)

    // Open the column menu.
    let menuTrigger = await getColumnMenuTrigger(page, 'Title')
    await menuTrigger.click({force: true})

    // Sort the column descending.
    await getColumnHeaderMenuOption(page, 'Title', Resources.tableHeaderContextMenu.sortAscending).click()

    // Wait for the sort to be applied, as indicated by the appearance of the sort direction label.
    await page.waitForSelector(`[aria-sort="ascending"]`)

    let firstTitle = await getTableCellText(await getTableRow(page, 1), 1)
    let secondTitle = await getTableCellText(await getTableRow(page, 2), 1)
    let thirdTitle = await getTableCellText(await getTableRow(page, 3), 1)

    // Make sure the rows are actually ordered by alphabetically ascending title value.
    expect(firstTitle).toBe('apple')
    expect(secondTitle).toBe('banana')
    expect(thirdTitle).toBe('cherry')

    // Remove the sort by clicking the same menu option again.
    menuTrigger = await getColumnMenuTrigger(page, 'Title')
    await menuTrigger.click()
    await getColumnHeaderMenuOption(page, 'Title', Resources.tableHeaderContextMenu.sortAscendingActive).click()

    // Wait for the sort direction label to disappear.
    await page.waitForSelector(`[aria-sort="ascending"]`, {state: 'hidden'})

    firstTitle = await getTableCellText(await getTableRow(page, 1), 1)
    secondTitle = await getTableCellText(await getTableRow(page, 2), 1)
    thirdTitle = await getTableCellText(await getTableRow(page, 3), 1)

    // Confirm that the sort has been removed.
    expect(firstTitle).toBe('cherry')
    expect(secondTitle).toBe('banana')
    expect(thirdTitle).toBe('apple')
  })

  test('a descending sort on a column can be applied and then cleared', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsEmpty')

    await memex.sharedInteractions.focusOmnibarInEmptyProjectOnPageLoad()

    // Add three draft issues.
    await page.keyboard.insertText('apple')
    await page.keyboard.press('Enter')
    await waitForRowCount(page, 1)
    // temp hack because adding on a new page too fast can break something
    await page.waitForTimeout(500)

    await page.keyboard.insertText('banana')
    await page.keyboard.press('Enter')
    await waitForRowCount(page, 2)

    await page.keyboard.insertText('cherry')
    await page.keyboard.press('Enter')
    await waitForRowCount(page, 3)

    // Open the column menu.
    let menuTrigger = await getColumnMenuTrigger(page, 'Title')
    await menuTrigger.click()

    // Sort the column descending.
    await getColumnHeaderMenuOption(page, 'Title', Resources.tableHeaderContextMenu.sortDescending).click()

    // Wait for the sort to be applied
    await expect(memex.tableView.columns.SORTED_DESCENDING_CELLS).toHaveCount(1)

    let firstTitle = await getTableCellText(await getTableRow(page, 1), 1)
    let secondTitle = await getTableCellText(await getTableRow(page, 2), 1)
    let thirdTitle = await getTableCellText(await getTableRow(page, 3), 1)

    // Make sure the rows are actually ordered by alphabetically descending title value.
    expect(firstTitle).toBe('cherry')
    expect(secondTitle).toBe('banana')
    expect(thirdTitle).toBe('apple')

    // Remove the sort by clicking the same menu option again.
    menuTrigger = await getColumnMenuTrigger(page, 'Title')
    await menuTrigger.click({force: true})

    await getColumnHeaderMenuOption(page, 'Title', Resources.tableHeaderContextMenu.sortDescendingActive).click()

    // Wait for the sort direction label to disappear.
    await expect(memex.tableView.columns.SORTED_DESCENDING_CELLS).toHaveCount(0)

    firstTitle = await getTableCellText(await getTableRow(page, 1), 1)
    secondTitle = await getTableCellText(await getTableRow(page, 2), 1)
    thirdTitle = await getTableCellText(await getTableRow(page, 3), 1)

    // Confirm that the sort has been removed.
    expect(firstTitle).toBe('apple')
    expect(secondTitle).toBe('banana')
    expect(thirdTitle).toBe('cherry')
  })

  test.describe('Title Column', () => {
    test('contains a shortcut to filter items by type or status', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems')

      // Open the column menu.
      const columnMenuTrigger = await getColumnMenuTrigger(page, 'Title')
      await columnMenuTrigger.click()

      const typeFilterOption = getColumnHeaderMenuOption(page, 'Title', Resources.tableHeaderContextMenu.filterByType)
      expect(typeFilterOption).toBeTruthy()
    })

    test('the Title column cannot be toggled in the column visibility menu if column is visible', async ({
      page,
      memex,
    }) => {
      await memex.navigateToStory('integrationTestsWithItems')

      await openColumnVisibilityMenu(page)

      expect(await getColumnVisibilityMenuOptions(page)).toContain('Title')

      await expect(page.getByRole('menu').getByRole('menuitemcheckbox', {name: 'Title'})).toBeDisabled()
    })

    // TODO: Something about the appearance animation on the column visibility
    // menu breaks the "click" on the "Title" item, potentially because the
    // animation includes translation. Without the force parameter, Playwright
    // seems to think the element is no longer attached to the DOM.
    test('the Title column can be toggled in the column visibility menu if column is hidden', async ({page, memex}) => {
      test.fixme()

      await memex.navigateToStory('integrationTestsWithTitleColumnHidden')

      // Column should be hidden from the table.
      await expectColumnToBeHidden(page, 'Title')

      await openColumnVisibilityMenu(page)

      expect(await getColumnVisibilityMenuOptions(page)).toContain('Title')

      // Expect the "Title" column option to be enabled.
      const titleVisibilityMenuOption = getColumnVisibilityMenuOption(page, 'Title')
      await expect(titleVisibilityMenuOption).toBeEnabled()

      // Toggle the Title column to visible.
      await titleVisibilityMenuOption.click()

      // Expect the title to be visible
      await expectColumnHeaderName(page, 0, 'Title')

      // Expect the "Title" column option to now be disabled.
      await expect(titleVisibilityMenuOption).toBeDisabled()
    })

    test("a column's position can be moved with a drag and drop operation in on the field modal", async ({
      page,
      memex,
    }) => {
      // the use of dispatchEvent in here seems to be flaky on Safari
      // muting this test for now to ensure it's not adding noise for
      // other contributors
      // UPDATE 3/15/22: This test is flaky in all browsers
      test.fixme(true)

      await memex.navigateToStory('integrationTestsWithItems')

      const firstColumnName = await getTableColumnHeaderName(page, 0)
      const secondColumnName = await getTableColumnHeaderName(page, 1)

      await openColumnVisibilityMenu(page)

      const titleVisibilityMenuOption = getColumnVisibilityMenuOption(page, 'Title')
      const assigneesDateVisibilityMenuOption = getColumnVisibilityMenuOption(page, 'Assignees')

      const assigneesBoundingBox = await assigneesDateVisibilityMenuOption.boundingBox()
      const {x, y, height} = assigneesBoundingBox

      // Fire a mousedown event on the first column header
      await titleVisibilityMenuOption.dispatchEvent('mousedown')

      // Move the mouse to the right edge of the second column header
      await page.mouse.move(x, y + height)
      // Fire a mouseup event
      await page.mouse.up()

      // Now column names should be swapped with their original values
      await expectColumnHeaderName(page, 0, secondColumnName)
      await expectColumnHeaderName(page, 1, firstColumnName)
    })

    test('a system column can be hidden by dragging to hidden fields in the add field menu', async ({
      page,
      browserName,
      memex,
    }) => {
      // the use of dispatchEvent in here seems to be flaky on Safari
      // muting this test for now to ensure it's not adding noise for
      // other contributors
      test.fixme(browserName === 'webkit')

      await memex.navigateToStory('integrationTestsWithItems')

      await expectColumnHeaderName(page, 1, 'Assignees')

      await openColumnVisibilityMenu(page)

      await getColumnVisibilityMenuOptions(page)

      const assigneesVisibilityMenuOption = getColumnVisibilityMenuOption(page, 'Assignees')
      const confidenceVisibilityMenuOption = getColumnVisibilityMenuOption(page, 'Confidence')

      const confidenceVisibilityMenuOptionBoundingBox = await confidenceVisibilityMenuOption.boundingBox()
      const {x, y, width} = confidenceVisibilityMenuOptionBoundingBox

      // Fire a mousedown event on the first column header
      await assigneesVisibilityMenuOption.dispatchEvent('mousedown')

      // Move the mouse to the right edge of the second column header
      await page.mouse.move(x + width - 5, y)

      // Fire a mouseup event
      await page.mouse.up()

      await expectColumnToBeHidden(page, 'Assignees')
    })

    test('a custom column can be hidden by dragging to hidden fields in the add field menu', async ({
      page,
      browserName,
      memex,
    }) => {
      // the use of dispatchEvent in here seems to be flaky on Safari
      // muting this test for now to ensure it's not adding noise for
      // other contributors
      test.fixme(browserName === 'webkit')

      await memex.navigateToStory('integrationTestsWithItems')

      await expectColumnToBeHidden(page, 'Aardvarks')

      await openColumnVisibilityMenu(page)

      const aardvarksVisibilityMenuOption = getColumnVisibilityMenuOption(page, 'Aardvarks')
      const milestoneVisibilityMenuOption = getColumnVisibilityMenuOption(page, 'Milestone')

      const milestoneVisibilityMenuOptionBoundingBox = await milestoneVisibilityMenuOption.boundingBox()
      const {x, y, width} = milestoneVisibilityMenuOptionBoundingBox

      // Fire a mousedown event on the first column header
      await aardvarksVisibilityMenuOption.dispatchEvent('mousedown')

      // Move the mouse to the right edge of the second column header
      await page.mouse.move(x + width - 5, y + 10)
      // Fire a mouseup event
      await page.mouse.up()

      await expectColumnHeaderName(page, 5, 'Aardvarks')
    })

    test('the `Title` cannot be hidden by dragging to hidden fields in the add field menu', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems')

      await expectColumnHeaderName(page, 0, 'Title')

      await openColumnVisibilityMenu(page)

      await getColumnVisibilityMenuOptions(page)

      const titleVisibilityMenuOption = getColumnVisibilityMenuOption(page, 'Title')
      const confidenceVisibilityMenuOption = getColumnVisibilityMenuOption(page, 'Confidence')

      const confidenceVisibilityMenuOptionBoundingBox = await confidenceVisibilityMenuOption.boundingBox()
      const {x, y, width} = confidenceVisibilityMenuOptionBoundingBox

      // Fire a mousedown event on the first column header
      await titleVisibilityMenuOption.dispatchEvent('mousedown')

      // Move the mouse to the right edge of the second column header
      await page.mouse.move(x + width - 5, y)
      // Fire a mouseup event
      await page.mouse.up()

      await expectColumnHeaderName(page, 0, 'Title')
    })

    test('a `Grouped by column` cannot be hidden by dragging to hidden fields in the add field menu', async ({
      page,
      memex,
    }) => {
      await memex.navigateToStory('integrationTestsWithItems')

      await isNotGroupedBy(page, 'Status', 'Done')
      await toggleGroupBy(page, 'Status')
      await isGroupedBy(page, 'Status', 'Done')

      await expectColumnHeaderName(page, 2, 'Status')

      await openColumnVisibilityMenu(page)

      const statusVisibilityMenuOption = getColumnVisibilityMenuOption(page, 'Status')
      const confidenceVisibilityMenuOption = getColumnVisibilityMenuOption(page, 'Confidence')

      const confidenceVisibilityMenuOptionBoundingBox = await confidenceVisibilityMenuOption.boundingBox()
      const {x, y, width} = confidenceVisibilityMenuOptionBoundingBox

      // Fire a mousedown event on the first column header
      await statusVisibilityMenuOption.dispatchEvent('mousedown')

      // Move the mouse to the right edge of the second column header
      await page.mouse.move(x + width - 5, y)
      // Fire a mouseup event
      await page.mouse.up()

      await expectColumnHeaderName(page, 2, 'Status')
    })
  })

  test.describe('Table Menu', () => {
    test('the table menu column should be hidden on empty table', async ({memex}) => {
      await memex.navigateToStory('integrationTestsEmpty')

      // Open the column menu.
      const columnMenuTrigger = memex.tableView.columns.COLUMN_HEADERS.locator('details summary')
      await expect(columnMenuTrigger).toBeHidden()
    })
  })
})

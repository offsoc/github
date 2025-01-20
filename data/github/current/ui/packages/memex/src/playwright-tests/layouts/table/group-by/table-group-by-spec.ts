import {expect} from '@playwright/test'

import {Resources} from '../../../../client/strings'
import {test} from '../../../fixtures/test-extended'
import {todayString, tomorrowString} from '../../../helpers/dates'
import {mustFind, mustNotFind} from '../../../helpers/dom/assertions'
import {_} from '../../../helpers/dom/selectors'
import {
  expectGroupHasRows,
  expectGroupIsCollapsed,
  isGroupedBy,
  isNotGroupedBy,
} from '../../../helpers/table/assertions'
import {
  dragGroupedRow,
  getColumnHeaderMenuOption,
  getColumnMenuTrigger,
  setCellToFocusMode,
  toggleGroupBy,
  toggleGroupCollapsed,
} from '../../../helpers/table/interactions'
import {
  cellTestId,
  getCellMode,
  getGroupNamesInTable,
  getRowRankingsWithinGroup,
  getRowTitlesWithinGroup,
  getTableCell,
  getTableIndexForRowInGroup,
  getTableRowWithinGroup,
} from '../../../helpers/table/selectors'
import {CellMode} from '../../../types/table'

const doneGroupId = '98236657'

test.describe('Group By', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'table',
    })
  })

  test('it allows group by for the system-defined Status field', async ({page}) => {
    // No Status grouping to begin with.
    await isNotGroupedBy(page, 'Status', 'Done')

    // Turn on Status grouping.
    await toggleGroupBy(page, 'Status')

    // Make sure grouping indicators appear.
    await isGroupedBy(page, 'Status', 'Done')

    // Turn off Status grouping.
    await toggleGroupBy(page, 'Status')

    // Make sure grouping indicators disappear.
    await isNotGroupedBy(page, 'Status', 'Done')
  })

  test('it allows group by for a user-defined single-select field', async ({page}) => {
    // No Stage grouping to begin with.
    await isNotGroupedBy(page, 'Stage', 'Closed')

    // Turn on Stage grouping.
    await toggleGroupBy(page, 'Stage')

    // Make sure grouping indicators appear.
    await isGroupedBy(page, 'Stage', 'Closed')

    // Turn off Stage grouping.
    await toggleGroupBy(page, 'Stage')

    // Make sure grouping indicators disappear.
    await isNotGroupedBy(page, 'Stage', 'Closed')
  })

  test('it allows group by for a text field', async ({page}) => {
    await isNotGroupedBy(page, 'Team', 'Novelty Aardvarks')
    // Turn on Stage grouping.
    await toggleGroupBy(page, 'Team')

    // Make sure grouping indicators appear.
    await isGroupedBy(page, 'Team', 'Novelty Aardvarks')

    // Make sure groups are displayed in alphabetical order by default.
    const groupNames = await getGroupNamesInTable(page)
    expect(groupNames).toStrictEqual(['Design Systems', 'Novelty Aardvarks', 'No Team'])

    // Turn off Stage grouping.
    await toggleGroupBy(page, 'Team')

    // Make sure grouping indicators disappear.
    await isNotGroupedBy(page, 'Team', 'Novelty Aardvarks')
  })

  test('it allows group by for a number field', async ({page}) => {
    // No Stage grouping to begin with.
    await isNotGroupedBy(page, 'Estimate', '10')

    // Turn on Stage grouping.
    await toggleGroupBy(page, 'Estimate')

    // Make sure grouping indicators appear.
    await isGroupedBy(page, 'Estimate', '10')

    // Make sure groups are displayed in numerical order by default.
    expect(await getGroupNamesInTable(page)).toStrictEqual(['1', '3', '10', 'No Estimate'])

    // Turn off Stage grouping.
    await toggleGroupBy(page, 'Estimate')

    // Make sure grouping indicators disappear.
    await isNotGroupedBy(page, 'Estimate', '10')
  })

  test('it allows group by for a date field', async ({page}) => {
    await isNotGroupedBy(page, 'Due Date', 'No Due Date')

    // Turn off grouping.
    await toggleGroupBy(page, 'Due Date')

    // Make sure grouping indicators appear.
    await isGroupedBy(page, 'Due Date', 'No Due Date')
    // Make sure groups are displayed in chronological order by default.
    expect(await getGroupNamesInTable(page)).toStrictEqual([todayString, tomorrowString, 'No Due Date'])

    // Make sure the group representing today's date has a label
    const groupLabelElements = page.getByTestId('table-group-label')
    await expect(groupLabelElements).toHaveCount(1)
    const textContent = await groupLabelElements.allTextContents()
    expect(textContent[0]).toBe('Today')

    // Turn off grouping.
    await toggleGroupBy(page, 'Due Date')

    // Make sure grouping indicators disappear.
    await isNotGroupedBy(page, 'Due Date', 'No Due Date')
  })

  test('a different column can be sorted after grouping', async ({page}) => {
    await toggleGroupBy(page, 'Status')
    await isGroupedBy(page, 'Status', 'Done')

    // Open the Assignees column menu.
    const menuTriggerTitle = await getColumnMenuTrigger(page, 'Assignees')
    await menuTriggerTitle.click()

    // Sort the column descending.
    const sortDescendingColumnOptionTitle = getColumnHeaderMenuOption(
      page,
      'Assignees',
      Resources.tableHeaderContextMenu.sortDescending,
    )
    await sortDescendingColumnOptionTitle.click()

    // Wait for the sort to be applied
    await mustFind(page, _('sorted-label-Assignees'))

    // Grouping indicators are still there.
    await isGroupedBy(page, 'Status', 'Done')
  })

  test('sorting the grouped column sorts the groupings', async ({page}) => {
    await toggleGroupBy(page, 'Status')
    await isGroupedBy(page, 'Status', 'Done')

    // Ensure that the groups are in asc order
    expect(await getGroupNamesInTable(page)).toStrictEqual(['Backlog', 'Done', 'No Status'])

    // Open the Status column menu.
    const menuTriggerTitle = await getColumnMenuTrigger(page, 'Status')
    await menuTriggerTitle.click()

    // Sort the column ascending.
    const sortAscendingColumnOptionTitle = getColumnHeaderMenuOption(
      page,
      'Status',
      Resources.tableHeaderContextMenu.sortAscending,
    )
    await sortAscendingColumnOptionTitle.click()

    // Ensure that the groups are in asc order
    expect(await getGroupNamesInTable(page)).toStrictEqual(['Backlog', 'Done', 'No Status'])

    // Open the Status column menu.
    await menuTriggerTitle.click()

    // Sort the column descending.
    const sortDescendingColumnOptionTitle = getColumnHeaderMenuOption(
      page,
      'Status',
      Resources.tableHeaderContextMenu.sortDescending,
    )
    await sortDescendingColumnOptionTitle.click()

    // grouped icon is still visible
    await isGroupedBy(page, 'Status', 'Done')

    // Ensure that the groups are reversed
    expect(await getGroupNamesInTable(page)).toStrictEqual(['No Status', 'Done', 'Backlog'])
  })

  test('sorting the grouped column displays correctly ordered rows', async ({page}) => {
    await toggleGroupBy(page, 'Status')
    await isGroupedBy(page, 'Status', 'Done')

    // get default order for items in group
    const referenceTitles = await getRowTitlesWithinGroup(page, 'Done')

    // Open the Status column menu.
    const menuTriggerTitle = await getColumnMenuTrigger(page, 'Status')
    await menuTriggerTitle.click()
    // Sort the column ascending.
    const sortAscendingColumnOptionTitle = getColumnHeaderMenuOption(
      page,
      'Status',
      Resources.tableHeaderContextMenu.sortAscending,
    )
    await sortAscendingColumnOptionTitle.click()

    // Ensure that items are in default order
    expect(await getRowTitlesWithinGroup(page, 'Done')).toStrictEqual(referenceTitles)
    // Ensure rankings are ascending
    expect(await getRowRankingsWithinGroup(page, 'Done')).toStrictEqual(['3', '4', '5'])

    // Open the Status column menu.
    await menuTriggerTitle.click()
    // Sort the column descending.
    const sortDescendingColumnOptionTitle = getColumnHeaderMenuOption(
      page,
      'Status',
      Resources.tableHeaderContextMenu.sortDescending,
    )
    await sortDescendingColumnOptionTitle.click()

    // grouped icon is still visible
    await isGroupedBy(page, 'Status', 'Done')

    // Ensure that items are in default order
    expect(await getRowTitlesWithinGroup(page, 'Done')).toStrictEqual(referenceTitles)
    // Ensure rankings are still ascending
    expect(await getRowRankingsWithinGroup(page, 'Done')).toStrictEqual(['4', '5', '6'])
  })

  test('it allows collapsing and expanding of groups', async ({page}) => {
    await toggleGroupBy(page, 'Status')

    // Rows start off expanded
    await expectGroupHasRows(page, 'Done', 3)

    // Rows can be collapsed
    await toggleGroupCollapsed(page, 'Done')
    await expectGroupIsCollapsed(page, 'Done')

    // eslint-disable-next-line no-restricted-properties
    let local = await page.evaluate(() => window.localStorage)
    expect(local['projects.collapsedGroups']).toEqual(JSON.stringify({1: {1: [doneGroupId]}}))

    // Rows can also be expanded again
    await toggleGroupCollapsed(page, 'Done')
    await expectGroupHasRows(page, 'Done', 3)

    // eslint-disable-next-line no-restricted-properties
    local = await page.evaluate(() => window.localStorage)
    expect(local['projects.collapsedGroups']).toBeUndefined()
  })

  test('allows expand/collapse of groups relative to each view', async ({page, memex}) => {
    await toggleGroupBy(page, 'Status')

    // Rows start off expanded
    await expectGroupHasRows(page, 'Done', 3)

    // Rows can be collapsed
    await toggleGroupCollapsed(page, 'Done')
    await expectGroupIsCollapsed(page, 'Done')

    // Create a new view
    await memex.views.createNewView()
    await expect(memex.views.ACTIVE_TAB).toHaveText(/^View 100$/)
    await toggleGroupBy(page, 'Status')

    // Collapsed state is not shared between views
    await expectGroupHasRows(page, 'Done', 3)

    // Collapse a different group
    await toggleGroupCollapsed(page, 'Backlog')
    await expectGroupIsCollapsed(page, 'Backlog')

    await memex.views.VIEW_TAB_LIST.getByTitle('View 1', {exact: true}).click()
    await expect(memex.views.ACTIVE_TAB).toHaveText(/^View 1$/)

    // Original state is preserved for the first view
    await expectGroupIsCollapsed(page, 'Done')
    await expectGroupHasRows(page, 'Backlog', 2)
  })

  test('keyboard navigation works for grouped columns', async ({page}) => {
    await toggleGroupBy(page, 'Status')

    // Focus the first row in a group with multiple rows
    const firstDoneRowIndex = await getTableIndexForRowInGroup(page, 'Done', 0)
    await setCellToFocusMode(page, _(cellTestId(firstDoneRowIndex, 'Status')))

    // Press down to focus on the next row
    await page.keyboard.down('ArrowDown')

    // Expect the cell mode of the next rown down to be focused
    const secondDoneRowIndex = await getTableIndexForRowInGroup(page, 'Done', 1)
    expect(await getCellMode(page, _(cellTestId(secondDoneRowIndex, 'Status')))).toBe(CellMode.FOCUSED)
  })

  test('it allows toggling a different column when group by is already applied', async ({page}) => {
    await toggleGroupBy(page, 'Status')

    // Grouped icon for Status appears
    await isGroupedBy(page, 'Status', 'Done')

    await toggleGroupBy(page, 'Stage')

    // Grouped icon for Stage appears
    await isGroupedBy(page, 'Stage', 'Closed')
    // While grouped icon for Status disappears
    await isNotGroupedBy(page, 'Status', 'Done')
  })

  test('it allows sorting on a different column when group by is applied', async ({page}) => {
    await toggleGroupBy(page, 'Status')
    await isGroupedBy(page, 'Status', 'Done')

    // Sort by Title
    const menuTriggerTitle = await getColumnMenuTrigger(page, 'Title')
    await menuTriggerTitle.click()

    const sortDescendingColumnOptionTitle = getColumnHeaderMenuOption(
      page,
      'Title',
      Resources.tableHeaderContextMenu.sortAscending,
    )
    await sortDescendingColumnOptionTitle.click()

    // expect rows in group to be sorted by title
    const firstItemInGroup = await getTableRowWithinGroup(page, 'Done', 0)
    const firstRowTitleCell = await getTableCell(firstItemInGroup, 1)
    const firstRowTitle: string = await firstRowTitleCell.innerText()

    const secondItemInGroup = await getTableRowWithinGroup(page, 'Done', 1)
    const secondRowTitleCell = await getTableCell(secondItemInGroup, 1)
    const secondRowTitle: string = await secondRowTitleCell.innerText()

    const lastItemInGroup = await getTableRowWithinGroup(page, 'Done', 2)
    const lastRowTitleCell = await getTableCell(lastItemInGroup, 1)
    const lastRowTitle: string = await lastRowTitleCell.innerText()

    expect(firstRowTitle.localeCompare(secondRowTitle)).toBeLessThan(0)
    expect(secondRowTitle.localeCompare(lastRowTitle)).toBeLessThan(0)
  })

  test('clearing sorting after grouping restores original order', async ({page}) => {
    await toggleGroupBy(page, 'Status')
    await isGroupedBy(page, 'Status', 'Done')

    // get default order for items in group

    // we expect three items in this group, and the first will have two
    // assignees so this should always change when sort is applied
    const beforeFirstItem = await getTableRowWithinGroup(page, 'Done', 0)
    const beforeFirstTitleCell = await getTableCell(beforeFirstItem, 1)
    const beforeFirstTitle: string = await beforeFirstTitleCell.innerText()

    const beforeLastItem = await getTableRowWithinGroup(page, 'Done', 2)
    const beforeLastTitleCell = await getTableCell(beforeLastItem, 1)
    const beforeLastTitle: string = await beforeLastTitleCell.innerText()

    // Sort by Title
    let menuTriggerTitle = await getColumnMenuTrigger(page, 'Title')
    await menuTriggerTitle.click()

    await getColumnHeaderMenuOption(page, 'Title', Resources.tableHeaderContextMenu.sortAscending).click()

    const duringFirstItem = await getTableRowWithinGroup(page, 'Done', 0)
    const duringFirstTitleCell = await getTableCell(duringFirstItem, 1)
    const duringFirstTitle: string = await duringFirstTitleCell.innerText()

    expect(beforeFirstTitle).not.toEqual(duringFirstTitle)

    const duringLastItem = await getTableRowWithinGroup(page, 'Done', 2)
    const duringLastTitleCell = await getTableCell(duringLastItem, 1)
    const duringLastTitle: string = await duringLastTitleCell.innerText()

    expect(beforeLastTitle).not.toEqual(duringLastTitle)

    // Clear sort by Title
    menuTriggerTitle = await getColumnMenuTrigger(page, 'Title')
    await menuTriggerTitle.click()
    await getColumnHeaderMenuOption(page, 'Title', Resources.tableHeaderContextMenu.sortAscendingActive).click()

    // get default order for items in group
    const afterFirstItem = await getTableRowWithinGroup(page, 'Done', 0)
    const afterFirsTitleCell = await getTableCell(afterFirstItem, 1)
    const afterFirstTitle: string = await afterFirsTitleCell.innerText()

    const afterLastItem = await getTableRowWithinGroup(page, 'Done', 2)
    const afterLastTitleCell = await getTableCell(afterLastItem, 1)
    const afterLastTitle: string = await afterLastTitleCell.innerText()

    expect(beforeFirstTitle).toEqual(afterFirstTitle)
    expect(beforeLastTitle).toEqual(afterLastTitle)
  })

  test('it hides empty groups for which there are no items', async ({page}) => {
    await mustNotFind(page, _('table-group-Ready'))
  })

  test('it shows the omnibar when hiding ALL empty groups for which there are no items', async ({page, memex}) => {
    await memex.sharedInteractions.filterToExpectedCount(
      'pneumonoultramicroscopicsilicovolcanoconiosis',
      'div[data-testid^=TableRow]',
      0,
    )
    await expect(getGroupNamesInTable(page)).resolves.toEqual([])
    await expect(memex.omnibar.INPUT).toBeVisible()
  })

  test('it hides empty groups when the last item is dragged from a group', async ({page}) => {
    const groupNameToEmpty = 'Backlog'
    await toggleGroupBy(page, 'Status')

    // The backlog currently has 2 rows
    await expectGroupHasRows(page, groupNameToEmpty, 2)

    const targetRow = await getTableRowWithinGroup(page, 'Done', 0)

    // Drag the first row to another group
    const firstRow = await getTableRowWithinGroup(page, 'Done', 1)
    await dragGroupedRow(page, firstRow, targetRow)

    // Drag the second row to another group
    const secondRow = await getTableRowWithinGroup(page, 'Done', 0)
    await dragGroupedRow(page, secondRow, targetRow)

    await expect(expectGroupHasRows(page, groupNameToEmpty, 0)).rejects.toThrow()
  })

  test('focus returns to trigger after doing group by', async ({page}) => {
    await toggleGroupBy(page, 'Status')
    await expect(page.getByRole('button', {name: 'Status column options'})).toBeFocused()
  })

  test('if cell is focused, focus omnibar in cell group', async ({page, memex}) => {
    await toggleGroupBy(page, 'Status')

    const rowIndex = await getTableIndexForRowInGroup(page, 'Done', 0)
    const cellSelector = _(cellTestId(rowIndex, 'Title'))
    await setCellToFocusMode(page, cellSelector)

    await page.keyboard.press('Control+Space')
    await expect(memex.omnibar.getInputForGroupLocator('Done')).toBeFocused()
  })

  test('Cannot group by labels', async ({page}) => {
    await toggleGroupBy(page, 'Status')
    await isGroupedBy(page, 'Status', 'Done')

    // Open the Labels column menu.
    const menuTriggerTitle = await getColumnMenuTrigger(page, 'Labels')
    await menuTriggerTitle.click()

    await expect(page.getByTestId('Labels-column-menu')).toBeVisible()
    await expect(page.getByTestId('group-by-trigger')).toBeHidden()
  })

  test.describe('group menu', () => {
    test('archive all items', async ({page, memex}) => {
      await toggleGroupBy(page, 'Status')

      await memex.tableView.GROUP_MENU_TRIGGER('Done').click()

      await page.getByRole('menuitem', {name: 'Archive all'}).click()

      const dialog = page.getByRole('alertdialog', {name: 'Archive all items?'})
      await dialog.getByRole('button', {name: 'Archive'}).click()

      await expect(memex.tableView.GROUP_MENU_TRIGGER('Done')).toBeHidden()
    })

    test('delete all items', async ({page, memex}) => {
      await toggleGroupBy(page, 'Status')

      await memex.tableView.GROUP_MENU_TRIGGER('Done').click()

      await page.getByRole('menuitem', {name: 'Delete all'}).click()

      const dialog = page.getByRole('alertdialog', {name: 'Delete all items?'})
      await dialog.getByRole('button', {name: 'Delete'}).click()

      await expect(memex.tableView.GROUP_MENU_TRIGGER('Done')).toBeHidden()
    })

    test('edit details', async ({page, memex}) => {
      await toggleGroupBy(page, 'Status')

      await memex.tableView.GROUP_MENU_TRIGGER('Done').click()

      await page.getByRole('menuitem', {name: 'Edit details'}).click()

      const dialog = page.getByRole('dialog', {name: 'Edit option'})
      const nameInput = dialog.getByRole('textbox', {name: 'Label text'})
      await nameInput.selectText()
      await nameInput.type('Complete')

      await dialog.getByRole('button', {name: 'Save'}).click()

      await expect(memex.tableView.GROUP_MENU_TRIGGER('Complete')).toBeVisible()
    })

    test('hide from view', async ({page, memex}) => {
      await toggleGroupBy(page, 'Status')

      await memex.tableView.GROUP_MENU_TRIGGER('Done').click()

      await page.getByRole('menuitem', {name: 'Hide from view'}).click()

      await expect(memex.tableView.GROUP_MENU_TRIGGER('Done')).toBeHidden()

      const filterInput = page.getByRole('combobox', {name: 'Filter by keyword or by field'})
      await expect(filterInput).toHaveValue('-status:Done')
    })

    test('delete', async ({page, memex}) => {
      await toggleGroupBy(page, 'Status')

      await memex.tableView.GROUP_MENU_TRIGGER('Done').click()

      await page.getByRole('menuitem', {name: 'Delete', exact: true}).click()

      const dialog = page.getByRole('alertdialog', {name: 'Delete option?'})
      await dialog.getByRole('button', {name: 'Delete'}).click()

      await expect(memex.tableView.GROUP_MENU_TRIGGER('Done')).toBeHidden()
    })

    test('delete hidden when empty group', async ({page, memex}) => {
      await toggleGroupBy(page, 'Status')

      const groupCollapseButton = page.getByRole('button', {name: 'Collapse group Done'})
      await expect(groupCollapseButton).toBeVisible()

      await memex.tableView.GROUP_MENU_TRIGGER('No Status').click()

      await expect(page.getByRole('menuitem', {name: 'Delete all', exact: true})).toBeVisible()
      await expect(page.getByRole('menuitem', {name: 'Delete', exact: true})).toBeHidden()
    })
  })

  test('it allows clicking the parent issue group header', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithSubIssues', {
      viewType: 'table',
    })

    await toggleGroupBy(page, 'Parent issue')
    await isGroupedBy(page, 'Parent issue', 'Parent One')

    const groupLabel = page.getByText('Parent One')
    await groupLabel.click()
    await expect(memex.sidePanel.NEW_ISSUE_VIEWER_DEVELOPMENT_WARNING).toBeVisible()
  })
})

test('hides group menu items when project is read-only', async ({page, memex}) => {
  await memex.navigateToStory('integrationTestsInReadonlyMode')

  await toggleGroupBy(page, 'Status')

  // The "no status" group should be hidden because it has no menu items in it
  await expect(memex.tableView.GROUP_MENU_TRIGGER('No Status')).toBeHidden()
  // The other menus should have a reduced set of menu items
  await memex.tableView.GROUP_MENU_TRIGGER('Done').click()
  const menuItems = await memex.tableView.GROUP_MENU('Done').getByRole('menuitem').allTextContents()
  expect(menuItems).toEqual(['Hide from view'])
})

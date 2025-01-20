import {expect} from '@playwright/test'

import {Resources} from '../../../client/strings'
import {test} from '../../fixtures/test-extended'
import {waitForSelectorCount} from '../../helpers/dom/assertions'
import {_} from '../../helpers/dom/selectors'
import {expectSortedByColumnIdUrlParam} from '../../helpers/table/assertions'
import {getColumnHeaderMenuOption, getColumnMenuTrigger, sortByColumnName} from '../../helpers/table/interactions'
import {getTableColumnId} from '../../helpers/table/selectors'

test.describe('Sorting', () => {
  test('no params in the URL means no columns are sorted', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'table',
    })

    await expect(memex.tableView.columns.SORTED_DESCENDING_CELLS).toHaveCount(0)
    await expect(memex.tableView.columns.SORTED_ASCENDING_CELLS).toHaveCount(0)

    expectSortedByColumnIdUrlParam(page, [])
  })

  test('sorted by asc params in the URL are honored by the table', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      sortedBy: {columnId: 'Title', direction: 'asc'},
      viewType: 'table',
    })

    await expect(memex.tableView.columns.SORTED_DESCENDING_CELLS).toHaveCount(0)
    await expect(memex.tableView.columns.SORTED_ASCENDING_CELLS).toHaveCount(1)

    await expect(memex.tableView.columns.SORTED_ASCENDING_CELLS.first()).toHaveText('Title', {useInnerText: true})

    expectSortedByColumnIdUrlParam(page, ['Title'])
  })

  test('sorted by desc params in the URL are honored by the table', async ({page, memex}) => {
    //Stage is column with id 10
    await memex.navigateToStory('integrationTestsWithItems', {
      sortedBy: {columnId: 10, direction: 'desc'},
      viewType: 'table',
    })

    await expect(memex.tableView.columns.SORTED_DESCENDING_CELLS).toHaveCount(1)
    await expect(memex.tableView.columns.SORTED_ASCENDING_CELLS).toHaveCount(0)

    await expect(memex.tableView.columns.SORTED_DESCENDING_CELLS.first()).toHaveText('Stage', {useInnerText: true})

    expectSortedByColumnIdUrlParam(page, ['10'])
  })

  test('secondary sort params are honored by the table', async ({page, memex}) => {
    //Stage is column with id 10
    await memex.navigateToStory('integrationTestsWithItems', {
      sortedBy: {columnId: 10, direction: 'desc'},
      secondarySortedBy: {columnId: 'Title', direction: 'asc'},
      viewType: 'table',
    })

    await expect(memex.tableView.columns.SORTED_DESCENDING_CELLS).toHaveCount(1)
    await expect(memex.tableView.columns.SORTED_ASCENDING_CELLS).toHaveCount(1)

    // "1" is the number annotation included in the icon when a secondary sort is applied
    await expect(memex.tableView.columns.SORTED_DESCENDING_CELLS.first()).toHaveText('Stage\n1', {useInnerText: true})
    await expect(memex.tableView.columns.SORTED_ASCENDING_CELLS.first()).toHaveText('Title\n2', {useInnerText: true})

    expectSortedByColumnIdUrlParam(page, ['10', 'Title'])
  })

  test('sorted by params are not cleared if columnId is not visible, column is made visible if it can be', async ({
    page,
    memex,
  }) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      sortedBy: {columnId: 999, direction: 'desc'},
      viewType: 'table',
    })

    await expect(memex.tableView.columns.SORTED_DESCENDING_CELLS).toHaveCount(0)
    await expect(memex.tableView.columns.SORTED_ASCENDING_CELLS).toHaveCount(0)

    expectSortedByColumnIdUrlParam(page, ['999'])
  })

  test('clicking on arrow on sorted column will switch direction of sort', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'table',
    })

    await sortByColumnName(page, 'Title', Resources.tableHeaderContextMenu.sortDescending)

    // Wait for the sort to be applied
    const sortedLabelTitle = page.getByTestId('sorted-label-Title')
    await expect(sortedLabelTitle).toBeVisible()

    await expect(page.getByRole('button', {name: 'Change sort direction to ascending'})).toHaveCount(1)
    await sortedLabelTitle.click()

    await expect(page.getByRole('button', {name: 'Change sort direction to descending'})).toHaveCount(1)
    await sortedLabelTitle.click()

    await expect(page.getByRole('button', {name: 'Change sort direction to ascending'})).toHaveCount(1)
  })

  test.describe('secondary sorting ', () => {
    test('selecting a second column adds a secondary sort', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'table',
      })

      await sortByColumnName(page, 'Title', Resources.tableHeaderContextMenu.sortDescending)

      // Wait for the sort to be applied
      const sortedLabelTitle = page.getByTestId('sorted-label-Title')
      await expect(sortedLabelTitle).toBeVisible()

      await sortByColumnName(page, 'Status', Resources.tableHeaderContextMenu.sortDescending)

      // Wait for the sort to be applied
      const sortedLabelStatus = page.getByTestId('sorted-label-Status')
      await expect(sortedLabelStatus).toBeVisible()
      await expect(sortedLabelStatus).toHaveAttribute('aria-label', /secondary/)

      // The other sorted label updates to primary
      await expect(sortedLabelTitle).toBeVisible()
      await expect(sortedLabelTitle).toHaveAttribute('aria-label', /primary/)
    })

    test('clearing secondary sort keeps primary sort', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'table',
      })

      await sortByColumnName(page, 'Title', Resources.tableHeaderContextMenu.sortDescending)
      const sortedLabelTitle = page.getByTestId('sorted-label-Title')
      await expect(sortedLabelTitle).toBeVisible()

      await sortByColumnName(page, 'Status', Resources.tableHeaderContextMenu.sortDescending)
      const sortedLabelStatus = page.getByTestId('sorted-label-Status')
      await expect(sortedLabelStatus).toBeVisible()
      // Clear sort
      await sortByColumnName(page, 'Status', Resources.tableHeaderContextMenu.sortDescendingActive)

      await expect(sortedLabelTitle).toBeVisible()
      await expect(sortedLabelStatus).toBeHidden()
    })

    test('toggling sort of a second column does not remove primary sort', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'table',
      })

      await sortByColumnName(page, 'Title', Resources.tableHeaderContextMenu.sortDescending)

      // Wait for the sort to be applied
      const sortedLabelTitle = page.getByTestId('sorted-label-Title')
      await expect(sortedLabelTitle).toBeVisible()

      await sortByColumnName(page, 'Status', Resources.tableHeaderContextMenu.sortDescending)
      const sortedLabelStatus = page.getByTestId('sorted-label-Status')

      // Wait for the sort to be applied
      await expect(sortedLabelStatus).toBeVisible()
      await expect(sortedLabelStatus).toHaveAttribute('aria-label', /secondary/)

      // The other sorted label is still present
      await expect(sortedLabelTitle).toBeVisible()
      await expect(sortedLabelTitle).toHaveAttribute('aria-label', /primary/)
    })

    test('removing the primary sort promotes the secondary sort', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'table',
      })

      // Primary sort by title
      await sortByColumnName(page, 'Title', Resources.tableHeaderContextMenu.sortDescending)
      const sortedLabelTitle = page.getByTestId('sorted-label-Title')
      await expect(sortedLabelTitle).toBeVisible()

      await sortByColumnName(page, 'Status', Resources.tableHeaderContextMenu.sortDescending)

      // Secondary sort by status
      const sortedLabelStatus = page.getByTestId('sorted-label-Status')
      await expect(sortedLabelStatus).toBeVisible()

      // Clicking "sort descending" again will clear the sort
      await sortByColumnName(page, 'Title', Resources.tableHeaderContextMenu.sortDescendingActive)

      // Title sort is removed
      await expect(sortedLabelTitle).toBeHidden()
      // Secondary sort is still present
      await expect(sortedLabelStatus).toBeVisible()
    })
  })

  test('toggling sort of custom column is indicated in header', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'table',
    })

    const teamColumnId = await getTableColumnId(page, 'Team')

    await sortByColumnName(page, 'Team', Resources.tableHeaderContextMenu.sortDescending)

    // Wait for the sort to be applied
    await waitForSelectorCount(page, _(`sorted-label-${teamColumnId}`), 1)
  })

  test('hiding a different field does not remove the sort', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'table',
    })

    const teamColumnId = await getTableColumnId(page, 'Team')

    await sortByColumnName(page, 'Team', Resources.tableHeaderContextMenu.sortDescending)

    // Wait for the sort to be applied
    await waitForSelectorCount(page, _(`sorted-label-${teamColumnId}`), 1)

    const menuTrigger = await getColumnMenuTrigger(page, 'Stage')
    await menuTrigger.click()
    const hideColumnOption = getColumnHeaderMenuOption(page, 'Stage', 'Hide field')
    await hideColumnOption.click()

    // Wait for the sort to be applied
    await waitForSelectorCount(page, _(`sorted-label-${teamColumnId}`), 1)
  })
})

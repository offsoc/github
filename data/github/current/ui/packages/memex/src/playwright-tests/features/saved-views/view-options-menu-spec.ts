import {expect, type Page} from '@playwright/test'

import {Resources} from '../../../client/strings'
import {test} from '../../fixtures/test-extended'
import {mustNotFind, waitForSelectorCount} from '../../helpers/dom/assertions'
import {_} from '../../helpers/dom/selectors'
import {isGroupedBy, isNotGroupedBy, isNotSortedBy, isSortedBy} from '../../helpers/table/assertions'
import {sortByColumnName, toggleGroupBy} from '../../helpers/table/interactions'
import {getTableColumnId} from '../../helpers/table/selectors'

function getSortByLocator(page: Page) {
  return page.locator('text="Sort by:"')
}

test.describe('ViewOptionsMenu', () => {
  test.describe('visible fields', () => {
    test('it shows the visible fields option when the view is a table', async ({memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'table',
      })

      await memex.viewOptionsMenu.open()
      await expect(memex.viewOptionsMenu.VIEW_OPTIONS_MENU_VISIBLE_COLUMNS).toBeVisible()
    })
    test('it shows the visible fields option when the view is a board', async ({memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'board',
      })

      await memex.viewOptionsMenu.open()
      await expect(memex.viewOptionsMenu.VIEW_OPTIONS_MENU_VISIBLE_COLUMNS).toBeVisible()
    })
    test('it does show the markers option when the view is a roadmap', async ({memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'roadmap',
      })

      await memex.viewOptionsMenu.open()
      await expect(memex.viewOptionsMenu.VIEW_OPTIONS_MENU_MARKER_COLUMNS).toBeVisible()
    })
  })
  for (const memex_insights of [true, false]) {
    test.describe(`with memex_insights: ${memex_insights}`, () => {
      test.beforeEach(async ({memex}) => {
        await memex.navigateToStory('integrationTestsWithItems', {
          serverFeatures: {
            memex_insights,
          },
        })
      })

      test('is opens when clicking the tab navigation dropdown button', async ({memex}) => {
        await memex.viewOptionsMenu.open()
        await expect(memex.viewOptionsMenu.VIEW_OPTIONS_MENU).toBeVisible()
      })

      test('opens the add/edit columns menu when necessary', async ({page, memex}) => {
        await waitForSelectorCount(page, _('column-visibility-menu'), 0)
        await memex.viewOptionsMenu.open()
        await memex.viewOptionsMenu.VIEW_OPTIONS_MENU_VISIBLE_COLUMNS.click()

        const element = await page.waitForSelector(_('column-visibility-menu'))

        expect(element).not.toBeNull()
      })

      test('focuses the view name when clicking to rename a view', async ({page, memex}) => {
        await memex.viewOptionsMenu.open()
        await memex.viewOptionsMenu.renameViewItem().click()
        const tabNameInput = page.getByRole('textbox', {name: 'View name'})
        await expect(tabNameInput).toBeFocused()
      })

      test('sets focus back to anchor when closing rename dialog', async ({page, memex}) => {
        await memex.viewOptionsMenu.open()
        await memex.viewOptionsMenu.renameViewItem().click()
        await expect(page.getByRole('dialog', {name: 'Rename view'})).toBeVisible()
        await page.keyboard.press('Escape')
        await expect(page.getByRole('dialog', {name: 'Rename view'})).toBeHidden()
        await expect(memex.viewOptionsMenu.VIEW_OPTIONS_MENU_TOGGLE).toBeFocused()
      })

      test('It displays Group By and shows menu to choose column to group by in Table View', async ({page, memex}) => {
        await memex.viewOptionsMenu.open()
        await expect(memex.viewOptionsMenu.VIEW_OPTIONS_MENU_GROUP_BY).toContainText('none')
        await memex.viewOptionsMenu.VIEW_OPTIONS_MENU_GROUP_BY.click()

        let groupByModal = await page.waitForSelector(_('group-by-menu'))
        let statusItem = await groupByModal.waitForSelector(_('group-by-Status'))
        await statusItem.click()
        await memex.viewOptionsMenu.expectViewStateIsDirty()

        await memex.viewOptionsMenu.open()
        await expect(memex.viewOptionsMenu.VIEW_OPTIONS_MENU_GROUP_BY).toContainText('Status')
        await memex.viewOptionsMenu.VIEW_OPTIONS_MENU_GROUP_BY.click()

        await isGroupedBy(page, 'Status', 'Done')

        await saveMemexView(page)
        await memex.viewOptionsMenu.expectViewStateNotDirty()

        await memex.viewOptionsMenu.open()
        await memex.viewOptionsMenu.VIEW_OPTIONS_MENU_GROUP_BY.click()

        groupByModal = await page.waitForSelector(_('group-by-menu'))
        statusItem = await groupByModal.waitForSelector(_('group-by-Status'))
        await statusItem.click()

        await memex.viewOptionsMenu.open()

        await isNotGroupedBy(page, 'Status', 'Done')
        await memex.viewOptionsMenu.expectViewStateIsDirty()

        await saveMemexView(page)
        await memex.viewOptionsMenu.expectViewStateNotDirty()
      })

      test('It does not show group by Labels', async ({page, memex}) => {
        await memex.viewOptionsMenu.open()
        await memex.viewOptionsMenu.VIEW_OPTIONS_MENU_GROUP_BY.click()

        await expect(page.getByTestId('group-by-Labels')).toBeHidden()
      })

      test('It displays Sort By and shows menu to choose column to sort by', async ({page, memex}) => {
        await memex.viewOptionsMenu.open()
        await expect(getSortByLocator(page)).toBeVisible()

        await isNotSortedBy(page, 'Status')

        await expect(memex.viewOptionsMenu.VIEW_OPTIONS_MENU_SORTED_BY).toContainText('manual')
        await memex.viewOptionsMenu.VIEW_OPTIONS_MENU_SORTED_BY.click()

        const statusItem = page.getByTestId('sort-by-Status')
        await statusItem.click()
        await memex.viewOptionsMenu.expectViewStateIsDirty()

        await expect(memex.viewOptionsMenu.VIEW_OPTIONS_MENU_SORTED_BY).toContainText('Status')

        await isSortedBy(page, 'Status')

        await memex.viewOptionsMenu.expectViewStateIsDirty()
        await saveMemexView(page)
        await memex.viewOptionsMenu.expectViewStateNotDirty()

        await memex.viewOptionsMenu.open()
        await memex.viewOptionsMenu.VIEW_OPTIONS_MENU_SORTED_BY.click()

        await statusItem.click()
        await memex.viewOptionsMenu.expectViewStateIsDirty()

        await expect(memex.viewOptionsMenu.VIEW_OPTIONS_MENU_SORTED_BY).toContainText('Status')

        await isSortedBy(page, 'Status')

        await memex.viewOptionsMenu.expectViewStateIsDirty()
        await saveMemexView(page)
        await memex.viewOptionsMenu.expectViewStateNotDirty()

        await memex.viewOptionsMenu.open()
        await memex.viewOptionsMenu.VIEW_OPTIONS_MENU_SORTED_BY.click()

        await statusItem.click()
        await memex.viewOptionsMenu.expectViewStateIsDirty()

        await expect(memex.viewOptionsMenu.VIEW_OPTIONS_MENU_SORTED_BY).toContainText('manual')

        await isNotSortedBy(page, 'Status')

        await memex.viewOptionsMenu.expectViewStateIsDirty()
        await saveMemexView(page)
        await memex.viewOptionsMenu.expectViewStateNotDirty()
      })

      test('it supports selecting a secondary sort field', async ({page, memex}) => {
        await sortByColumnName(page, 'Status', Resources.tableHeaderContextMenu.sortAscending)
        await isSortedBy(page, 'Status')
        await memex.viewOptionsMenu.expectViewStateIsDirty()

        await memex.viewOptionsMenu.open()
        await expect(memex.viewOptionsMenu.VIEW_OPTIONS_MENU_SORTED_BY).toContainText('Status (ascending)')
        await memex.viewOptionsMenu.setSortByColumn('Title')
        await memex.viewOptionsMenu.close()
        await memex.viewOptionsMenu.close()

        await isSortedBy(page, 'Title')
        await isSortedBy(page, 'Status')

        await memex.viewOptionsMenu.open()
        await expect(memex.viewOptionsMenu.VIEW_OPTIONS_MENU_SORTED_BY).toContainText(
          'Status (ascending),  Title (ascending)',
        )
        // Click twice, one to change direction, one to clear
        await memex.viewOptionsMenu.setSortByColumn('Status')

        await memex.viewOptionsMenu.setSortByColumn('Status')

        await expect(memex.viewOptionsMenu.VIEW_OPTIONS_MENU_SORTED_BY).not.toContainText('Status (ascending)')
        await expect(memex.viewOptionsMenu.VIEW_OPTIONS_MENU_SORTED_BY).toContainText('Title')

        await isNotSortedBy(page, 'Status')
        await isSortedBy(page, 'Title')
      })

      test('it does not show roadmap date fields in table view', async ({memex}) => {
        await memex.viewOptionsMenu.open()
        await expect(memex.viewOptionsMenu.ROADMAP_DATE_FIELDS).toBeHidden()
      })

      test('saves a view on a custom field sort and grouping', async ({page, memex}) => {
        await toggleGroupBy(page, 'Stage')
        await sortByColumnName(page, 'Team')

        await isGroupedBy(page, 'Stage', 'Closed')

        const teamColumnId = await getTableColumnId(page, 'Team')

        await sortByColumnName(page, 'Team', Resources.tableHeaderContextMenu.sortDescending)

        // Wait for the sort to be applied
        await waitForSelectorCount(page, _(`sorted-label-${teamColumnId}`), 1)
        await isSortedBy(page, teamColumnId)

        await memex.viewOptionsMenu.expectViewStateIsDirty()
        await memex.viewOptionsMenu.open()
        await saveMemexView(page)
        await memex.viewOptionsMenu.expectViewStateNotDirty()

        await isSortedBy(page, teamColumnId)
        await isGroupedBy(page, 'Stage', 'Closed')
      })

      test('it resets the dirty state when reset is clicked', async ({page, memex}) => {
        // just sort
        await sortByColumnName(page, 'Status', Resources.tableHeaderContextMenu.sortAscending)
        await isSortedBy(page, 'Status')
        await memex.viewOptionsMenu.expectViewStateIsDirty()

        await memex.viewOptionsMenu.open()
        await memex.viewOptionsMenu.RESET_CHANGES.click()
        await memex.viewOptionsMenu.expectViewStateNotDirty()
        await isNotSortedBy(page, 'Status')

        // just group
        await toggleGroupBy(page, 'Status')
        await isGroupedBy(page, 'Status', 'Done')
        await memex.viewOptionsMenu.expectViewStateIsDirty()

        await memex.viewOptionsMenu.open()
        await memex.viewOptionsMenu.RESET_CHANGES.click()
        await memex.viewOptionsMenu.expectViewStateNotDirty()
        await isNotGroupedBy(page, 'Status', 'Done')

        // both sorting and grouping
        await sortByColumnName(page, 'Status', Resources.tableHeaderContextMenu.sortAscending)
        await isSortedBy(page, 'Status')
        await toggleGroupBy(page, 'Status')
        await isGroupedBy(page, 'Status', 'Done')
        await memex.viewOptionsMenu.expectViewStateIsDirty()

        await memex.viewOptionsMenu.open()
        await memex.viewOptionsMenu.RESET_CHANGES.click()
        await memex.viewOptionsMenu.expectViewStateNotDirty()
        await isNotSortedBy(page, 'Status')
        await isNotGroupedBy(page, 'Status', 'Done')
      })

      test('duplicates a view', async ({memex}) => {
        const initialTabNavItems = await memex.views.VIEW_TABS.count()
        await memex.viewOptionsMenu.open()
        await memex.viewOptionsMenu.duplicateViewItem().click()

        await expect(memex.views.VIEW_TABS).toHaveCount(initialTabNavItems + 1)
      })

      test('deletes a view', async ({page, memex}) => {
        await memex.views.createNewView()

        await expect(memex.views.VIEW_TABS).toHaveCount(2)

        await memex.viewOptionsMenu.open()

        await memex.viewOptionsMenu.deleteViewItem().click()

        const deleteConfirm = await page.waitForSelector('button >> text=Delete')
        await deleteConfirm.click()
        await expect(memex.views.VIEW_TABS).toHaveCount(1)
        await expect(memex.viewOptionsMenu.VIEW_OPTIONS_MENU_TOGGLE).toBeFocused()
      })

      test('opens delete view modal but does not delete', async ({page, memex}) => {
        await memex.views.createNewView()

        await expect(memex.views.VIEW_TABS).toHaveCount(2)

        await memex.viewOptionsMenu.open()

        await memex.viewOptionsMenu.deleteViewItem().click()

        const deleteCancel = await page.waitForSelector('button >> text=Cancel')
        await deleteCancel.click()
        await expect(memex.views.VIEW_TABS).toHaveCount(2)
        await expect(memex.viewOptionsMenu.VIEW_OPTIONS_MENU_TOGGLE).toBeFocused()
      })

      if (memex_insights) {
        test('It has the Generate chart item in the list', async ({page, memex}) => {
          await memex.filter.filterBy('some-filter')
          await memex.viewOptionsMenu.open()
          await memex.viewOptionsMenu.showInsightsItem().click()

          await page.waitForSelector(_('insights-page'))
          expect(await memex.filter.INPUT.inputValue()).toEqual('some-filter')
        })
      }
    })

    test.describe(`with memex_insights: ${memex_insights}`, () => {
      test.beforeEach(async ({memex}) => {
        await memex.navigateToStory('integrationTestsWithItems', {
          serverFeatures: {
            memex_insights,
          },
          viewType: 'board',
        })
      })

      test('it does show sort by in board view', async ({page, memex}) => {
        await memex.viewOptionsMenu.open()
        await expect(getSortByLocator(page)).toBeVisible()
      })

      test('it does not show roadmap date fields in board view', async ({memex}) => {
        await memex.viewOptionsMenu.open()
        await expect(memex.viewOptionsMenu.ROADMAP_DATE_FIELDS).toBeHidden()
      })

      test('It shows the correct menu options for group by in board view', async ({page, memex}) => {
        await memex.boardView.expectVisible()

        await memex.viewOptionsMenu.open()
        await expect(memex.viewOptionsMenu.VIEW_OPTIONS_MENU_COLUMN_BY).toContainText('Status')
        await memex.viewOptionsMenu.VIEW_OPTIONS_MENU_COLUMN_BY.click()

        const groupByModal = await page.waitForSelector(_('group-by-menu'))
        const groupByOptions = (await groupByModal.innerText())
          .trim()
          .split('\n')
          .slice(1)
          .filter(x => x !== '') // doing this extra filtering for webkit as it has empty lines in between

        // for now, we're only testing to make sure we get the correct options in group by menu for board view
        expect(groupByOptions.length).toBe(4)
        expect(groupByOptions[0]).toBe('Status')
        expect(groupByOptions[1]).toBe('Stage')
        expect(groupByOptions[2]).toBe('Aardvarks')
        expect(groupByOptions[3]).toBe('Neon Alpacas')
      })

      test('It groups the board by the selected vertical groupby menu item', async ({page, memex}) => {
        await memex.boardView.expectVisible()

        await memex.viewOptionsMenu.open()
        await expect(memex.viewOptionsMenu.VIEW_OPTIONS_MENU_COLUMN_BY).toContainText('Status')
        await memex.viewOptionsMenu.VIEW_OPTIONS_MENU_COLUMN_BY.click()

        await page.waitForSelector(_('group-by-menu'))
        const groupByStage = await page.waitForSelector(_('group-by-Stage'))
        await groupByStage.click()

        const titleTexts = memex.boardView.COLUMN_TITLE_TEXTS

        const noStageColumnTitle = await titleTexts.nth(0).textContent()
        const onHoldColumnTitle = await titleTexts.nth(1).textContent()
        const upNextColumnTitle = await titleTexts.nth(2).textContent()

        await memex.boardView.getColumn(noStageColumnTitle).expectVisible()
        await memex.boardView.getColumn(onHoldColumnTitle).expectVisible()
        await memex.boardView.getColumn(upNextColumnTitle).expectVisible()
      })
    })
  }

  test('By default it has the show-insights item in the list', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      serverFeatures: {
        memex_insights: false,
      },
    })
    await memex.filter.filterBy('some-filter')
    await memex.viewOptionsMenu.open()
    await memex.viewOptionsMenu.showInsightsItem().click()

    await page.waitForSelector(_('insights-page'))
    expect(await memex.filter.INPUT.inputValue()).toEqual('some-filter')
  })

  test('If memex_table_without_limits is enabled, it does not have the show-insights item in the list', async ({
    memex,
  }) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      serverFeatures: {
        memex_table_without_limits: true,
      },
    })
    await memex.filter.filterBy('some-filter')
    await memex.viewOptionsMenu.open()
    await expect(memex.viewOptionsMenu.showInsightsItem()).toBeHidden()
  })

  test('Does not show show-insights item in the list for users without write permissions', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsInReadonlyMode', {
      serverFeatures: {
        memex_insights: false,
      },
    })

    await memex.viewOptionsMenu.open()
    await mustNotFind(page, _('view-options-menu-item-show-insights'))
  })
})

async function saveMemexView(page: Page) {
  await page.getByTestId('view-options-menu-save-changes-button').click()
}

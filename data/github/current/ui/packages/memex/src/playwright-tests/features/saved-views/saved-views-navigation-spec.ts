import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'
import {waitForSelectorCount} from '../../helpers/dom/assertions'
import {_} from '../../helpers/dom/selectors'
import {sortByColumnName} from '../../helpers/table/interactions'
import {eventually} from '../../helpers/utils'

test.describe('ViewNavigation [Saved Views]', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
  })

  test('Views can be navigated through', async ({page, memex}) => {
    await memex.views.createNewView()
    await eventually(() => expect(new URL(page.url()).pathname).toMatch(/\/views\/100$/))
    await memex.views.VIEW_TABS.first().click()
    await eventually(() => expect(new URL(page.url()).pathname).toMatch(/\/views\/1$/))
  })

  test('A view can be created as a table', async ({page, memex}) => {
    await expect(memex.views.VIEW_TABS).toHaveCount(1)

    await memex.views.createNewView('Table')
    await waitForSelectorCount(page, _('view-navigation-view-tab-link'), 2)
    await expect(memex.views.VIEW_TABS).toHaveCount(2)
    await memex.tableView.expectVisible()
  })

  test('A view can be created as a board', async ({page, memex}) => {
    await expect(memex.views.VIEW_TABS).toHaveCount(1)

    await memex.views.createNewView('Board')
    await waitForSelectorCount(page, _('view-navigation-view-tab-link'), 2)
    await expect(memex.views.VIEW_TABS).toHaveCount(2)
    await memex.boardView.expectVisible()
  })

  test('A view can be created as a roadmap', async ({page, memex}) => {
    await expect(memex.views.VIEW_TABS).toHaveCount(1)

    await memex.views.createNewView('Roadmap')
    await waitForSelectorCount(page, _('view-navigation-view-tab-link'), 2)
    await expect(memex.views.VIEW_TABS).toHaveCount(2)
    await memex.roadmapPage.expectVisible()
  })

  test('Stats are sent when view is created', async ({memex}) => {
    await memex.views.createNewView()

    await memex.stats.expectStatsToContain({
      memexProjectViewNumber: 1,
      name: 'view_create',
      ui: 'tab navigation',
      context: 'table',
    })
  })

  test('A view name can be updated', async ({memex, page}) => {
    await memex.views.showViewTabRenameInput(0)

    await expect(memex.views.getViewTabRenameInput(0)).toHaveAttribute('value', 'View 1')

    const updateRequests = []
    page.on('request', request => {
      if (request.url().endsWith('mock-memex-view-update-api-data-url')) {
        updateRequests.push(request)
      }
    })

    await memex.views.getViewTabRenameInput(0).focus()

    await memex.views.getViewTabRenameInput(0).selectText()
    await memex.views.getViewTabRenameInput(0).type('New View Name')
    await memex.views.getViewTabRenameInput(0).press('Enter')

    await expect(memex.views.VIEW_TABS.nth(0)).toHaveText('New View Name')
    expect(updateRequests).toHaveLength(1)
  })

  test('Unsaved view keep its state when navigate away from it', async ({page, memex}) => {
    await expect(memex.views.VIEW_TABS).toHaveCount(1)

    await sortByColumnName(page, 'Title')
    await page.waitForSelector(_('view-options-dirty'))

    await waitForSelectorCount(page, _('sorted-label-Title'), 1)

    await memex.views.createNewView()

    await expect(memex.views.VIEW_TABS).toHaveCount(2)

    await waitForSelectorCount(page, _('sorted-label-Title'), 0)

    await memex.views.VIEW_TABS.nth(0).click()

    await waitForSelectorCount(page, _('sorted-label-Title'), 1)
  })
})

test.describe.parallel('focus selected view', () => {
  test('view 42 is in the frame', async ({memex, page}) => {
    await memex.navigateToStory('integrationTests42Views')
    await expect(page.getByTestId('view-navigation-view-tab-link').nth(41)).toBeVisible()
  })
})

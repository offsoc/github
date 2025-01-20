import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'
import {eventually} from '../../helpers/utils'

test.describe('View Navigation', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'table',
    })

    await memex.views.createNewView()
    await memex.views.createNewView()
    await memex.views.createNewView()
    await memex.views.createNewView()
  })

  test('move view to correct position when view is dropped after another view', async ({memex}) => {
    expect(await memex.views.getNames()).toEqual(['View 1', 'View 100', 'View 101', 'View 102', 'View 103'])

    await memex.views.dragView(memex.views.VIEW_TABS.nth(1), 'before', memex.views.VIEW_TABS.nth(3))

    await eventually(async () => {
      expect(await memex.views.getNames()).toEqual(['View 1', 'View 101', 'View 100', 'View 102', 'View 103'])
    })
  })

  test('move view to correct position when view is dropped before another view', async ({memex}) => {
    expect(await memex.views.getNames()).toEqual(['View 1', 'View 100', 'View 101', 'View 102', 'View 103'])

    await memex.views.dragView(memex.views.VIEW_TABS.nth(2), 'before', memex.views.VIEW_TABS.nth(1))

    await eventually(async () => {
      expect(await memex.views.getNames()).toEqual(['View 1', 'View 101', 'View 100', 'View 102', 'View 103'])
    })
  })

  test('move view to front when view is dropped before the first view', async ({memex}) => {
    expect(await memex.views.getNames()).toEqual(['View 1', 'View 100', 'View 101', 'View 102', 'View 103'])

    await memex.views.dragView(memex.views.VIEW_TABS.nth(2), 'before', memex.views.VIEW_TABS.first())

    await eventually(async () =>
      expect(await memex.views.getNames()).toEqual(['View 101', 'View 1', 'View 100', 'View 102', 'View 103']),
    )
  })

  test('move view to end when view is dropped after the last view', async ({memex}) => {
    expect(await memex.views.getNames()).toEqual(['View 1', 'View 100', 'View 101', 'View 102', 'View 103'])

    await memex.views.dragView(memex.views.VIEW_TABS.nth(2), 'after', memex.views.VIEW_TABS.last())

    await eventually(async () =>
      expect(await memex.views.getNames()).toEqual(['View 1', 'View 100', 'View 102', 'View 103', 'View 101']),
    )
  })

  // Regression test for #6554
  test('unsaved changes are not lost when reordering view', async ({memex}) => {
    const viewToChange = memex.views.VIEW_TABS.nth(2)
    await viewToChange.click()

    // Make any change to the view to make it 'dirty'
    await memex.viewOptionsMenu.switchToBoardView()

    await memex.views.expectViewToHaveUnsavedChanges()

    // Drag the view to a different position. Should not lose the in-memory changes (to board view)
    await memex.views.dragView(viewToChange, 'after', memex.views.VIEW_TABS.nth(3))

    await eventually(async () =>
      expect(await memex.views.getNames()).toEqual(['View 1', 'View 100', 'View 102', 'View 101', 'View 103']),
    )

    await memex.views.expectViewToHaveUnsavedChanges()
  })

  // Regression test for #16920
  test('view tab has overflow:hidden when deselected', async ({memex}) => {
    expect(await memex.views.getNames()).toEqual(['View 1', 'View 100', 'View 101', 'View 102', 'View 103'])

    // Verify that before the tab is navigated to, it has overflow:hidden
    await memex.views.expectViewTabToHaveOverflowHidden(2)

    //Select the tab and verify that the input is visible
    await memex.views.showViewTabRenameInput(2)
    await expect(memex.views.getViewTabRenameInput(2)).toHaveAttribute('value', 'View 101')

    //Select a different tab
    await memex.views.showViewTabRenameInput(0)
    await expect(memex.views.getViewTabRenameInput(0)).toHaveAttribute('value', 'View 1')

    // Verify that overflow:hidden is put back on the tab
    await memex.views.expectViewTabToHaveOverflowHidden(2)
  })
})

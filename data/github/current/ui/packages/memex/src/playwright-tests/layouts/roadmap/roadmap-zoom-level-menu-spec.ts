import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'

test('should display persisted zoom level in the menu', async ({memex}) => {
  await memex.navigateToStory('appWithRoadmapLayout')

  // Month is selected by default
  await memex.viewOptionsMenu.open()
  await expect(memex.viewOptionsMenu.ROADMAP_ZOOM_LEVEL).toHaveText('Zoom level: Month')
})

test('should allow selecting a target zoom level from view options menu', async ({memex}) => {
  await memex.navigateToStory('appWithRoadmapLayout')

  // Month should be initially selected
  await memex.viewOptionsMenu.open()
  await memex.viewOptionsMenu.ROADMAP_ZOOM_LEVEL.click()
  await expect(memex.viewOptionsMenu.ROADMAP_ZOOM_LEVEL_MENU.getByRole('menuitemradio', {name: 'Month'})).toBeChecked()

  // Change to year
  await memex.viewOptionsMenu.ROADMAP_ZOOM_LEVEL_MENU.getByRole('menuitemradio', {name: 'Year'}).click()

  // Now year should be selected
  await expect(memex.viewOptionsMenu.ROADMAP_ZOOM_LEVEL).toHaveText('Zoom level: Year')

  await memex.viewOptionsMenu.ROADMAP_ZOOM_LEVEL.click()
  await expect(memex.viewOptionsMenu.ROADMAP_ZOOM_LEVEL_MENU.getByRole('menuitemradio', {name: 'Year'})).toBeChecked()
})

test('should allow selecting a target zoom level from toolbar', async ({memex}) => {
  await memex.navigateToStory('appWithRoadmapLayout')

  await memex.roadmapPage.ROADMAP_CONTROL_ZOOM.click()
  await expect(memex.roadmapPage.ROADMAP_CONTROL_ZOOM_MENU.getByRole('menuitemradio', {name: 'Month'})).toBeChecked()
  await memex.roadmapPage.ROADMAP_CONTROL_ZOOM_MENU.getByRole('menuitemradio', {name: 'Year'}).click()

  await memex.roadmapPage.ROADMAP_CONTROL_ZOOM.click()
  await expect(memex.roadmapPage.ROADMAP_CONTROL_ZOOM_MENU.getByRole('menuitemradio', {name: 'Year'})).toBeChecked()

  // Now year should be selected
  await memex.viewOptionsMenu.open()
  await expect(memex.viewOptionsMenu.ROADMAP_ZOOM_LEVEL).toHaveText('Zoom level: Year')
})

test('switching to roadmap view should not result in dirty state for project with no persisted zoom level', async ({
  memex,
}) => {
  await memex.navigateToStory('integrationTestsWithItems')

  await memex.viewOptionsMenu.expectViewStateNotDirty()

  // Switch to roadmap view and save
  await memex.viewOptionsMenu.switchToRoadmapView()
  await memex.viewOptionsMenu.saveChanges()

  await memex.viewOptionsMenu.expectViewStateNotDirty()

  await memex.viewOptionsMenu.open()
  // Clicking on "Month" should not result in dirty state
  await memex.viewOptionsMenu.ROADMAP_ZOOM_LEVEL.click()
  await memex.viewOptionsMenu.ROADMAP_ZOOM_LEVEL_MENU.getByRole('menuitemradio', {name: 'Year'}).click()
  await memex.viewOptionsMenu.expectViewStateIsDirty()

  // Changing back to month should result in not dirty state
  await memex.viewOptionsMenu.ROADMAP_ZOOM_LEVEL.click()
  await memex.viewOptionsMenu.ROADMAP_ZOOM_LEVEL_MENU.getByRole('menuitemradio', {name: 'Month'}).click()
  await memex.viewOptionsMenu.expectViewStateNotDirty()
})

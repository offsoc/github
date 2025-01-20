import {expect, type Locator, type Page} from '@playwright/test'

import {test} from '../../fixtures/test-extended'

const getPopoverWithDateFieldText = (page: Page): Locator => {
  return page.getByText(
    "We've selected an existing date field in your project to get started. You can change the fields used here.",
  )
}

test.describe('getting started popover', () => {
  test('shows no date fields message when no date fields are configured', async ({memex, page}) => {
    await memex.navigateToStory('appWithReasonField', {
      viewType: 'roadmap',
    })

    await expect(
      page.getByText('Your project needs at least one date or iteration field to get started.'),
    ).toBeVisible()

    // Clicking the button opens the field configuration menu
    await page.getByText('Got it!').click()

    await expect(page.getByRole('menuitem', {name: 'New field'})).toBeVisible()
    await expect(page.getByRole('group', {name: 'Start date'})).toBeVisible()
    await expect(page.getByRole('group', {name: 'Target date'})).toBeVisible()

    // Adding a new field should make it go away
    await page.getByRole('menuitem', {name: 'New field'}).click()
    await page.keyboard.type('Date')
    await page.keyboard.press('Enter')

    // Go to a different page and come back
    await memex.topBarNavigation.INSIGHTS_NAV_BUTTON.click()
    await page.goBack()

    await expect(page.getByText('Your project needs at least one date or iteration field to get started.')).toBeHidden()
  })

  test('shows preselected fields message on first load', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems')

    await memex.viewOptionsMenu.switchToRoadmapView()

    await expect(getPopoverWithDateFieldText(page)).toBeVisible()

    // Now, check that the message is not shown after persisting the changes
    await page.getByText('Got it!').click()

    await memex.viewOptionsMenu.saveChanges()

    // Switch to another view type
    await memex.viewOptionsMenu.switchToBoardView()
    await memex.viewOptionsMenu.saveChanges()
    await memex.viewOptionsMenu.switchToRoadmapView()

    await expect(getPopoverWithDateFieldText(page)).toBeHidden()
  })

  test('it prepopulates dates when accessing roadmap via URL params', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems', {viewType: 'roadmap'})

    // Popover is shown and date fields are dirty
    await expect(getPopoverWithDateFieldText(page)).toBeVisible()

    // Save the view using the preselected date fields
    await page.getByText('Got it!').click()
    await expect(memex.roadmapPage.ROADMAP_CONTROLS_DATE_FIELDS_DIRTY).toBeVisible()
    await memex.viewOptionsMenu.saveChanges()
    await expect(memex.roadmapPage.ROADMAP_CONTROLS_DATE_FIELDS_DIRTY).toBeHidden()

    await memex.roadmapPage.dateFieldStart('Due Date').click()
    await memex.roadmapPage.ROADMAP_DATE_FIELDS_MENU_NO_END.click()

    // Dirty indicator is not present
    await expect(memex.roadmapPage.ROADMAP_CONTROLS_DATE_FIELDS_DIRTY).toBeHidden()
  })

  test('it stays dismissed when switching between dirty tabs', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems')

    // Create 2 new Roadmap views and confirm the popover is visible in both
    await memex.views.createNewView()
    await expect(memex.views.ACTIVE_TAB).toHaveText('View 100')
    await memex.viewOptionsMenu.switchToRoadmapView()
    await expect(getPopoverWithDateFieldText(page)).toBeVisible()

    await memex.views.createNewView()
    await expect(memex.views.ACTIVE_TAB).toHaveText('View 101')
    await memex.viewOptionsMenu.switchToRoadmapView()
    await expect(getPopoverWithDateFieldText(page)).toBeVisible()

    // Switch to the first view, confirm the popover is visible, then dismiss it
    await memex.views.VIEW_TAB_LIST.locator('text=View 100').click()
    await expect(getPopoverWithDateFieldText(page)).toBeVisible()
    await page.getByText('Got it!').click()
    await expect(getPopoverWithDateFieldText(page)).toBeHidden()

    // Switch to the second view and confirm the popover is still visible
    await memex.views.VIEW_TAB_LIST.locator('text=View 101').click()
    await expect(getPopoverWithDateFieldText(page)).toBeVisible()

    // Switch to the first view and confirm the popover is still dismissed
    await memex.views.VIEW_TAB_LIST.locator('text=View 100').click()
    await expect(getPopoverWithDateFieldText(page)).toBeHidden()
  })
})

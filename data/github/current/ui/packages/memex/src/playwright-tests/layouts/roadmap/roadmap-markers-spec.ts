import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'

test.describe('Roadmap markers', () => {
  test.describe('Iteration Markers', () => {
    test.beforeEach(async ({memex, page}) => {
      await memex.navigateToStory('appWithRoadmapLayout')
      await memex.roadmapPage.ROADMAP_CONTROLS_MARKERS.click()
      await memex.roadmapPage.ROADMAP_MARKERS_MENU.getByRole('menuitemcheckbox', {
        name: 'Iteration',
        exact: true,
      }).click()
      await page.keyboard.press('Escape')
    })

    test('current iteration markers are visible', async ({memex}) => {
      await expect(memex.roadmapPage.iterationMarkerNub('iteration-4')).toBeVisible()
      await expect(memex.roadmapPage.iterationMarkerHeader('iteration-4')).toBeVisible()
    })

    test('completed iteration markers are visible', async ({memex, page}) => {
      await page.mouse.wheel(-300, 0)

      await expect(memex.roadmapPage.iterationMarkerNub('iteration-3')).toBeVisible()
      await expect(memex.roadmapPage.iterationMarkerHeader('iteration-3')).toBeVisible()
    })

    test('planned iteration markers are visible', async ({memex, page}) => {
      await page.mouse.wheel(300, 0)

      await expect(memex.roadmapPage.iterationMarkerNub('iteration-5')).toBeVisible()
      await expect(memex.roadmapPage.iterationMarkerHeader('iteration-5')).toBeVisible()
    })

    test('iteration breaks are rendered as markers', async ({memex, page}) => {
      // add a break
      await memex.projectSettingsPage.navigateToSettingsForCustomField('Iteration')
      await expect(page.getByTestId('add-break-button').first()).toBeVisible()
      await page.getByTestId('add-break-button').nth(1).click()
      await page.getByTestId('iteration-field-settings-save').click()
      // return to roadmap
      await memex.topBarNavigation.RETURN_TO_PROJECT_VIEW.click()
      await expect(memex.roadmapPage.iterationMarkerNub('iteration-4')).toBeVisible()
      await expect(memex.roadmapPage.iterationMarkerHeader('iteration-4')).toBeVisible()
      await page.mouse.wheel(300, 0)
      // verify that the break marker is rendered
      await expect(memex.roadmapPage.iterationBreakMarkerNub('break-iteration-4-iteration-5')).toBeVisible()
      await expect(memex.roadmapPage.iterationMarkerHeader('break-iteration-4-iteration-5')).toBeVisible()
    })

    test('multiple iteration markers appear stacked', async ({memex, page}) => {
      await memex.roadmapPage.ROADMAP_CONTROLS_MARKERS.click()
      await memex.roadmapPage.ROADMAP_MARKERS_MENU.getByRole('menuitemcheckbox', {name: '3W Iteration'}).click()
      await page.keyboard.press('Escape')

      await expect(memex.roadmapPage.iterationMarkerHeader('iteration-5')).toBeVisible()
      await expect(memex.roadmapPage.iterationMarkerHeader('iteration-5')).toHaveText(/2 iterations/)

      await memex.roadmapPage.iterationMarkerHeader('iteration-5').getByRole('button').click()

      await expect(memex.roadmapPage.ITERATION_MARKER_SELECTOR.getByRole('menuitem').nth(0)).toHaveText(/Iteration 5/)
      await expect(memex.roadmapPage.ITERATION_MARKER_SELECTOR.getByRole('menuitem').nth(1)).toHaveText(
        /3W Iteration 1/,
      )
    })

    test('iteration markers can be toggled off/on through the markers menu', async ({memex}) => {
      await expect(memex.roadmapPage.iterationMarkerNub('iteration-4')).toBeVisible()
      await expect(memex.roadmapPage.iterationMarkerHeader('iteration-4')).toBeVisible()
      await memex.roadmapPage.ROADMAP_CONTROLS_MARKERS.click()
      await memex.roadmapPage.ROADMAP_MARKERS_MENU.getByRole('menuitemcheckbox', {
        name: 'Iteration',
        exact: true,
      }).click()
      await expect(memex.roadmapPage.iterationMarkerNub('iteration-4')).toBeHidden()
      await expect(memex.roadmapPage.iterationMarkerHeader('iteration-4')).toBeHidden()
    })
  })

  test.describe('Milestone markers', () => {
    test('displays markers', async ({memex, page}) => {
      await memex.navigateToStory('appWithRoadmapLayout')
      await memex.roadmapPage.ROADMAP_CONTROLS_MARKERS.click()
      await memex.roadmapPage.ROADMAP_MARKERS_MENU.getByRole('menuitemcheckbox', {name: 'Milestone'}).click()
      await page.keyboard.press('Escape')
      await expect(memex.roadmapPage.MILESTONE_MARKER_HEADERS).toHaveCount(3)
    })

    test('multiple milestones can be grouped into a single marker', async ({memex, page}) => {
      await memex.navigateToStory('appWithRoadmapLayout')
      await memex.roadmapPage.ROADMAP_CONTROLS_MARKERS.click()
      await memex.roadmapPage.ROADMAP_MARKERS_MENU.getByRole('menuitemcheckbox', {name: 'Milestone'}).click()
      await page.keyboard.press('Escape')

      await expect(memex.roadmapPage.MILESTONE_MARKER_HEADERS.getByText('2 milestones')).toBeVisible()
      await memex.roadmapPage.MILESTONE_MARKER_HEADERS.getByText('2 milestones').click()
      await expect(memex.roadmapPage.MILESTONE_MARKER_SELECTOR).toBeVisible()
      await expect(memex.roadmapPage.MILESTONE_MARKER_SELECTOR.getByRole('listitem')).toHaveCount(2)
    })

    test('can be toggled off/on through the markers menu', async ({memex, page}) => {
      await memex.navigateToStory('appWithRoadmapLayout')

      await expect(memex.roadmapPage.MILESTONE_MARKER_HEADERS).toBeHidden()

      await memex.roadmapPage.ROADMAP_CONTROLS_MARKERS.click()
      await memex.roadmapPage.ROADMAP_MARKERS_MENU.getByRole('menuitemcheckbox', {name: 'Milestone'}).click()
      await page.keyboard.press('Escape')

      await expect(memex.roadmapPage.MILESTONE_MARKER_HEADERS).toHaveCount(3)

      await memex.roadmapPage.ROADMAP_CONTROLS_MARKERS.click()
      await memex.roadmapPage.ROADMAP_MARKERS_MENU.getByRole('menuitemcheckbox', {name: 'Milestone'}).click()
      await page.keyboard.press('Escape')

      await expect(memex.roadmapPage.MILESTONE_MARKER_HEADERS).toBeHidden()
    })
  })

  test.describe('Custom-date markers', () => {
    test('markers are visible & controls enabled when they are selected date-fields', async ({memex, page}) => {
      await memex.navigateToStory('appWithRoadmapLayout')

      await memex.roadmapPage.ROADMAP_CONTROLS_DATE_FIELDS.click()
      await memex.roadmapPage.dateFieldStart('Start Date').click()
      await memex.roadmapPage.dateFieldEnd('End Date').click()
      await page.keyboard.press('Escape')

      await memex.roadmapPage.ROADMAP_CONTROLS_MARKERS.click()
      await memex.roadmapPage.ROADMAP_MARKERS_MENU.getByRole('menuitemcheckbox', {name: 'Start Date'}).click()
      await memex.roadmapPage.ROADMAP_MARKERS_MENU.getByRole('menuitemcheckbox', {name: 'Due Date'}).click()
      await memex.roadmapPage.ROADMAP_MARKERS_MENU.getByRole('menuitemcheckbox', {name: 'End Date'}).click()
      await expect(
        memex.roadmapPage.ROADMAP_MARKERS_MENU.getByRole('menuitemcheckbox', {name: 'Start Date'}),
      ).toBeEnabled()
      await expect(
        memex.roadmapPage.ROADMAP_MARKERS_MENU.getByRole('menuitemcheckbox', {name: 'Start Date'}),
      ).toBeChecked()
      await expect(
        memex.roadmapPage.ROADMAP_MARKERS_MENU.getByRole('menuitemcheckbox', {name: 'End Date'}),
      ).toBeEnabled()
      await expect(
        memex.roadmapPage.ROADMAP_MARKERS_MENU.getByRole('menuitemcheckbox', {name: 'End Date'}),
      ).toBeChecked()
      await expect(
        memex.roadmapPage.ROADMAP_MARKERS_MENU.getByRole('menuitemcheckbox', {name: 'Due Date'}),
      ).toBeChecked()
      await expect(
        memex.roadmapPage.ROADMAP_MARKERS_MENU.getByRole('menuitemcheckbox', {name: 'Due Date'}),
      ).toBeEnabled()
      await page.keyboard.press('Escape')

      // the actual number can change based on the number of days in a month
      await expect(memex.roadmapPage.CUSTOM_DATE_MARK_LINE.first()).toBeVisible()
      expect(await memex.roadmapPage.CUSTOM_DATE_MARK_LINE.count()).toBeGreaterThan(1)
    })

    test('markers are visible & controls enabled when they are not selected date-fields', async ({memex, page}) => {
      await memex.navigateToStory('appWithRoadmapLayout')

      await memex.roadmapPage.ROADMAP_CONTROLS_DATE_FIELDS.click()
      await memex.roadmapPage.dateFieldStart('Iteration').click()
      await memex.roadmapPage.dateFieldEnd('Iteration').click()
      await page.keyboard.press('Escape')

      await memex.roadmapPage.ROADMAP_CONTROLS_MARKERS.click()
      await memex.roadmapPage.ROADMAP_MARKERS_MENU.getByRole('menuitemcheckbox', {name: 'Start Date'}).click()
      await memex.roadmapPage.ROADMAP_MARKERS_MENU.getByRole('menuitemcheckbox', {name: 'Due Date'}).click()
      await memex.roadmapPage.ROADMAP_MARKERS_MENU.getByRole('menuitemcheckbox', {name: 'End Date'}).click()
      await expect(
        memex.roadmapPage.ROADMAP_MARKERS_MENU.getByRole('menuitemcheckbox', {name: 'Start Date'}),
      ).toBeEnabled()
      await expect(
        memex.roadmapPage.ROADMAP_MARKERS_MENU.getByRole('menuitemcheckbox', {name: 'Start Date'}),
      ).toBeChecked()
      await expect(
        memex.roadmapPage.ROADMAP_MARKERS_MENU.getByRole('menuitemcheckbox', {name: 'End Date'}),
      ).toBeEnabled()
      await expect(
        memex.roadmapPage.ROADMAP_MARKERS_MENU.getByRole('menuitemcheckbox', {name: 'End Date'}),
      ).toBeChecked()

      // the actual number can change based on the number of days in a month
      await expect(memex.roadmapPage.CUSTOM_DATE_MARK_LINE.first()).toBeVisible()
      expect(await memex.roadmapPage.CUSTOM_DATE_MARK_LINE.count()).toBeGreaterThan(1)
    })
  })
})

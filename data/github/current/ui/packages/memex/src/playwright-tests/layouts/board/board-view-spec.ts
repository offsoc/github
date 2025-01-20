import {expect} from '@playwright/test'

import type {MemexApp} from '../../fixtures/memex-app'
import {test} from '../../fixtures/test-extended'
import {tomorrowString} from '../../helpers/dates'
import {_} from '../../helpers/dom/selectors'
import {getColumnVisibilityMenuOption} from '../../helpers/table/selectors'
import {MissingStatusColumn} from '../../types/board'

test.describe('Board view', () => {
  test('renders columns with matching number of items', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })

    await memex.boardView.getColumn(MissingStatusColumn.Label).expectCardCount(3)
    await memex.boardView.getColumn(MissingStatusColumn.Label).expectCountInCounterLabel(3)
    await memex.boardView.getColumn('Backlog').expectCardCount(2)
    await memex.boardView.getColumn('Backlog').expectCountInCounterLabel(2)
    await memex.boardView.getColumn('Ready').expectCardCount(0)
    await memex.boardView.getColumn('Ready').expectCountInCounterLabel(0)
    await memex.boardView.getColumn('In Progress').expectCardCount(0)
    await memex.boardView.getColumn('In Progress').expectCountInCounterLabel(0)
    await memex.boardView.getColumn('Done').expectCardCount(3)
    await memex.boardView.getColumn('Done').expectCountInCounterLabel(3)
  })

  test('clicking on a draft issue title (with meta key) opens the side panel', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })

    await memex.boardView
      .getCard(MissingStatusColumn.Label, 0)
      .getSidePanelTrigger()
      .click({modifiers: ['Meta']})

    // Expect the item pane to be visible
    await expect(memex.sidePanel.getDraftSidePanel('Here is a Draft Issue!')).toBeVisible()
  })

  test('renders columns with matching number of items for an empty memex', async ({memex}) => {
    await memex.navigateToStory('integrationTestsEmpty', {
      viewType: 'board',
    })

    // MissingStatusColumn is hidden when the column is empty
    // https://github.com/github/memex/issues/4395
    await memex.boardView.getColumn('Backlog').expectCardCount(0)
    await memex.boardView.getColumn('Ready').expectCardCount(0)
    await memex.boardView.getColumn('In Progress').expectCardCount(0)
    await memex.boardView.getColumn('Done').expectCardCount(0)

    await memex.boardView.getColumn(MissingStatusColumn.Label).expectHidden()
  })

  test('Column options can be edited by using the column context menu', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })

    await memex.boardView.getColumn('Backlog').openContextMenu()
    await memex.boardView.COLUMN_MENU('Backlog').getByRole('menuitem', {name: 'Edit details'}).click()

    await memex.editOptionDialog.NAME_INPUT.fill('Backlog (old)')

    await memex.editOptionDialog.SAVE_BUTTON.click()

    await memex.boardView.getColumn('Backlog (old)').expectVisible()
  })

  test.describe('Display labels in board view for all visible fields that have a value', () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'board',
      })
    })

    test('The selected group by field is not included as a label', async ({page, memex}) => {
      // Verify that the vertical group by field is Status
      await memex.viewOptionsMenu.open()
      await expect(memex.viewOptionsMenu.VIEW_OPTIONS_MENU_COLUMN_BY).toContainText('Status')

      // Ensure Status is not included in labels
      const originalLabels = await memex.boardView.getCard('Backlog', 1).getCardLabelContent()
      expect(originalLabels).not.toContain('Stage: Backlog')
      // But Stage is included
      expect(originalLabels).toContain('Stage: Up Next')

      // Change vertical group by field to Stage
      await memex.viewOptionsMenu.VIEW_OPTIONS_MENU_COLUMN_BY.click()

      await page.waitForSelector(_('group-by-menu'))
      const groupByStage = await page.waitForSelector(_('group-by-Stage'))
      await groupByStage.click()

      // Ensure Status of issue is now included in labels
      const updatedLabels = await memex.boardView.getCard('Up Next', 0).getCardLabelContent()
      expect(updatedLabels).toContain('Status: Backlog')
      // And Stage is not
      expect(updatedLabels).not.toContain('Stage: Up Next')
    })
  })

  test.describe('Initial focus', () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('appWithBoardLayout')
    })

    const firstCard = (memex: MemexApp) => memex.boardView.getCard('No Status', 0).cardLocator

    test('Nothing is focused when the page loads', async ({page}) => {
      await expect(page.locator('body')).toBeFocused()
    })

    test('Can jump focus with down arrow after page load', async ({page, memex}) => {
      await page.keyboard.press('ArrowDown')
      await expect(firstCard(memex)).toBeFocused()
    })

    test('Can jump focus with down arrow when tab is focused', async ({page, memex}) => {
      await memex.views.ACTIVE_TAB.focus()
      await page.keyboard.press('ArrowDown')
      await expect(firstCard(memex)).toBeFocused()
    })

    test('Cannot jump focus when anything else is focused', async ({page, memex}) => {
      await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.focus()
      await page.keyboard.press('ArrowDown')
      await expect(firstCard(memex)).not.toBeFocused()
    })
  })
})

test.describe('Board view (not Safari)', () => {
  test.beforeEach(async ({memex, browserName}) => {
    test.fixme(browserName === 'webkit', 'This test is flaky on Safari')
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })
  })

  test.describe('Display labels in board view for all visible fields that have a value', () => {
    test('Display labels in the same order as table view', async ({memex}) => {
      const labels = await memex.boardView.getCard('Backlog', 0).getCardLabelContent()

      expect(labels).toEqual([
        'enhancement ✨',
        'Repository: github/memex',
        'Milestone: Sprint 9',
        '#123',
        '#456',
        '#789',
        'Progress: 7 of 11 (64% completed)',
        'Tracked by memex#335',
        'Type: Bug',
        'Team: Novelty Aardvarks',
        'Estimate: 1',
      ])
    })

    test('Display custom fields in the same order as table view', async ({memex}) => {
      const labels = await memex.boardView.getCard('Backlog', 1).getCardLabelContent()
      expect(labels).toEqual([
        'Repository: github/memex',
        'Milestone: v0.1 - Prioritized Lists?',
        'Stage: Up Next',
        `Due Date: ${tomorrowString}`,
      ])
    })

    test('Remove the label and display correct number of labels when a field is removed', async ({page, memex}) => {
      await memex.viewOptionsMenu.open()
      await memex.viewOptionsMenu.VIEW_OPTIONS_MENU_VISIBLE_COLUMNS.click()
      await getColumnVisibilityMenuOption(page, 'Labels').click()
      const labels = await memex.boardView.getCard('Backlog', 0).getCardLabelContent()
      expect(labels).toEqual([
        'Repository: github/memex',
        'Milestone: Sprint 9',
        '#123',
        '#456',
        '#789',
        'Progress: 7 of 11 (64% completed)',
        'Tracked by memex#335',
        'Type: Bug',
        'Team: Novelty Aardvarks',
        'Estimate: 1',
      ])
    })

    test('Add the label and display correct number of labels when a field is added', async ({page, memex}) => {
      await memex.viewOptionsMenu.open()
      await memex.viewOptionsMenu.VIEW_OPTIONS_MENU_VISIBLE_COLUMNS.click()
      await getColumnVisibilityMenuOption(page, 'Custom Text').click()
      await page.waitForSelector(_('custom-label-Custom Text'))
      const labels = await memex.boardView.getCard('Backlog', 0).getCardLabelContent()
      expect(labels).toEqual([
        'enhancement ✨',
        'Repository: github/memex',
        'Milestone: Sprint 9',
        '#123',
        '#456',
        '#789',
        'Progress: 7 of 11 (64% completed)',
        'Tracked by memex#335',
        'Type: Bug',
        'Team: Novelty Aardvarks',
        'Estimate: 1',
        'Custom Text: Really really, really, really, really, really long custom text value',
      ])
    })

    test('Moving fields will change order as they are moved', async ({page, memex}) => {
      let labels = await memex.boardView.getCard('Backlog', 0).getCardLabelContent()
      expect(labels).toEqual([
        'enhancement ✨',
        'Repository: github/memex',
        'Milestone: Sprint 9',
        '#123',
        '#456',
        '#789',
        'Progress: 7 of 11 (64% completed)',
        'Tracked by memex#335',
        'Type: Bug',
        'Team: Novelty Aardvarks',
        'Estimate: 1',
      ])
      await memex.viewOptionsMenu.open()
      await memex.viewOptionsMenu.VIEW_OPTIONS_MENU_VISIBLE_COLUMNS.click()
      await getColumnVisibilityMenuOption(page, 'Team').click() //clicking visible field hides it
      await getColumnVisibilityMenuOption(page, 'Team').click() //clicking on a hidden field makes it visible and adds it to the end
      await page.waitForSelector(_('custom-label-Team'))
      labels = await memex.boardView.getCard('Backlog', 0).getCardLabelContent()
      expect(labels).toEqual([
        'enhancement ✨',
        'Repository: github/memex',
        'Milestone: Sprint 9',
        '#123',
        '#456',
        '#789',
        'Progress: 7 of 11 (64% completed)',
        'Tracked by memex#335',
        'Type: Bug',
        'Estimate: 1',
        'Team: Novelty Aardvarks',
      ])
    })
  })

  test('New fields can be added on the board view via the view-options-menu', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })

    await memex.viewOptionsMenu.open()
    await memex.viewOptionsMenu.VIEW_OPTIONS_MENU_VISIBLE_COLUMNS.click()
    await memex.viewOptionsMenu.NEW_FIELD_BUTTON.click()
    await expect(memex.boardView.ADD_NEW_COLUMN_MENU).toBeVisible()
  })
})

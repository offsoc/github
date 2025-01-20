import {type ElementHandle, expect, type Page} from '@playwright/test'

import {MemexRefreshEvents} from '../../mocks/data/memex-refresh-events'
import {test} from '../fixtures/test-extended'
import {
  emitMockMessage,
  emitMockMessageOnMessageChannel,
  MESSAGE_SOCKET_CHANNEL_ELEMENT_SELECTOR,
} from '../helpers/alive/message'
import {waitForSelectorCount} from '../helpers/dom/assertions'
import {getInputValue, hasDOMFocus, waitForTitle} from '../helpers/dom/interactions'
import {_} from '../helpers/dom/selectors'
import {hidePage, showPage} from '../helpers/dom/visibility'
import {waitForRowCount} from '../helpers/table/assertions'
import {setCellToFocusMode as clickCell, setCellToFocusMode} from '../helpers/table/interactions'
import {
  cellTestId,
  getCellMode,
  getTableCell,
  getTableColumnHeaderNames,
  getTableDataRows,
  getTableRow,
} from '../helpers/table/selectors'
import type {DetailEvent} from '../types/live-update'
import {CellMode} from '../types/table'
/**
 * We debounced calls to every 1250ms calling for refresh, and this twice as long
 * to ensure we've reacted to incoming messages
 */
const THROTTLE_TIMER_COMPLETION_TIMEOUT = 2500

const waitForThrottleTimerCompletion = () => {
  return new Promise(resolve => setTimeout(resolve, THROTTLE_TIMER_COMPLETION_TIMEOUT))
}

const getTextEditorInput = async (page: Page, testCellId: string): Promise<ElementHandle<HTMLInputElement>> => {
  const input = page.locator(`${testCellId} input`)
  if (!input) throw new Error('Could not find title editor input')
  const handle = await input.elementHandle()
  return handle as ElementHandle<HTMLInputElement>
}

test.describe('Live Updates', () => {
  test.describe('New project', () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('integrationTestsEmpty')
    })

    test("Retains an item's content when a refresh message is heard", async ({page, memex}) => {
      await memex.sharedInteractions.focusOmnibarInEmptyProjectOnPageLoad()

      // Add a draft issue
      await page.keyboard.insertText('hello-there')
      await page.keyboard.press('Enter')

      await waitForRowCount(page, 1)

      // Click the text in the cell
      const firstRow = await getTableRow(page, 1)
      const firstCell = await getTableCell(firstRow, 1)
      const text = firstCell.locator(':right-of(svg)')

      await text.click()

      // Expect the item pane to be visible
      const sidePanel = memex.sidePanel.getDraftSidePanel('hello-there')
      await expect(sidePanel).toBeVisible()

      // Click on the edit button to open the editor
      const editSidePanelButton = sidePanel.getByTestId('edit-comment-button')
      await expect(editSidePanelButton).toBeVisible()
      await editSidePanelButton.click()

      // Wait for the markdown input to visible and select it
      const markdownInput = memex.sidePanel.getMarkdownEditorInput()
      await expect(markdownInput).toBeVisible()
      await markdownInput.click()

      // Enter content to the markdown text editor
      const expectedText = 'issue-content'
      await markdownInput.type(expectedText)

      // Simulate a refresh message
      const emitted = await emitMockMessage(page)
      await waitForThrottleTimerCompletion()
      test.expect(emitted).toBeTruthy()

      // Ensure the content hasn't been removed
      await memex.sidePanel.expectMarkdownEditorToHaveValue(expectedText)
    })
  })

  test.describe('Current project', () => {
    test.beforeEach(async ({page, memex}) => {
      await memex.navigateToStory('integrationTestLiveUpdates')
      await page.waitForSelector(_('live-update-listener'), {state: 'attached'})
      /**
       * Ensure the socket channel element is in the dom
       */
      await page.waitForSelector(MESSAGE_SOCKET_CHANNEL_ELEMENT_SELECTOR, {
        state: 'attached',
      })
    })
    test('should listen to an emitted message', async ({page}) => {
      /**
       * Listen for `socket:message` event on the element
       */
      const awaitEventListened = page.evaluate(
        args => {
          const element = document.querySelector(args.elementSelector)
          if (!element) throw new Error('No element found')
          return new Promise<DetailEvent>(resolve => {
            element.addEventListener('socket:message', ({detail}: CustomEvent<DetailEvent>) => resolve(detail))
          })
        },
        {elementSelector: MESSAGE_SOCKET_CHANNEL_ELEMENT_SELECTOR} as const,
      )

      /**
       * Emit a mock message on the message channel
       */
      const emitted = await emitMockMessage(page)
      test.expect(emitted).toBeTruthy()
      /**
       * Resolves to the expected event detail
       */
      await test.expect(awaitEventListened).resolves.toEqual({
        waitFor: 0,
        data: {
          type: MemexRefreshEvents.MemexProjectEvent,
          payload: {id: 100},
          actor: {id: 100},
        },
      })
    })

    test('Updates title when a message comes in', async ({page}) => {
      const rowsBefore = await getTableDataRows(page)
      const columnsBefore = await getTableColumnHeaderNames(page)

      await page.evaluate(() => {
        return window.__memexInMemoryServer.memexes.update({title: "My Team's Memex(Updated by socket)"})
      })

      const emitted = await emitMockMessage(page)
      test.expect(emitted).toBeTruthy()

      await waitForTitle(page, "My Team's Memex")

      const rowsAfter = await getTableDataRows(page)
      const columnsAfter = await getTableColumnHeaderNames(page)

      test.expect(rowsAfter).toHaveLength(rowsBefore.length)
      test.expect(columnsAfter).toHaveLength(columnsBefore.length)
    })

    //github.com/github/memex/issues/9298
    test.fixme('Adds an item when an item was added, and a refresh message is heard', async ({page}) => {
      const rowsBefore = await getTableDataRows(page)
      const columnsBefore = await getTableColumnHeaderNames(page)

      await page.evaluate(() => {
        return window.__memexInMemoryServer.memexItems.add({
          memexProjectItem: {
            contentType: 'DraftIssue',
            content: {
              title: 'A new draft issue',
            },
            previousMemexProjectItemId: '',
          },
        })
      })

      const emitted = await emitMockMessage(page)
      test.expect(emitted).toBeTruthy()

      // wait for throttle timer to complete
      await waitForSelectorCount(
        page,
        'div[data-testid^=TableRow]',
        rowsBefore.length + 1,
        THROTTLE_TIMER_COMPLETION_TIMEOUT,
      )

      const rowsAfter = await getTableDataRows(page)
      const columnsAfter = await getTableColumnHeaderNames(page)

      test.expect(rowsAfter).toHaveLength(rowsBefore.length + 1)
      test.expect(columnsAfter).toHaveLength(columnsBefore.length)
    })

    test('maintains scroll position when an update is heard', async ({page}) => {
      const cellSelector = _(cellTestId(3, 'Title'))

      const element = await page.waitForSelector(cellSelector)

      await clickCell(page, cellSelector)

      test.expect(await hasDOMFocus(page, element)).toBeTruthy()

      const [elementFocusScrollLeft, elementScrollWidth] = await page.evaluate(() => {
        const scrollElement = document.querySelector('[data-testid=table-scroll-container]')
        return [scrollElement.scrollLeft, scrollElement.scrollWidth] as const
      })

      await page.mouse.wheel(elementScrollWidth, 0)

      const emitted = await emitMockMessage(page)
      test.expect(emitted).toBeTruthy()
      await waitForThrottleTimerCompletion()

      /**
       * Due to issues with consistently scrolling to the same place using
       * playwrights mouse scroll, we're just going to check that the scroll
       * doesn't return to the position the initial element focus caused
       */
      await test
        .expect(
          page.evaluate(() => {
            const scrollElement = document.querySelector('[data-testid=table-scroll-container]')
            return scrollElement.scrollLeft
          }),
        )
        .resolves.not.toBe(elementFocusScrollLeft)
    })

    test('does not disrupt a cell in edit mode when live update is received', async ({page}) => {
      const cellSelector = _(cellTestId(3, 'Team'))
      await setCellToFocusMode(page, cellSelector)
      test.expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)

      // Enter edit mode and change the value of the cell
      await page.keyboard.press('a')
      test.expect(await getCellMode(page, cellSelector)).toBe(CellMode.EDITING)

      const input = await getTextEditorInput(page, cellSelector)

      test.expect(await hasDOMFocus(page, input)).toBe(true)
      test.expect(await getInputValue(page, input)).toBe('a')

      await page.evaluate(() => {
        return window.__memexInMemoryServer.memexes.update({title: "My Team's Memex(Updated by socket)"})
      })

      // Simulate a live update and wait for it to finish
      const emitted = await emitMockMessage(page)
      test.expect(emitted).toBeTruthy()

      await waitForTitle(page, "My Team's Memex")

      // Verify that we haven't changed the focus and that our
      // local change to the cell value hasn't been overwritten

      test.expect(await hasDOMFocus(page, input)).toBe(true)
      test.expect(await getInputValue(page, input)).toBe('a')
    })

    test('Does not update title when an unknown message is emitted', async ({page}) => {
      await page.evaluate(() => {
        return window.__memexInMemoryServer.memexes.update({title: "My Team's Memex(Updated by socket)"})
      })

      await emitMockMessageOnMessageChannel(page, {
        waitFor: 0,
        data: {
          type: 'unknown-socket-refresh-event',
          payload: {id: 100},
          actor: {id: 100},
        },
      })
      await waitForThrottleTimerCompletion()

      await waitForTitle(page, "My Team's Memex")
    })

    test('Should add a new view', async ({page, memex}) => {
      await expect(memex.views.VIEW_TABS).toHaveCount(1)
      // create a new view
      await page.evaluate(() => {
        return window.__memexInMemoryServer.views.create({view: {name: 'New test view'}})
      })

      const emitted = await emitMockMessage(page)
      test.expect(emitted).toBeTruthy()
      await waitForThrottleTimerCompletion()

      await expect(memex.views.VIEW_TABS).toHaveCount(2)
    })

    // https://github.com/github/memex/issues/9353
    test.fixme('Should maintain a deleted view temporarily, with a subset of functionality', async ({page, memex}) => {
      // delete the only view
      await page.evaluate(() => {
        const view = window.__memexInMemoryServer.db.views.all()[0]

        return window.__memexInMemoryServer.views.delete({viewNumber: view.number})
      })

      const items = await getTableDataRows(page)

      const emitted = await emitMockMessage(page)
      test.expect(emitted).toBeTruthy()
      await waitForThrottleTimerCompletion()

      /**
       * Ensure view is still visible
       */
      await expect(memex.views.VIEW_TABS).toHaveCount(1)

      const viewName = await memex.views.VIEW_TABS.nth(0).textContent()
      await page.waitForSelector(_('deleted-view-toast'))
      /**
       * Ensure the rows are the same length
       */
      await test.expect(getTableDataRows(page)).resolves.toHaveLength(items.length)

      /**
       * Ensure the command palette cannot save directly
       */
      await memex.commandMenu.triggerCommandPalette()
      await memex.commandMenu.searchFor('view')

      await memex.commandMenu.expectFilteredResults(6)

      const commandsList = await page.waitForSelector(_('command-menu-filtered-commands'))
      await commandsList.waitForSelector('text=Duplicate view')
      await commandsList.waitForSelector('text=New view')

      await memex.commandMenu.assertNotInResults('Save view')

      /**
       * Ensure the view options menu cannot save directly
       */
      await memex.viewOptionsMenu.open()
      await expect(memex.viewOptionsMenu.duplicateViewItem()).toBeVisible()
      await expect(memex.viewOptionsMenu.SAVE_CHANGES).toBeHidden()

      /**
       * When clicking on a deleted view toast, create a new view if we can
       */
      const action = await page.waitForSelector(_('deleted-view-toast-action'))
      await action.click()

      /**
       * Ensure view is still visible
       */
      await expect(memex.views.VIEW_TABS).toHaveCount(1)
      await expect(memex.views.VIEW_TABS.nth(0)).not.toHaveText(viewName)
    })

    test('should not update when not visible', async ({page, memex}) => {
      await expect(memex.views.VIEW_TABS).toHaveCount(1)

      await hidePage(page)
      // create a new view
      await page.evaluate(() => {
        return window.__memexInMemoryServer.views.create({view: {name: 'New test view'}})
      })

      await test.expect(emitMockMessage(page)).resolves.toBe(false)

      await expect(memex.views.VIEW_TABS).toHaveCount(1)

      await waitForThrottleTimerCompletion()

      await expect(memex.views.VIEW_TABS).toHaveCount(1)

      await showPage(page)
      const emitted = await emitMockMessage(page)
      test.expect(emitted).toBeTruthy()
      await waitForThrottleTimerCompletion()

      await expect(memex.views.VIEW_TABS).toHaveCount(2)
    })

    test('Should not cause accidental redirects on changes', async ({page, memex}) => {
      await memex.topBarNavigation.OPEN_PROJECT_MENU_BUTTON.click()
      await memex.topBarNavigation.SETTINGS_NAV_BUTTON.click()

      // Ensure the settings side nav is visible
      await expect(page.getByTestId('settings-side-nav')).toBeVisible()

      await emitMockMessageOnMessageChannel(page, {
        waitFor: 0,
        data: {
          type: 'mock-socket-refresh-event',
          payload: {id: 100},
          actor: {id: 100},
        },
      })
      await waitForThrottleTimerCompletion()
      // Ensure the settings side nav is visible
      await expect(page.getByTestId('settings-side-nav')).toBeVisible()
    })
  })

  test.describe('Copying draft issues', () => {
    test('shows a toast for bulk copy message if actor is logged in user', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestLiveUpdates')
      await page.waitForSelector(_('live-update-listener'), {state: 'attached'})
      /**
       * Ensure the socket channel element is in the dom
       */
      await page.waitForSelector(MESSAGE_SOCKET_CHANNEL_ELEMENT_SELECTOR, {
        state: 'attached',
      })

      await emitMockMessageOnMessageChannel(page, {
        waitFor: 0,
        data: {
          bulkCopySuccess: true,
          actor: {id: 5487287},
        },
      })

      await waitForThrottleTimerCompletion()
      // Toast is shown after a delay
      await page.waitForTimeout(2000)
      await memex.toasts.expectErrorMessageVisible('Draft issues copied successfully.')
    })

    test('does not show a toast for bulk copy message if actor is not logged in user', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestLiveUpdates')
      await page.waitForSelector(_('live-update-listener'), {state: 'attached'})
      /**
       * Ensure the socket channel element is in the dom
       */
      await page.waitForSelector(MESSAGE_SOCKET_CHANNEL_ELEMENT_SELECTOR, {
        state: 'attached',
      })

      await emitMockMessageOnMessageChannel(page, {
        waitFor: 0,
        data: {
          bulkCopySuccess: true,
          actor: {id: 99},
        },
      })
      // Toast is shown after a delay
      await page.waitForTimeout(2000)
      await memex.toasts.expectErrorMessageHidden()
    })
  })

  test.describe('Paginated current project', () => {
    test.beforeEach(async ({page, memex}) => {
      await memex.navigateToStory('integrationTestLiveUpdates', {
        serverFeatures: {memex_table_without_limits: true},
      })
      await page.waitForSelector(_('live-update-listener'), {state: 'attached'})
      /**
       * Ensure the socket channel element is in the dom
       */
      await page.waitForSelector(MESSAGE_SOCKET_CHANNEL_ELEMENT_SELECTOR, {
        state: 'attached',
      })
    })

    test('Updates title when a message comes in', async ({page}) => {
      const rowsBefore = await getTableDataRows(page)
      const columnsBefore = await getTableColumnHeaderNames(page)

      await page.evaluate(() => {
        return window.__memexInMemoryServer.memexes.update({title: "My Team's Memex(Updated by socket)"})
      })

      const emitted = await emitMockMessage(page)
      test.expect(emitted).toBeTruthy()

      await waitForTitle(page, "My Team's Memex")

      const rowsAfter = await getTableDataRows(page)
      const columnsAfter = await getTableColumnHeaderNames(page)

      test.expect(rowsAfter).toHaveLength(rowsBefore.length)
      test.expect(columnsAfter).toHaveLength(columnsBefore.length)
    })

    test('should not update non-items when not visible', async ({page, memex}) => {
      await expect(memex.views.VIEW_TABS).toHaveCount(1)

      await hidePage(page)
      // create a new view
      await page.evaluate(() => {
        return window.__memexInMemoryServer.views.create({view: {name: 'New test view'}})
      })

      await test.expect(emitMockMessage(page)).resolves.toBe(false)

      await expect(memex.views.VIEW_TABS).toHaveCount(1)

      await waitForThrottleTimerCompletion()

      await expect(memex.views.VIEW_TABS).toHaveCount(1)

      await showPage(page)
      // Wait for automatic refresh to complete
      await waitForThrottleTimerCompletion()

      await expect(memex.views.VIEW_TABS).toHaveCount(2)
    })

    test('should not update items when not visible', async ({page}) => {
      const rowsBefore = await getTableDataRows(page)

      await hidePage(page)
      // create a new item
      await page.evaluate(() => {
        return window.__memexInMemoryServer.memexItems.add({
          memexProjectItem: {
            contentType: 'DraftIssue',
            content: {
              title: 'A new draft issue',
            },
            previousMemexProjectItemId: '',
          },
        })
      })

      await test.expect(emitMockMessage(page)).resolves.toBe(false)

      await waitForThrottleTimerCompletion()

      let rowsAfter = await getTableDataRows(page)
      test.expect(rowsAfter).toHaveLength(rowsBefore.length)

      await showPage(page)
      // Wait for automatic paginated items refresh to complete
      await waitForThrottleTimerCompletion()

      rowsAfter = await getTableDataRows(page)
      test.expect(rowsAfter).toHaveLength(rowsBefore.length + 1)
    })
  })
})

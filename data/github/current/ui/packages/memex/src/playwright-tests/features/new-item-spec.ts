import {expect, type Page} from '@playwright/test'

import {Resources} from '../../client/strings'
import type {MemexApp} from '../fixtures/memex-app'
import {test} from '../fixtures/test-extended'
import {mustFind, mustNotFind, waitForSelectorCount} from '../helpers/dom/assertions'
import {hasDOMFocus} from '../helpers/dom/interactions'
import {_} from '../helpers/dom/selectors'
import {waitForRowCount} from '../helpers/table/assertions'
import {getColumnHeaderMenuOption, getColumnMenuTrigger} from '../helpers/table/interactions'
import {cellTestId, getCellMode, getTableCellText, getTableRow} from '../helpers/table/selectors'
import {eventually, generateRandomName} from '../helpers/utils'
import {CellMode} from '../types/table'

const EXTENDED_TIMEOUT = 10_000
async function addNewIssueFromOmnibarSuggestionList(
  page: Page,
  memex: MemexApp,
  options: {selectItemCb: () => Promise<void>; rowCount?: number; rowIndex?: number},
) {
  await expect(memex.omnibar.INPUT).toBeFocused()

  // Load repository suggestions.
  await page.keyboard.type('#')
  await page.waitForSelector(_('repo-searcher-list'))
  await waitForSelectorCount(page, _('repo-searcher-item'), 8, EXTENDED_TIMEOUT)

  // Filter the list of repository suggestions.
  await page.keyboard.type('gith')
  await waitForSelectorCount(page, _('repo-searcher-item'), 1)

  // Select a repository.
  await page.keyboard.press('Enter')
  await page.waitForSelector(_('issue-picker-list'))

  // Filter the list of issues suggestions.
  await page.keyboard.type('integration test fixture')
  await waitForSelectorCount(page, _('issue-picker-item'), 1)

  // Select the issue.
  await options.selectItemCb()

  // Ensure that we added a new row to the table.
  await waitForRowCount(page, options.rowCount ?? 1)

  const newRow = await getTableRow(page, options.rowIndex ?? 1)
  const newRowTitle = await getTableCellText(newRow, 1)
  expect(newRowTitle).toEqual('I am an integration test fixture #1001')
}

async function addNewIssueFromOmnibarSuggestionListWithMouse(
  page: Page,
  memex: MemexApp,
  options?: {rowCount?: number; rowIndex?: number},
) {
  await addNewIssueFromOmnibarSuggestionList(page, memex, {
    selectItemCb: () => page.click('[data-testid=issue-picker-item]'),
    ...options,
  })
}

async function addNewIssueFromOmnibarSuggestionListWithKeyboard(
  page: Page,
  memex: MemexApp,
  key: 'Enter' | 'Tab',
  options?: {rowCount?: number; rowIndex?: number},
) {
  await addNewIssueFromOmnibarSuggestionList(page, memex, {selectItemCb: () => page.keyboard.press(key), ...options})
}

test.describe('New Items', () => {
  test('after adding new issues can via mouse, do not hide suggestion list', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsEmpty')

    await memex.sharedInteractions.focusOmnibarInEmptyProjectOnPageLoad()
    await addNewIssueFromOmnibarSuggestionListWithMouse(page, memex)

    // Ensure issue picker is still visible
    const pickerList = await page.waitForSelector(_('issue-picker-list'))

    const listHiddenAttr = await pickerList.getAttribute('hidden')
    expect(listHiddenAttr).not.toBe('')
  })

  test('after adding new issues via mouse and focusing different element, hide suggestion list', async ({
    page,
    memex,
  }) => {
    await memex.navigateToStory('integrationTestsEmpty')

    await memex.sharedInteractions.focusOmnibarInEmptyProjectOnPageLoad()
    await addNewIssueFromOmnibarSuggestionListWithMouse(page, memex)

    // Ensure issue picker is still visible
    const pickerList = await page.waitForSelector(_('issue-picker-list'))

    // Clicking outside of the issue picker marks it as hidden
    await page.getByRole('heading', {level: 1}).click()

    const listHiddenAttr = await pickerList.getAttribute('hidden')
    expect(listHiddenAttr).toBe('')
  })

  test('after adding new issue with mouse and focusing html body element, hide suggestion list', async ({
    page,
    memex,
  }) => {
    await memex.navigateToStory('integrationTestsEmpty')

    await memex.sharedInteractions.focusOmnibarInEmptyProjectOnPageLoad()
    await addNewIssueFromOmnibarSuggestionListWithMouse(page, memex)

    // Ensure issue picker is still visible
    const pickerList = await page.waitForSelector(_('issue-picker-list'))

    // Clicking outside of scope should hide issue suggestion picker
    await page.click('body')

    const listHiddenAttr = await pickerList.getAttribute('hidden')
    expect(listHiddenAttr).toBe('')
  })

  test('after adding new issue with Enter key, do not hide suggestion list', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsEmpty')

    await memex.sharedInteractions.focusOmnibarInEmptyProjectOnPageLoad()
    await addNewIssueFromOmnibarSuggestionListWithKeyboard(page, memex, 'Enter')

    // Ensure issue picker is still visible
    await mustFind(page, _('issue-picker-list'))
  })

  test('after adding new issue with Tab key, hide suggestion list', async ({page, memex}) => {
    // this fails in production
    test.fixme()
    await memex.navigateToStory('integrationTestsEmpty')

    await memex.sharedInteractions.focusOmnibarInEmptyProjectOnPageLoad()
    await addNewIssueFromOmnibarSuggestionListWithKeyboard(page, memex, 'Tab')

    // Ensure issue picker is not visible
    await mustNotFind(page, _('issue-picker-list'))

    // Ensure that the Assignees column is still focused
    const cellAssigneesSelector = _(cellTestId(0, 'Assignees'))
    expect(await getCellMode(page, cellAssigneesSelector)).toBe(CellMode.FOCUSED)
  })

  test('if sorted by Assignees, after adding new issue with Enter key issue should be first and issue picker visible', async ({
    page,
    memex,
  }) => {
    await memex.navigateToStory('integrationTestsEmpty')

    await memex.sharedInteractions.focusOmnibarInEmptyProjectOnPageLoad()

    // Add draft issue
    await page.keyboard.type('Draft issue')
    await page.keyboard.press('Enter')

    // Order descending by 'Assignees' column
    const menuTrigger = await getColumnMenuTrigger(page, 'Assignees')
    await menuTrigger.click()
    const sortDescending = getColumnHeaderMenuOption(page, 'Assignees', Resources.tableHeaderContextMenu.sortDescending)
    await sortDescending.click()

    // Add new issue
    const omnibar = await page.waitForSelector(_('repo-searcher-input'))
    await omnibar.click()
    await addNewIssueFromOmnibarSuggestionListWithKeyboard(page, memex, 'Enter', {rowCount: 2, rowIndex: 1})

    // Ensure issue picker is visible
    await mustFind(page, _('issue-picker-list'))
  })

  test('if sorted by Assignees, after adding new issue with Tab key issue should be first', async ({page, memex}) => {
    test.fixme(
      true,
      'This test does not work currently as the Tab behaviour will not focus on the new item when there is latency on the backend. See https://github.com/github/memex/issues/8527 for more context',
    )
    await memex.navigateToStory('integrationTestsEmpty')

    // Add draft issue
    await page.keyboard.type('Draft issue')
    await page.keyboard.press('Enter')

    // Order descending by 'Assignees' column
    const menuTrigger = await getColumnMenuTrigger(page, 'Assignees')
    await menuTrigger.click()
    const sortDescending = getColumnHeaderMenuOption(page, 'Assignees', Resources.tableHeaderContextMenu.sortDescending)
    await sortDescending.click()

    // Add new issue
    await page.keyboard.press('Control+Space')
    await addNewIssueFromOmnibarSuggestionListWithKeyboard(page, memex, 'Tab', {rowCount: 2, rowIndex: 1})

    // Ensure issue picker is not visible
    await mustNotFind(page, _('issue-picker-list'))

    // Ensure that the 'Assignees' column is focused
    const cellAssigneesSelector = _(cellTestId(1, 'Assignees'))
    expect(await getCellMode(page, cellAssigneesSelector)).toBe(CellMode.FOCUSED)
  })

  test('on click, sets focus', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsEmpty')

    await memex.sharedInteractions.focusOmnibarInEmptyProjectOnPageLoad()

    const plusButton = await page.waitForSelector(_('new-item-button'))
    await plusButton.click()

    const newItemInput = await page.waitForSelector(_('repo-searcher-input'))
    expect(await hasDOMFocus(page, newItemInput)).toBe(true)
  })

  test('an error toast is displayed if useApiRequest hook fails to perform', async ({page, memex}) => {
    /**
     * This test seems to fail occasionally in CI - skipping to avoid errors there, but we should
     * determine why this is happening.
     */
    test.fixme()

    await memex.navigateToStory('integrationTestsInErrorMode')

    const plusButton = await page.waitForSelector(_('new-item-button'))
    await plusButton.click()

    await page.keyboard.insertText('this should err')
    await page.keyboard.press('Enter')

    // Assert that we displayed an error toast.
    expect(await page.waitForSelector(_('failedToAddNewItem'))).toBeTruthy()
  })

  test('the picker is hidden when blurring the new item input', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsEmpty')

    await memex.sharedInteractions.focusOmnibarInEmptyProjectOnPageLoad()

    // Load repository suggestions.
    await page.keyboard.type('#')
    const searcherList = await page.waitForSelector(_('repo-searcher-list'))
    await eventually(() => expect(searcherList.isVisible()).resolves.toBeTruthy())
    await waitForSelectorCount(page, _('repo-searcher-item'), 8, EXTENDED_TIMEOUT)

    // Blurring the input via Escape should close the search list
    await page.keyboard.press('Escape')
    await eventually(() => expect(searcherList.isVisible()).resolves.not.toBeTruthy())
  })
  test('creating a draft issue and ensuring that hitting the enter key twice does not create two drafts', async ({
    page,
    memex,
  }) => {
    const draftIssueTitle = generateRandomName()
    await memex.navigateToStory('integrationTestsWithItems')
    await waitForRowCount(page, 8)
    // set the sleep time to 1 second to the event listner has enough time
    await page.evaluate(() => {
      window.__memexInMemoryServer.sleepMs = 1000
    })
    // open the draft issue input
    await page.keyboard.press('Control+Space')
    await expect(memex.omnibar.INPUT).toBeFocused()
    await page.keyboard.type(draftIssueTitle)

    await Promise.all([page.keyboard.press('Enter'), page.keyboard.press('Enter')])
    await page.waitForSelector(`text=${draftIssueTitle}`)
    await waitForRowCount(page, 9)
  })

  test('adding an item while there is more data on the server shows a toast saying the item was added to the bottom of the table', async ({
    page,
    memex,
  }) => {
    // // We want to verify that we don't make a network request for the item when opening the side panel, because we already have it in memory.
    let madeNetworkRequestForGettingItem = false
    page.on('request', request => {
      if (request.method() === 'GET') {
        const url = new URL(request.url())
        if (url.href.endsWith('/mock-memex-item-get-api-data-url?memexProjectItemId=')) {
          madeNetworkRequestForGettingItem = true
        }
      }
    })

    const draftIssueTitle = generateRandomName()
    await memex.navigateToStory('integrationTestsPaginatedData', {
      serverFeatures: {memex_table_without_limits: true},
    })

    const addItemPromise = page.waitForRequest(request => {
      if (request.method() === 'POST') {
        const url = new URL(request.url())
        if (url.href.indexOf('/mock-memex-item-create-api-data-url') !== -1) {
          return true
        }
        return false
      }
    })

    // open the draft issue input
    await page.keyboard.press('Control+Space')
    await expect(memex.omnibar.INPUT).toBeFocused()
    await page.keyboard.type(draftIssueTitle)
    await page.keyboard.press('Enter')

    // Ensure that we still make a request to the server to add the item
    await addItemPromise

    await eventually(async () => {
      await memex.toasts.expectErrorMessageVisible(Resources.newItemAddedToBottomOfTable)
    })
    await memex.toasts.TOAST_ACTION.click()

    await expect(memex.sidePanel.getDraftSidePanel(draftIssueTitle)).toBeVisible()
    expect(madeNetworkRequestForGettingItem).toBe(false)
  })
})

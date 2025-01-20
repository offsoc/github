import {expect} from '@playwright/test'

import {todayString} from '../../../../mocks/data/dates'
import {test} from '../../../fixtures/test-extended'
import {_} from '../../../helpers/dom/selectors'
import {assertRowMatchesType, waitForRowCount} from '../../../helpers/table/assertions'
import {cellTestId, getCellMode, getTableCell, getTableRow} from '../../../helpers/table/selectors'
import {generateRandomName, testPlatformMeta} from '../../../helpers/utils'
import {ItemType} from '../../../types/board'
import {CellMode} from '../../../types/table'

// Select the clickable text to the right of the item's icon
const textSelector = ':right-of(svg)'
// When interacting with an issue or pull request, ensure the locator
// is targeting something clickable, otherwise it will try to find both
// the `a` and `span` tag within
const anchorSelector = `a${textSelector}`

test.describe('Table view', () => {
  test("renders item in side panel even if it's not in the table with MWL FF disabled", async ({memex, page}) => {
    // We want to verify that we don't make a network request for the item when it's in the table.
    let madeNetworkRequestForItem = false
    page.on('request', request => {
      if (request.method() === 'GET') {
        const url = new URL(request.url())
        if (url.href.endsWith('/mock-memex-item-get-api-data-url?memexProjectItemId=31165')) {
          madeNetworkRequestForItem = true
        }
      }
    })

    // MWL FF disabled
    await memex.navigateToStory('integrationTestsPaginatedData', {
      paneState: {pane: 'issue', itemId: 31165},
      serverFeatures: {memex_table_without_limits: false},
    })

    await expect(
      memex.sidePanel.getIssueSidePanel('Ill calculate the 1080p XML transmitter, that should alarm the RSS firewall!'),
    ).toBeVisible()

    expect(madeNetworkRequestForItem).toBe(false)
  })
  test("renders item in side panel even if it's not in the table with MWL FF enabled", async ({memex, page}) => {
    // We want to verify that we make a network request for the item when it's not in the table.

    let madeNetworkRequestForItem = false
    page.on('request', request => {
      if (request.method() === 'GET') {
        const url = new URL(request.url())
        if (url.href.endsWith('/mock-memex-item-get-api-data-url?memexProjectItemId=31165')) {
          madeNetworkRequestForItem = true
        }
      }
    })

    // MWL FF enabled
    await memex.navigateToStory('integrationTestsPaginatedData', {
      paneState: {pane: 'issue', itemId: 31165},
      serverFeatures: {memex_table_without_limits: true},
    })

    await expect(
      memex.sidePanel.getIssueSidePanel('Ill calculate the 1080p XML transmitter, that should alarm the RSS firewall!'),
    ).toBeVisible()

    expect(madeNetworkRequestForItem).toBe(true)
  })
  test.describe('Using the item pane with draft issues', () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('integrationTestsEmpty')
      await memex.sharedInteractions.focusOmnibarInEmptyProjectOnPageLoad()
    })
    test('clicking on a draft text opens the pane', async ({page, memex}) => {
      // Add a draft issue.
      await page.keyboard.insertText('hello-there')
      await page.keyboard.press('Enter')

      await waitForRowCount(page, 1)

      // Click the text in the cell
      const firstRow = await getTableRow(page, 1)
      const firstCell = await getTableCell(firstRow, 1)
      const textLocator = firstCell.locator(textSelector)

      await textLocator.click()

      // Expect the item pane to be visible
      await expect(memex.sidePanel.getDraftSidePanel('hello-there')).toBeVisible()

      const tasklistForm = page.getByTestId('tasklist-form')

      await tasklistForm.waitFor({state: 'detached'})
    })

    test('close the item pane with escape', async ({page, memex}) => {
      // Add a draft issue.
      await page.keyboard.insertText('hello-there')
      await page.keyboard.press('Enter')

      await waitForRowCount(page, 1)

      // Click the text in the cell
      const firstRow = await getTableRow(page, 1)
      const firstCell = await getTableCell(firstRow, 1)
      const textLocator = firstCell.locator(textSelector)

      await textLocator.click()

      // Expect the item pane to be visible
      await memex.sidePanel.getDraftSidePanel('hello-there').waitFor()

      await page.keyboard.press('Escape')

      // Expect the item pane to be removed from the DOM
      await memex.sidePanel.getDraftSidePanel('hello-there').waitFor({state: 'detached'})

      // Expect the focus to return to the cell
      const cellSelector = _(cellTestId(0, 'Title'))
      expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)
    })

    test('close the item pane with close button', async ({page, memex}) => {
      // Add a draft issue.
      await page.keyboard.insertText('hello-there')
      await page.keyboard.press('Enter')

      await waitForRowCount(page, 1)

      // Click the text in the cell
      const firstRow = await getTableRow(page, 1)
      const firstCell = await getTableCell(firstRow, 1)
      const textLocator = firstCell.locator(textSelector)

      await textLocator.click()

      await memex.sidePanel.getDraftSidePanel('hello-there').waitFor()

      const closePaneButton = page.getByTestId('side-panel-button-close')
      await closePaneButton.click()

      // Expect the item pane to be removed from the DOM
      await memex.sidePanel.getDraftSidePanel('hello-there').waitFor({state: 'detached'})

      // Expect the focus to return to the cell
      const cellSelector = _(cellTestId(0, 'Title'))
      expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)
    })

    test('should disable command pallette if text editor textarea is focused', async ({page, memex}) => {
      // Add a draft issue.
      await page.keyboard.insertText('hello-there')
      await page.keyboard.press('Enter')

      await waitForRowCount(page, 1)

      // Click the text in the cell
      const firstRow = await getTableRow(page, 1)
      const firstCell = await getTableCell(firstRow, 1)
      const textLocator = firstCell.locator(textSelector)

      await textLocator.click()

      // Expect the item pane to be visible
      await expect(memex.sidePanel.getDraftSidePanel('hello-there')).toBeVisible()

      // Click on the edit button to open the editor
      const editSidePanelButton = await page.waitForSelector(_('edit-comment-button'))
      await editSidePanelButton.click()

      // Focus the text editor textarea
      await page.click(`${_('markdown-editor')} textarea`)

      // Expect the command pallette to be disabled
      await page.keyboard.press(`${testPlatformMeta}+k`)
      await page.waitForSelector(_('command-menu-filtered-commands'), {state: 'hidden'})
    })
  })

  // These tests are for the legacy issue viewer, which is only visible for logged out users
  test.describe('Using the item pane with issues', () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        loggedOut: true,
      })
    })

    const firstIssueTitle =
      "This is the title for my closed issue. Now that I've closed it, the text is really and long and should elide!"

    test('clicking on an issue opens the pane', async ({page, memex}) => {
      // Click the text in the cell
      const firstRow = await getTableRow(page, 1)
      const firstCell = await getTableCell(firstRow, 1)
      const textLocator = firstCell.locator(anchorSelector)

      await textLocator.click()

      // Expect the item pane to be visible
      await expect(memex.sidePanel.getIssueSidePanel(firstIssueTitle)).toBeVisible()
      await memex.sidePanel.expectTitleContentLoaded()
      const tasklistForm = page.getByTestId('tasklist-form')

      await tasklistForm.waitFor({state: 'attached'})
      const taskListFormData = await tasklistForm.evaluate((form: HTMLFormElement) => {
        const fd = new FormData(form)
        const data = {
          body: fd.get('body'),
          itemId: fd.get('item-id'),
          repoId: fd.get('repository-id'),
          kind: fd.get('kind'),
          projectId: fd.get('project-id'),
        }

        return data
      })

      expect(taskListFormData).toMatchObject({
        body: expect.stringContaining(''),
        itemId: '2',
        repoId: '1',
        kind: 'issue',
        projectId: '1',
      })
      await expect(memex.sidePanel.SIDE_PANEL.getByTestId('sidebar-field-Team').locator('input')).toHaveValue(
        'Novelty Aardvarks',
      )
      await expect(memex.sidePanel.SIDE_PANEL.getByTestId('sidebar-field-Estimate').locator('input')).toHaveValue('10')
      await expect(memex.sidePanel.SIDE_PANEL.getByTestId('sidebar-field-Due Date')).toContainText(`${todayString}`)
      await expect(memex.sidePanel.SIDE_PANEL.getByTestId('sidebar-field-Labels')).toContainText('enhancement')
      await expect(memex.sidePanel.SIDE_PANEL.getByTestId('sidebar-field-Labels')).toContainText('tech debt')
      await expect(memex.sidePanel.SIDE_PANEL.getByTestId('sidebar-field-Status')).toContainText('Done')
      await expect(memex.sidePanel.SIDE_PANEL.getByTestId('sidebar-field-Repository')).toContainText('memex')
      await expect(memex.sidePanel.SIDE_PANEL.getByTestId('sidebar-field-Milestone')).toContainText('Prioritized Lists')
      await expect(memex.sidePanel.SIDE_PANEL.getByTestId('sidebar-field-Stage')).toContainText('Choose an option')
    })

    test('close the item pane with escape', async ({page, memex}) => {
      // Click the text in the cell
      const firstRow = await getTableRow(page, 1)
      const firstCell = await getTableCell(firstRow, 1)
      const textLocator = firstCell.locator(anchorSelector)

      await textLocator.click()

      // Expect the item pane to be visible
      await memex.sidePanel.getIssueSidePanel(firstIssueTitle).waitFor()

      await page.keyboard.press('Escape')

      // Expect the item pane to be removed from the DOM
      await memex.sidePanel.getIssueSidePanel(firstIssueTitle).waitFor({state: 'detached'})

      // Expect the focus to return to the cell
      const cellSelector = _(cellTestId(0, 'Title'))
      expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)
    })

    // Flaky: https://github.com/github/memex/issues/9286
    test('close the item pane with close button', async ({page, memex}) => {
      // Click the text in the cell
      const firstRow = await getTableRow(page, 1)
      const firstCell = await getTableCell(firstRow, 1)
      const textLocator = firstCell.locator(anchorSelector)

      await textLocator.click()

      await memex.sidePanel.getIssueSidePanel(firstIssueTitle).waitFor()

      const closePaneButton = page.getByTestId('side-panel-button-close')
      await closePaneButton.click()

      // Expect the item pane to be removed from the DOM
      await memex.sidePanel.getIssueSidePanel(firstIssueTitle).waitFor({state: 'detached'})

      // Expect the focus to return to the cell
      const cellSelector = _(cellTestId(0, 'Title'))
      expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)
    })

    test('should disable command pallette is text editor textarea is focused', async ({page, memex}) => {
      // Click the text in the cell
      const firstRow = await getTableRow(page, 1)
      const firstCell = await getTableCell(firstRow, 1)
      const textLocator = firstCell.locator(anchorSelector)

      await textLocator.click()

      // Expect the item pane to be visible
      await expect(memex.sidePanel.getIssueSidePanel(firstIssueTitle)).toBeVisible()

      // Focus the text editor textarea
      await page.click(`${_('markdown-editor')} textarea`)

      // Expect the command pallette to be disabled
      await page.keyboard.press(`${testPlatformMeta}+k`)
      await page.waitForSelector(_('command-menu-filtered-commands'), {state: 'hidden'})
    })

    test('use quote reply keyboard shortcut', async ({page, memex}) => {
      const firstRow = await getTableRow(page, 1)
      const firstCell = await getTableCell(firstRow, 1)
      const textLocator = firstCell.locator(anchorSelector)

      await textLocator.click()
      await expect(memex.sidePanel.getIssueSidePanel(firstIssueTitle)).toBeVisible()
      await memex.sidePanel.expectTitleContentLoaded()

      const title = memex.sidePanel.TITLE_LOCATOR
      const titleText = await title.innerText()
      await title.highlight()
      await page.keyboard.press('r')

      // I don't believe this test ever worked as it used to asssert "" === "" prior to waiting on the titleText to load.
      // The editor does not get the highlighted content when 'r' is pressed in the test as it does manually.
      // TODO: Update this test when/if we can get the editor to get the highlighted content.
      expect(titleText).not.toEqual('')
      await expect(page.getByTestId('markdown-editor').getByRole('textbox')).toHaveText('')
    })

    test('ignore modifier keys for shortcuts', async ({page, memex}) => {
      const firstRow = await getTableRow(page, 1)
      const firstCell = await getTableCell(firstRow, 1)
      const textLocator = firstCell.locator(anchorSelector)

      await textLocator.click()
      await expect(memex.sidePanel.getIssueSidePanel(firstIssueTitle)).toBeVisible()

      const title = page.getByTestId('side-panel-title-content')
      await title.highlight()

      // these should be ignored!
      await page.keyboard.press('Shift+r')
      await page.keyboard.press('Control+r')
      await page.keyboard.press('Alt+r')
      await page.keyboard.press('Meta+r')

      await expect(page.getByTestId('markdown-editor').getByRole('textbox')).toHaveText('')
    })
  })
})

test.describe('Board view', () => {
  test.describe('with draft issue', () => {
    const itemName = `Draft issue ${generateRandomName()}`
    test.beforeEach(async ({memex, page}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'board',
      })

      await memex.boardView.getColumn('Ready').ADD_ITEM.click()

      await expect(memex.omnibar.INPUT).toBeFocused()
      await page.keyboard.type(itemName)
      await page.keyboard.press('Enter')
      await page.waitForSelector(`text=${itemName}`)
    })

    test.describe('Using the item pane', () => {
      test('clicking on a draft text opens the pane', async ({memex}) => {
        await memex.boardView.getColumn('Ready').expectCardCount(1)
        await memex.boardView.getCard('Ready', 0).getSidePanelTrigger().click()

        // Expect the item pane to be visible
        await expect(memex.sidePanel.getDraftSidePanel(itemName)).toBeVisible()
      })

      test('close the item pane with escape', async ({page, memex}) => {
        await memex.boardView.getColumn('Ready').expectCardCount(1)
        await memex.boardView.getCard('Ready', 0).getSidePanelTrigger().click()

        // Expect the item pane to be visible
        await expect(memex.sidePanel.getDraftSidePanel(itemName)).toBeVisible()

        await page.keyboard.press('Escape')

        // Expect the item pane to be removed from the DOM
        await memex.sidePanel.getDraftSidePanel(itemName).waitFor({state: 'detached'})

        // Expect the focus to return to the card trigger
        await expect(memex.boardView.getCard('Ready', 0).getSidePanelTrigger()).toBeFocused()
      })

      //github.com/github/memex/issues/9286
      test.fixme('close the item pane with close button', async ({page, memex}) => {
        await memex.boardView.getColumn('Ready').expectCardCount(1)
        await memex.boardView.getCard('Ready', 0).getSidePanelTrigger().click()

        // Expect the item pane to be visible
        await expect(memex.sidePanel.getDraftSidePanel(itemName)).toBeVisible()

        const closePaneButton = page.getByTestId('side-panel-button-close')
        await closePaneButton.click()

        // Expect the item pane to be removed from the DOM
        await memex.sidePanel.getDraftSidePanel(itemName).waitFor({state: 'detached'})

        // Expect the focus to return to the card
        await memex.boardView.getCard('Ready', 0).expectToBeFocused()
      })
    })
  })

  test('clicking on an issue opens the pane', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })
    await memex.boardView.getCard('Backlog', 0).getSidePanelTrigger().click()

    // Expect the item pane to be visible
    await expect(memex.sidePanel.getIssueSidePanel('Fix this `issue` please!')).toBeVisible()
  })

  test('Space key on a selected issue card opens the pane and returns focus to the card when closed', async ({
    memex,
    page,
  }) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })
    await memex.boardView.getCard('Backlog', 0).click()
    await page.keyboard.press('Space')

    // Expect the item pane to be visible
    await expect(memex.sidePanel.getIssueSidePanel('Fix this `issue` please!')).toBeVisible()

    await page.keyboard.press('Escape')

    // Expect the item pane to be removed from the DOM
    await memex.sidePanel.getIssueSidePanel('Fix this `issue` please!').waitFor({state: 'detached'})

    // Expect the focus to return to the card
    await memex.boardView.getCard('Backlog', 0).expectToBeFocused()
  })

  test('Enter key on a focused title link opens the pane and returns focus to the title link when closed', async ({
    memex,
    page,
  }) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })
    await memex.boardView.getCard('Backlog', 0).getSidePanelTrigger().focus()
    await page.keyboard.press('Enter')

    // Expect the item pane to be visible
    await expect(memex.sidePanel.getIssueSidePanel('Fix this `issue` please!')).toBeVisible()

    await page.keyboard.press('Escape')

    // Expect the item pane to be removed from the DOM
    await memex.sidePanel.getIssueSidePanel('Fix this `issue` please!').waitFor({state: 'detached'})

    // Expect the focus to return to the title link within the card
    await expect(memex.boardView.getCard('Backlog', 0).getSidePanelTrigger()).toBeFocused()
  })
})

test.describe('Permissions', () => {
  test('show body for viewer without write permission', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewerPrivileges: {
        viewerRole: 'read',
      },
    })
    await assertRowMatchesType(page, 3, ItemType.DraftIssue)

    const row = await getTableRow(page, 3)
    const cell = await getTableCell(row, 1)
    const textLocator = cell.locator(textSelector)

    await textLocator.click()
    const sidePanel = memex.sidePanel.getDraftSidePanel('Here is a Draft Issue!')
    await expect(sidePanel).toBeVisible()

    // using "attached" here and not "visible" because the bounding box is empty
    const emptyBodyPlaceholder = sidePanel.getByTestId('empty-body-placeholder')
    await expect(emptyBodyPlaceholder).toHaveCount(1)
  })

  test('show markdown editor for viewer with write permission', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewerPrivileges: {
        viewerRole: 'write',
      },
    })
    await assertRowMatchesType(page, 3, ItemType.DraftIssue)

    const row = await getTableRow(page, 3)
    const cell = await getTableCell(row, 1)
    const textLocator = cell.locator(textSelector)

    await textLocator.click()
    const sidePanel = memex.sidePanel.getDraftSidePanel('Here is a Draft Issue!')
    await expect(sidePanel).toBeVisible()

    // Click on the edit button to open the editor
    const editSidePanelButton = sidePanel.getByTestId('edit-comment-button')
    await editSidePanelButton.click()

    await expect(sidePanel.locator(`${_('markdown-editor')} textarea`)).toBeVisible()
  })

  test('project info button is available', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewerPrivileges: {
        viewerRole: 'write',
      },
    })

    await expect(page.getByTestId('project-memex-info-button')).toBeVisible()
  })

  test('can open project info item pane', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewerPrivileges: {
        viewerRole: 'write',
      },
    })

    const infoButton = page.getByTestId('project-memex-info-button')
    await infoButton.click()
    await expect(memex.sidePanel.PROJECT_SIDE_PANEL).toBeVisible()
  })

  test('can edit description in project info item pane', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewerPrivileges: {
        viewerRole: 'write',
      },
    })

    const infoButton = page.getByTestId('project-memex-info-button')
    await infoButton.click()

    await (await page.waitForSelector(_('description-editor-edit'))).click()

    await (await page.waitForSelector(_('description-editor'))).click()
    await page.keyboard.type('description')

    expect(await page.inputValue(_('description-editor'))).toEqual('description')
  })

  test('can edit readme in project info item pane', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewerPrivileges: {
        viewerRole: 'write',
      },
    })

    const infoButton = page.getByTestId('project-memex-info-button')
    await infoButton.click()

    await (await page.waitForSelector(_('pencil-editor-button'))).click()

    await memex.sidePanel.getMarkdownEditorInput().click()
    await page.keyboard.type('readme')
    await memex.sidePanel.expectMarkdownEditorToHaveValue('readme')
  })

  test('focus wraps around', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewerPrivileges: {
        viewerRole: 'write',
      },
    })

    await page.getByTestId('project-memex-info-button').click()

    // TODO: We should skip needing to tab over this internal hidden tabstop, but would require reworking the
    // initial focus management for the side panel a little bit more thoroughly
    await page.keyboard.press('Tab')

    await expect(memex.sidePanel.CLOSE_BUTTON).toBeFocused()

    // Tab through all current interative elements
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await expect(memex.sidePanel.CLOSE_BUTTON).not.toBeFocused()
    await page.keyboard.press('Tab')
    // Focus should have wrapped around to the beginning again
    await expect(memex.sidePanel.CLOSE_BUTTON).toBeFocused()
  })
})

test.describe('Pinned', () => {
  const draftIssueTitle = 'Here is a Draft Issue!'

  test.beforeEach(async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems')
    await memex.tableView.cells.getCellLocator(2, 'Title').click()
    await page.keyboard.press('Space')
    await memex.sidePanel.PIN_BUTTON.click()
    await expect(memex.sidePanel.getDraftSidePanel(draftIssueTitle, true)).toBeVisible()
  })

  // https://github.com/github/memex/issues/17204
  test.fixme('returns focus to button when unpinning and repinning', async ({memex, page}) => {
    await memex.sidePanel.UNPIN_BUTTON.focus()
    await page.keyboard.press('Enter')
    await expect(memex.sidePanel.getDraftSidePanel(draftIssueTitle)).toBeVisible()
    await expect(memex.sidePanel.PIN_BUTTON).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(memex.sidePanel.getDraftSidePanel(draftIssueTitle, true)).toBeVisible()
    await expect(memex.sidePanel.UNPIN_BUTTON).toBeFocused()
  })

  test('updating panel keeps it pinned and pulls focus', async ({memex, page}) => {
    const cell = memex.tableView.cells.getCellLocator(5, 'Title')
    await cell.click()
    await page.keyboard.press('Space')

    const panel = memex.sidePanel.getIssueSidePanel('Fix this `issue` please!', true)
    await expect(panel).toBeVisible()
    await expect(panel.getByTestId('side-panel-focus-target')).toBeFocused()
  })

  test('escape closes panel after clicking anywhere in it', async ({memex, page}) => {
    await memex.tableView.cells.getCellLocator(5, 'Title').click()
    await memex.sidePanel.getDraftSidePanel(draftIssueTitle, true).click()
    await page.keyboard.press('Escape')
    await expect(memex.sidePanel.getDraftSidePanel(draftIssueTitle)).toBeHidden()
  })
})

// We don't actually render the issue viewer in the sidepanel in dev, this test is just to verify that the warning is shown
test.describe('New issue viewer', () => {
  test('renders a warning when opening the new issue viewer in the sidepanel in dev on a table view', async ({
    memex,
    page,
  }) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'table',
    })

    const firstRow = await getTableRow(page, 1)
    const firstCell = await getTableCell(firstRow, 1)
    const textLocator = firstCell.locator(anchorSelector)

    await textLocator.click()

    await expect(page).toHaveURL(/&pane=issue&itemId=2/)
    await expect(memex.sidePanel.NEW_ISSUE_VIEWER_DEVELOPMENT_WARNING).toBeVisible()
  })

  test('renders a warning when opening the new issue viewer in the sidepanel on a board view', async ({
    memex,
    page,
  }) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'board',
    })

    await memex.boardView.getCard('Backlog', 0).getSidePanelTrigger().click()

    await expect(page).toHaveURL(/&pane=issue&itemId=3/)
    await expect(memex.sidePanel.NEW_ISSUE_VIEWER_DEVELOPMENT_WARNING).toBeVisible()
  })

  // Current the new issue viewer is not available to logged out users
  test('renders the legacy issue viewer when logged out', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsInReadonlyMode', {
      viewType: 'table',
    })

    const firstRow = await getTableRow(page, 6)
    const firstCell = await getTableCell(firstRow, 1)
    const textLocator = firstCell.locator(anchorSelector)

    await textLocator.click()

    await expect(page).toHaveURL(/&pane=issue&itemId=3/)
    await expect(memex.sidePanel.NEW_ISSUE_VIEWER_DEVELOPMENT_WARNING).toBeHidden()
    await expect(memex.sidePanel.getIssueSidePanel('Fix this issue please!')).toBeHidden()
  })
})

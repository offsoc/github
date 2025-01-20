import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'

test.describe('bulk filling of table cells', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {viewerPrivileges: {viewerRole: 'write'}})
  })

  test('Fills selected values on cmd+D', async ({page, memex}) => {
    const startCell = memex.tableView.cells.getCellLocator(3, 'Status')
    const middleCell = memex.tableView.cells.getCellLocator(5, 'Status')
    const endCell = memex.tableView.cells.getCellLocator(6, 'Status')

    await Promise.all([
      expect(startCell).toHaveText('Done'),
      expect(middleCell).toHaveText('Backlog'),
      expect(endCell).toHaveText('Backlog'),
    ])

    await startCell.click()
    await page.keyboard.press('Control+Enter')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Shift+Enter')

    await Promise.all([
      expect(startCell).toHaveAttribute('aria-selected', 'true'),
      expect(middleCell).toHaveAttribute('aria-selected', 'true'),
      expect(endCell).toHaveAttribute('aria-selected', 'true'),
    ])

    await page.keyboard.press('Control+d')

    await Promise.all([
      expect(startCell).toHaveText('Done'),
      expect(middleCell).toHaveText('Done'),
      expect(endCell).toHaveText('Done'),
      // cells should remain selected
      expect(startCell).toHaveAttribute('aria-selected', 'true'),
      expect(middleCell).toHaveAttribute('aria-selected', 'true'),
      expect(endCell).toHaveAttribute('aria-selected', 'true'),
    ])
  })

  test('Copies selected values on cmd+C', async ({page, memex, clipboard}) => {
    const startCell = memex.tableView.cells.getCellLocator(3, 'Status')

    await startCell.click()
    await page.keyboard.press('Control+Enter')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Shift+Enter')

    await clipboard.copySelection()

    const clipboardText1 = await clipboard.getText()
    expect(clipboardText1).toBe('Done\nBacklog\nBacklog')
  })

  test('Fills values when fill handle is dragged down', async ({memex}) => {
    const startCell = memex.tableView.cells.getCellLocator(3, 'Status')
    const middleCell = memex.tableView.cells.getCellLocator(5, 'Status')
    const endCell = memex.tableView.cells.getCellLocator(6, 'Status')

    const fillHandle = startCell.getByTestId('table-cell-fill-handle')

    await Promise.all([
      expect(startCell).toHaveText('Done'),
      expect(middleCell).toHaveText('Backlog'),
      expect(endCell).toHaveText('Backlog'),
    ])

    await startCell.click()
    await fillHandle.dragTo(endCell)

    await Promise.all([
      expect(startCell).toHaveText('Done'),
      expect(middleCell).toHaveText('Done'),
      expect(endCell).toHaveText('Done'),
      // cells should now be selected
      expect(startCell).toHaveAttribute('aria-selected', 'true'),
      expect(middleCell).toHaveAttribute('aria-selected', 'true'),
      expect(endCell).toHaveAttribute('aria-selected', 'true'),
    ])
  })

  test('Uses bottom as source cell when fill handle is dragged up', async ({memex}) => {
    const startCell = memex.tableView.cells.getCellLocator(3, 'Status')
    const middleCell = memex.tableView.cells.getCellLocator(5, 'Status')
    const endCell = memex.tableView.cells.getCellLocator(6, 'Status')

    await Promise.all([
      expect(startCell).toHaveText('Done'),
      expect(middleCell).toHaveText('Backlog'),
      expect(endCell).toHaveText('Backlog'),
    ])

    await endCell.click()
    await endCell.getByTestId('table-cell-fill-handle').dragTo(startCell)

    await Promise.all([
      expect(startCell).toHaveText('Backlog'),
      expect(middleCell).toHaveText('Backlog'),
      expect(endCell).toHaveText('Backlog'),
    ])
  })

  test('Always uses top cell as fill source when using keyboard command to fill', async ({page, memex}) => {
    const startCell = memex.tableView.cells.getCellLocator(3, 'Status')
    const middleCell = memex.tableView.cells.getCellLocator(5, 'Status')
    const endCell = memex.tableView.cells.getCellLocator(6, 'Status')

    await Promise.all([
      expect(startCell).toHaveText('Done'),
      expect(middleCell).toHaveText('Backlog'),
      expect(endCell).toHaveText('Backlog'),
    ])

    await endCell.click()
    await page.keyboard.press('Control+Enter')
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('Shift+Enter')
    await page.keyboard.press('Control+d')

    await Promise.all([
      expect(startCell).toHaveText('Done'),
      expect(middleCell).toHaveText('Done'),
      expect(endCell).toHaveText('Done'),
    ])
  })
})

test.describe('fill validation', () => {
  test('Allows filling assignees from repo to draft', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithCustomMilestoneData')

    const {locator: issueCell, FILL_HANDLE} = memex.tableView.cells.getGenericCell(1, 'Assignees')
    const draftCell = memex.tableView.cells.getCellLocator(2, 'Assignees')

    const sourceText = await issueCell.textContent()

    await issueCell.click()
    await FILL_HANDLE.dragTo(draftCell)

    await expect(draftCell).toHaveText(sourceText)
  })

  test('Fails to fill assignees across repos', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithCustomMilestoneData')

    const {locator: sourceCell, FILL_HANDLE} = memex.tableView.cells.getGenericCell(5, 'Assignees')
    const middleDraftCell = memex.tableView.cells.getCellLocator(6, 'Assignees')
    const targetCell = memex.tableView.cells.getCellLocator(8, 'Assignees')

    const [sourceText, targetText] = await Promise.all([sourceCell.textContent(), targetCell.textContent()])

    await sourceCell.click()
    await FILL_HANDLE.dragTo(targetCell)

    await Promise.all([
      expect(sourceCell).toHaveText(sourceText),
      expect(middleDraftCell).toBeEmpty(),
      expect(targetCell).toHaveText(targetText),
    ])
    await memex.toasts.expectErrorMessageVisible('Assignees can only be copied within the same repository')
  })

  test('Fails to fill milestones across repos', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithCustomMilestoneData')

    const {locator: sourceCell, FILL_HANDLE} = memex.tableView.cells.getGenericCell(6, 'Milestone')
    const middleDraftCell = memex.tableView.cells.getCellLocator(7, 'Milestone')
    const targetCell = memex.tableView.cells.getCellLocator(8, 'Milestone')

    const [sourceText, targetText] = await Promise.all([sourceCell.textContent(), targetCell.textContent()])

    await sourceCell.click()
    await FILL_HANDLE.dragTo(targetCell)

    await Promise.all([
      expect(sourceCell).toHaveText(sourceText),
      expect(middleDraftCell).toBeEmpty(),
      expect(targetCell).toHaveText(targetText),
    ])
    // error should be draft target because there is a draft in between
    await memex.toasts.expectErrorMessageVisible('Milestones cannot be applied to draft issues')
  })

  test('Fills issue types across repos', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithCustomMilestoneData', {filterQuery: '-no:repo is:issue'})

    const {locator: sourceCell, FILL_HANDLE} = memex.tableView.cells.getGenericCell(2, 'Type')
    const targetCell = memex.tableView.cells.getCellLocator(3, 'Type')

    await sourceCell.click()
    await FILL_HANDLE.dragTo(targetCell)

    const sourceText = await sourceCell.textContent()

    await expect(targetCell).toHaveText(sourceText)
  })

  test('Fails to fill labels across repos', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithCustomMilestoneData')

    const {locator: sourceCell, FILL_HANDLE} = memex.tableView.cells.getGenericCell(5, 'Labels')
    const middleDraftCell = memex.tableView.cells.getCellLocator(6, 'Labels')
    const targetCell = memex.tableView.cells.getCellLocator(8, 'Labels')

    const [sourceText, targetText] = await Promise.all([sourceCell.textContent(), targetCell.textContent()])

    await sourceCell.click()
    await FILL_HANDLE.dragTo(targetCell)

    await Promise.all([
      expect(sourceCell).toHaveText(sourceText),
      expect(middleDraftCell).toBeEmpty(),
      expect(targetCell).toHaveText(targetText),
    ])
    // error should be draft target because there is a draft in between
    await memex.toasts.expectErrorMessageVisible('Labels cannot be applied to draft issues')
  })

  test('Fills following empty cells on double-click', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithCustomMilestoneData')

    const sourceCell = memex.tableView.cells.getCellLocator(1, 'Status')
    const emptyCell = memex.tableView.cells.getCellLocator(2, 'Status')

    await Promise.all([expect(sourceCell).toHaveText('Done'), expect(emptyCell).toBeEmpty()])

    await sourceCell.click()
    await sourceCell.getByTestId('table-cell-fill-handle').dblclick()

    await Promise.all([
      expect(sourceCell).toHaveText('Done'),
      expect(sourceCell).toHaveAttribute('aria-selected', 'true'),
      expect(emptyCell).toHaveText('Done'),
      expect(emptyCell).toHaveAttribute('aria-selected', 'true'),
    ])
  })
})

import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'
import {getColumnVisibilityMenuOption, getTableIndexForRowInGroup} from '../../helpers/table/selectors'

test.describe('pasting in table view', () => {
  const githubMemexRepo = 'github/memex'
  let memexFirstRowIndex: number = undefined
  let memexSecondRowIndex: number = undefined
  test.beforeEach(async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithCustomMilestoneData', {
      viewerPrivileges: {viewerRole: 'admin'},
      groupedBy: {columnId: 'Repository'},
    })
    memexFirstRowIndex = await getTableIndexForRowInGroup(page, githubMemexRepo, 0)
    memexSecondRowIndex = await getTableIndexForRowInGroup(page, githubMemexRepo, 1)
  })

  const makeFixture = (
    cellType: string,
    columnName: string,
    sourceRowIndex: number,
    targetRowIndex: number,
    sourceGroup = githubMemexRepo,
  ) => ({
    cellType,
    columnName,
    sourceRowIndex,
    targetRowIndex,
    sourceGroup,
  })

  test.describe('within same column & repository', () => {
    for (const {cellType, columnName, sourceRowIndex, targetRowIndex} of [
      makeFixture('text', 'Team', 0, 1),
      makeFixture('assignees', 'Assignees', 0, 1),
      makeFixture('single-select', 'Status', 0, 1),
      makeFixture('labels', 'Labels', 0, 1),
      makeFixture('milestone', 'Milestone', 0, 1),
      makeFixture('date', 'Due Date', 0, 1),
      makeFixture('number', 'Estimate', 0, 1),
      makeFixture('issue-type', 'Type', 2, 0),
      makeFixture('parent-issue', 'Parent issue', 2, 0),
    ]) {
      test(`can copy and paste ${cellType} cells using the mouse`, async ({memex, page, clipboard}) => {
        const sourceRow = await getTableIndexForRowInGroup(page, githubMemexRepo, sourceRowIndex)
        const targetRow = await getTableIndexForRowInGroup(page, githubMemexRepo, targetRowIndex)

        const sourceCell = memex.tableView.cells.getCellLocator(sourceRow, columnName)
        const sourceText = await sourceCell.textContent()

        await sourceCell.focus()
        await clipboard.copySelection()

        const singleTargetCell = memex.tableView.cells.getCellLocator(targetRow, columnName)
        await singleTargetCell.focus()
        await clipboard.paste()

        await expect(singleTargetCell).toHaveText(sourceText)
      })
    }
    for (const {cellType, columnName, sourceRowIndex, targetRowIndex} of [
      makeFixture('text', 'Team', 2, 3),
      makeFixture('assignees', 'Assignees', 2, 3),
      makeFixture('single-select', 'Status', 2, 3),
      makeFixture('labels', 'Labels', 2, 3),
      makeFixture('milestone', 'Milestone', 2, 3),
      makeFixture('date', 'Due Date', 2, 3),
      makeFixture('number', 'Estimate', 2, 3),
      makeFixture('issue-type', 'Type', 2, 3),
      makeFixture('parent-issue', 'Parent issue', 2, 3),
    ]) {
      test(`can bulk add ${cellType} cells using the keyboard`, async ({memex, page, clipboard}) => {
        const sourceRow = await getTableIndexForRowInGroup(page, githubMemexRepo, sourceRowIndex)

        const sourceCell = memex.tableView.cells.getCellLocator(sourceRow, columnName)
        const sourceText = await sourceCell.textContent()

        await sourceCell.focus()
        await clipboard.copySelection()

        await page.keyboard.press('Shift+ArrowDown')
        await clipboard.paste()

        const nextRowIndex = await getTableIndexForRowInGroup(page, githubMemexRepo, targetRowIndex)
        const bulkTargetCell = memex.tableView.cells.getCellLocator(nextRowIndex, columnName)

        await expect(bulkTargetCell).toHaveText(sourceText)
      })
    }
    test.describe('can copy and paste empty cell using the mouse', () => {
      for (const {cellType, columnName, sourceRowIndex, targetRowIndex, sourceGroup} of [
        makeFixture('text', 'Team', 1, 0),
        makeFixture('single-select', 'Status', 0, 1, 'No Repository'),
        makeFixture('number', 'Estimate', 4, 1),
        makeFixture('date', 'Due Date', 1, 0),
        makeFixture('assignees', 'Assignees', 4, 0),
        makeFixture('labels', 'Labels', 4, 0),
        makeFixture('milestone', 'Milestone', 1, 0),
        makeFixture('issue-type', 'Type', 0, 2),
        makeFixture('parent-issue', 'Parent issue', 0, 2),
      ]) {
        test(`can copy and paste ${cellType} cells`, async ({memex, page, clipboard}) => {
          const sourceRow = await getTableIndexForRowInGroup(page, sourceGroup, sourceRowIndex)
          const targetRow = await getTableIndexForRowInGroup(page, sourceGroup, targetRowIndex)

          const sourceCell = memex.tableView.cells.getCellLocator(sourceRow, columnName)
          const sourceText = await sourceCell.textContent()
          expect(sourceText).toEqual('')

          await sourceCell.focus()
          await clipboard.copySelection()

          const singleTargetCell = memex.tableView.cells.getCellLocator(targetRow, columnName)
          await singleTargetCell.focus()
          await clipboard.paste()

          await expect(singleTargetCell).toHaveText(sourceText)
        })
      }
    })
    test.describe('can copy and paste empty cell using the keyboard', () => {
      for (const {cellType, columnName, sourceRowIndex, targetRowIndex, sourceGroup} of [
        makeFixture('text', 'Team', 0, 1),
        makeFixture('single-select', 'Status', 0, 1),
        makeFixture('number', 'Estimate', 0, 1),
        makeFixture('date', 'Due Date', 0, 1),
        makeFixture('assignees', 'Assignees', 0, 1),
        makeFixture('labels', 'Labels', 0, 1),
        makeFixture('milestone', 'Milestone', 0, 1),
        makeFixture('issue-type', 'Type', 2, 3),
        makeFixture('parent-issue', 'Parent issue', 2, 3),
      ]) {
        test(`can copy and paste ${cellType} cells`, async ({memex, page, clipboard}) => {
          const sourceRow = await getTableIndexForRowInGroup(page, sourceGroup, sourceRowIndex)
          const sourceCell = memex.tableView.cells.getCellLocator(sourceRow, columnName)

          await sourceCell.focus()

          // Explicitly clear value of cells
          await page.keyboard.press('Delete')
          await expect(sourceCell).toBeEmpty()

          const sourceText = await sourceCell.textContent()
          expect(sourceText).toEqual('')

          await clipboard.copySelection()

          await page.keyboard.press('Shift+ArrowDown')
          await clipboard.paste()

          const nextRowIndex = await getTableIndexForRowInGroup(page, sourceGroup, targetRowIndex)
          const bulkTargetCell = memex.tableView.cells.getCellLocator(nextRowIndex, columnName)

          await expect(bulkTargetCell).toHaveText(sourceText)
        })
      }
    })

    test(`cannot paste titles`, async ({memex, clipboard}) => {
      const columnName = 'Title'
      const sourceCell = memex.tableView.cells.getCellLocator(memexFirstRowIndex, columnName)
      const sourceText = await sourceCell.textContent()

      await sourceCell.focus()
      await clipboard.copySelection()

      const singleTargetCell = memex.tableView.cells.getCellLocator(memexSecondRowIndex, columnName)
      await singleTargetCell.focus()
      await clipboard.paste()

      await expect(singleTargetCell).not.toHaveText(sourceText)
    })
  })

  test.describe('across repositories / item types', () => {
    for (const {cellType, columnName, sourceRowIndex, targetRowIndex, sourceGroup} of [
      makeFixture('Labels', 'Labels', 0, 0),
      makeFixture('Milestones', 'Milestone', 0, 0),
      makeFixture('Issue types', 'Type', 2, 0),
      makeFixture('Parent issues', 'Parent issue', 2, 0),
    ]) {
      test(`cannot paste ${cellType.toLowerCase()} onto draft issues`, async ({memex, clipboard, page}) => {
        const sourceRow = await getTableIndexForRowInGroup(page, sourceGroup, sourceRowIndex)
        const sourceCell = memex.tableView.cells.getCellLocator(sourceRow, columnName)

        await sourceCell.focus()
        await clipboard.copySelection()

        const noRepoRowIndex = await getTableIndexForRowInGroup(page, 'No Repository', targetRowIndex)
        const targetCell = memex.tableView.cells.getCellLocator(noRepoRowIndex, columnName)

        await targetCell.focus()
        await clipboard.paste()

        await memex.toasts.expectErrorMessageVisible(`${cellType} cannot be applied to draft issues`)
        await expect(targetCell).toBeEmpty()
      })
    }

    for (const {cellType, columnName, sourceRowIndex, targetRowIndex, sourceGroup} of [
      makeFixture('Labels', 'Labels', 0, 0),
      makeFixture('Milestones', 'Milestone', 0, 0),
      makeFixture('Assignees', 'Assignees', 0, 0),
    ]) {
      test(`cannot paste ${cellType.toLowerCase()} across repositories`, async ({memex, clipboard, page}) => {
        const sourceRow = await getTableIndexForRowInGroup(page, sourceGroup, sourceRowIndex)
        const sourceCell = memex.tableView.cells.getCellLocator(sourceRow, columnName)

        await sourceCell.focus()
        await clipboard.copySelection()

        const railsRepoRowIndex = await getTableIndexForRowInGroup(page, 'rails/rails', targetRowIndex)
        const targetCell = memex.tableView.cells.getCellLocator(railsRepoRowIndex, columnName)
        const targetText = await targetCell.textContent()

        await targetCell.focus()
        await clipboard.paste()

        await memex.toasts.expectErrorMessageVisible(`${cellType} can only be copied within the same repository`)
        await expect(targetCell).toHaveText(targetText)
      })
    }

    test('can paste assignees onto drafts', async ({memex, clipboard, page}) => {
      const columnName = 'Assignees'
      const sourceCell = memex.tableView.cells.getCellLocator(memexFirstRowIndex, columnName)
      const sourceText = await sourceCell.textContent()

      await sourceCell.focus()
      await clipboard.copySelection()

      const noRepoRowIndex = await getTableIndexForRowInGroup(page, 'No Repository', 0)
      const targetCell = memex.tableView.cells.getCellLocator(noRepoRowIndex, columnName)

      await targetCell.focus()
      await clipboard.paste()

      await expect(targetCell).toHaveText(sourceText)
    })

    test('cannot paste issue type onto pull requests', async ({memex, clipboard, page}) => {
      const sourceRow = await getTableIndexForRowInGroup(page, githubMemexRepo, 2)
      const sourceCell = memex.tableView.cells.getCellLocator(sourceRow, 'Type')

      await sourceCell.focus()
      await clipboard.copySelection()

      const targetRow = await getTableIndexForRowInGroup(page, githubMemexRepo, 1)
      const targetCell = memex.tableView.cells.getCellLocator(targetRow, 'Type')
      const targetText = await targetCell.textContent()

      await targetCell.focus()
      await clipboard.paste()

      await memex.toasts.expectErrorMessageVisible('Issue types cannot be applied to pull requests')
      await expect(targetCell).toHaveText(targetText)
    })
  })

  test.describe('across column types', () => {
    const dataTypeMismatchError = 'Cannot paste data of different types'

    test.describe('single-select', () => {
      test.describe('from one single-select column to another', () => {
        test('can copy and paste empty single-select value', async ({memex, clipboard, page}) => {
          const emptyStatusCellId = await getTableIndexForRowInGroup(page, 'No Repository', 0)

          const sourceCell = memex.tableView.cells.getCellLocator(emptyStatusCellId, 'Status')

          await sourceCell.focus()
          await clipboard.copySelection()

          const targetCell = memex.tableView.cells.getCellLocator(memexSecondRowIndex, 'Stage')

          await targetCell.focus()
          await clipboard.paste()

          await expect(targetCell).toHaveText('')
        })

        test('cannot copy and paste non-empty single-select value', async ({memex, clipboard}) => {
          const sourceCell = memex.tableView.cells.getCellLocator(memexSecondRowIndex, 'Status')

          await sourceCell.focus()
          await clipboard.copySelection()

          const targetCell = memex.tableView.cells.getCellLocator(memexSecondRowIndex, 'Stage')

          await targetCell.focus()
          await clipboard.paste()

          await memex.toasts.expectErrorMessageVisible(dataTypeMismatchError)
          await expect(targetCell).toHaveText('Closed')
        })
      })

      test.describe('from text to single-select', () => {
        test('can copy and paste empty text value into single-select cell', async ({memex, clipboard}) => {
          const sourceCell = memex.tableView.cells.getCellLocator(memexSecondRowIndex, 'Team')

          await sourceCell.focus()
          await clipboard.copySelection()

          const targetCell = memex.tableView.cells.getCellLocator(memexSecondRowIndex, 'Status')

          await targetCell.focus()
          await clipboard.paste()

          await expect(targetCell).toHaveText('')
        })

        test('can paste matching text value into single-select cell', async ({memex, page, clipboard}) => {
          const sourceCell = memex.tableView.cells.getCellLocator(memexSecondRowIndex, 'Team')

          await sourceCell.dblclick()
          await page.keyboard.insertText(' BACKLOG ')
          await page.keyboard.press('Enter')
          await sourceCell.focus()
          await clipboard.copySelection()

          const targetCell = memex.tableView.cells.getCellLocator(memexSecondRowIndex, 'Status')

          await targetCell.focus()
          await clipboard.paste()

          await expect(targetCell).toHaveText('Backlog')
        })

        test('cannot paste non-valid text value into single-select cell', async ({memex, clipboard}) => {
          const sourceCell = memex.tableView.cells.getCellLocator(memexFirstRowIndex, 'Team')

          await sourceCell.focus()
          await clipboard.copySelection()

          const targetCell = memex.tableView.cells.getCellLocator(memexSecondRowIndex, 'Status')

          await targetCell.focus()
          await clipboard.paste()

          await memex.toasts.expectErrorMessageVisible(dataTypeMismatchError)
          await expect(targetCell).toHaveText('Done')
        })
      })

      test.describe('from invalid column (i.e. not text or single-select) to single-select', () => {
        test('can paste empty value into single-select cell', async ({memex, clipboard}) => {
          const sourceCell = memex.tableView.cells.getCellLocator(memexSecondRowIndex, 'Due Date')

          await sourceCell.focus()
          await clipboard.copySelection()

          const targetCell = memex.tableView.cells.getCellLocator(memexSecondRowIndex, 'Status')

          await targetCell.focus()
          await clipboard.paste()

          await expect(targetCell).toHaveText('')
        })

        test('cannot paste non-empty value into single-select cell', async ({memex, clipboard}) => {
          const sourceCell = memex.tableView.cells.getCellLocator(memexFirstRowIndex, 'Due Date')

          await sourceCell.focus()
          await clipboard.copySelection()

          const targetCell = memex.tableView.cells.getCellLocator(memexSecondRowIndex, 'Status')

          await targetCell.focus()
          await clipboard.paste()

          await memex.toasts.expectErrorMessageVisible(dataTypeMismatchError)
          await expect(targetCell).toHaveText('Done')
        })
      })
    })

    test.describe('text', () => {
      test.describe('from one text column to another', () => {
        // makes a second text column visible
        test.beforeEach(async ({page, memex}) => {
          await memex.viewOptionsMenu.open()
          await memex.viewOptionsMenu.VIEW_OPTIONS_MENU_VISIBLE_COLUMNS.click()
          await getColumnVisibilityMenuOption(page, 'Theme').click()
          await page.keyboard.press('Escape')
          await page.keyboard.press('Escape')
        })

        test('Can copy and paste empty text value', async ({memex, clipboard, page}) => {
          const testRowIndex = await getTableIndexForRowInGroup(page, 'github/memex', 2)
          const sourceCell = memex.tableView.cells.getCellLocator(testRowIndex, 'Theme')

          await sourceCell.focus()
          await clipboard.copySelection()

          const targetCell = memex.tableView.cells.getCellLocator(testRowIndex, 'Team')

          await targetCell.focus()
          await clipboard.paste()

          await expect(targetCell).toHaveText('')
        })

        test('Can copy and paste non-empty text value', async ({memex, clipboard}) => {
          const testRowIndex = memexFirstRowIndex
          const sourceCell = memex.tableView.cells.getCellLocator(testRowIndex, 'Team')

          await sourceCell.focus()
          await clipboard.copySelection()

          const targetCell = memex.tableView.cells.getCellLocator(testRowIndex, 'Theme')

          await targetCell.focus()
          await clipboard.paste()

          await expect(targetCell).toHaveText('Novelty Aardvarks')
        })
      })

      test.describe('from non-text column to text', () => {
        test('Can copy and paste empty value', async ({memex, clipboard}) => {
          const testRowIndex = memexFirstRowIndex
          const sourceCell = memex.tableView.cells.getCellLocator(testRowIndex, 'Stage')

          await sourceCell.focus()
          await clipboard.copySelection()

          const targetCell = memex.tableView.cells.getCellLocator(testRowIndex, 'Team')

          await targetCell.focus()
          await clipboard.paste()

          await expect(targetCell).toHaveText('')
        })
      })
    })
  })

  test.describe('from outside Memex', () => {
    test('can paste text into text cells', async ({memex, clipboard}) => {
      await clipboard.writeText('hello world')

      const targetCell = memex.tableView.cells.getCellLocator(memexSecondRowIndex, 'Team')

      await targetCell.focus()
      await clipboard.paste()

      await expect(targetCell).toHaveText('hello world')
    })

    test('can paste external text after copying a cell', async ({memex, clipboard}) => {
      const sourceCell = memex.tableView.cells.getCellLocator(memexFirstRowIndex, 'Team')

      await sourceCell.focus()
      await clipboard.copySelection()
      await clipboard.writeText('hello world')

      const targetCell = memex.tableView.cells.getCellLocator(memexSecondRowIndex, 'Team')

      await targetCell.focus()
      await clipboard.paste()

      await expect(targetCell).toHaveText('hello world')
    })

    test('can paste numeric text into number cells', async ({memex, clipboard}) => {
      await clipboard.writeText('123')

      const targetCell = memex.tableView.cells.getCellLocator(memexSecondRowIndex, 'Estimate')

      await targetCell.focus()
      await clipboard.paste()

      await expect(targetCell).toHaveText('123')
    })
  })
})

test.describe('iteration cell', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('appWithIterationsField', {
      viewType: 'table',
    })
  })
  test(`can copy and paste empty Iteration cells`, async ({memex, page, clipboard}) => {
    const sourceCell = memex.tableView.cells.getCellLocator(1, 'Iteration')
    const sourceText = await sourceCell.textContent()
    expect(sourceText).toEqual('')

    await sourceCell.focus()
    await clipboard.copySelection()

    const singleTargetCell = memex.tableView.cells.getCellLocator(0, 'Iteration')
    await singleTargetCell.focus()
    await clipboard.paste()

    await expect(singleTargetCell).toHaveText(sourceText)

    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Shift+ArrowDown')
    await clipboard.paste()

    const bulkTargetCell1 = memex.tableView.cells.getCellLocator(2, 'Iteration')
    const bulkTargetCell2 = memex.tableView.cells.getCellLocator(3, 'Iteration')

    await Promise.all([expect(bulkTargetCell1).toHaveText(sourceText), expect(bulkTargetCell2).toHaveText(sourceText)])
  })
})

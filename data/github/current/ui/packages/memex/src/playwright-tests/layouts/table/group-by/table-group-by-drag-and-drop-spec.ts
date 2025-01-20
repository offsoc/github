import {expect} from '@playwright/test'

import {ParentIssueResources, TrackedByResources} from '../../../../client/strings'
import {test} from '../../../fixtures/test-extended'
import {todayString, tomorrowString} from '../../../helpers/dates'
import {dragTo, submitConfirmDialog} from '../../../helpers/dom/interactions'
import {_} from '../../../helpers/dom/selectors'
import type {CreateItemOptions} from '../../../helpers/table/interactions'
import {
  addDraftItem,
  createItemFromGroupFooter,
  dragGroupedRow,
  focusOnFooterForGroup,
  sortByColumnName,
  toggleGroupBy,
  toggleGroupCollapsed,
} from '../../../helpers/table/interactions'
import {
  getDropdownCaret,
  getFooterInputForGroup,
  getGroupNamesInTable,
  getRowTitle,
  getTableCell,
  getTableRowWithinGroup,
} from '../../../helpers/table/selectors'
import {eventually} from '../../../helpers/utils'

type DragAndDropTestsType = Array<{itemType: 'Issue' | 'PullRequest'; dragSrc: number; dropTarget: number}>

test.describe('Group by Drag And Drop', () => {
  test.beforeEach(({browserName}) => {
    test.fixme(browserName === 'firefox', 'cannot Group by drag and drop with Playwright in firefox')
  })

  test.describe('Single-select, date, number', () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'table',
      })
    })

    test('it allows dragging and dropping between single-select groups', async ({page}) => {
      await toggleGroupBy(page, 'Status')

      const rowToDrag = await getTableRowWithinGroup(page, 'Backlog', 0)
      const rowToDragTitle = await getRowTitle(rowToDrag)
      const targetRow = await getTableRowWithinGroup(page, 'Done', 0)

      await dragGroupedRow(page, rowToDrag, targetRow)

      const rowAtOldLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, 'Backlog', 0))
      const rowAtNewLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, 'Done', 1))

      // Make sure there's a new row where rowToDrag used to be.
      expect(rowAtOldLocationTitle).not.toEqual(rowToDragTitle)

      // Make sure rowToDrag landed where we expected.
      expect(rowAtNewLocationTitle).toEqual(rowToDragTitle)
    })

    test('drag & drop across groups can be undone', async ({page}) => {
      await toggleGroupBy(page, 'Status')

      const rowToDrag = await getTableRowWithinGroup(page, 'Backlog', 0)
      const rowToDragTitle = await getRowTitle(rowToDrag)
      const targetRow = await getTableRowWithinGroup(page, 'Done', 0)

      await dragGroupedRow(page, rowToDrag, targetRow)

      const rowAtOldLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, 'Backlog', 0))
      const rowAtNewLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, 'Done', 1))

      expect(rowAtOldLocationTitle).not.toEqual(rowToDragTitle)
      expect(rowAtNewLocationTitle).toEqual(rowToDragTitle)

      // wait for the undo stack to update
      await page.waitForTimeout(1000)
      await page.keyboard.press('Control+z')

      const undone_rowAtOldLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, 'Backlog', 0))
      const undone_rowAtNewLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, 'Done', 1))

      expect(undone_rowAtOldLocationTitle).toEqual(rowToDragTitle)
      expect(undone_rowAtNewLocationTitle).not.toEqual(rowToDragTitle)
    })

    test('it allows dragging and dropping from a single-select group to the default group', async ({page}) => {
      await toggleGroupBy(page, 'Status')

      const rowToDrag = await getTableRowWithinGroup(page, 'Done', 1)
      const rowToDragTitle = await getRowTitle(rowToDrag)
      const targetRow = await getTableRowWithinGroup(page, 'No Status', 0)

      await dragGroupedRow(page, rowToDrag, targetRow)

      const rowAtOldLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, 'Done', 1))
      const rowAtNewLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, 'No Status', 1))

      // Make sure there's a new row where rowToDrag used to be.
      expect(rowAtOldLocationTitle).not.toEqual(rowToDragTitle)

      // Make sure rowToDrag landed where we expected.
      expect(rowAtNewLocationTitle).toEqual(rowToDragTitle)
    })

    test('it allows dragging and dropping from the default group to a real single-select group', async ({page}) => {
      await toggleGroupBy(page, 'Status')

      const rowToDrag = await getTableRowWithinGroup(page, 'No Status', 0)
      const rowToDragTitle = await getRowTitle(rowToDrag)
      const targetRow = await getTableRowWithinGroup(page, 'Done', 1)

      await dragGroupedRow(page, rowToDrag, targetRow)

      const rowAtOldLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, 'No Status', 0))
      const rowAtNewLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, 'Done', 2))

      // Make sure there's a new row where rowToDrag used to be.
      expect(rowAtOldLocationTitle).not.toEqual(rowToDragTitle)

      // Make sure rowToDrag landed where we expected.
      expect(rowAtNewLocationTitle).toEqual(rowToDragTitle)
    })

    test('it allows dragging and dropping within single-select groups', async ({page}) => {
      await toggleGroupBy(page, 'Status')

      const rowToDrag = await getTableRowWithinGroup(page, 'Backlog', 0)
      const rowToDragTitle = await getRowTitle(rowToDrag)
      const targetRow = await getTableRowWithinGroup(page, 'Backlog', 1)
      const targetRowTitle = await getRowTitle(targetRow)

      await dragGroupedRow(page, rowToDrag, targetRow)

      const rowAtOldLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, 'Backlog', 0))
      const rowAtNewLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, 'Backlog', 1))

      // Make sure the titles of the two adjacent rows have been swapped.
      expect(rowAtOldLocationTitle).toBe(targetRowTitle)
      expect(rowAtNewLocationTitle).toBe(rowToDragTitle)
    })

    test('it allows dragging and dropping between text groups', async ({page}) => {
      await toggleGroupBy(page, 'Team')

      const rowToDrag = await getTableRowWithinGroup(page, 'Novelty Aardvarks', 0)
      const rowToDragTitle = await getRowTitle(rowToDrag)
      const targetRow = await getTableRowWithinGroup(page, 'Design Systems', 0)

      await dragGroupedRow(page, rowToDrag, targetRow)

      const rowAtOldLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, 'Novelty Aardvarks', 0))
      const rowAtNewLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, 'Design Systems', 1))

      // Make sure there's a new row where rowToDrag used to be.
      expect(rowAtOldLocationTitle).not.toEqual(rowToDragTitle)

      // Make sure rowToDrag landed where we expected.
      expect(rowAtNewLocationTitle).toEqual(rowToDragTitle)
    })

    test('it allows dragging and dropping from a text group to the default group', async ({page}) => {
      await toggleGroupBy(page, 'Team')

      const rowToDrag = await getTableRowWithinGroup(page, 'Novelty Aardvarks', 0)
      const rowToDragTitle = await getRowTitle(rowToDrag)
      const targetRow = await getTableRowWithinGroup(page, 'No Team', 0)

      await dragGroupedRow(page, rowToDrag, targetRow)

      const rowAtOldLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, 'Novelty Aardvarks', 0))
      const rowAtNewLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, 'No Team', 1))

      // Make sure there's a new row where rowToDrag used to be.
      expect(rowAtOldLocationTitle).not.toEqual(rowToDragTitle)

      // Make sure rowToDrag landed where we expected.
      expect(rowAtNewLocationTitle).toEqual(rowToDragTitle)
    })

    test('it allows dragging and dropping from the default group to a real text group', async ({page}) => {
      await toggleGroupBy(page, 'Team')

      const rowToDrag = await getTableRowWithinGroup(page, 'No Team', 0)
      const rowToDragTitle = await getRowTitle(rowToDrag)
      const targetRow = await getTableRowWithinGroup(page, 'Novelty Aardvarks', 1)

      await dragGroupedRow(page, rowToDrag, targetRow)

      const rowAtOldLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, 'No Team', 0))
      const rowAtNewLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, 'Novelty Aardvarks', 2))

      // Make sure there's a new row where rowToDrag used to be.
      expect(rowAtOldLocationTitle).not.toEqual(rowToDragTitle)

      // Make sure rowToDrag landed where we expected.
      expect(rowAtNewLocationTitle).toEqual(rowToDragTitle)
    })

    test('it allows dragging and dropping within text groups', async ({page}) => {
      await toggleGroupBy(page, 'Team')

      const rowToDrag = await getTableRowWithinGroup(page, 'Novelty Aardvarks', 0)
      const rowToDragTitle = await getRowTitle(rowToDrag)
      const targetRow = await getTableRowWithinGroup(page, 'Novelty Aardvarks', 1)
      const targetRowTitle = await getRowTitle(targetRow)

      await dragGroupedRow(page, rowToDrag, targetRow)

      const rowAtOldLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, 'Novelty Aardvarks', 0))
      const rowAtNewLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, 'Novelty Aardvarks', 1))

      // Make sure the titles of the two adjacent rows have been swapped.
      expect(rowAtOldLocationTitle).toBe(targetRowTitle)
      expect(rowAtNewLocationTitle).toBe(rowToDragTitle)
    })

    test('it allows dragging and dropping between number groups', async ({page}) => {
      await toggleGroupBy(page, 'Estimate')

      const rowToDrag = await getTableRowWithinGroup(page, '10', 0)
      const rowToDragTitle = await getRowTitle(rowToDrag)
      const targetRow = await getTableRowWithinGroup(page, '3', 0)

      await dragGroupedRow(page, rowToDrag, targetRow)

      const rowAtOldLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, '10', 0))
      const rowAtNewLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, '3', 1))

      // Make sure there's a new row where rowToDrag used to be.
      expect(rowAtOldLocationTitle).not.toEqual(rowToDragTitle)

      // Make sure rowToDrag landed where we expected.
      expect(rowAtNewLocationTitle).toEqual(rowToDragTitle)
    })

    test('it allows dragging and dropping from a number group to the default group', async ({page}) => {
      await toggleGroupBy(page, 'Estimate')

      const rowToDrag = await getTableRowWithinGroup(page, '10', 0)
      const rowToDragTitle = await getRowTitle(rowToDrag)
      const targetRow = await getTableRowWithinGroup(page, 'No Estimate', 0)

      await dragGroupedRow(page, rowToDrag, targetRow)

      const rowAtOldLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, '10', 0))
      const rowAtNewLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, 'No Estimate', 1))

      // Make sure there's a new row where rowToDrag used to be.
      expect(rowAtOldLocationTitle).not.toEqual(rowToDragTitle)

      // Make sure rowToDrag landed where we expected.
      expect(rowAtNewLocationTitle).toEqual(rowToDragTitle)
    })

    test('it allows dragging and dropping from the default group to a real number group', async ({page}) => {
      await toggleGroupBy(page, 'Estimate')

      const rowToDrag = await getTableRowWithinGroup(page, 'No Estimate', 0)
      const rowToDragTitle = await getRowTitle(rowToDrag)
      const targetRow = await getTableRowWithinGroup(page, '10', 1)

      await dragGroupedRow(page, rowToDrag, targetRow)

      const rowAtOldLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, 'No Estimate', 0))
      const rowAtNewLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, '10', 2))

      // Make sure there's a new row where rowToDrag used to be.
      expect(rowAtOldLocationTitle).not.toEqual(rowToDragTitle)

      // Make sure rowToDrag landed where we expected.
      expect(rowAtNewLocationTitle).toEqual(rowToDragTitle)
    })

    test('it allows dragging and dropping within number groups', async ({page}) => {
      await toggleGroupBy(page, 'Estimate')

      const rowToDrag = await getTableRowWithinGroup(page, '10', 0)
      const rowToDragTitle = await getRowTitle(rowToDrag)
      const targetRow = await getTableRowWithinGroup(page, '10', 1)
      const targetRowTitle = await getRowTitle(targetRow)

      await dragGroupedRow(page, rowToDrag, targetRow)

      const rowAtOldLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, '10', 0))
      const rowAtNewLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, '10', 1))

      // Make sure the titles of the two adjacent rows have been swapped.
      expect(rowAtOldLocationTitle).toBe(targetRowTitle)
      expect(rowAtNewLocationTitle).toBe(rowToDragTitle)
    })

    test('it allows dragging and dropping between date groups', async ({page}) => {
      await toggleGroupBy(page, 'Due Date')

      const rowToDrag = await getTableRowWithinGroup(page, todayString, 0)
      const rowToDragTitle = await getRowTitle(rowToDrag)
      const targetRow = await getTableRowWithinGroup(page, tomorrowString, 0)

      await dragGroupedRow(page, rowToDrag, targetRow)

      const rowAtOldLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, todayString, 0))
      const rowAtNewLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, tomorrowString, 1))

      // Make sure there's a new row where rowToDrag used to be.
      expect(rowAtOldLocationTitle).not.toEqual(rowToDragTitle)

      // Make sure rowToDrag landed where we expected.
      expect(rowAtNewLocationTitle).toEqual(rowToDragTitle)
    })

    test('it allows dragging and dropping from a date group to the default group', async ({page}) => {
      await toggleGroupBy(page, 'Due Date')

      const rowToDrag = await getTableRowWithinGroup(page, todayString, 0)
      const rowToDragTitle = await getRowTitle(rowToDrag)
      const targetRow = await getTableRowWithinGroup(page, 'No Due Date', 0)

      await dragGroupedRow(page, rowToDrag, targetRow)

      const rowAtOldLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, todayString, 0))
      const rowAtNewLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, 'No Due Date', 1))

      // Make sure there's a new row where rowToDrag used to be.
      expect(rowAtOldLocationTitle).not.toEqual(rowToDragTitle)

      // Make sure rowToDrag landed where we expected.
      expect(rowAtNewLocationTitle).toEqual(rowToDragTitle)
    })

    test('it allows dragging and dropping from the default group to a date group', async ({page}) => {
      await toggleGroupBy(page, 'Due Date')

      const rowToDrag = await getTableRowWithinGroup(page, 'No Due Date', 0)
      const rowToDragTitle = await getRowTitle(rowToDrag)
      const targetRow = await getTableRowWithinGroup(page, todayString, 1)

      await dragGroupedRow(page, rowToDrag, targetRow)

      const rowAtOldLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, 'No Due Date', 0))
      const rowAtNewLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, todayString, 2))

      // Make sure there's a new row where rowToDrag used to be.
      expect(rowAtOldLocationTitle).not.toEqual(rowToDragTitle)

      // Make sure rowToDrag landed where we expected.
      expect(rowAtNewLocationTitle).toEqual(rowToDragTitle)
    })

    test('it allows dragging and dropping within date groups', async ({page}) => {
      await toggleGroupBy(page, 'Due Date')

      const rowToDrag = await getTableRowWithinGroup(page, todayString, 0)
      const rowToDragTitle = await getRowTitle(rowToDrag)
      const targetRow = await getTableRowWithinGroup(page, todayString, 1)
      const targetRowTitle = await getRowTitle(targetRow)

      await dragGroupedRow(page, rowToDrag, targetRow)

      const rowAtOldLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, todayString, 0))
      const rowAtNewLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, todayString, 1))

      // Make sure the titles of the two adjacent rows have been swapped.
      expect(rowAtOldLocationTitle).toBe(targetRowTitle)
      expect(rowAtNewLocationTitle).toBe(rowToDragTitle)
    })

    test('it allows dragging and dropping within status groups', async ({page}) => {
      await toggleGroupBy(page, 'Status')

      const rowToDrag = await getTableRowWithinGroup(page, 'Backlog', 0)
      const rowToDragTitle = await getRowTitle(rowToDrag)
      const targetRow = await getTableRowWithinGroup(page, 'Done', 1)

      await dragGroupedRow(page, rowToDrag, targetRow)

      const rowAtOldLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, 'Backlog', 0))
      const rowAtNewLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, 'Done', 2))

      // Make sure there's a new row where rowToDrag used to be.
      expect(rowAtOldLocationTitle).not.toEqual(rowToDragTitle)

      // Make sure rowToDrag landed where we expected.
      expect(rowAtNewLocationTitle).toEqual(rowToDragTitle)
    })

    test('it expands collapsed groups when dropped on', async ({page}) => {
      await toggleGroupBy(page, 'Status')
      await toggleGroupCollapsed(page, 'Done')

      const rowToDrag = await getTableRowWithinGroup(page, 'Backlog', 0)
      const rowToDragTitle = await getRowTitle(rowToDrag)
      const fromRowDraggerCell = await getTableCell(rowToDrag, 0)

      const toGroupButtonBox = await page.getByRole('button', {name: 'Expand group Done'}).boundingBox()
      await dragTo(page, fromRowDraggerCell, {x: toGroupButtonBox.x + 10, y: toGroupButtonBox.y + 10})

      // must be expanded now
      await expect(page.getByRole('button', {name: 'Collapse group Done'})).toBeVisible()

      expect(await getRowTitle(await getTableRowWithinGroup(page, 'Done', 3))).toEqual(rowToDragTitle)
    })

    test('it expands collapsed groups when held over', async ({page}) => {
      await toggleGroupBy(page, 'Status')
      await toggleGroupCollapsed(page, 'Done')

      const rowToDrag = await getTableRowWithinGroup(page, 'Backlog', 0)
      const fromRowDraggerCell = await getTableCell(rowToDrag, 0)

      const toGroupButtonBox = await page.getByRole('button', {name: 'Expand group Done'}).boundingBox()
      await dragTo(page, fromRowDraggerCell, {x: toGroupButtonBox.x + 10, y: toGroupButtonBox.y + 10}, undefined, false)

      // still collapsed
      await expect(page.getByRole('button', {name: 'Expand group Done'})).toBeVisible()

      await page.waitForTimeout(750)

      // must be expanded now
      await expect(page.getByRole('button', {name: 'Collapse group Done'})).toBeVisible()
    })

    test('it allows dragging across groups when sorted', async ({page}) => {
      await toggleGroupBy(page, 'Status')
      await sortByColumnName(page, 'Title')

      const rowToDrag = await getTableRowWithinGroup(page, 'Backlog', 0)
      const rowToDragTitle = await getRowTitle(rowToDrag)
      const targetRow = await getTableRowWithinGroup(page, 'Done', 1)

      await dragGroupedRow(page, rowToDrag, targetRow)

      const rowAtOldLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, 'Backlog', 0))

      // Even though we dragged the row onto the second row in the Done group, it must move to be the first row because it's
      // sorted by title alphabetically
      const rowAtNewLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, 'Done', 0))

      // Make sure there's a new row where rowToDrag used to be.
      expect(rowAtOldLocationTitle).not.toEqual(rowToDragTitle)

      // Make sure rowToDrag landed where we expected.
      expect(rowAtNewLocationTitle).toEqual(rowToDragTitle)
    })
  })

  test.describe('Assignees', () => {
    test('it allows dragging and dropping across groups when grouped by assignees', async ({memex, page}) => {
      // to get fixed list of assignees
      await memex.navigateToStory('integrationTestsWithCustomAssigneesData', {
        viewType: 'table',
      })

      await toggleGroupBy(page, 'Assignees')
      const groupNames = await getGroupNamesInTable(page)
      const groups = groupNames.map(g => g.replace(', ', '-')).filter(g => !g.toLowerCase().includes('no assignee'))

      const dragGroupName = groups[0]
      const dropGroupName = groups[2]

      const rowToDrag = await getTableRowWithinGroup(page, dragGroupName, 0)
      const rowToDragTitle = await getRowTitle(rowToDrag)
      const targetRow = await getTableRowWithinGroup(page, dropGroupName, 0)

      await dragGroupedRow(page, rowToDrag, targetRow)
      const updatedGroupNames = (await getGroupNamesInTable(page))
        .map(g => g.replace(', ', '-'))
        .filter(g => !g.toLowerCase().includes('no assignee'))

      expect(updatedGroupNames.includes(dragGroupName)).toBe(false)

      const rowAtNewLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, dropGroupName, 1))
      expect(rowAtNewLocationTitle).toBe(rowToDragTitle) // moves to new group
    })

    test('drag and drop should remove assignees when dropped in no assignees group', async ({memex, page}) => {
      // to get fixed list of assignees
      await memex.navigateToStory('integrationTestsWithCustomAssigneesData', {
        viewType: 'table',
      })

      await toggleGroupBy(page, 'Assignees')
      const groupNames = await getGroupNamesInTable(page)
      const groups = groupNames.map(g => g.replace(', ', '-'))

      const dragGroupName = groups[0]
      const dropGroupName = groups[groupNames.length - 1]

      const rowToDrag = await getTableRowWithinGroup(page, dragGroupName, 0)
      const rowToDragTitle = await getRowTitle(rowToDrag)
      const targetRow = await getTableRowWithinGroup(page, dropGroupName, 0)

      await dragGroupedRow(page, rowToDrag, targetRow)
      const updatedGroupNames = (await getGroupNamesInTable(page)).map(g => g.replace(', ', '-'))

      expect(updatedGroupNames.includes(dragGroupName)).toBe(false) // group should be removed as it only had one item

      const rowAtNewLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, dropGroupName, 1))
      expect(rowAtNewLocationTitle).toBe(rowToDragTitle) // moves to no assignees group
    })
  })

  test.describe('Milestone', () => {
    test('footer omnibar is enabled for a milestone groups', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'table',
      })

      await toggleGroupBy(page, 'Milestone')

      const groupName = 'v0.1 - Prioritized Lists?'

      const input = await getFooterInputForGroup(page, groupName)

      expect(input).not.toBeNull()
    })

    test('footer omnibar is enabled for the "No Milestone" group', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'table',
      })

      await toggleGroupBy(page, 'Milestone')

      const groupName = 'No Milestone'
      const input = await getFooterInputForGroup(page, groupName)

      expect(input).not.toBeNull()
    })

    test('it allows dragging and dropping from within the same group', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'table',
      })

      await toggleGroupBy(page, 'Milestone')

      const groupName = 'v0.1 - Prioritized Lists?'

      const rowToDrag = await getTableRowWithinGroup(page, groupName, 0)
      const rowToDragTitle = await getRowTitle(rowToDrag)
      const targetRow = await getTableRowWithinGroup(page, groupName, 2)

      await dragGroupedRow(page, rowToDrag, targetRow)

      const rowAtNewLocation = await getTableRowWithinGroup(page, groupName, 2)
      const rowAtNewLocationTitle = await getRowTitle(rowAtNewLocation)

      // Make sure dnd works and dialog is not present
      expect(rowAtNewLocationTitle).toBe(rowToDragTitle)
      await expect(page.getByRole('alertdialog')).toBeHidden()
    })

    test('it prevents dragging and dropping a "Draft Issue" across different milestones', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'table',
      })

      await toggleGroupBy(page, 'Milestone')

      const groupName = 'No Milestone'
      const targetGroupName = 'v0.1 - Prioritized Lists?'

      await focusOnFooterForGroup(page, memex, groupName)
      await addDraftItem(page, 'This is a draft issue')

      const rowToDrag = await getTableRowWithinGroup(page, groupName, 4)
      const rowToDragTitle = await getRowTitle(rowToDrag)
      const targetRow = await getTableRowWithinGroup(page, targetGroupName, 2)
      const targetRowTitle = await getRowTitle(targetRow)

      await dragGroupedRow(page, rowToDrag, targetRow)

      const rowAtOldLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, targetGroupName, 2))

      // Make sure the target rows have not reordered
      expect(rowAtOldLocationTitle).not.toBe(rowToDragTitle)
      expect(rowAtOldLocationTitle).toBe(targetRowTitle)

      // Make sure dialog is present and confirm action
      await submitConfirmDialog(page, 'Got it!')
    })

    const noMilestoneTests: DragAndDropTestsType = [
      {itemType: 'Issue', dragSrc: 0, dropTarget: 1},
      {itemType: 'PullRequest', dragSrc: 2, dropTarget: 1},
    ]

    for (const {itemType, dragSrc, dropTarget} of noMilestoneTests) {
      test(`it allows dragging and dropping ${itemType} item to a "No Milestone" group`, async ({page, memex}) => {
        await memex.navigateToStory('integrationTestsWithItems', {
          viewType: 'table',
        })

        await toggleGroupBy(page, 'Milestone')

        const groupName = 'v0.1 - Prioritized Lists?'
        const targetGroupName = 'No Milestone'

        const rowToDrag = await getTableRowWithinGroup(page, groupName, dragSrc)
        const rowToDragTitle = await getRowTitle(rowToDrag)
        const targetRow = await getTableRowWithinGroup(page, targetGroupName, dropTarget)
        const targetRowTitle = await getRowTitle(targetRow)

        await dragGroupedRow(page, rowToDrag, targetRow)

        const rowAtOldLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, targetGroupName, dropTarget))

        // Make sure the target rows have not reordered
        expect(rowAtOldLocationTitle).not.toEqual(rowToDragTitle)
        expect(rowAtOldLocationTitle).toEqual(targetRowTitle)
      })
    }

    const repositoryWithMilestonesTest: DragAndDropTestsType = [
      {itemType: 'Issue', dragSrc: 0, dropTarget: 0},
      {itemType: 'PullRequest', dragSrc: 1, dropTarget: 0},
    ]

    for (const {itemType, dragSrc, dropTarget} of repositoryWithMilestonesTest) {
      test(`it allows dragging and dropping ${itemType} to a group when repository has milestone`, async ({
        page,
        memex,
      }) => {
        await memex.navigateToStory('integrationTestsWithItems', {
          viewType: 'table',
        })

        const groupName = 'v0.1 - Prioritized Lists?'
        const targetGroupName = 'Sprint 9'

        // select a new milestone we can group by with
        const caret = await getDropdownCaret(page, _('TableCell{row: 0, column: Milestone}'))
        await caret.click()

        const optionSelector = _('table-cell-editor-row')
        await page.waitForFunction(([selector]) => !!document.querySelector(selector), [optionSelector])

        const milestoneLocator = page.locator(optionSelector).nth(1)
        await milestoneLocator.click()

        await toggleGroupBy(page, 'Milestone')

        const rowToDrag = await getTableRowWithinGroup(page, groupName, dragSrc)
        const rowToDragTitle = await getRowTitle(rowToDrag)
        const targetRow = await getTableRowWithinGroup(page, targetGroupName, dropTarget)

        await dragGroupedRow(page, rowToDrag, targetRow)

        await eventually(async () => {
          const rowAtNewLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, targetGroupName, 1))

          expect(rowAtNewLocationTitle).toEqual(rowToDragTitle)
          await expect(page.getByRole('alertdialog')).toBeHidden()
        })
      })
    }

    const repositoryWithoutMilestoneTest: DragAndDropTestsType = [
      {itemType: 'Issue', dragSrc: 0, dropTarget: 0},
      {itemType: 'PullRequest', dragSrc: 1, dropTarget: 0},
    ]

    for (const {itemType, dragSrc, dropTarget} of repositoryWithoutMilestoneTest) {
      test(`it doesnt allow dragging and dropping ${itemType} to a group when repository does not have that milestone`, async ({
        memex,
        page,
      }) => {
        await memex.navigateToStory('integrationTestsWithCustomMilestoneData', {
          viewType: 'table',
        })
        const groupName = 'v0.1 - Prioritized Lists?'
        const targetGroupName = 'New Release'

        await toggleGroupBy(page, 'Milestone')

        const rowToDrag = await getTableRowWithinGroup(page, groupName, dragSrc)
        const rowToDragTitle = await getRowTitle(rowToDrag)
        const targetRow = await getTableRowWithinGroup(page, targetGroupName, dropTarget)
        const targetRowTitle = await getRowTitle(targetRow)

        await dragGroupedRow(page, rowToDrag, targetRow)

        await eventually(async () => {
          const rowAtOldLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, targetGroupName, 0))
          // Make sure the target rows have not reordered
          expect(rowAtOldLocationTitle).not.toEqual(rowToDragTitle)
          expect(rowAtOldLocationTitle).toEqual(targetRowTitle)

          // Make sure dialog is present and confirm action
          await submitConfirmDialog(page, 'Got it!')
        })
      })
    }
  })

  test.describe('Issue Type', () => {
    test('footer omnibar is enabled for a issue type groups', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'table',
      })

      await toggleGroupBy(page, 'Type')

      const groupName = 'Batch'

      const input = await getFooterInputForGroup(page, groupName)

      expect(input).not.toBeNull()
    })

    test('footer omnibar is enabled for the "No Type" group', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'table',
      })

      await toggleGroupBy(page, 'Type')

      const groupName = 'No Type'
      const input = await getFooterInputForGroup(page, groupName)

      expect(input).not.toBeNull()
    })

    test('it allows dragging and dropping from within the same group', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'table',
      })

      await toggleGroupBy(page, 'Type')

      const groupName = 'No Type'

      const rowToDrag = await getTableRowWithinGroup(page, groupName, 0)
      const rowToDragTitle = await getRowTitle(rowToDrag)
      const targetRow = await getTableRowWithinGroup(page, groupName, 2)

      await dragGroupedRow(page, rowToDrag, targetRow)

      const rowAtNewLocation = await getTableRowWithinGroup(page, groupName, 2)
      const rowAtNewLocationTitle = await getRowTitle(rowAtNewLocation)

      // Make sure dnd works and dialog is not present
      expect(rowAtNewLocationTitle).toBe(rowToDragTitle)
      await expect(page.getByRole('alertdialog')).toBeHidden()
    })

    test('it prevents dragging and dropping a "Pull request" across different types', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'table',
      })

      await toggleGroupBy(page, 'Type')

      const groupName = 'No Type'
      const targetGroupName = 'Batch'

      const rowToDrag = await getTableRowWithinGroup(page, groupName, 1)
      const rowToDragTitle = await getRowTitle(rowToDrag)
      const targetRow = await getTableRowWithinGroup(page, targetGroupName, 0)
      const targetRowTitle = await getRowTitle(targetRow)

      await dragGroupedRow(page, rowToDrag, targetRow)

      const rowAtOldLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, targetGroupName, 0))

      // Make sure the target rows have not reordered
      expect(rowAtOldLocationTitle).not.toBe(rowToDragTitle)
      expect(rowAtOldLocationTitle).toBe(targetRowTitle)

      // Make sure dialog is present and confirm action
      await submitConfirmDialog(page, 'Got it!')
    })

    test('it prevents dragging and dropping a "Draft Issue" across different types', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'table',
      })

      await toggleGroupBy(page, 'Type')

      const groupName = 'No Type'
      const targetGroupName = 'Batch'
      const draftTitle = 'This is a draft issue'

      await focusOnFooterForGroup(page, memex, groupName)
      await addDraftItem(page, draftTitle)

      const rowToDrag = await getTableRowWithinGroup(page, groupName, 6)
      const rowToDragTitle = await getRowTitle(rowToDrag)
      expect(rowToDragTitle).toContain(draftTitle)

      const targetRow = await getTableRowWithinGroup(page, targetGroupName, 0)
      const targetRowTitle = await getRowTitle(targetRow)

      await dragGroupedRow(page, rowToDrag, targetRow)

      const rowAtOldLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, targetGroupName, 0))

      // Make sure the target rows have not reordered
      expect(rowAtOldLocationTitle).not.toBe(rowToDragTitle)
      expect(rowAtOldLocationTitle).toBe(targetRowTitle)

      // Make sure dialog is present and confirm action
      await submitConfirmDialog(page, 'Got it!')
    })

    test('it allows dragging and dropping an issue item to a "No Type" group', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'table',
      })

      await toggleGroupBy(page, 'Type')

      const groupName = 'Batch'
      const targetGroupName = 'No Type'

      const rowToDrag = await getTableRowWithinGroup(page, groupName, 0)
      const rowToDragTitle = await getRowTitle(rowToDrag)
      const targetRow = await getTableRowWithinGroup(page, targetGroupName, 1)
      const targetRowTitle = await getRowTitle(targetRow)

      await dragGroupedRow(page, rowToDrag, targetRow)

      const rowAtOldLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, targetGroupName, 1))

      // Make sure the target rows have not reordered
      expect(rowAtOldLocationTitle).not.toEqual(rowToDragTitle)
      expect(rowAtOldLocationTitle).toEqual(targetRowTitle)
    })

    test('it allows dragging and dropping an issue item to a group when repository has issue type', async ({
      page,
      memex,
    }) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'table',
      })

      await toggleGroupBy(page, 'Type')

      const groupName = 'Batch'
      const targetGroupName = 'Bug'

      const rowToDrag = await getTableRowWithinGroup(page, groupName, 0)
      const rowToDragTitle = await getRowTitle(rowToDrag)
      const targetRow = await getTableRowWithinGroup(page, targetGroupName, 0)

      await dragGroupedRow(page, rowToDrag, targetRow)

      await eventually(async () => {
        const rowAtNewLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, targetGroupName, 1))

        expect(rowAtNewLocationTitle).toEqual(rowToDragTitle)
        await expect(page.getByRole('alertdialog')).toBeHidden()
      })
    })

    test('it doesnt allow dragging and dropping an issue item to a group when repository does not have that issue type', async ({
      memex,
      page,
    }) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'table',
      })

      await toggleGroupBy(page, 'Type')

      const issueTitle = 'I am an integration test fixture'
      const issueOptions: CreateItemOptions = {
        expectsRepoCount: 8,
        targetRepo: 'rails', // Rails repo does not have any issue types
        itemTitle: issueTitle,
        waitForRender: true,
      }

      await createItemFromGroupFooter(page, memex, 'No Type', issueOptions)

      const groupName = 'No Type'
      const targetGroupName = 'Batch'

      const rowToDrag = await getTableRowWithinGroup(page, groupName, 6)
      const rowToDragTitle = await getRowTitle(rowToDrag)
      expect(rowToDragTitle).toContain(issueTitle)

      const targetRow = await getTableRowWithinGroup(page, targetGroupName, 0)
      const targetRowTitle = await getRowTitle(targetRow)

      await dragGroupedRow(page, rowToDrag, targetRow)

      await eventually(async () => {
        const rowAtOldLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, targetGroupName, 0))
        // Make sure the target rows have not reordered
        expect(rowAtOldLocationTitle).not.toEqual(rowToDragTitle)
        expect(rowAtOldLocationTitle).toEqual(targetRowTitle)

        // Make sure dialog is present and confirm action
        await submitConfirmDialog(page, 'Got it!')
      })
    })
  })

  test.describe('Tracked by', () => {
    test("it doesn't allow dragging and dropping an item to a group when feature flag is disabled", async ({
      page,
      memex,
    }) => {
      await memex.navigateToStory('appWithTrackedByField', {
        viewType: 'table',
        serverFeatures: {
          tasklist_block: true,
        },
      })

      const groupName = 'old bug from a long time ago'
      const targetGroupName = 'style nitpick'

      await toggleGroupBy(page, 'Tracked by')

      const rowToDrag = await getTableRowWithinGroup(page, groupName, 0)
      const rowToDragTitle = await getRowTitle(rowToDrag)
      const targetRow = await getTableRowWithinGroup(page, targetGroupName, 0)
      const targetRowTitle = await getRowTitle(targetRow)

      await dragGroupedRow(page, rowToDrag, targetRow)

      const rowAtOldLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, targetGroupName, 0))
      expect(rowAtOldLocationTitle).not.toEqual(rowToDragTitle)
      expect(rowAtOldLocationTitle).toEqual(targetRowTitle)
    })

    test('it allows dragging and dropping an item to a group when feature flag is enabled', async ({page, memex}) => {
      await memex.navigateToStory('appWithTrackedByField', {
        viewType: 'table',
        serverFeatures: {
          tasklist_block: true,
        },
      })

      const groupName = 'old bug from a long time ago'
      const targetGroupName = 'style nitpick'

      await toggleGroupBy(page, 'Tracked by')

      const rowToDrag = await getTableRowWithinGroup(page, groupName, 0)
      const rowToDragTitle = await getRowTitle(rowToDrag)
      const targetRow = await getTableRowWithinGroup(page, targetGroupName, 0)

      await dragGroupedRow(page, rowToDrag, targetRow)

      const rowAtNewLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, targetGroupName, 1))
      expect(rowAtNewLocationTitle).toEqual(rowToDragTitle)
    })

    test('it does not allow draft issues to be dragged and dropped', async ({page, memex}) => {
      await memex.navigateToStory('appWithTrackedByField', {
        viewType: 'table',
        serverFeatures: {
          tasklist_block: true,
        },
      })

      const groupName = 'No Tracked by'
      const targetGroupName = 'style nitpick'

      await toggleGroupBy(page, 'Tracked by')

      const rowToDrag = await getTableRowWithinGroup(page, groupName, 2)
      const targetRow = await getTableRowWithinGroup(page, targetGroupName, 0)

      await dragGroupedRow(page, rowToDrag, targetRow)

      await memex.toasts.expectErrorMessageVisible(TrackedByResources.Toasts.DraftAndPullsNotSupported.message)
    })

    test('it does not allow PRs to be dragged and dropped', async ({page, memex}) => {
      await memex.navigateToStory('appWithTrackedByField', {
        viewType: 'table',
        serverFeatures: {
          tasklist_block: true,
        },
      })

      const groupName = 'No Tracked by'
      const targetGroupName = 'style nitpick'

      await toggleGroupBy(page, 'Tracked by')

      const rowToDrag = await getTableRowWithinGroup(page, groupName, 1)
      const targetRow = await getTableRowWithinGroup(page, targetGroupName, 0)

      await dragGroupedRow(page, rowToDrag, targetRow)

      await memex.toasts.expectErrorMessageVisible(TrackedByResources.Toasts.DraftAndPullsNotSupported.message)
    })

    test('it warns a user when dragging and dropping a multiply-tracked-by item', async ({page, memex}) => {
      await memex.navigateToStory('appWithTrackedByField', {
        viewType: 'table',
        serverFeatures: {
          tasklist_block: true,
        },
      })

      const groupName = 'style nitpick'
      const targetGroupName = 'No Tracked by'

      await toggleGroupBy(page, 'Tracked by')

      const rowToDrag = await getTableRowWithinGroup(page, groupName, 0)
      const rowToDragTitle = await getRowTitle(rowToDrag)
      const targetRow = await getTableRowWithinGroup(page, targetGroupName, 0)

      // cancelling the move should result in the item not being moved
      await dragGroupedRow(page, rowToDrag, targetRow)
      await submitConfirmDialog(page, 'Cancel')
      expect(await getRowTitle(await getTableRowWithinGroup(page, groupName, 0))).toEqual(rowToDragTitle)

      // confirming the move should result in the item being moved
      await dragGroupedRow(page, rowToDrag, targetRow)
      await submitConfirmDialog(page, 'Move')
      const rowAtNewLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, targetGroupName, 1))
      expect(rowAtNewLocationTitle).toEqual(rowToDragTitle)
    })
  })

  test.describe('Parent issue', () => {
    test('it allows dragging and dropping between different parents', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithSubIssues', {
        viewType: 'table',
        serverFeatures: {
          sub_issues: true,
        },
      })

      const groupName = 'Parent One'
      const targetGroupName = 'Parent Two'

      await toggleGroupBy(page, 'Parent issue')

      const rowToDrag = await getTableRowWithinGroup(page, groupName, 0)
      const rowToDragTitle = await getRowTitle(rowToDrag)
      const targetRow = await getTableRowWithinGroup(page, targetGroupName, 0)

      await dragGroupedRow(page, rowToDrag, targetRow)

      const rowAtNewLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, targetGroupName, 1))
      expect(rowAtNewLocationTitle).toEqual(rowToDragTitle)
    })

    test('it allows dragging and dropping between parent to no parent', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithSubIssues', {
        viewType: 'table',
        serverFeatures: {
          sub_issues: true,
        },
      })

      const groupName = 'Parent One'
      const targetGroupName = 'No Parent issue'

      await toggleGroupBy(page, 'Parent issue')

      const rowToDrag = await getTableRowWithinGroup(page, groupName, 0)
      const rowToDragTitle = await getRowTitle(rowToDrag)
      const targetRow = await getTableRowWithinGroup(page, targetGroupName, 0)

      await dragGroupedRow(page, rowToDrag, targetRow)

      const rowAtNewLocationTitle = await getRowTitle(await getTableRowWithinGroup(page, targetGroupName, 1))
      expect(rowAtNewLocationTitle).toEqual(rowToDragTitle)
    })

    test('it does not allow draft issues to be dragged and dropped', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithSubIssues', {
        viewType: 'table',
        serverFeatures: {
          sub_issues: true,
        },
      })

      const groupName = 'No Parent issue'
      const targetGroupName = 'Parent Three'

      await toggleGroupBy(page, 'Parent issue')

      const rowToDrag = await getTableRowWithinGroup(page, groupName, 6)
      const targetRow = await getTableRowWithinGroup(page, targetGroupName, 0)

      await dragGroupedRow(page, rowToDrag, targetRow)

      await memex.toasts.expectErrorMessageVisible(ParentIssueResources.toasts.draftAndPullsNotSupported.message)
    })

    test('it does not allow PRs to be dragged and dropped', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithSubIssues', {
        viewType: 'table',
        serverFeatures: {
          sub_issues: true,
        },
      })

      const groupName = 'No Parent issue'
      const targetGroupName = 'Parent Three'

      await toggleGroupBy(page, 'Parent issue')

      const rowToDrag = await getTableRowWithinGroup(page, groupName, 1)
      const targetRow = await getTableRowWithinGroup(page, targetGroupName, 0)

      await dragGroupedRow(page, rowToDrag, targetRow)

      await memex.toasts.expectErrorMessageVisible(ParentIssueResources.toasts.draftAndPullsNotSupported.message)
    })
  })

  test('it shows an alert when dragged and dropped during a server error', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithSubIssues', {
      forceErrorMode: true,
    })

    const groupName = 'No Parent issue'
    const targetGroupName = 'Parent Three'

    await toggleGroupBy(page, 'Parent issue')

    const rowToDrag = await getTableRowWithinGroup(page, groupName, 2)
    const targetRow = await getTableRowWithinGroup(page, targetGroupName, 0)

    await dragGroupedRow(page, rowToDrag, targetRow)

    await expect(page.getByRole('alertdialog', {name: "Item can't be moved"})).toBeVisible()
    await expect(page.getByRole('alertdialog')).toContainText("Item can't be moved")
    await expect(page.getByRole('alertdialog')).toContainText('Failed to update item')
  })
})

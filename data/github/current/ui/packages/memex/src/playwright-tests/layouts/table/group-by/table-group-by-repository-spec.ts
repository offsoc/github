import {expect} from '@playwright/test'

import {Resources} from '../../../../client/strings'
import {test} from '../../../fixtures/test-extended'
import {isGroupedBy, isNotGroupedBy, isSortedBy} from '../../../helpers/table/assertions'
import {dragGroupedRow, sortByColumnName, toggleGroupBy} from '../../../helpers/table/interactions'
import {getGroupNamesInTable, getTableRowWithinGroup} from '../../../helpers/table/selectors'

const RepositoryColumnId = 'Repository'
const RepositoryField = 'Repository'
const RepositoryNameWithOwner = 'github/github'
const RepositoryNameWithOwnerRegex = /.+\/[^/]+$/

test.describe('Group By Repository', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('reactTableWithItems', {
      viewType: 'table',
    })
  })

  test('it allows group by repository', async ({page}) => {
    // No grouping to begin with
    await isNotGroupedBy(page, RepositoryField, RepositoryColumnId)

    // Turn on Repository grouping.
    await toggleGroupBy(page, RepositoryField)
    await isGroupedBy(page, RepositoryField, RepositoryNameWithOwner)

    // Turn off Repository grouping.
    await toggleGroupBy(page, RepositoryField)
    await isNotGroupedBy(page, RepositoryField, RepositoryColumnId)
  })

  test('it should render groups in asc order by default with a correctly formatted repo name', async ({page}) => {
    await toggleGroupBy(page, RepositoryField)

    const groupRepositoryNameList = await getGroupNamesInTable(page)
    const lastGroupName = groupRepositoryNameList.pop()

    expect(lastGroupName).toEqual('No Repository')

    // check that repo names match the name with owner format
    for (const groupRepositoryName of groupRepositoryNameList) {
      expect(groupRepositoryName).toMatch(RepositoryNameWithOwnerRegex)
    }

    // check that the repo names are in alphabetical order
    for (let i = 0; i < groupRepositoryNameList.length - 1; ++i) {
      expect(groupRepositoryNameList[i] < groupRepositoryNameList[i + 1]).toEqual(true)
    }
  })

  test('user can sort groups in desc order based on the repository name', async ({page}) => {
    await toggleGroupBy(page, RepositoryField)

    // groups are initially sorted in ascending order
    const expectedDescOrder = (await getGroupNamesInTable(page)).reverse()

    await sortByColumnName(page, RepositoryField, Resources.tableHeaderContextMenu.sortDescending)
    await isSortedBy(page, 'Repository')

    const values = await getGroupNamesInTable(page)
    expect(values).toEqual(expectedDescOrder)
  })

  test('user can sort groups in asc order based on repository name', async ({page}) => {
    await toggleGroupBy(page, RepositoryField)

    // groups are initially sorted by start date in ascending order
    const expectedAscOrder = await getGroupNamesInTable(page)

    // 1st sort in descending order
    await sortByColumnName(page, RepositoryField, Resources.tableHeaderContextMenu.sortDescending)
    // sort by ascending order
    await sortByColumnName(page, RepositoryField)
    await isSortedBy(page, 'Repository')

    const values = await getGroupNamesInTable(page)
    expect(values).toEqual(expectedAscOrder)
  })
})

test.describe('Group By Repository', () => {
  //github.com/github/memex/issues/9430
  test.fixme(
    'user cannot move items between repository groups, it is a read only field',
    async ({page, memex, browserName}) => {
      // this test fails on firefox - ubuntu, which is the same for `table-group-by-drag-and-drop-spec`
      // this can also be validated by page.screenshot where DnD works in other browsers except firefox
      // for reference we tried suggestions from: https://github.com/microsoft/playwright/issues/1094,
      test.fixme(browserName === 'firefox', 'cannot Group by drag and drop with Playwright in firefox')

      await memex.navigateToStory('reactTableWithItems', {
        viewType: 'table',
      })

      await toggleGroupBy(page, RepositoryField)

      const groups = await getGroupNamesInTable(page)

      const firstGroup = groups[0]
      const targetGroup = groups[1]

      const targetRow = await getTableRowWithinGroup(page, targetGroup, 0)

      // test error message cases when drag and dropping rows between repo groups
      const pullRequestRow = await getTableRowWithinGroup(page, firstGroup, 0)
      const issueRow = await getTableRowWithinGroup(page, firstGroup, 2)

      // TODO: Add draft issue test case. Currently doesn't work because dragging it from
      // the bottom of the window (since it's always in No Repository) to the target group breaks
      // the drag and drop interaction
      // const draftIssueRow = await getTableRowWithinGroup(page, 'No Repository', 0)

      const testCases = [
        {
          row: pullRequestRow,
          expectedAlertMessage:
            'Unable to transfer pull requestPull requests cannot be moved between repositories.Got it!',
        },
        {
          row: issueRow,
          expectedAlertMessage:
            'Transfer issueYou can transfer this issue to a different repository from the issue page.Got it!',
        },
      ]

      for (const testCase of testCases) {
        // Drag the row to another group
        await dragGroupedRow(page, testCase.row, targetRow)

        // expect a confirm dialog with error message
        const dialog = page.getByRole('alertdialog')
        await expect(dialog).toBeVisible()
        await expect(dialog).toHaveText(testCase.expectedAlertMessage)

        await page.keyboard.press('Escape')
      }
    },
  )
})

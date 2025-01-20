import {expect, type Page} from '@playwright/test'

import {test} from '../../../fixtures/test-extended'
import {_} from '../../../helpers/dom/selectors'
import {isNotGroupedBy} from '../../../helpers/table/assertions'
import {createItemFromGroupFooter, toggleGroupBy} from '../../../helpers/table/interactions'
import {
  cellTestId,
  getGroupNamesInTable,
  getTableGroups,
  getTableIndexForRowInGroup,
  type TableGroup,
} from '../../../helpers/table/selectors'

/**
 * Use a special collator to make sure that when grouping by number we sort in numerical order
 * (e.g. '1', '2', '10') rather than lexical order (e.g. '1', '10', '2').
 *
 * This doesn't otherwise affect string comparisons, so it has no effect when we group by other
 * types (which each represent the group value as a string).
 *
 * https://stackoverflow.com/a/38641281
 */
const NUMERIC_COLLATOR = new Intl.Collator(undefined, {numeric: true})

type ParentIssueGroup = {
  name: string
  testId: string
  parentIssue: string
  isNoParentIssueGroup: boolean
}

function getParentIssueGroupNames(groups: Array<TableGroup>): Array<ParentIssueGroup> {
  return groups.map(g => {
    const {name, testId} = g
    const isNoParentIssueGroup = name.toLocaleLowerCase() === 'no parent issue'
    return {...g, isNoParentIssueGroup, parentIssue: isNoParentIssueGroup ? '' : testId}
  })
}

function sortParentIssueGroup(a: ParentIssueGroup, b: ParentIssueGroup) {
  return NUMERIC_COLLATOR.compare(a.name, b.name)
}

/** Read the text content of a table cell and convert into an array of assignees */
async function extractParentIssueFromCell(page: Page, selector: string): Promise<string> {
  const parentIssueCellValue = await page.textContent(selector)

  // Get the title of the parent issue from the parent issue pill i.e. Parent One #10
  return parentIssueCellValue.split('#')[0].trim()
}

test.describe('Group by Parent issue', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithSubIssues', {
      viewType: 'table',
      serverFeatures: {
        memex_group_by_multi_value_changes: true,
        sub_issues: true,
      },
    })
  })

  test('should display groups when grouped by parent issue', async ({page}) => {
    await isNotGroupedBy(page, 'Parent issue', 'No Parent issue')

    await toggleGroupBy(page, 'Parent issue')
    const groupNames = await getGroupNamesInTable(page)

    expect(groupNames.length).not.toBe(0)
  })

  test('should group by Parent issue in ascending order', async ({page}) => {
    await toggleGroupBy(page, 'Parent issue')

    const tableGroups = await getTableGroups(page)
    const allGroups = getParentIssueGroupNames(tableGroups)

    const groups = allGroups.filter(g => !g.isNoParentIssueGroup)
    const noParentIssueGroupIndex = allGroups.findIndex(g => g.isNoParentIssueGroup)
    const expectedSortedOrder = groups.sort(sortParentIssueGroup)

    // validate there's visible groups and that each group is sorted in ascending order
    expect(allGroups.length).not.toBe(0)
    expect(groups).toEqual(expectedSortedOrder)

    // validate that we have a `No Parent issue` group and that is the last group in the list
    expect(noParentIssueGroupIndex).not.toBe(-1)
    expect(noParentIssueGroupIndex).toBe(allGroups.length - 1)
  })

  test('should add parent issue to an Issue', async ({page, memex}) => {
    await toggleGroupBy(page, 'Parent issue')

    const tableGroups = await getTableGroups(page)
    const allGroups = getParentIssueGroupNames(tableGroups)

    const firstGroup = allGroups[0]
    const expectedParentIssue = firstGroup.parentIssue

    await createItemFromGroupFooter(page, memex, firstGroup.testId)

    const newRowIndex = await getTableIndexForRowInGroup(page, firstGroup.testId, 1)
    const actualParentIssue = await extractParentIssueFromCell(page, _(cellTestId(newRowIndex, 'Parent issue')))

    expect(expectedParentIssue).toEqual(actualParentIssue)
  })
})

import {expect, type Page} from '@playwright/test'

import {test} from '../../../fixtures/test-extended'
import {_} from '../../../helpers/dom/selectors'
import {isNotGroupedBy} from '../../../helpers/table/assertions'
import {
  addDraftItem,
  createItemFromGroupFooter,
  type CreateItemOptions,
  focusOnFooterForGroup,
  toggleGroupBy,
} from '../../../helpers/table/interactions'
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

/** Read the text content of a table cell and convert into an array of assignees */
async function extractAssigneesFromCell(page: Page, selector: string): Promise<Array<string>> {
  const assigneesCellValue = await page.textContent(selector)

  const filteredText = assigneesCellValue.replace(' and ', ',')
  return filteredText.split(',').map(i => i.trim())
}

type AssigneeGroup = {
  name: string
  testId: string
  assignees: Array<string>
  isNoAssigneesGroup: boolean
}

function getAssigneeGroupNames(groups: Array<TableGroup>): Array<AssigneeGroup> {
  return groups.map(g => {
    const {name, testId} = g

    const isNoAssigneesGroup = name.toLocaleLowerCase() === 'no assignees'
    const assignees = testId.split('_')

    return {...g, isNoAssigneesGroup, assignees: isNoAssigneesGroup ? [] : assignees}
  })
}

function sortAssigneeGroups(a: AssigneeGroup, b: AssigneeGroup) {
  return NUMERIC_COLLATOR.compare(a.name, b.name)
}

test.describe('Group by Assignees', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'table',
    })
  })

  test('should display groups', async ({page}) => {
    await isNotGroupedBy(page, 'Assignees', 'No Assignee')

    await toggleGroupBy(page, 'Assignees')
    const groupNames = await getGroupNamesInTable(page)

    expect(groupNames.length).not.toBe(0)
  })

  test('should group by Assignee in alphabetical ascending order', async ({page}) => {
    await toggleGroupBy(page, 'Assignees')

    const tableGroups = await getTableGroups(page)
    const allGroups = getAssigneeGroupNames(tableGroups)

    const groups = allGroups.filter(g => !g.isNoAssigneesGroup)
    const noAssigneesGroupIndex = allGroups.findIndex(g => g.isNoAssigneesGroup)
    const expectedSortedOrder = groups.sort(sortAssigneeGroups)

    // validate there's visible groups and that each group is sorted in alphabetical order
    expect(allGroups.length).not.toBe(0)
    expect(groups).toEqual(expectedSortedOrder)

    // validate that we have a `No Assignee` group and that is the last group in the list
    expect(noAssigneesGroupIndex).not.toBe(-1)
    expect(noAssigneesGroupIndex).toBe(allGroups.length - 1)
  })

  test('should add assignees to an Issue', async ({page, memex}) => {
    await toggleGroupBy(page, 'Assignees')
    const tableGroups = await getTableGroups(page)
    const allGroups = getAssigneeGroupNames(tableGroups)

    const firstGroup = allGroups[0]
    const expectedAssignees = firstGroup.assignees

    await createItemFromGroupFooter(page, memex, firstGroup.testId)

    const newRowIndex = await getTableIndexForRowInGroup(page, firstGroup.testId, 1)
    const actualAssignees = await extractAssigneesFromCell(page, _(cellTestId(newRowIndex, 'Assignees')))

    expect(expectedAssignees).toEqual(actualAssignees)
  })

  test('should add assignees to a Pull Request', async ({page, memex}) => {
    const pullRequestOptions: CreateItemOptions = {
      expectsRepoCount: 8,
      targetRepo: 'memex',
      itemTitle: 'Pull Request',
      waitForRender: true,
    }

    await toggleGroupBy(page, 'Assignees')
    const tableGroups = await getTableGroups(page)
    const allGroups = getAssigneeGroupNames(tableGroups)

    const firstGroup = allGroups[0]
    const expectedAssignees = firstGroup.assignees

    await createItemFromGroupFooter(page, memex, firstGroup.testId, pullRequestOptions)

    const newRowIndex = await getTableIndexForRowInGroup(page, firstGroup.testId, 1)
    const actualAssignees = await extractAssigneesFromCell(page, _(cellTestId(newRowIndex, 'Assignees')))

    expect(expectedAssignees).toEqual(actualAssignees)
  })
})

test.describe('Group by Assignees', () => {
  test('should add assignees to Draft issues', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'table',
    })

    await toggleGroupBy(page, 'Assignees')
    const tableGroups = await getTableGroups(page)
    const allGroups = getAssigneeGroupNames(tableGroups)

    const firstGroup = allGroups[0]
    const expectedAssignees = firstGroup.assignees

    await focusOnFooterForGroup(page, memex, firstGroup.testId)
    await addDraftItem(page, 'To Do')

    const newRowIndex = await getTableIndexForRowInGroup(page, firstGroup.testId, 1)
    const actualAssignees = await extractAssigneesFromCell(page, _(cellTestId(newRowIndex, 'Assignees')))

    expect(expectedAssignees).toEqual(actualAssignees)
  })
})

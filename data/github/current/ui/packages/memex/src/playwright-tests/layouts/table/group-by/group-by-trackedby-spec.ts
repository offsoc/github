import {expect} from '@playwright/test'

import {test} from '../../../fixtures/test-extended'
import {expectGroupHasRows, isNotGroupedBy} from '../../../helpers/table/assertions'
import {toggleGroupBy} from '../../../helpers/table/interactions'
import {getGroupNamesInTable, getTableGroups, type TableGroup} from '../../../helpers/table/selectors'

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

type TrackedbyGroup = {
  name: string
  testId: string
  trackedBy: string
  isNoTrackedByGroup: boolean
}

function getTrackedByGroupNames(groups: Array<TableGroup>): Array<TrackedbyGroup> {
  return groups.map(g => {
    const {name, testId} = g
    const isNoTrackedByGroup = name.toLocaleLowerCase() === 'no tracked by'
    return {...g, isNoTrackedByGroup, trackedBy: isNoTrackedByGroup ? '' : testId}
  })
}

function sortTrackedbyGroup(a: TrackedbyGroup, b: TrackedbyGroup) {
  return NUMERIC_COLLATOR.compare(a.name, b.name)
}

test.describe('Group by Tracked By', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('appWithTrackedByField', {
      viewType: 'table',
      serverFeatures: {
        memex_group_by_multi_value_changes: true,
        tasklist_block: true,
      },
    })
  })

  test('should display groups when grouped by tracked by', async ({page}) => {
    await isNotGroupedBy(page, 'Tracked by', 'No Tracked by')

    await toggleGroupBy(page, 'Tracked by')
    const groupNames = await getGroupNamesInTable(page)

    expect(groupNames.length).not.toBe(0)
  })

  test('should group by Tracked By in ascending order of fullDisplayName', async ({page}) => {
    await toggleGroupBy(page, 'Tracked by')

    const tableGroups = await getTableGroups(page)
    const allGroups = getTrackedByGroupNames(tableGroups)

    const groups = allGroups.filter(g => !g.isNoTrackedByGroup)
    const noTrackedByGroupIndex = allGroups.findIndex(g => g.isNoTrackedByGroup)
    const expectedSortedOrder = groups.sort(sortTrackedbyGroup)

    // validate there's visible groups and that each group is sorted in ascending order of fullDisplayName
    expect(allGroups.length).not.toBe(0)
    expect(groups).toEqual(expectedSortedOrder)

    // validate that we have a `No Tracked By` group and that is the last group in the list
    expect(noTrackedByGroupIndex).not.toBe(-1)
    expect(noTrackedByGroupIndex).toBe(allGroups.length - 1)
  })
})

test.describe('missing issues row', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('appWithTrackedByField', {
      viewType: 'table',
      serverFeatures: {
        memex_group_by_multi_value_changes: true,
        tasklist_block: true,
      },
    })
  })

  test('should be visible when "tasklist_block" feature flag is enabled', async ({page}) => {
    await toggleGroupBy(page, 'Tracked by')

    const tableGroups = await getTableGroups(page)
    const allGroups = getTrackedByGroupNames(tableGroups)

    const groups = allGroups.filter(g => !g.isNoTrackedByGroup)
    const expectedSortedOrder = groups.sort(sortTrackedbyGroup)

    // validate there's visible groups and that each group is sorted in ascending order of fullDisplayName
    expect(allGroups.length).not.toBe(0)
    expect(groups).toEqual(expectedSortedOrder)

    const missingIssuesButtons = page.getByTestId('tracked-by-missing-issues-button')
    await expect(missingIssuesButtons).toHaveCount(3)
  })

  test('should display the items menu and bulk add options when the sub-footer is clicked', async ({page}) => {
    await toggleGroupBy(page, 'Tracked by')

    const missingItemsButton = page.getByTestId('tracked-by-missing-issues-button').first()

    // Button for the first table group
    await missingItemsButton.click()

    const missingIssuesMenu = page.getByTestId('tracked-by-missing-issues-menu')

    // Remove the empty strings from names after getting them, because Safari preserves the newlines in the names like "\nChild 1\n"
    const missingIssuesMenuItems = (await missingIssuesMenu.allInnerTexts())[0].split('\n').filter(Boolean)

    await expect(missingIssuesMenu).toHaveCount(1)

    expect(missingIssuesMenuItems.length).toBe(3)
    expect(missingIssuesMenuItems).toEqual([
      'Add all 2 items', //bulk add option
      'A closed issue that can be added',
      'I am an integration test fixture',
    ])
  })

  test('should add single item from the drop down', async ({page}) => {
    await toggleGroupBy(page, 'Tracked by')
    await expectGroupHasRows(page, 'old bug from a long time ago', 1)

    const missingItemsButton = page.getByTestId('tracked-by-missing-issues-button').first()

    // Button for the first table group
    await missingItemsButton.click()
    const singleItemFromDropDown = page.getByTestId('tracked-by-missing-issue-row-A closed issue that can be added')
    await singleItemFromDropDown.click()

    await expectGroupHasRows(page, 'old bug from a long time ago', 2)
  })

  test('should bulk add multiple items from the drop down', async ({page}) => {
    await toggleGroupBy(page, 'Tracked by')
    await expectGroupHasRows(page, 'old bug from a long time ago', 1)

    const missingItemsButton = page.getByTestId('tracked-by-missing-issues-button').first()

    // Button for the first table group
    await missingItemsButton.click()
    const singleItemFromDropDown = page.getByTestId('tracked-by-missing-issues-menu-add-all')
    await singleItemFromDropDown.click()

    await expectGroupHasRows(page, 'old bug from a long time ago', 3)
  })
})

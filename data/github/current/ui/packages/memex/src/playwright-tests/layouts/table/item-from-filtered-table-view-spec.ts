import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'
import {groupContainsRows} from '../../helpers/dom/assertions'
import {_} from '../../helpers/dom/selectors'
import {expectGroupHasRowCount} from '../../helpers/table/assertions'
import {
  addDraftItem,
  createItemFromGroupFooter,
  createItemFromOmnibar,
  createItemOptionDefaults,
  type CreateItemOptions,
  focusOnFooterForGroup,
  toggleGroupBy,
} from '../../helpers/table/interactions'
import {
  cellTestId,
  getItemRowCountWithinGroup,
  getTableDataRows,
  getTableIndexForRowInGroup,
} from '../../helpers/table/selectors'
import {TestsResources} from '../../types/resources'

const DATE_COLUMN_NAME = 'Due Date'
const ITERATION_COLUMN_NAME = 'Iteration'

interface MockFilter {
  filter: string
  field: string
  fieldDataType: string
  fieldValue: string
}

const TEST_FILTERS: Array<MockFilter> = [
  {
    filter: 'assignees:lerebear',
    field: 'Assignees',
    fieldDataType: 'assignees',
    fieldValue: 'lerebear',
  },
  {
    filter: 'status:Backlog',
    field: 'Status',
    fieldDataType: 'singleSelect',
    fieldValue: 'Backlog',
  },
  {
    filter: 'estimate:1',
    field: 'Estimate',
    fieldDataType: 'number',
    fieldValue: '1',
  },
  {
    filter: 'team:"Novelty Aardvarks"',
    field: 'Team',
    fieldDataType: 'text',
    fieldValue: 'Novelty Aardvarks',
  },
]

const pullRequestOptions: CreateItemOptions = {
  expectsRepoCount: 8,
  targetRepo: 'memex',
  itemTitle: 'Pull Request',
  waitForRender: true,
}

const excludeAssignees = ({fieldDataType}: MockFilter) => fieldDataType !== 'assignees'

test.describe('Filtered views', () => {
  test.slow()
  test.describe('Default page', () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'table',
      })
    })

    test.describe('Issue - item creation', () => {
      for (const {filter, field, fieldDataType, fieldValue} of TEST_FILTERS.filter(excludeAssignees)) {
        test(`should apply ${field} from filter field value with "${fieldDataType}" data type`, async ({
          page,
          memex,
        }) => {
          await memex.filter.filterBy(filter)
          const rowsBeforeInsertion = await getTableDataRows(page)
          await createItemFromOmnibar(page, memex)

          // Validate there's one additional row of field type
          // and that it has been assigned to the filter field value
          const insertionIndex = rowsBeforeInsertion.length // the last row for insertion
          await expect(page.getByTestId(cellTestId(insertionIndex, field))).toHaveText(fieldValue)
          await memex.toasts.expectErrorMessageHidden()
        })
      }

      test('should apply assignee from filter field value with "assignees" data type', async ({page, memex}) => {
        const [ASSIGNEE] = TEST_FILTERS
        await memex.filter.filterBy(ASSIGNEE.filter)
        const rowsBeforeInsertion = await getTableDataRows(page)
        await createItemFromOmnibar(page, memex)

        // Validate there's one additional row of field type
        // and that it has been assigned to the filter field value
        const insertionIndex = rowsBeforeInsertion.length // the last row for insertion

        // We can apply assignees to an empty field or a field containing one or more assignees
        // in the integrating environment we could randomly have one or many users assigned to an issue
        // 1. We now need to wait for all assignees due to assigment through the asynchronous suggestions flow
        // 2. We split with an `and` continue to make sure the list contains the assignee field value
        const assignees = (await page.textContent(_(cellTestId(insertionIndex, ASSIGNEE.field))))
          .split(' and ')
          .map(assignee => assignee.trim())
        // Account for temporary space at the beginning due to https://github.com/github/memex/issues/16409

        // expect that the list of assignees includes our filter value
        expect(assignees).toContain(ASSIGNEE.fieldValue)
        await memex.toasts.expectErrorMessageHidden()
      })

      test('should not apply an assignee when more than one assignee filter value', async ({page, memex}) => {
        const [ASSIGNEE] = TEST_FILTERS
        await memex.filter.filterBy(`${ASSIGNEE.filter},another-login`)
        await createItemFromOmnibar(page, memex, {...createItemOptionDefaults, waitForRender: false})

        await memex.toasts.expectErrorMessageVisible("The new item is hidden by this view's filters.")
      })

      test('should apply milestone from filter field value with "milestone" data type', async ({page, memex}) => {
        await memex.filter.filterBy('milestone:"Sprint 9"')
        const rowsBeforeInsertion = await getTableDataRows(page)
        await createItemFromOmnibar(page, memex)

        // Validate there's one additional row of field type
        // and that it has been assigned to the filter field value
        const insertionIndex = rowsBeforeInsertion.length // the last row for insertion
        await expect(page.getByTestId(cellTestId(insertionIndex, 'Milestone'))).toHaveText('Sprint 9')
        await memex.toasts.expectErrorMessageHidden()
      })

      test('should apply label from filter field value with "label" data type', async ({page, memex}) => {
        await memex.filter.filterBy('label:backend')
        const rowsBeforeInsertion = await getTableDataRows(page)
        await createItemFromOmnibar(page, memex)

        // Validate there's one additional row of field type
        // and that it has been assigned to the filter field value
        const insertionIndex = rowsBeforeInsertion.length // the last row for insertion
        await expect(page.getByTestId(cellTestId(insertionIndex, 'Labels'))).toHaveText('backend')
        await memex.toasts.expectErrorMessageHidden()
      })

      test('should show toast if assignee in filter field does not exist on repository', async ({page, memex}) => {
        await test.expect(getTableDataRows(page)).resolves.toHaveLength(8)
        await memex.filter.filterBy('assignee:"does-not-exist"')
        await createItemFromOmnibar(page, memex, {...createItemOptionDefaults, waitForRender: false})

        // Assert that we displayed a warning toast.
        await memex.toasts.expectErrorMessageVisible(TestsResources.newItemFilterWarning)
        // Ensure that the item was created
        await memex.filter.CLEAR_FILTER_BUTTON.click()
        await test.expect(getTableDataRows(page)).resolves.toHaveLength(9)
      })

      test('should show toast if milestone in filter field does not exist on repository', async ({page, memex}) => {
        await memex.filter.filterBy('milestone:"does not exist"')
        await createItemFromOmnibar(page, memex, {...createItemOptionDefaults, waitForRender: false})

        // Assert that we displayed a warning toast.
        await memex.toasts.expectErrorMessageVisible(TestsResources.newItemFilterWarning)
      })

      test('should show toast if label in filter field does not exist on repository', async ({page, memex}) => {
        await memex.filter.filterBy('label:does-not-exist-label')
        await createItemFromOmnibar(page, memex, {...createItemOptionDefaults, waitForRender: false})

        // Assert that we displayed a warning toast.
        await memex.toasts.expectErrorMessageVisible(TestsResources.newItemFilterWarning)
      })

      test('should apply Due Date from filter field value with "date" data type', async ({page, memex}) => {
        const cellDateContent = await page.textContent(_(cellTestId(0, DATE_COLUMN_NAME)))
        const targetDate = new Date(`${cellDateContent}, UTC`).toISOString().slice(0, 10)

        await memex.filter.filterBy(`due-date:"${targetDate}"`)
        const rowsBeforeInsertion = await getTableDataRows(page)
        await createItemFromOmnibar(page, memex)

        // Validate there's one additional row of field type
        // and that it has been assigned to the filter field value
        const insertionIndex = rowsBeforeInsertion.length // the last row for insertion
        await expect(page.getByTestId(cellTestId(insertionIndex, DATE_COLUMN_NAME))).toHaveText(cellDateContent)
        await memex.toasts.expectErrorMessageHidden()
      })

      test('should apply values from a complex filter containing "multiple" `AND` conditions', async ({
        page,
        memex,
      }) => {
        const complexFilter = TEST_FILTERS.map(({filter}) => filter).join(' ')

        await memex.filter.filterBy(complexFilter)
        const rowsBeforeInsertion = await getTableDataRows(page)
        await createItemFromOmnibar(page, memex)

        // Validate there's one additional row of field type
        // and that it has been assigned to the filter field value
        const insertionIndex = rowsBeforeInsertion.length // the last row for insertion
        for (const {field, fieldValue} of TEST_FILTERS) {
          await expect(page.getByTestId(cellTestId(insertionIndex, field))).toContainText(fieldValue)
        }

        await memex.toasts.expectErrorMessageHidden()
      })

      test('should apply values from a complex filter containing multiple suggested columns', async ({page, memex}) => {
        const [ASSIGNEE] = TEST_FILTERS
        const LABELS = {
          filter: 'label:backend',
          field: 'Labels',
          fieldValue: 'backend',
          dataType: 'label',
        }
        const filters = [ASSIGNEE, LABELS]
        const complexFilter = filters.map(({filter}) => filter).join(' ')

        await memex.filter.filterBy(complexFilter)
        const rowsBeforeInsertion = await getTableDataRows(page)
        await createItemFromOmnibar(page, memex)

        // Validate there's one additional row of field type
        // and that it has been assigned to the filter field value
        const insertionIndex = rowsBeforeInsertion.length // the last row for insertion
        for (const {field, fieldValue} of filters) {
          await expect(page.getByTestId(cellTestId(insertionIndex, field))).toContainText(fieldValue)
        }

        await memex.toasts.expectErrorMessageHidden()
      })
    })

    test.describe('Draft Issue - item creation', () => {
      test('should add the assignee to the draft issue', async ({page, memex}) => {
        const [ASSIGNEE] = TEST_FILTERS

        await memex.filter.filterBy(ASSIGNEE.filter)
        const rowsBeforeInsertion = await getTableDataRows(page)

        const plusButton = await page.waitForSelector(_('new-item-button'))
        await plusButton.click()

        await addDraftItem(page, 'To Do')

        // Validate there's one additional row of field type
        // and that it has been assigned to the filter field value
        const insertionIndex = rowsBeforeInsertion.length // the last row for insertion
        await expect(page.getByTestId(cellTestId(insertionIndex, 'Assignees'))).toContainText(ASSIGNEE.fieldValue)
        await memex.toasts.expectErrorMessageHidden()
      })

      test(`should show a toast when a milestone is in the filter`, async ({page, memex}) => {
        await memex.filter.filterBy('milestone:"Sprint 9"')

        const plusButton = await page.waitForSelector(_('new-item-button'))
        await plusButton.click()
        await addDraftItem(page, 'this should err', 'Enter', false)

        // Assert that we displayed a warning toast.
        await memex.toasts.expectErrorMessageVisible(TestsResources.newItemFilterWarning)
      })

      test(`should show a toast when a label is in the filter`, async ({page, memex}) => {
        await memex.filter.filterBy('label:backend')

        const plusButton = await page.waitForSelector(_('new-item-button'))
        await plusButton.click()
        await addDraftItem(page, 'this should err', 'Enter', false)

        // Assert that we displayed a warning toast.
        await memex.toasts.expectErrorMessageVisible(TestsResources.newItemFilterWarning)
      })

      for (const {filter, field, fieldDataType, fieldValue} of TEST_FILTERS.filter(excludeAssignees)) {
        test(`should apply ${field} from filter field value with "${fieldDataType}" data type`, async ({
          page,
          memex,
        }) => {
          await memex.filter.filterBy(filter)
          const rowsBeforeInsertion = await getTableDataRows(page)

          const plusButton = await page.waitForSelector(_('new-item-button'))
          await plusButton.click()

          await addDraftItem(page, 'To Do')

          // Validate there's one additional row of field type
          // and that it has been assigned to the filter field value
          const insertionIndex = rowsBeforeInsertion.length // the last row for insertion
          await expect(page.getByTestId(cellTestId(insertionIndex, field))).toHaveText(fieldValue)
          await memex.toasts.expectErrorMessageHidden()
        })
      }

      test('should apply Due Date from filter field value with "date" data type', async ({page, memex}) => {
        const cellDateContent = await page.textContent(_(cellTestId(0, DATE_COLUMN_NAME)))
        const targetDate = new Date(`${cellDateContent}, UTC`).toISOString().slice(0, 10)

        await memex.filter.filterBy(`due-date:"${targetDate}"`)
        const rowsBeforeInsertion = await getTableDataRows(page)

        const plusButton = await page.waitForSelector(_('new-item-button'))
        await plusButton.click()

        await addDraftItem(page, 'To Do')

        // Validate there's one additional row of field type
        // and that it has been assigned to the filter field value
        const insertionIndex = rowsBeforeInsertion.length // the last row for insertion
        await expect(page.getByTestId(cellTestId(insertionIndex, DATE_COLUMN_NAME))).toHaveText(cellDateContent)
        await memex.toasts.expectErrorMessageHidden()
      })

      test('should apply values from a complex filter containing "multiple" `AND` conditions', async ({
        page,
        memex,
      }) => {
        const complexFilter = TEST_FILTERS.filter(excludeAssignees)
          .map(({filter}) => filter)
          .join(' ')

        await memex.filter.filterBy(complexFilter)
        const rowsBeforeInsertion = await getTableDataRows(page)

        const plusButton = await page.waitForSelector(_('new-item-button'))
        await plusButton.click()

        await addDraftItem(page, 'To Do')

        // Validate there's one additional row of field type
        // and that it has been assigned to the filter field value
        const insertionIndex = rowsBeforeInsertion.length // the last row for insertion
        for (const {field, fieldValue} of TEST_FILTERS.filter(excludeAssignees)) {
          await expect(page.getByTestId(cellTestId(insertionIndex, field))).toHaveText(fieldValue)
        }

        await memex.toasts.expectErrorMessageHidden()
      })
    })

    test.describe('Pull-request - item creation', () => {
      for (const {filter, field, fieldDataType, fieldValue} of TEST_FILTERS) {
        test(`should apply ${field} from filter field value with "${fieldDataType}" data type`, async ({
          page,
          memex,
        }) => {
          await memex.filter.filterBy(filter)
          const rowsBeforeInsertion = await getTableDataRows(page)
          await createItemFromOmnibar(page, memex, pullRequestOptions)

          // Validate there's one additional row of field type
          // and that it has been assigned to the filter field value
          const insertionIndex = rowsBeforeInsertion.length // the last row for insertion
          // note that our pull request should `not` have any preassigned fields
          await expect(page.getByTestId(cellTestId(insertionIndex, field))).toHaveText(fieldValue)
          await memex.toasts.expectErrorMessageHidden()
        })
      }

      test('should apply Due Date from filter field value with "date" data type', async ({page, memex}) => {
        const cellDateContent = await page.textContent(_(cellTestId(0, DATE_COLUMN_NAME)))
        const targetDate = new Date(`${cellDateContent}, UTC`).toISOString().slice(0, 10)

        await memex.filter.filterBy(`due-date:"${targetDate}"`)
        const rowsBeforeInsertion = await getTableDataRows(page)
        await createItemFromOmnibar(page, memex, pullRequestOptions)

        // Validate there's one additional row of field type
        // and that it has been assigned to the filter field value
        const insertionIndex = rowsBeforeInsertion.length // the last row for insertion
        await expect(page.getByTestId(cellTestId(insertionIndex, DATE_COLUMN_NAME))).toHaveText(cellDateContent)
        await memex.toasts.expectErrorMessageHidden()
      })

      test('should apply values from a complex filter containing "multiple" `AND` conditions', async ({
        page,
        memex,
      }) => {
        const complexFilter = TEST_FILTERS.map(({filter}) => filter).join(' ')

        await memex.filter.filterBy(complexFilter)
        const rowsBeforeInsertion = await getTableDataRows(page)
        await createItemFromOmnibar(page, memex, pullRequestOptions)

        // Validate there's one additional row of field type unnecessary
        // and that it has been assigned to the filter field value
        const insertionIndex = rowsBeforeInsertion.length // the last row for insertion
        for (const {field, fieldValue} of TEST_FILTERS) {
          await expect(page.getByTestId(cellTestId(insertionIndex, field))).toHaveText(fieldValue)
        }

        await memex.toasts.expectErrorMessageHidden()
      })
    })

    test.describe('exclusion filter', () => {
      test('should create an item from "no:status"', async ({page, memex}) => {
        const filter = 'no:status'
        await memex.filter.filterBy(filter)
        const rowsBeforeInsertion = await getTableDataRows(page)
        await createItemFromOmnibar(page, memex)

        // Validate there's one additional row with no status
        // (Cell equivalent to "Empty" string or falsy value)
        const insertionIndex = rowsBeforeInsertion.length // the last row for insertion
        await expect(page.getByTestId(cellTestId(insertionIndex, 'Status'))).toHaveText('')
        await memex.toasts.expectErrorMessageHidden()
      })

      for (const {filter, field, fieldDataType: type, fieldValue} of TEST_FILTERS) {
        // https://github.com/github/memex/issues/9297
        test.fixme(
          `should create item with filter "-${filter}" but must "NOT" apply filter "${type}" value`,
          async ({page, memex}) => {
            await memex.filter.filterBy(`-${filter}`)
            const rowsBeforeInsertion = await getTableDataRows(page)
            await createItemFromOmnibar(page, memex)

            // Validate there's one additional row of field type
            // but should not apply the filter field value
            const insertionIndex = rowsBeforeInsertion.length // the last row for insertion
            await expect(page.getByTestId(cellTestId(insertionIndex, field))).not.toHaveText(fieldValue)
            await memex.toasts.expectErrorMessageHidden()
          },
        )
      }

      test(`should create item with exclusion filter but must "NOT" apply filter "date" value`, async ({
        page,
        memex,
      }) => {
        const cellDateContent = await page.textContent(_(cellTestId(0, DATE_COLUMN_NAME)))
        const targetDate = new Date(`${cellDateContent}, UTC`).toISOString().slice(0, 10)

        await memex.filter.filterBy(`-due-date:"${targetDate}"`)
        const rowsBeforeInsertion = await getTableDataRows(page)
        await createItemFromOmnibar(page, memex)

        // Validate there's one additional row of field type
        // but should not apply the filter Date value
        const insertionIndex = rowsBeforeInsertion.length // the last row for insertion
        await expect(page.getByTestId(cellTestId(insertionIndex, DATE_COLUMN_NAME))).not.toHaveText(cellDateContent)
        await memex.toasts.expectErrorMessageHidden()
      })
    })

    test.describe('Group By column applied', () => {
      const GROUP_BY_FIELDS = TEST_FILTERS.filter(excludeAssignees)

      // https://github.com/github/memex/issues/9455
      for (const {filter, field, fieldDataType, fieldValue} of GROUP_BY_FIELDS) {
        test.fixme(
          `should create item in ${field} group with filter field value with "${fieldDataType}" type`,
          async ({page, memex}) => {
            await toggleGroupBy(page, field)

            await memex.filter.filterBy(filter)
            await createItemFromGroupFooter(page, memex, fieldValue)

            // Validate there's one additional row of field type
            // and that it has been assigned to the filter field value
            await expect(page.getByTestId(cellTestId(8, field))).toHaveText(fieldValue)
            await memex.toasts.expectErrorMessageHidden()
          },
        )
      }

      test('should create item in Date group with filter field value for "date" type', async ({page, memex}) => {
        const cellDateContent = await page.textContent(_(cellTestId(0, DATE_COLUMN_NAME)))
        const targetDate = new Date(`${cellDateContent}, UTC`).toISOString().slice(0, 10)

        const field = 'Due Date'
        const filter = `due-date:"${targetDate}"`
        const initialRowCount = 2

        await toggleGroupBy(page, field)
        await memex.filter.filterBy(filter)

        await focusOnFooterForGroup(page, memex, cellDateContent)
        await addDraftItem(page, 'To Do')
        await groupContainsRows(page, cellDateContent, initialRowCount + 1)

        // Validate there's one additional row of field type
        // and that it has been assigned to the filter field value
        const newRowIndex = await getTableIndexForRowInGroup(page, cellDateContent, initialRowCount)
        await expect(page.getByTestId(cellTestId(newRowIndex, field))).toHaveText(cellDateContent)
        await memex.toasts.expectErrorMessageHidden()
      })

      test('should create Issue for group "AND" apply filter values if the filter does "NOT" contain group', async ({
        page,
        memex,
      }) => {
        const field = 'Status'
        const filter = 'team:"Novelty Aardvarks" estimate:1'
        const targetGroup = 'Backlog'

        await toggleGroupBy(page, field)
        await memex.filter.filterBy(filter)

        const expectedInsertionIndex = await getItemRowCountWithinGroup(page, targetGroup)
        await createItemFromGroupFooter(page, memex, targetGroup)

        // Validate there's one additional row of field type
        // and that each field has the correct value applied according to the filter
        const newRowIndex = await getTableIndexForRowInGroup(page, targetGroup, expectedInsertionIndex)
        await expect(page.getByTestId(cellTestId(newRowIndex, 'Status'))).toHaveText(targetGroup)
        await expect(page.getByTestId(cellTestId(newRowIndex, 'Team'))).toHaveText('Novelty Aardvarks')
        await expect(page.getByTestId(cellTestId(newRowIndex, 'Estimate'))).toHaveText('1')
        await memex.toasts.expectErrorMessageHidden()
      })

      test('should create Draft Issue for group "AND" apply values from a complex filter where the filter does "NOT" contain the group', async ({
        page,
        memex,
      }) => {
        const field = 'Estimate'
        const targetGroup = '1'
        const complexFilter = TEST_FILTERS.filter(excludeAssignees)
          .map(({filter}) => filter)
          .join(' ')

        await toggleGroupBy(page, field)
        await memex.filter.filterBy(complexFilter)

        // create Draft Issue
        await focusOnFooterForGroup(page, memex, targetGroup)
        const expectedInsertionIndex = await getItemRowCountWithinGroup(page, targetGroup)
        await addDraftItem(page, 'To Do')

        // Validate there's one additional row of field type
        // and that each field has the correct value applied according to the filter
        await expectGroupHasRowCount(page, targetGroup, expectedInsertionIndex + 1)
        const newRowIndex = await getTableIndexForRowInGroup(page, targetGroup, expectedInsertionIndex)
        for (const {field: column, fieldValue} of TEST_FILTERS.filter(excludeAssignees)) {
          await expect(page.getByTestId(cellTestId(newRowIndex, column))).toHaveText(fieldValue)
        }
        await memex.toasts.expectErrorMessageHidden()
      })

      test('should create Pull-Request for group "AND" apply filter values if the filter does "NOT" contain group', async ({
        page,
        memex,
      }) => {
        const field = 'Status'
        const filter = 'Team:"Novelty Aardvarks" estimate:1 assignee:traumverloren'
        const targetGroup = 'Backlog'

        await toggleGroupBy(page, field)
        await memex.filter.filterBy(filter)
        const expectedInsertionIndex = await getItemRowCountWithinGroup(page, targetGroup)
        await createItemFromGroupFooter(page, memex, targetGroup, pullRequestOptions)

        // Validate there's one additional row of field type
        // and that each field has the correct value applied according to the filter
        await expectGroupHasRowCount(page, targetGroup, expectedInsertionIndex + 1)
        const newRowIndex = await getTableIndexForRowInGroup(page, targetGroup, expectedInsertionIndex)
        await expect(page.getByTestId(cellTestId(newRowIndex, 'Status'))).toHaveText(targetGroup)
        await expect(page.getByTestId(cellTestId(newRowIndex, 'Team'))).toHaveText('Novelty Aardvarks')
        await expect(page.getByTestId(cellTestId(newRowIndex, 'Estimate'))).toHaveText('1')
        await memex.toasts.expectErrorMessageHidden()
      })
    })
  })

  test('should apply Iteration from filter field value for issue item creation', async ({page, memex}) => {
    await memex.navigateToStory('appWithIterationsField', {
      viewType: 'table',
    })
    await memex.filter.filterBy('iteration:"Iteration 4"')
    const rowsBeforeInsertion = await getTableDataRows(page)
    await createItemFromOmnibar(page, memex)

    // Validate there's one additional row of field type
    // and that it has been assigned to the filter field value
    const insertionIndex = rowsBeforeInsertion.length // the last row for insertion
    await expect(page.getByTestId(cellTestId(insertionIndex, ITERATION_COLUMN_NAME))).toHaveText('Iteration 4')
    await memex.toasts.expectErrorMessageHidden()
  })

  test('should apply Iteration from filter field value for draft issue item creation for draft issue item creation', async ({
    page,
    memex,
  }) => {
    await memex.navigateToStory('appWithIterationsField', {viewType: 'table'})

    await memex.filter.filterBy('iteration:"Iteration 4"')
    const rowsBeforeInsertion = await getTableDataRows(page)

    const plusButton = await page.waitForSelector(_('new-item-button'))
    await plusButton.click()

    await addDraftItem(page, 'To Do')

    // Validate there's one additional row of field type
    // and that it has been assigned to the filter field value
    const insertionIndex = rowsBeforeInsertion.length // the last row for insertion
    await expect(page.getByTestId(cellTestId(insertionIndex, ITERATION_COLUMN_NAME))).toHaveText('Iteration 4')
    await memex.toasts.expectErrorMessageHidden()
  })

  test('should apply Iteration from filter field value for pull-request item creation', async ({page, memex}) => {
    await memex.navigateToStory('appWithIterationsField', {viewType: 'table'})

    await memex.filter.filterBy('iteration:"Iteration 4"')
    const rowsBeforeInsertion = await getTableDataRows(page)
    await createItemFromOmnibar(page, memex, pullRequestOptions)

    // Validate there's one additional row of field type
    // and that it has been assigned to the filter field value
    const insertionIndex = rowsBeforeInsertion.length // the last row for insertion
    await expect(page.getByTestId(cellTestId(insertionIndex, ITERATION_COLUMN_NAME))).toHaveText('Iteration 4')
    await memex.toasts.expectErrorMessageHidden()
  })

  test('should create item with exclusion filter but must "NOT" apply filter "iteration" value', async ({
    page,
    memex,
  }) => {
    await memex.navigateToStory('appWithIterationsField', {viewType: 'table'})

    await memex.filter.filterBy('-iteration:"Iteration 4"')
    const rowsBeforeInsertion = await getTableDataRows(page)
    await createItemFromOmnibar(page, memex)

    // Validate there's one additional row of field type
    // but should not apply the filter Iteration value
    const insertionIndex = rowsBeforeInsertion.length // the last row for insertion
    await expect(page.getByTestId(cellTestId(insertionIndex, ITERATION_COLUMN_NAME))).not.toHaveText('Iteration 4')
    await memex.toasts.expectErrorMessageHidden()
  })

  test('should create item in Iteration group with value applied for "iteration" type', async ({page, memex}) => {
    const field = 'Iteration'
    const fieldValue = 'Iteration 4'

    const filter = `iteration:"${fieldValue}"`

    await memex.navigateToStory('appWithIterationsField', {
      viewType: 'table',
      filterQuery: filter,
    })
    await toggleGroupBy(page, field)

    await focusOnFooterForGroup(page, memex, fieldValue)
    const initialRowCount = await getItemRowCountWithinGroup(page, fieldValue)
    await addDraftItem(page, 'To Do')
    await groupContainsRows(page, fieldValue, initialRowCount + 1)

    // Validate there's one additional row of field type
    // and that it has been assigned to the filter field value
    const newRowIndex = await getTableIndexForRowInGroup(page, fieldValue, initialRowCount)
    await expect(page.getByTestId(cellTestId(newRowIndex, field))).toHaveText(fieldValue)
    await memex.toasts.expectErrorMessageHidden()
  })

  test('should create Draft Issue for group "AND" apply filter values if the filter does "NOT" contain group', async ({
    page,
    memex,
  }) => {
    const filter = 'status:Done'

    await memex.navigateToStory('appWithIterationsField', {
      viewType: 'table',
      filterQuery: filter,
    })

    const field = 'Iteration'
    const targetGroup = 'Iteration 4'

    await toggleGroupBy(page, field)

    // create Draft Issue
    await focusOnFooterForGroup(page, memex, targetGroup)
    const expectedInsertionIndex = await getItemRowCountWithinGroup(page, targetGroup)
    await addDraftItem(page, 'To Do')

    // Validate there's one additional row of field type
    // and that each field has the correct value applied according to the filter
    const newRowIndex = await getTableIndexForRowInGroup(page, targetGroup, expectedInsertionIndex)
    await expect(page.getByTestId(cellTestId(newRowIndex, 'Status'))).toHaveText('Done')
    await expect(page.getByTestId(cellTestId(newRowIndex, 'Iteration'))).toHaveText('Iteration 4')
    await memex.toasts.expectErrorMessageHidden()
  })
})

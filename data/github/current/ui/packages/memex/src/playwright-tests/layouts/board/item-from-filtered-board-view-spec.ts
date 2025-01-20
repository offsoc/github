import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'
import {mustNotFind} from '../../helpers/dom/assertions'
import {_} from '../../helpers/dom/selectors'
import {addDraftItem, createItemFromOmnibar, type CreateItemOptions} from '../../helpers/table/interactions'
import {eventually} from '../../helpers/utils'
import {BacklogColumn, InProgressColumn, MissingStatusColumn} from '../../types/board'

const TOAST_WARNING = 'theItemWasCreatedButItHasBeenHiddenBecauseItDoesNotMatchTheCurrentFilter.'

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
    filter: 'team:"Design Systems"',
    field: 'Team',
    fieldDataType: 'text',
    fieldValue: 'Design Systems',
  },
]

const excludeAssignees = ({fieldDataType}: MockFilter) => fieldDataType !== 'assignees'

test.describe('Filtered views', () => {
  test.slow()
  test.describe('Default page', () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'board',
      })
    })

    test.describe('Issue - item creation', () => {
      for (const {filter, field, fieldDataType, fieldValue} of TEST_FILTERS) {
        test(`should apply ${field} from filter field value with "${fieldDataType}" data type`, async ({
          page,
          memex,
          browserName,
        }) => {
          test.fixme(browserName === 'webkit' && fieldDataType === 'date', 'This test is flaky on Safari')
          const column = filter === 'status:Backlog' ? BacklogColumn.Label : MissingStatusColumn.Label
          const cardCountBeforeInsertion = await memex.boardView.getColumn(column).getCardCount()

          await memex.filter.filterBy(filter)
          await createItemFromOmnibar(page, memex)
          await memex.filter.CLEAR_FILTER_BUTTON.click()

          const cardCountAfterInsertion = await memex.boardView.getColumn(column).getCardCount()
          expect(cardCountAfterInsertion).toBeGreaterThan(cardCountBeforeInsertion)

          // We can apply assignees to an empty field or a field containing one or more assignees
          // in the integrating environment we could randomly have one or many users assigned to an issue
          // Therefore, we now need to wait for all assignees due to assigment through the asynchronous suggestions flow
          await eventually(async () => {
            const insertionIndex = cardCountBeforeInsertion
            const labels = await memex.boardView.getCard(column, insertionIndex).getCardLabelContent()
            const assignees = await memex.boardView.getCard(column, insertionIndex).getAssignees().getAssigneeNames()

            switch (field) {
              case 'Assignees':
                expect(assignees).toContain(fieldValue)
                break
              case 'Status':
                break
              case 'Team':
                expect(labels).toContain(`Team: ${fieldValue}`)
                break
              case 'Estimate':
                expect(labels).toContain(`Estimate: ${fieldValue}`)
                break
              default:
                test.fail(true, 'unexpected field, please update the test')
            }
          })
          await mustNotFind(page, _(TOAST_WARNING))
        })
      }

      test('should apply Due Date from filter field value with "date" data type', async ({
        page,
        memex,
        browserName,
      }) => {
        test.fixme(browserName === 'webkit', 'This test is flaky on Safari')
        const cardWithDateLabels = await memex.boardView.getCard(BacklogColumn.Label, 1).getCardLabelContent()
        const displayDate = cardWithDateLabels[3].split(': ')[1]
        const targetDate = new Date(`${displayDate}, UTC`).toISOString().slice(0, 10)
        const missingStatusCardsCount = await memex.boardView.getColumn(MissingStatusColumn.Label).getCardCount()

        await memex.filter.filterBy(`due-date:"${targetDate}"`)
        await createItemFromOmnibar(page, memex)
        await memex.filter.CLEAR_FILTER_BUTTON.click()

        // Validate there's one additional card added to the No Status column
        // and that it has the date from the filter
        const insertionIndex = missingStatusCardsCount
        const labels = await memex.boardView.getCard(MissingStatusColumn.Label, insertionIndex).getCardLabelContent()
        expect(labels[1].split(': ')[1]).toBe(displayDate)
        await mustNotFind(page, _(TOAST_WARNING))
      })

      test('should apply values from a complex filter containing "multiple" `AND` conditions', async ({
        page,
        memex,
      }) => {
        const complexFilter = TEST_FILTERS.map(({filter}) => filter).join(' ')
        const cardsBeforeInsertionCount = await memex.boardView.getColumn(BacklogColumn.Label).getCardCount()

        await memex.filter.filterBy(complexFilter)
        await createItemFromOmnibar(page, memex)
        await memex.filter.CLEAR_FILTER_BUTTON.click()

        // Validate there's one additional row of field type
        // and that it has been assigned to the filter field value
        await eventually(async () => {
          const insertionIndex = cardsBeforeInsertionCount // the last row for insertion
          const labels = await memex.boardView.getCard(BacklogColumn.Label, insertionIndex).getCardLabelContent()
          const assignees = await memex.boardView
            .getCard(BacklogColumn.Label, insertionIndex)
            .getAssignees()
            .getAssigneeNames()

          for (const {field, fieldValue} of TEST_FILTERS) {
            switch (field) {
              case 'Assignees':
                expect(assignees).toContain(fieldValue)
                break
              case 'Status':
                // no-op since the cards existence in the Backlog column validates the Status column was set correctly
                break
              case 'Team':
                expect(labels).toContain(`Team: ${fieldValue}`)
                break
              case 'Estimate':
                expect(labels).toContain(`Estimate: ${fieldValue}`)
                break
              default:
                test.fail(true, 'unexpected field, please update the test')
            }
          }
        })
        await mustNotFind(page, _(TOAST_WARNING))
      })
    })

    test.describe('Draft Issue - item creation', () => {
      for (const {filter, field, fieldDataType, fieldValue} of TEST_FILTERS) {
        test(`should apply ${field} from filter field value with "${fieldDataType}" data type`, async ({
          page,
          memex,
          browserName,
        }) => {
          test.fixme(browserName === 'webkit' && fieldDataType === 'date', 'This test is flaky on Safari')
          const columnString = field === 'Status' ? BacklogColumn.Label : InProgressColumn.Label
          const column = memex.boardView.getColumn(columnString)
          const cardsBeforeInsertionCount = await column.getCardCount()

          await memex.filter.filterBy(filter)
          await column.clickAddItem()
          await addDraftItem(page, 'To Do')
          await memex.filter.CLEAR_FILTER_BUTTON.click()
          await eventually(async () => {
            // Validate there's one additional row of field type
            // and that it has been assigned to the filter field value
            const insertionIndex = cardsBeforeInsertionCount // the last row for insertion
            const labels = await memex.boardView.getCard(columnString, insertionIndex).getCardLabelContent()
            const assignees = await memex.boardView
              .getCard(columnString, insertionIndex)
              .getAssignees()
              .getAssigneeNames()
            switch (field) {
              case 'Assignees':
                expect(assignees).toContain(fieldValue)
                break
              case 'Status':
                // no-op since the cards existence in the Backlog column validates the Status column was set correctly
                break
              case 'Team':
                expect(labels).toContain(`Team: ${fieldValue}`)
                break
              case 'Estimate':
                expect(labels).toContain(`Estimate: ${fieldValue}`)
                break
              default:
                test.fail(true, 'unexpected field, please update the test')
            }
            await mustNotFind(page, _(TOAST_WARNING))
          })
        })
      }

      test('should not set column value if multiple values are in the filter', async ({page, memex}) => {
        expect(await memex.boardView.getColumn(BacklogColumn.Label).getCardCount()).toEqual(2)

        const STATUS_FILTER: MockFilter = {
          filter: 'status:Backlog,Done',
          field: 'Status',
          fieldDataType: 'singleSelect',
          fieldValue: 'Backlog,Done',
        }
        const STAGE_FILTER: MockFilter = {
          filter: 'stage:Closed,"Up Next","In progress"',
          field: 'Stage',
          fieldDataType: 'singleSelect',
          fieldValue: 'Closed,Up Next,In progress',
        }
        const filters = [STATUS_FILTER, STAGE_FILTER]
        await memex.filter.filterBy(filters.map(({filter}) => filter).join(' '))

        await memex.boardView.getColumn(BacklogColumn.Label).ADD_ITEM.click()

        await page.keyboard.type('Draft issue')
        await page.keyboard.press('Enter')
        // Validate that a toast warning is shown
        await memex.toasts.expectErrorMessageVisible("The new item is hidden by this view's filters.")
        // Ensure that a card was not added to the Backlog column
        expect(await memex.boardView.getColumn(BacklogColumn.Label).getCardCount()).toEqual(1)
        // Clear the filter and ensure that the card is now visible
        await memex.filter.CLEAR_FILTER_BUTTON.click()
        expect(await memex.boardView.getColumn(BacklogColumn.Label).getCardCount()).toEqual(3)
      })

      test('should apply Due Date from filter field value with "date" data type', async ({
        page,
        memex,
        browserName,
      }) => {
        test.fixme(browserName === 'webkit', 'This test is flaky on Safari')
        const cardWithDateLabels = await memex.boardView.getCard(BacklogColumn.Label, 1).getCardLabelContent()
        const displayDate = cardWithDateLabels[3]
        const targetDate = new Date(`${displayDate}, UTC`).toISOString().slice(0, 10)

        const column = memex.boardView.getColumn(InProgressColumn.Label)
        const cardsBeforeInsertionCount = await column.getCardCount()

        await memex.filter.filterBy(`due-date:"${targetDate}"`)
        await column.clickAddItem()
        await addDraftItem(page, 'To Do')
        await memex.filter.CLEAR_FILTER_BUTTON.click()

        // Validate there's one additional row of field type
        // and that it has been assigned to the filter field value
        const insertionIndex = cardsBeforeInsertionCount
        const labels = await memex.boardView.getCard(InProgressColumn.Label, insertionIndex).getCardLabelContent()
        expect(labels[0]).toBe(displayDate)
        await mustNotFind(page, _(TOAST_WARNING))
      })

      test('should apply values from a complex filter containing "multiple" `AND` conditions', async ({
        page,
        memex,
      }) => {
        const complexFilter = TEST_FILTERS.filter(excludeAssignees)
          .map(({filter}) => filter)
          .join(' ')

        const column = memex.boardView.getColumn(BacklogColumn.Label)
        const cardsBeforeInsertionCount = await column.getCardCount()

        await memex.filter.filterBy(complexFilter)
        await column.clickAddItem()
        await addDraftItem(page, 'To Do')
        await memex.filter.CLEAR_FILTER_BUTTON.click()

        // Validate there's one additional row of field type
        // and that it has been assigned to the filter field value
        const insertionIndex = cardsBeforeInsertionCount // the last row for insertion
        const labels = await memex.boardView.getCard(BacklogColumn.Label, insertionIndex).getCardLabelContent()

        for (const {field, fieldValue} of TEST_FILTERS.filter(excludeAssignees)) {
          switch (field) {
            case 'Status':
              // we found the card in the Backlog column, confirming the status was applied correctly
              break
            case 'Team':
              expect(labels).toContain(`Team: ${fieldValue}`)
              break
            case 'Estimate':
              expect(labels).toContain(`Estimate: ${fieldValue}`)
              break
            default:
              test.fail(true, 'unexpected field, please update the test')
          }
        }

        await mustNotFind(page, _(TOAST_WARNING))
      })
    })

    test.describe('Pull-request - item creation', () => {
      const pullRequestOptions: CreateItemOptions = {
        expectsRepoCount: 8,
        targetRepo: 'memex',
        itemTitle: 'Pull Request',
        waitForRender: true,
      }

      for (const {filter, field, fieldDataType, fieldValue} of TEST_FILTERS) {
        test(`should apply ${field} from filter field value with "${fieldDataType}" data type`, async ({
          page,
          memex,
        }) => {
          const column = field === 'Status' ? BacklogColumn.Label : MissingStatusColumn.Label
          const cardsBeforeInsertionCount = await memex.boardView.getColumn(column).getCardCount()

          await memex.filter.filterBy(filter)
          await createItemFromOmnibar(page, memex, pullRequestOptions)
          await memex.filter.CLEAR_FILTER_BUTTON.click()

          // Validate there's one additional card of field type
          // and that it has been assigned to the filter field value
          const insertionIndex = cardsBeforeInsertionCount // the last row for insertion

          // in the integrating environment we could randomly have one or many users assigned to an issue
          // Therefore, we now need to wait for all assignees due to assigment through the asynchronous suggestions flow
          await eventually(async () => {
            switch (field) {
              case 'Assignees':
                expect(
                  await memex.boardView.getCard(column, insertionIndex).getAssignees().getAssigneeNames(),
                ).toContain(fieldValue)
                break
              case 'Status':
                // we found the card in the Backlog column, confirming the status was applied correctly
                break
              case 'Team':
                expect(await memex.boardView.getCard(column, insertionIndex).getCardLabelContent()).toContain(
                  `Team: ${fieldValue}`,
                )
                break
              case 'Estimate':
                expect(await memex.boardView.getCard(column, insertionIndex).getCardLabelContent()).toContain(
                  `Estimate: ${fieldValue}`,
                )
                break
              default:
                test.fail(true, 'unexpected field, please update the test')
            }
          })
          await mustNotFind(page, _(TOAST_WARNING))
        })
      }

      test('should apply Due Date from filter field value with "date" data type', async ({
        page,
        memex,
        browserName,
      }) => {
        test.fixme(browserName === 'webkit', 'This test is flaky on Safari')
        const cardWithDateLabels = await memex.boardView.getCard(BacklogColumn.Label, 1).getCardLabelContent()
        const displayDate = cardWithDateLabels[3]
        const targetDate = new Date(`${displayDate}, UTC`).toISOString().slice(0, 10)
        const cardsBeforeInsertionCount = await memex.boardView.getColumn(MissingStatusColumn.Label).getCardCount()

        await memex.filter.filterBy(`due-date:"${targetDate}"`)
        await createItemFromOmnibar(page, memex, pullRequestOptions)
        await memex.filter.CLEAR_FILTER_BUTTON.click()

        // Validate there's one additional card of field type
        // and that it has been assigned to the filter field value
        const insertionIndex = cardsBeforeInsertionCount // the last row for insertion
        const labels = await memex.boardView.getCard(MissingStatusColumn.Label, insertionIndex).getCardLabelContent()
        expect(labels).toContain(displayDate)
        await mustNotFind(page, _(TOAST_WARNING))
      })

      test('should apply values from a complex filter containing "multiple" `AND` conditions', async ({
        page,
        memex,
      }) => {
        const complexFilter = TEST_FILTERS.map(({filter}) => filter).join(' ')
        const cardsBeforeInsertionCount = await memex.boardView.getColumn(BacklogColumn.Label).getCardCount()

        await memex.filter.filterBy(complexFilter)
        await createItemFromOmnibar(page, memex, pullRequestOptions)
        await memex.filter.CLEAR_FILTER_BUTTON.click()

        const cardsAfterInsertionCount = await memex.boardView.getColumn(BacklogColumn.Label).getCardCount()
        expect(cardsAfterInsertionCount).toBeGreaterThan(cardsBeforeInsertionCount)

        // Validate there's one additional card of field type
        // and that it has been assigned to the filter field value
        await eventually(async () => {
          const insertionIndex = cardsBeforeInsertionCount // the last row for insertion
          for (const {field, fieldValue} of TEST_FILTERS) {
            switch (field) {
              case 'Assignees':
                expect(
                  await memex.boardView.getCard(BacklogColumn.Label, insertionIndex).getAssignees().getAssigneeNames(),
                ).toContain(fieldValue)
                break
              case 'Status':
                // no-op since the cards existence in the Backlog column validates the Status column was set correctly
                break
              case 'Team':
                expect(
                  await memex.boardView.getCard(BacklogColumn.Label, insertionIndex).getCardLabelContent(),
                ).toContain(`Team: ${fieldValue}`)
                break
              case 'Estimate':
                expect(
                  await memex.boardView.getCard(BacklogColumn.Label, insertionIndex).getCardLabelContent(),
                ).toContain(`Estimate: ${fieldValue}`)
                break
              default:
                test.fail(true, 'unexpected field, please update the test')
            }
          }
        })

        await mustNotFind(page, _(TOAST_WARNING))
      })
    })

    test.describe('exclusion filter', () => {
      test('should create an item from "no:status"', async ({page, memex}) => {
        const filter = 'no:status'
        const cardsBeforeInsertionCount = await memex.boardView.getColumn(MissingStatusColumn.Label).getCardCount()

        await memex.filter.filterBy(filter)
        await createItemFromOmnibar(page, memex)
        await memex.filter.CLEAR_FILTER_BUTTON.click()

        // Validate there's one additional card with no status
        // (Cell equivalent to "Empty" string or falsy value)
        const insertionIndex = cardsBeforeInsertionCount // the last row for insertion
        // getting labels will fail if the card does not exist, its existence proves its in the missing status column
        const labels = await memex.boardView.getCard(MissingStatusColumn.Label, insertionIndex).getCardLabelContent()
        expect(labels).toContain('Repository: github/memex')
        await mustNotFind(page, _(TOAST_WARNING))
      })

      for (const {filter, fieldDataType: type, fieldValue} of TEST_FILTERS) {
        // https://github.com/github/memex/issues/9297
        test.fixme(
          `should create item with filter "-${filter}" but must "NOT" apply filter "${type}" value`,
          async ({page, memex, browserName}) => {
            test.fixme(browserName === 'webkit' && type === 'date', 'This test is flaky on Safari')
            const cardsBeforeInsertionCount = await memex.boardView.getColumn(MissingStatusColumn.Label).getCardCount()
            await memex.filter.filterBy(`-${filter}`)
            await createItemFromOmnibar(page, memex)
            await memex.filter.CLEAR_FILTER_BUTTON.click()

            // Validate there's one additional card of field type
            // but should not apply the filter field value
            const insertionIndex = cardsBeforeInsertionCount // the last row for insertion
            const labels = await memex.boardView
              .getCard(MissingStatusColumn.Label, insertionIndex)
              .getCardLabelContent()
            expect(labels).not.toContain(fieldValue)
            await mustNotFind(page, _(TOAST_WARNING))
          },
        )
      }

      test(`should create item with exclusion filter but must "NOT" apply filter "date" value`, async ({
        page,
        memex,
        browserName,
      }) => {
        test.fixme(browserName === 'webkit', 'This test is flaky on Safari')
        const cardWithDateLabels = await memex.boardView.getCard(BacklogColumn.Label, 1).getCardLabelContent()
        const displayDate = cardWithDateLabels[3]

        const targetDate = new Date(`${displayDate}, UTC`).toISOString().slice(0, 10)

        const cardsBeforeInsertionCount = await memex.boardView.getColumn(MissingStatusColumn.Label).getCardCount()

        await memex.filter.filterBy(`-due-date:"${targetDate}"`)
        await createItemFromOmnibar(page, memex)
        await memex.filter.CLEAR_FILTER_BUTTON.click()

        // Validate there's one additional row of field type
        // but should not apply the filter Date value
        const insertionIndex = cardsBeforeInsertionCount // the last row for insertion
        const labels = await memex.boardView.getCard(MissingStatusColumn.Label, insertionIndex).getCardLabelContent()
        expect(labels).not.toContain(displayDate)
        await mustNotFind(page, _(TOAST_WARNING))
      })
    })
  })

  test('should apply Iteration from filter field value for issue item creation', async ({page, memex}) => {
    await memex.navigateToStory('appWithIterationsField', {viewType: 'board'})

    const cardsBeforeInsertionCount = await memex.boardView.getColumn(MissingStatusColumn.Label).getCardCount()

    await memex.filter.filterBy('iteration:"Iteration 4"')
    await createItemFromOmnibar(page, memex)
    await memex.filter.CLEAR_FILTER_BUTTON.click()

    // Validate there's one additional row of field type
    // and that it has been assigned to the filter field value
    const insertionIndex = cardsBeforeInsertionCount // the last card for insertion
    const labels = await memex.boardView.getCard(MissingStatusColumn.Label, insertionIndex).getCardLabelContent()
    expect(labels[0]).toMatch(/Iteration: Iteration 0/)
    await mustNotFind(page, _(TOAST_WARNING))
  })

  test('should apply Iteration from filter field value for draft item creation', async ({page, memex}) => {
    await memex.navigateToStory('appWithIterationsField', {viewType: 'board'})

    const column = memex.boardView.getColumn(MissingStatusColumn.Label)
    const cardsBeforeInsertionCount = await column.getCardCount()

    await memex.filter.filterBy('iteration:"Iteration 4"')
    await column.clickAddItem()
    await addDraftItem(page, 'To Do')
    await memex.filter.CLEAR_FILTER_BUTTON.click()

    // Validate there's one additional card of field type
    // and that it has been assigned to the filter field value
    const insertionIndex = cardsBeforeInsertionCount
    const labels = await memex.boardView.getCard(MissingStatusColumn.Label, insertionIndex).getCardLabelContent()
    expect(labels[0]).toMatch(/Iteration: Iteration 0/)
    await mustNotFind(page, _(TOAST_WARNING))
  })

  test('should apply Iteration from filter field value for pull-request item creation', async ({page, memex}) => {
    await memex.navigateToStory('appWithIterationsField', {viewType: 'board'})

    const cardsBeforeInsertionCount = await memex.boardView.getColumn(MissingStatusColumn.Label).getCardCount()

    await memex.filter.filterBy('iteration:"Iteration 4"')
    await createItemFromOmnibar(page, memex, {
      expectsRepoCount: 8,
      targetRepo: 'memex',
      itemTitle: 'Pull Request',
      waitForRender: true,
    })
    await memex.filter.CLEAR_FILTER_BUTTON.click()

    // Validate there's one additional card of field type
    // and that it has been assigned to the filter field value
    const insertionIndex = cardsBeforeInsertionCount // the last row for insertion
    const labels = await memex.boardView.getCard(MissingStatusColumn.Label, insertionIndex).getCardLabelContent()
    expect(labels[0]).toMatch(/Iteration: Iteration 0/)
    await mustNotFind(page, _(TOAST_WARNING))
  })

  test('should create item with exclusion filter but must "NOT" apply filter "iteration" value', async ({
    page,
    memex,
  }) => {
    await memex.navigateToStory('appWithIterationsField', {viewType: 'board'})

    const cardsBeforeInsertionCount = await memex.boardView.getColumn(MissingStatusColumn.Label).getCardCount()

    await memex.filter.filterBy('-iteration:"Iteration 4"')
    await createItemFromOmnibar(page, memex)
    await memex.filter.CLEAR_FILTER_BUTTON.click()

    // Validate there's one additional row of field type
    // but should not apply the filter Iteration value
    const insertionIndex = cardsBeforeInsertionCount // the last row for insertion
    const labels = await memex.boardView.getCard(MissingStatusColumn.Label, insertionIndex).getCardLabelContent()
    expect(labels).not.toContain('Iteration 4')
    await mustNotFind(page, _(TOAST_WARNING))
  })
})

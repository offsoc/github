/**
 * This subset of GroupBy integration tests deals with rows editing and moving
 *
 * It currently fails on some browsers in CI, so we've extracted to a separate file
 * to skip until we have time to fix them
 *
 */
import {expect, type Page} from '@playwright/test'

import {test} from '../../../fixtures/test-extended'
import {
  today,
  todayISOString,
  todayString,
  tomorrow,
  tomorrowISOString,
  tomorrowString,
  yesterdayISOString,
  yesterdayString,
} from '../../../helpers/dates'
import {groupContainsRows} from '../../../helpers/dom/assertions'
import {_} from '../../../helpers/dom/selectors'
import {groupMustNotExist} from '../../../helpers/table/assertions'
import {setCellToEditMode, toggleGroupBy} from '../../../helpers/table/interactions'
import {cellTestId, getTableIndexForRowInGroup} from '../../../helpers/table/selectors'

const getDateText = (dateValue: string) => {
  const dateArray = dateValue.split('-')
  // Use month + day + year for data entry
  return `${dateArray[1]}/${dateArray[2]}/${dateArray[0]}`
}
const todayText = getDateText(todayISOString)
const tomorrowText = getDateText(tomorrowISOString)
const yesterdayText = getDateText(yesterdayISOString)

async function moveToPreviousMonth(page: Page) {
  const previousMonthButton = page.getByTestId('previous-button')
  await previousMonthButton.click()
}

async function moveToNextMonth(page: Page) {
  const nextMonthButton = page.getByTestId('next-button')
  await nextMonthButton.click()
}

test.describe('Group By Drag And Drop', () => {
  test.beforeEach(async ({memex, browserName}) => {
    test.fixme(['firefox', 'webkit'].includes(browserName), 'test is broken with firefox on ubuntu and webkit on macOS')

    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'table',
    })
  })

  test('editing a grouped date cell can move the row in between existing groups', async ({page}) => {
    await toggleGroupBy(page, 'Due Date')

    await groupContainsRows(page, todayString, 2)
    await groupContainsRows(page, tomorrowString, 1)

    // Select a cell whose value is today
    const rowIndex = await getTableIndexForRowInGroup(page, todayString, 0)
    const cellSelector = _(cellTestId(rowIndex, 'Due Date'))
    expect(await page.textContent(cellSelector)).toEqual(todayString)

    // Update that cell to have a new value
    await setCellToEditMode(page, cellSelector)

    // If we're currently at the end of the month, we need to
    // move to the next month to find tomorrow's date.
    if (tomorrow.getDate() === 1) {
      await moveToNextMonth(page)
    }

    const tomorrowDate = page.getByTestId(`day-${tomorrowText}`)
    await tomorrowDate?.click()

    // Make sure the grouped row counts have changed appropriately
    await groupContainsRows(page, todayString, 1)
    await groupContainsRows(page, tomorrowString, 2)
  })

  test('editing a grouped date cell creates a new group if necessary', async ({page}) => {
    await toggleGroupBy(page, 'Due Date')

    await groupContainsRows(page, todayString, 2)
    await groupMustNotExist(page, yesterdayString)

    // Select a cell whose value is today
    const rowIndex = await getTableIndexForRowInGroup(page, todayString, 0)
    const cellSelector = _(cellTestId(rowIndex, 'Due Date'))
    expect(await page.textContent(cellSelector)).toEqual(todayString)

    // Update that cell to have a new value
    await setCellToEditMode(page, cellSelector)

    // If we're currently at the beginning of the month, we need to
    // move to the previous month to find yesterday's date.
    if (today.getDate() === 1) {
      await moveToPreviousMonth(page)
    }

    const yesterdayDate = page.getByTestId(`day-${yesterdayText}`)
    await yesterdayDate?.click()

    // Make sure the grouped row counts have changed appropriately
    await groupContainsRows(page, todayString, 1)
    await groupContainsRows(page, yesterdayString, 1)

    const groupTitleElements = page.getByTestId('group-name')

    // Make sure the new group was added in chronological order
    await expect(groupTitleElements).toContainText([yesterdayString, todayString, tomorrowString, 'No Due Date'])
  })

  test('editing a grouped date cell removes an existing group if necessary', async ({page}) => {
    await toggleGroupBy(page, 'Due Date')

    await groupContainsRows(page, todayString, 2)
    await groupContainsRows(page, tomorrowString, 1)

    // Select a cell whose value is tomorrow
    const rowIndex = await getTableIndexForRowInGroup(page, tomorrowString, 0)
    const cellSelector = _(cellTestId(rowIndex, 'Due Date'))
    expect(await page.textContent(cellSelector)).toEqual(tomorrowString)

    // Update that cell to be today
    await setCellToEditMode(page, cellSelector)

    // If today is the end of the month, then this cell (which is tomorrow), is the
    // beginning of the month and we need to move the previous month to find today.
    if (tomorrow.getDate() === 1) {
      await moveToPreviousMonth(page)
    }

    const todayDate = page.getByTestId(`day-${todayText}`)
    await todayDate?.click()

    // Make sure the grouped row counts have changed appropriately
    await groupContainsRows(page, todayString, 3)
    await groupMustNotExist(page, tomorrowString)
  })

  test('editing a grouped date cell can move from the default group to a group with a value', async ({page}) => {
    await toggleGroupBy(page, 'Due Date')

    await groupContainsRows(page, todayString, 2)
    await groupContainsRows(page, 'No Due Date', 5)

    // Select a cell that doesn't have a value.
    const rowIndex = await getTableIndexForRowInGroup(page, 'No Due Date', 0)
    const cellSelector = _(cellTestId(rowIndex, 'Due Date'))
    expect(await page.textContent(cellSelector)).toEqual('')

    // Update that cell to have a value of today
    await setCellToEditMode(page, cellSelector)
    await page.getByTestId(`day-${todayText}`).click()

    // Make sure the grouped row counts have changed appropriately
    await groupContainsRows(page, todayString, 3)
    await groupContainsRows(page, 'No Due Date', 4)
  })
})

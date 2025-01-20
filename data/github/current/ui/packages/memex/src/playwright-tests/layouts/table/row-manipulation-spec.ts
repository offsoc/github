import {expect} from '@playwright/test'

import {SystemColumnId} from '../../../client/api/columns/contracts/memex-column'
import {test} from '../../fixtures/test-extended'
import {dragTo} from '../../helpers/dom/interactions'
import {isNotSortedBy, isSortedBy} from '../../helpers/table/assertions'
import {cellTestId, getTableCell, getTableRow} from '../../helpers/table/selectors'

test.describe('Row manipulation', () => {
  test("a row's priority can be changed with a drag and drop operation", async ({page, memex, browserName}) => {
    test.fixme(browserName === 'firefox', 'test is broken with firefox on ubuntu')

    await memex.navigateToStory('integrationTestsWithItems')

    // Get the original values of the title column for the first and second rows.
    // We'll compare this to the values after the drag and drop at the end of the test.
    const firstItemTitle = await page.getByTestId(cellTestId(0, 'Title')).textContent()
    const secondItemTitle = await page.getByTestId(cellTestId(1, 'Title')).textContent()
    const firstRow = await getTableRow(page, 1)
    const firstRowDraggerCell = await getTableCell(firstRow, 0)
    const secondRow = await getTableRow(page, 2)
    const secondRowDraggerCell = await getTableCell(secondRow, 0)

    const secondRowDraggerCellBoundingBox = await secondRowDraggerCell.boundingBox()
    const {x: secondRowX, y: secondRowY, height: secondRowHeight} = secondRowDraggerCellBoundingBox

    await dragTo(page, firstRowDraggerCell, {x: secondRowX, y: secondRowY + secondRowHeight})

    await expect(page.getByTestId(cellTestId(0, 'Title'))).toContainText(secondItemTitle)
    await expect(page.getByTestId(cellTestId(1, 'Title'))).toContainText(firstItemTitle)
  })

  test("while sorting is applied, a row's priority can be changed with a drag and drop operation", async ({
    page,
    memex,
  }) => {
    test.fixme()

    await memex.navigateToStory('integrationTestsWithItems', {
      sortedBy: {
        columnId: SystemColumnId.Labels,
        direction: 'asc',
      },
    })

    // Get the original values of the title column for the first and second rows.
    // We'll compare this to the values after the drag and drop at the end of the test.
    const topRowTitle = await page.getByTestId(cellTestId(1, 'Title')).textContent() // Update styles for table
    const topRow = await getTableRow(page, 4)
    const topRowDraggerCell = await getTableCell(topRow, 0)

    const bottomRowTitle = await page.getByTestId(cellTestId(2, 'Title')).textContent() // Here is a Draft Issue!
    const bottomRow = await getTableRow(page, 5)
    const bottomRowDraggerCell = await getTableCell(bottomRow, 0)

    const topRowDraggerCellBoundingBox = await topRowDraggerCell.boundingBox()
    const {x: topRowX, y: topRowY} = topRowDraggerCellBoundingBox

    await dragTo(page, bottomRowDraggerCell, {x: topRowX, y: topRowY})

    // The bottom row ID becomes 1 due to placing above the top row which was 1 causing the original row ID of 1 to be pushed down to 2.
    await expect(topRow.getByTestId(cellTestId(1, 'Title'))).toContainText(bottomRowTitle)
    await expect(bottomRow.getByTestId(cellTestId(2, 'Title'))).toContainText(topRowTitle)
  })

  test("while sorting and filtering are applied, a row's priority can be changed with a drag and drop operation", async ({
    page,
    memex,
  }) => {
    test.fixme()

    await memex.navigateToStory('integrationTestsWithItems', {
      filterQuery: 'repo:"github/memex"',
      sortedBy: {
        columnId: SystemColumnId.Labels,
        direction: 'asc',
      },
    })

    // Get the original values of the title column for the first and second rows.
    // We'll compare this to the values after the drag and drop at the end of the test.
    const topRowTitle = await page.getByTestId(cellTestId(1, 'Title')).textContent() // Update styles for table
    const topRow = await getTableRow(page, 4)
    const topRowDraggerCell = await getTableCell(topRow, 0)

    const bottomRowTitle = await page.getByTestId(cellTestId(6, 'Title')).textContent() // Fixes all the bugs
    const bottomRow = await getTableRow(page, 5)
    const bottomRowDraggerCell = await getTableCell(bottomRow, 0)

    const topRowDraggerCellBoundingBox = await topRowDraggerCell.boundingBox()
    const {x: topRowX, y: topRowY} = topRowDraggerCellBoundingBox

    await dragTo(page, bottomRowDraggerCell, {x: topRowX, y: topRowY})

    // The bottom row ID becomes 2 due to placing above the top row which was 1 causing the original row ID of 1 to be pushed down to 2.
    await expect(topRow.getByTestId(cellTestId(1, 'Title'))).toContainText(bottomRowTitle)
    await expect(bottomRow.getByTestId(cellTestId(2, 'Title'))).toContainText(topRowTitle)
  })

  test('while sorting is applied, cannot reorder items between sorted values', async ({page, memex}) => {
    test.fixme()

    await memex.navigateToStory('integrationTestsWithItems', {
      sortedBy: {
        columnId: SystemColumnId.Labels,
        direction: 'asc',
      },
    })

    // Get the original values of the title column for the first and second rows.
    // We'll compare this to the values after the drag and drop at the end of the test.
    const topRowTitle = await page.getByTestId(cellTestId(5, 'Title')).textContent()
    const topRow = await getTableRow(page, 2)
    const topRowDraggerCell = await getTableCell(topRow, 0)

    // The bottom row ID is 81 due to original positioning pre-sorting, appears below the top row when sorting is applied for labels.
    const bottomRowTitle = await page.getByTestId(cellTestId(0, 'Title')).textContent()
    const bottomRow = await getTableRow(page, 3)
    const bottomRowDraggerCell = await getTableCell(bottomRow, 0)

    const topRowDraggerCellBoundingBox = await topRowDraggerCell.boundingBox()
    const {x: topRowX, y: topRowY} = topRowDraggerCellBoundingBox

    await dragTo(page, bottomRowDraggerCell, {x: topRowX, y: topRowY})

    // We expect the rows to not have moved between sorted value groups, their original values and positions should be preserved.
    await expect(topRow.getByTestId(cellTestId(5, 'Title'))).toContainText(topRowTitle)
    await expect(bottomRow.getByTestId(cellTestId(0, 'Title'))).toContainText(bottomRowTitle)
  })

  test('while sorting is applied, reordering items between sorted values presents toast that can clear sorting', async ({
    page,
    memex,
    browserName,
  }) => {
    test.fixme(browserName === 'firefox', 'test is broken with firefox on ubuntu')

    await memex.navigateToStory('integrationTestsWithItems', {
      sortedBy: {
        columnId: SystemColumnId.Labels,
        direction: 'asc',
      },
    })

    await isSortedBy(page, SystemColumnId.Labels)
    const topRow = await getTableRow(page, 2)
    const topRowDraggerCell = await getTableCell(topRow, 0)

    const bottomRow = await getTableRow(page, 3)
    const bottomRowDraggerCell = await getTableCell(bottomRow, 0)

    const topRowDraggerCellBoundingBox = await topRowDraggerCell.boundingBox()
    const {x: topRowX, y: topRowY} = topRowDraggerCellBoundingBox

    await dragTo(page, bottomRowDraggerCell, {x: topRowX, y: topRowY})

    // We expect the toast to be visible.
    await memex.toasts.expectErrorMessageVisible('Cannot reorder items between sorted values')

    // We also expect the toast action to be clickable.
    await memex.toasts.TOAST_ACTION.click()
    await isNotSortedBy(page, SystemColumnId.Labels)
  })

  test('a redacted item row is not draggable', async ({page, memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
    const nonRedactedItemRow = await getTableRow(page, 3)
    const nonRedactedItemRowDraggerCell = await getTableCell(nonRedactedItemRow, 0)
    const nonRedactedItemRowDraggerCellFirstChild = nonRedactedItemRowDraggerCell.locator('div').nth(0)
    expect(await nonRedactedItemRowDraggerCellFirstChild.getAttribute('draggable')).toBeTruthy()

    const redactedItemRow = await getTableRow(page, 5)
    const redactedItemRowDraggerCell = await getTableCell(redactedItemRow, 0)
    const redactedItemRowDraggerCellFirstChild = redactedItemRowDraggerCell.locator('div').nth(0)
    expect(await redactedItemRowDraggerCellFirstChild.getAttribute('draggable')).toBeFalsy()
  })
})

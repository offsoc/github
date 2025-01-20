import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'
import {waitForSelectorCount} from '../../helpers/dom/assertions'
import {_} from '../../helpers/dom/selectors'
import {getTableColumnId} from '../../helpers/table/selectors'

test.describe('FieldSumsMenu', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {})
  })

  test('should keep field sum settings specific to a view', async ({page, memex}) => {
    await memex.viewOptionsMenu.switchToBoardView()

    await waitForSelectorCount(page, _('column-items-counter'), 5)

    await memex.viewOptionsMenu.open()
    await expect(memex.viewOptionsMenu.fieldSumItem()).toContainText('Count')
    await memex.viewOptionsMenu.fieldSumItem().click()

    await expect(page.getByTestId('field-sum-menu')).toBeVisible()
    const countMenuItem = page.getByTestId('sum-of-items')
    await countMenuItem.click()

    await waitForSelectorCount(page, _('column-items-counter'), 0)

    await memex.views.createNewView()

    await memex.viewOptionsMenu.switchToBoardView()

    await waitForSelectorCount(page, _('column-items-counter'), 5)
  })
  test('updates query params when hiding items count', async ({page, memex}) => {
    await memex.viewOptionsMenu.switchToBoardView()

    await memex.viewOptionsMenu.open()
    await memex.viewOptionsMenu.fieldSumItem().click()

    await expect(page.getByTestId('field-sum-menu')).toBeVisible()
    const countMenuItem = page.getByTestId('sum-of-items')
    await countMenuItem.click()

    memex.expectQueryParams([{name: 'hideItemsCount', expectedValue: 'true'}])
    memex.expectQueryParams([{name: 'sumFields', expectedValue: ''}])
  })
  test('updates query params when summing fields', async ({page, memex, browserName}) => {
    if (browserName === 'webkit') {
      test.fixme()
      return
    }
    const {addField} = memex.tableView

    await addField.show()
    await addField.clickNewField()

    await addField.setFieldName('Points')
    await addField.setFieldType('number')

    await addField.clickSaveButton()

    const estimateColumnId = await getTableColumnId(page, 'Estimate')
    const pointsColumnId = await getTableColumnId(page, 'Points')

    await memex.viewOptionsMenu.switchToBoardView()

    await memex.viewOptionsMenu.open()
    await memex.viewOptionsMenu.fieldSumItem().click()

    await expect(page.getByTestId('field-sum-menu')).toBeVisible()
    const estimateMenuItem = page.getByTestId('sum-of-Estimate')
    await estimateMenuItem.click()

    memex.expectQueryParams([{name: 'hideItemsCount', expectedValue: 'false'}])
    memex.expectQueryParams([{name: 'sumFields', expectedValue: `[${estimateColumnId}]`}])

    const pointsMenuItem = await page.waitForSelector(_('sum-of-Points'))
    await pointsMenuItem.click()

    memex.expectQueryParams([{name: 'hideItemsCount', expectedValue: 'false'}])
    memex.expectQueryParams([{name: 'sumFields', expectedValue: `[${estimateColumnId},${pointsColumnId}]`}])
  })
  test('remove query params when selections are reverted', async ({page, memex, browserName}) => {
    if (browserName === 'webkit') {
      test.fixme()
    }
    const estimateColumnId = await getTableColumnId(page, 'Estimate')

    await memex.viewOptionsMenu.switchToBoardView()

    await memex.viewOptionsMenu.open()
    await memex.viewOptionsMenu.fieldSumItem().click()

    await expect(page.getByTestId('field-sum-menu')).toBeVisible()
    const countMenuItem = page.getByTestId('sum-of-items')
    await countMenuItem.click()

    await expect(page.getByTestId('field-sum-menu')).toBeVisible()
    const estimateMenuItem = page.getByTestId('sum-of-Estimate')
    await estimateMenuItem.click()

    memex.expectQueryParams([
      {name: 'hideItemsCount', expectedValue: 'true'},
      {name: 'sumFields', expectedValue: `[${estimateColumnId}]`},
    ])

    await countMenuItem.click()
    await estimateMenuItem.click()

    memex.expectQueryParams([
      {name: 'sumFields', expectedValue: null},
      {name: 'hideItemsCount', expectedValue: null},
    ])
  })

  test('maintain selections when page is reloaded', async ({page, memex, browserName}) => {
    if (browserName === 'webkit') {
      test.fixme()
    }
    const estimateColumnId = await getTableColumnId(page, 'Estimate')

    await memex.viewOptionsMenu.switchToBoardView()

    await memex.viewOptionsMenu.open()
    await memex.viewOptionsMenu.fieldSumItem().click()

    await expect(page.getByTestId('field-sum-menu')).toBeVisible()
    const countMenuItem = page.getByTestId('sum-of-items')
    await countMenuItem.click()

    await expect(page.getByTestId('field-sum-menu')).toBeVisible()
    const estimateMenuItem = page.getByTestId('sum-of-Estimate')
    await estimateMenuItem.click()

    memex.expectQueryParams([
      {name: 'hideItemsCount', expectedValue: 'true'},
      {name: 'sumFields', expectedValue: `[${estimateColumnId}]`},
    ])

    await page.reload()

    await waitForSelectorCount(page, _('column-items-counter'), 0)
    await waitForSelectorCount(page, _('column-sum-Estimate'), 5)
  })
})

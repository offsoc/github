import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'
import {hasDOMFocus} from '../../helpers/dom/interactions'
import {_} from '../../helpers/dom/selectors'
import {setCellToEditMode as dblClickCell, setCellToFocusMode as clickCell} from '../../helpers/table/interactions'
import {cellTestId, getCellMode, rowTestId} from '../../helpers/table/selectors'
import {testPlatformMeta} from '../../helpers/utils'
import {CellMode} from '../../types/table'

test.describe('keyboard shortcuts', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')
  })

  test('Meta/Control+Shift+\\ opens the row menu when focused in the row', async ({page}) => {
    const rowSelector = _(rowTestId(3))
    const cellSelector = _(cellTestId(3, 'Title'))

    await clickCell(page, cellSelector)
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)

    await page.keyboard.press(`${testPlatformMeta}+Shift+\\`)

    const menuTrigger = page.locator(`${rowSelector} ${_('row-menu-trigger')}`)
    await expect(menuTrigger).toBeVisible()

    const firstMenuItem = page.getByTestId('row-menu-archive')
    await expect(firstMenuItem).toBeVisible()

    expect(await hasDOMFocus(page, await firstMenuItem.elementHandle())).toBe(true)
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.DEFAULT)
  })

  test('Meta/Control+Shift+\\ does not open the row menu when editing in the row', async ({page}) => {
    const rowSelector = _(rowTestId(3))
    const cellSelector = _(cellTestId(3, 'Title'))

    await dblClickCell(page, cellSelector)
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.EDITING)

    await page.keyboard.press(`${testPlatformMeta}+Shift+\\`)

    const menuTrigger = page.locator(`${rowSelector} ${_('row-menu-trigger')}`)

    await expect(menuTrigger).toBeVisible()
    expect(await hasDOMFocus(page, await menuTrigger.elementHandle())).toBe(false)
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.EDITING)
  })

  test('Meta/Control+Shift+\\ does not open the row menu when the item is redacted', async ({page}) => {
    // We assume the fifth item in the table is a redacted item
    const rowSelector = _(rowTestId(4))
    const cellSelector = _(cellTestId(4, 'Title'))

    await dblClickCell(page, cellSelector)
    expect(await getCellMode(page, cellSelector)).toBe(CellMode.FOCUSED)

    await page.keyboard.press(`${testPlatformMeta}+Shift+\\`)

    const menuTrigger = page.locator(`${rowSelector} ${_('row-menu-trigger')}`)

    await expect(menuTrigger).toBeHidden()
  })
})

import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'

test('Rename status column on Board View', async ({page, memex}) => {
  await memex.navigateToStory('integrationTestsWithItems', {viewType: 'board'})

  await memex.boardView.getColumn('Backlog').openContextMenu()
  await memex.boardView.COLUMN_MENU('Backlog').getByRole('menuitem', {name: 'Edit details'}).click()
  const input = page.getByRole('textbox', {name: 'Label text'})
  await input.fill('Backlog (new)')

  await page.keyboard.press('Enter')
  await memex.boardView.getColumn('Backlog (new)').expectVisible()
})

test.describe('Rename iteration columns on Board View', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('appWithIterationsField', {
      viewType: 'board',
      verticalGroupedBy: {
        columnId: 20,
      },
    })
  })

  const CURRENT_NAME = 'Iteration 1'
  const NEW_NAME = 'Iteration 1 (Old)'

  test('Columns can be renamed by clicking their name', async ({memex}) => {
    await memex.boardView.getColumn(CURRENT_NAME).COLUMN_TITLE.click()
    const titleInput = memex.boardView.getColumn(CURRENT_NAME).COLUMN_TITLE_INPUT
    await titleInput.selectText()
    await titleInput.type(NEW_NAME)
    await titleInput.press('Enter')

    await memex.boardView.getColumn(NEW_NAME).expectVisible()
  })

  test('Columns can be renamed by double-clicking their name', async ({memex}) => {
    await memex.boardView.getColumn(CURRENT_NAME).COLUMN_TITLE.click()
    const titleInput = memex.boardView.getColumn(CURRENT_NAME).COLUMN_TITLE_INPUT
    await titleInput.selectText()
    await titleInput.type(NEW_NAME)
    await titleInput.press('Enter')

    await memex.boardView.getColumn(NEW_NAME).expectVisible()
  })

  test('Columns can be renamed by using the column context menu', async ({memex}) => {
    await memex.boardView.getColumn(CURRENT_NAME).openContextMenu()
    await memex.boardView.COLUMN_MENU(CURRENT_NAME).getByRole('menuitem', {name: 'Rename'}).click()

    await memex.boardView.getColumn(CURRENT_NAME).COLUMN_TITLE.click()
    const titleInput = memex.boardView.getColumn(CURRENT_NAME).COLUMN_TITLE_INPUT
    await titleInput.selectText()
    await titleInput.type(NEW_NAME)
    await titleInput.press('Enter')

    await memex.boardView.getColumn(NEW_NAME).expectVisible()
  })

  test('Columns can be renamed by triggering edit-state via the keyboard', async ({memex}) => {
    await memex.boardView.getColumn(CURRENT_NAME).COLUMN_TITLE.focus()
    await memex.boardView.getColumn(CURRENT_NAME).COLUMN_TITLE.press('Enter')
    const titleInput = memex.boardView.getColumn(CURRENT_NAME).COLUMN_TITLE_INPUT
    await titleInput.selectText()
    await titleInput.type(NEW_NAME)
    await titleInput.press('Enter')

    await memex.boardView.getColumn(NEW_NAME).expectVisible()
  })

  test('Pressing escape cancels the edit', async ({memex}) => {
    await memex.boardView.getColumn(CURRENT_NAME).COLUMN_TITLE.click()
    const titleInput = memex.boardView.getColumn(CURRENT_NAME).COLUMN_TITLE_INPUT
    await titleInput.selectText()
    await titleInput.type(NEW_NAME)
    await titleInput.press('Escape')

    await memex.boardView.getColumn(CURRENT_NAME).expectVisible()
  })

  test.describe('Column Title Input', () => {
    test('increases width when edited', async ({memex}) => {
      await memex.boardView.getColumn(CURRENT_NAME).COLUMN_TITLE.focus()
      await memex.boardView.getColumn(CURRENT_NAME).COLUMN_TITLE.press('Enter')
      const titleInput = memex.boardView.getColumn(CURRENT_NAME).COLUMN_TITLE_INPUT
      const oldBoundaries = await titleInput.boundingBox()
      const oldWidth = oldBoundaries?.width
      await titleInput.selectText()
      await titleInput.type(NEW_NAME)
      const newBoundaries = await titleInput.boundingBox()
      const newWidth = newBoundaries?.width || 0
      expect(oldWidth).toBeLessThan(newWidth)
    })

    test('reduces width when edited', async ({memex}) => {
      await memex.boardView.getColumn(CURRENT_NAME).COLUMN_TITLE.focus()
      await memex.boardView.getColumn(CURRENT_NAME).COLUMN_TITLE.press('Enter')
      const titleInput = memex.boardView.getColumn(CURRENT_NAME).COLUMN_TITLE_INPUT
      const oldBoundaries = await titleInput.boundingBox()
      const oldWidth = oldBoundaries?.width
      await titleInput.selectText()
      await titleInput.type('X')
      const newBoundaries = await titleInput.boundingBox()
      const newWidth = newBoundaries?.width || 0
      expect(oldWidth).toBeGreaterThan(newWidth)
    })
  })
})

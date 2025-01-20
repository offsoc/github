import {expect} from '@playwright/test'

import type {MemexApp} from '../../fixtures/memex-app'
import {test} from '../../fixtures/test-extended'
import {submitConfirmDialog} from '../../helpers/dom/interactions'

test.describe('Board view with iteration-type field', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('appWithIterationsField', {
      viewType: 'board',
      verticalGroupedBy: {
        columnId: 20,
      },
    })
  })

  const iterationFieldName = 'Iteration'

  test('deletes iteration when corresponding column is deleted', async ({page, memex}) => {
    const interationToDelete = 'Iteration 5'

    await memex.boardView.getColumn(interationToDelete).openContextMenu()
    await memex.boardView.COLUMN_MENU(interationToDelete).getByRole('menuitem', {name: 'Delete', exact: true}).click()
    await submitConfirmDialog(page, 'Delete')

    await memex.projectSettingsPage.navigateToSettingsForCustomField(iterationFieldName)
    expect(await getIterationTitles(memex)).not.toContain(interationToDelete)
  })

  test('renames iteration when corresponding column is renamed', async ({memex}) => {
    const fromIterationName = 'Iteration 4'
    const toIterationName = 'Iteration 4 (renamed)'

    await memex.boardView.getColumn(fromIterationName).COLUMN_TITLE.click()
    const titleInput = memex.boardView.getColumn(fromIterationName).COLUMN_TITLE_INPUT
    await titleInput.selectText()
    await titleInput.type(toIterationName)
    await titleInput.press('Enter')

    await memex.boardView.getColumn(toIterationName).expectVisible()

    await memex.projectSettingsPage.navigateToSettingsForCustomField(iterationFieldName)
    const currentIterationNames = await getIterationTitles(memex)
    expect(currentIterationNames).not.toContain(fromIterationName)
    expect(currentIterationNames).toContain(toIterationName)
  })
})

async function getIterationTitles(memex: MemexApp) {
  const iterationTitles: Array<string> = []
  const inputLocators = await memex.projectSettingsPage.ITERATION_NAME_INPUT.all()
  for (const inputLocator of inputLocators) {
    iterationTitles.push(await inputLocator.inputValue())
  }
  return iterationTitles
}

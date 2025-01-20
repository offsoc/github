import {expect} from '@playwright/test'

import {test} from '../../fixtures/test-extended'
import {dragTo, mustGetCenter} from '../../helpers/dom/interactions'
import {waitForFunction} from '../../helpers/utils'

test.describe('Move columns', () => {
  test.describe('Unfiltered columns', () => {
    test.beforeEach(async ({memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'board',
      })
    })

    test('Columns can be moved by dragging-and-dropping to the left', async ({page, memex}) => {
      const titleTexts = memex.boardView.COLUMN_TITLE_TEXTS
      const thirdColTitle = await titleTexts.nth(2).textContent()
      const secondColTitle = await titleTexts.nth(1).textContent()

      if (!thirdColTitle || !secondColTitle) {
        throw new Error('Missing column titles')
      }

      const columnTitle = memex.boardView.getColumn(thirdColTitle).COLUMN_TITLE
      const targetColumn = memex.boardView.getColumn(secondColTitle).columnLocator
      const targetColumnCenter = await mustGetCenter(targetColumn)

      await dragTo(page, columnTitle, {x: targetColumnCenter.x - 10})

      // Wait for our state update to be reflected.
      const didMove = await waitForFunction(async () => {
        const titleText = await titleTexts.nth(1).textContent()
        return titleText === thirdColTitle ? true : null
      })

      expect(didMove).toBeTruthy()
    })

    test('Columns can be moved by dragging-and-dropping to the right', async ({page, memex}) => {
      const titleTexts = memex.boardView.COLUMN_TITLE_TEXTS
      const secondColTitle = await titleTexts.nth(1).textContent()
      const fourthColTitle = await titleTexts.nth(3).textContent()

      if (!fourthColTitle || !secondColTitle) {
        throw new Error('Missing column titles')
      }

      const columnTitle = memex.boardView.getColumn(secondColTitle).COLUMN_TITLE
      const targetColumn = memex.boardView.getColumn(fourthColTitle).columnLocator
      const targetColumnCenter = await mustGetCenter(targetColumn)

      await dragTo(page, columnTitle, {x: targetColumnCenter.x + 10})

      // Wait for our state update to be reflected.
      const didMove = await waitForFunction(async () => {
        const titleText = await titleTexts.nth(3).textContent()
        return titleText === secondColTitle ? true : null
      })

      expect(didMove).toBeTruthy()
    })

    test('Columns can be moved by dragging-and-dropping on the left side of the first column', async ({
      page,
      memex,
    }) => {
      const titleTexts = memex.boardView.COLUMN_TITLE_TEXTS
      const thirdColTitle = await titleTexts.nth(2).textContent()
      const firstColTitle = await titleTexts.nth(0).textContent()

      if (!thirdColTitle) {
        throw new Error('Missing third column title')
      }

      if (!firstColTitle) {
        throw new Error('Missing first column title')
      }

      const columnTitle = memex.boardView.getColumn(thirdColTitle).COLUMN_TITLE
      const targetColumn = memex.boardView.getColumn(firstColTitle).columnLocator
      const targetColumnCenter = await mustGetCenter(targetColumn)

      await dragTo(page, columnTitle, {x: targetColumnCenter.x - 10})

      // Wait for our state update to be reflected.
      const didMove = await waitForFunction(async () => {
        const titleText = await titleTexts.nth(1).textContent()
        return titleText === thirdColTitle ? true : null
      })

      expect(didMove).toBeTruthy()
    })

    test("Dragging a column right after its current position doesn't trigger reordering", async ({page, memex}) => {
      const titleTexts = memex.boardView.COLUMN_TITLE_TEXTS
      const columnIndex = 1 // second column, first column doesn't move
      const currentColTitle = await titleTexts.nth(columnIndex).textContent()

      if (!currentColTitle) {
        throw new Error('Missing first column title')
      }

      const columnTitle = memex.boardView.getColumn(currentColTitle).COLUMN_TITLE
      const targetColumn = memex.boardView.getColumn(currentColTitle).columnLocator
      const targetColumnCenter = await mustGetCenter(targetColumn)

      await dragTo(page, columnTitle, {x: targetColumnCenter.x + 20}) // move slightly to the right

      // Wait for our state update to be reflected.
      const didNotMove = await waitForFunction(async () => {
        const titleText = await titleTexts.nth(columnIndex).textContent()
        return titleText === currentColTitle ? true : null
      })

      expect(didNotMove).toBeTruthy()
    })
  })

  test.describe('Filtered columns', () => {
    test('Columns can be moved by dragging-and-dropping to the left', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'board',
        filterQuery: "-status:'In Progress'",
      })
      const titleTexts = memex.boardView.COLUMN_TITLE_TEXTS
      const thirdColTitle = await titleTexts.nth(2).textContent()
      const secondColTitle = await titleTexts.nth(1).textContent()

      if (!thirdColTitle || !secondColTitle) {
        throw new Error('Missing column titles')
      }

      const columnTitle = memex.boardView.getColumn(thirdColTitle).COLUMN_TITLE
      const targetColumn = memex.boardView.getColumn(secondColTitle).columnLocator
      const targetColumnCenter = await mustGetCenter(targetColumn)

      await dragTo(page, columnTitle, {x: targetColumnCenter.x - 10})

      // Wait for our state update to be reflected.
      const didMove = await waitForFunction(async () => {
        const titleText = await titleTexts.nth(1).textContent()
        return titleText === thirdColTitle ? true : null
      })

      expect(didMove).toBeTruthy()
    })

    test('Columns can be moved by dragging-and-dropping to the right', async ({page, memex}) => {
      await memex.navigateToStory('integrationTestsWithItems', {
        viewType: 'board',
        filterQuery: "-status:'In Progress'",
      })
      const titleTexts = memex.boardView.COLUMN_TITLE_TEXTS
      const secondColTitle = await titleTexts.nth(1).textContent()
      const fourthColTitle = await titleTexts.nth(3).textContent()

      if (!fourthColTitle || !secondColTitle) {
        throw new Error('Missing column titles')
      }

      const columnTitle = memex.boardView.getColumn(secondColTitle).COLUMN_TITLE
      const targetColumn = memex.boardView.getColumn(fourthColTitle).columnLocator
      const targetColumnCenter = await mustGetCenter(targetColumn)

      await dragTo(page, columnTitle, {x: targetColumnCenter.x + 10})

      // Wait for our state update to be reflected.
      const didMove = await waitForFunction(async () => {
        const titleText = await titleTexts.nth(3).textContent()
        return titleText === secondColTitle ? true : null
      })

      expect(didMove).toBeTruthy()
    })
  })
})

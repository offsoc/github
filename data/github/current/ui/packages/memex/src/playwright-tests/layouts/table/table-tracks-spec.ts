import {test} from '../../fixtures/test-extended'

test.describe('Table Tracks Field', () => {
  test('Renders avatar for each reviewer', async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems')

    await memex.tableView.cells.getTracksCell(5).expectTracksProgressText('7 of 11')
  })
})

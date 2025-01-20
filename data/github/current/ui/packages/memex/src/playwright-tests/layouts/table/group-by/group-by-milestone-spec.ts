import {test} from '../../../fixtures/test-extended'
import {mustFind} from '../../../helpers/dom/assertions'
import {_} from '../../../helpers/dom/selectors'

test.describe('Group By Milestone', () => {
  test('if all footers are disabled, empty group is shown', async ({memex, page}) => {
    await memex.navigateToStory('integrationTestsWithItems', {
      viewType: 'table',
      groupedBy: {columnId: 'Milestone'},
    })
    await mustFind(page, _('table-group-No Milestone'))
  })
})

import '../../../mocks/platform/utils'

import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {draftIssueFactory} from '../../../factories/memex-items/draft-issue-factory'
import {mockUseHasColumnData} from '../../../mocks/hooks/use-has-column-data'
import {mockUseRepositories} from '../../../mocks/hooks/use-repositories'
import {setupRoadmapView} from '../../../test-app-wrapper'

describe('Roadmap focus', () => {
  beforeEach(() => {
    // Mock async data fetching hooks to avoid open handles
    mockUseHasColumnData()
    mockUseRepositories()
  })

  function renderRoadmap() {
    const {Roadmap} = setupRoadmapView({
      items: [draftIssueFactory.withTitleColumnValue('Explore performance issues').build()],
    })
    render(<Roadmap />)
  }

  describe('Filtering', () => {
    it('should focus the filter bar on meta+/', async () => {
      renderRoadmap()

      await userEvent.keyboard('{Meta>}/{/Meta}')
      expect(await screen.findByTestId('filter-bar-input')).toHaveFocus()
    })
  })
})

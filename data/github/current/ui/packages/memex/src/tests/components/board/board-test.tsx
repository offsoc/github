import {render, screen} from '@testing-library/react'

import {useHasColumnData} from '../../../client/state-providers/columns/use-has-column-data'
import {draftIssueFactory} from '../../factories/memex-items/draft-issue-factory'
import {asMockHook} from '../../mocks/stub-utilities'
import {setupBoardView} from '../../test-app-wrapper'
import {mockGetBoundingClientRect} from './board-test-helper'

/**
 * Without mocking this hook we will issue an additional server call because the
 * data that we have for our items does not line up with the columns that are defined for the
 * test. This additional server call is async and will respond _after_ the test has completed,
 * causing noise in the test console when we try to `setState` outside of an `act` block.
 *
 * We could try to always make sure that our column values line up with our columns, to prevent
 * this call; however, since this behavior isn't really what we're focused on testing in
 * this test suite, we instead just mock out the hook entirely.
 */
jest.mock('../../../client/state-providers/columns/use-has-column-data')

describe('Board View', () => {
  beforeAll(() => {
    mockGetBoundingClientRect()
    asMockHook(useHasColumnData).mockReturnValue({hasColumnData: () => true})
  })

  it('should render a memex item', () => {
    const {Board} = setupBoardView({
      items: [draftIssueFactory.withTitleColumnValue('Explore performance issues').build()],
    })
    render(<Board />)

    expect(screen.getAllByTestId('board-view-column-card')).toHaveLength(1)
    expect(screen.getByText('Explore performance issues')).toBeInTheDocument()
  })
})

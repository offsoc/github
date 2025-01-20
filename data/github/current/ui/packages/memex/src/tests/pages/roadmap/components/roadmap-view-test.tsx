import '../../../mocks/platform/utils'

import {render, screen} from '@testing-library/react'

import {mockGetBoundingClientRect} from '../../../components/board/board-test-helper'
import {mockUseHasColumnData} from '../../../mocks/hooks/use-has-column-data'
import {mockUseRepositories} from '../../../mocks/hooks/use-repositories'
import {setupRoadmapViewWithDates} from './roadmap-test-helpers'

jest.mock('../../../../client/state-providers/columns/use-has-column-data')
jest.mock('../../../../client/components/react_table/hooks/use-is-omnibar-fixed', () => ({
  useIsOmnibarFixed: jest.fn(() => false),
}))

describe('Roadmap View', () => {
  beforeAll(() => {
    // Mock async data fetching hooks to avoid open handles
    mockUseHasColumnData()
    mockUseRepositories()
    mockGetBoundingClientRect()
  })

  it('should render a memex item', () => {
    const {Roadmap} = setupRoadmapViewWithDates()
    render(<Roadmap />)

    expect(screen.getAllByTestId('roadmap-view-item-pill')).toHaveLength(3)

    // 'Explore performance issues' title is found twice:  1) in the table and 2) in the roadmap pill
    expect(screen.getAllByText('Explore performance issues')).toHaveLength(2)
  })
})

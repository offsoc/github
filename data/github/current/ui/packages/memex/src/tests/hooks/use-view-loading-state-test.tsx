import {render, screen} from '@testing-library/react'

import {LoadingStates, useViewLoadingState} from '../../client/hooks/use-view-loading-state'
import {useViews} from '../../client/hooks/use-views'

jest.mock('../../client/hooks/use-views')
const mockUseViews = jest.mocked(useViews)

describe('use-view-loading-state', () => {
  it('has the loadingState loaded when not missing fields', () => {
    mockUseViews.mockReturnValue({
      missingRequiredColumnData: false,
    } as ReturnType<typeof useViews>)

    render(<TestComponent />)

    expect(screen.getByText(LoadingStates.loaded)).toBeInTheDocument()
  })
  it('the loading states go from missing -> loading -> loaded as time progresses', async () => {
    mockUseViews.mockReturnValue({
      missingRequiredColumnData: true,
    } as ReturnType<typeof useViews>)

    const {rerender} = render(<TestComponent />)

    expect(screen.getByText(LoadingStates.missing)).toBeInTheDocument()

    expect(await screen.findByText(LoadingStates.loading)).toBeInTheDocument()

    mockUseViews.mockReturnValue({
      missingRequiredColumnData: false,
    } as ReturnType<typeof useViews>)

    rerender(<TestComponent />)

    expect(screen.getByText(LoadingStates.loaded)).toBeInTheDocument()
  })
})

function TestComponent() {
  const {loadingState} = useViewLoadingState()

  return <p>{loadingState}</p>
}

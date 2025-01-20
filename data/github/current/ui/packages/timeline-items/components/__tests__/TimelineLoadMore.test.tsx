import {act, screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {TimelineLoadMore} from '../TimelineLoadMore'
import {VALUES} from '../../constants/values'
import {announce} from '@github-ui/aria-live'
import {noop} from '@github-ui/noop'

jest.mock('@github-ui/aria-live', () => ({
  announce: jest.fn(),
}))

test('Renders the load all component', () => {
  const countUnderPaging = VALUES.timeline.maxPreloadCount - 1

  render(<TimelineLoadMore type="front" numberOfTimelineItems={countUnderPaging} />)

  expect(screen.getByRole('heading', {name: `${countUnderPaging} remaining items`})).toBeInTheDocument()
  expect(screen.getByRole('button', {name: 'Load all'})).toBeInTheDocument()
  expect(screen.getByRole('button', {name: 'Load all'})).toHaveAccessibleDescription(
    `${countUnderPaging} remaining items`,
  )
})

test('Text supports singular item', () => {
  render(<TimelineLoadMore type="front" numberOfTimelineItems={1} />)

  expect(screen.getByRole('heading', {name: '1 remaining item'})).toBeInTheDocument()
})

test('Renders the load more button', () => {
  const countOverPaging = VALUES.timeline.maxPreloadCount + 1

  render(<TimelineLoadMore type="front" numberOfTimelineItems={countOverPaging} />)

  expect(screen.getByRole('heading', {name: `${countOverPaging} remaining items`})).toBeInTheDocument()
  expect(screen.getByRole('button', {name: 'Load 150 more'})).toBeInTheDocument()
  expect(screen.getByRole('button', {name: 'Load 150 more'})).toHaveAccessibleDescription(
    `${countOverPaging} remaining items`,
  )
})

describe('onLoadComplete', () => {
  test('Triggers when all items are loaded', () => {
    const onLoadAllCompleteMock = jest.fn()

    render(
      <TimelineLoadMore
        type="front"
        numberOfTimelineItems={5}
        loadMoreBottomFn={(_, options) => options?.onComplete?.()}
        onLoadAllComplete={onLoadAllCompleteMock}
      />,
    )

    expect(onLoadAllCompleteMock).not.toHaveBeenCalled()

    const loadButton = screen.getByRole('button', {name: 'Load all'})
    act(() => loadButton.click())

    expect(onLoadAllCompleteMock).toHaveBeenCalled()
  })

  test('Does not trigger when partially loading items', () => {
    const onLoadAllCompleteMock = jest.fn()

    render(
      <TimelineLoadMore
        type="front"
        numberOfTimelineItems={VALUES.timeline.maxPreloadCount + 1}
        loadMoreBottomFn={(_, options) => options?.onComplete?.()}
        onLoadAllComplete={onLoadAllCompleteMock}
      />,
    )

    expect(onLoadAllCompleteMock).not.toHaveBeenCalled()

    const loadButton = screen.getByRole('button', {name: 'Load 150 more'})
    act(() => loadButton.click())

    expect(onLoadAllCompleteMock).not.toHaveBeenCalled()
  })
})

describe('Announces loading', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Load all', () => {
    render(<TimelineLoadMore type="front" numberOfTimelineItems={5} />)

    expect(announce).not.toHaveBeenCalled()

    const loadButton = screen.getByRole('button', {name: 'Load all'})
    act(() => loadButton.click())

    expect(announce).toHaveBeenCalledWith('Loading remaining timeline items', {assertive: true})
  })

  test('Load more', () => {
    render(<TimelineLoadMore type="front" numberOfTimelineItems={VALUES.timeline.maxPreloadCount + 1} />)

    expect(announce).not.toHaveBeenCalled()

    const loadButton = screen.getByRole('button', {name: 'Load 150 more'})
    act(() => loadButton.click())

    expect(announce).toHaveBeenCalledWith('Loading newer timeline items', {assertive: true})
  })

  test('Load more (newer)', () => {
    render(
      <TimelineLoadMore
        type="front"
        loadMoreTopFn={noop}
        loadMoreBottomFn={noop}
        numberOfTimelineItems={VALUES.timeline.maxPreloadCount + 1}
      />,
    )

    expect(announce).not.toHaveBeenCalled()

    const loadButton = screen.getByRole('button', {name: 'Load more actions'})
    act(() => loadButton.click())
    const loadNewerItem = screen.getByRole('menuitem', {name: 'Load newer activity'})
    act(() => loadNewerItem.click())

    expect(announce).toHaveBeenCalledWith('Loading newer timeline items', {assertive: true})
  })

  test('Load more (older)', () => {
    render(
      <TimelineLoadMore
        type="front"
        loadMoreTopFn={noop}
        loadMoreBottomFn={noop}
        numberOfTimelineItems={VALUES.timeline.maxPreloadCount + 1}
      />,
    )

    expect(announce).not.toHaveBeenCalled()

    const loadButton = screen.getByRole('button', {name: 'Load more actions'})
    act(() => loadButton.click())
    const loadOlderItem = screen.getByRole('menuitem', {name: 'Load older activity'})
    act(() => loadOlderItem.click())

    expect(announce).toHaveBeenCalledWith('Loading older timeline items', {assertive: true})
  })
})

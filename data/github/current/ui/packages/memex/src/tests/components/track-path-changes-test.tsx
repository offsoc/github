import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
// eslint-disable-next-line no-restricted-imports
import {Link, MemoryRouter} from 'react-router-dom'

import {PathChange} from '../../client/api/stats/contracts'
import {TrackPathChanges} from '../../client/components/track-path-changes'

const mockUsePostStats = {
  postStats: jest.fn(),
}

jest.mock('../../client/hooks/common/use-post-stats', () => ({
  _esModule: true,
  usePostStats: () => mockUsePostStats,
}))

const mockRoutes = {
  findRouteBestMatchByPath: jest.fn(),
}

jest.mock('../../client/routes', () => {
  return {
    _esModule: true,
    findRouteBestMatchByPath: () => mockRoutes.findRouteBestMatchByPath(),
  }
})

describe('track-path-changes', () => {
  const basePath = '/'

  const links = Object.freeze({
    a: {
      path: 'path/link-a',
      text: 'Link A',
      route: 'path/:slug',
    },

    b: {
      path: 'another-path/link-b',
      text: 'Link B',
      route: 'another-path/:slug',
    },
  })

  it('invokes the stat API on initial load', () => {
    // Arrange
    const expectedPayload = Object.freeze({
      name: PathChange,
      context: JSON.stringify({currentPath: '/', previousPath: null, currentBestMatchRoute: '<unknown_route>'}),
    })

    render(
      <MemoryRouter initialEntries={[basePath]}>
        <TrackPathChanges />
        <Link to={links.a.path}>{links.a.text}</Link>
        <Link to={links.b.path}>{links.b.text}</Link>
      </MemoryRouter>,
    )

    // Assert
    expect(mockUsePostStats.postStats).toHaveBeenCalledTimes(1)
    expect(mockUsePostStats.postStats).toHaveBeenCalledWith(expectedPayload)
  })

  it('invokes the stat API when location changes', async () => {
    // Arrange
    const expectedPayload = Object.freeze({
      name: PathChange,
      context: JSON.stringify({
        currentPath: basePath + links.a.path,
        previousPath: basePath,
        currentBestMatchRoute: links.a.route,
      }),
    })

    render(
      <MemoryRouter initialEntries={[basePath]}>
        <TrackPathChanges />
        <Link to={links.a.path}>{links.a.text}</Link>
        <Link to={links.b.path}>{links.b.text}</Link>
      </MemoryRouter>,
    )

    // reset to ignore initial load
    mockUsePostStats.postStats.mockClear()
    mockRoutes.findRouteBestMatchByPath.mockClear()
    mockRoutes.findRouteBestMatchByPath.mockReturnValue({
      path: links.a.route,
    })

    // Act

    await userEvent.click(screen.getByText(links.a.text))

    // Assert
    expect(mockUsePostStats.postStats).toHaveBeenCalledTimes(1)
    expect(mockUsePostStats.postStats).toHaveBeenCalledWith(expectedPayload)
  })

  it("doen't invoke the stat API if the location is the same between navigation", async () => {
    // Arrange
    const fromBaseToAExpectedPayload = Object.freeze({
      name: PathChange,
      context: JSON.stringify({
        currentPath: `${basePath}${links.a.path}`,
        previousPath: basePath,
        currentBestMatchRoute: links.a.route,
      }),
    })

    const fromAToBExpectedPayload = Object.freeze({
      name: PathChange,
      context: JSON.stringify({
        currentPath: `${basePath}${links.b.path}`,
        previousPath: `${basePath}${links.a.path}`,
        currentBestMatchRoute: links.b.route,
      }),
    })

    render(
      <MemoryRouter initialEntries={[basePath]}>
        <TrackPathChanges />
        <Link to={links.a.path}>{links.a.text}</Link>
        <Link to={links.b.path}>{links.b.text}</Link>
      </MemoryRouter>,
    )

    // reset to ignore initial load
    mockUsePostStats.postStats.mockClear()
    mockRoutes.findRouteBestMatchByPath.mockClear()
    mockRoutes.findRouteBestMatchByPath
      .mockReturnValueOnce({path: links.a.route})
      .mockReturnValue({path: links.b.route})

    // Act

    await userEvent.click(screen.getByText(links.a.text))
    await userEvent.click(screen.getByText(links.a.text))
    await userEvent.click(screen.getByText(links.b.text))
    await userEvent.click(screen.getByText(links.b.text))

    // Assert
    expect(mockUsePostStats.postStats).toHaveBeenCalledTimes(2)
    expect(mockUsePostStats.postStats).toHaveBeenCalledWith(fromBaseToAExpectedPayload)
    expect(mockUsePostStats.postStats).toHaveBeenLastCalledWith(fromAToBExpectedPayload)
  })
})
